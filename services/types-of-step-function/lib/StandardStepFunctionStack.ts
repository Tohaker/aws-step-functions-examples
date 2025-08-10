import { CfnOutput, Stack, type StackProps } from "aws-cdk-lib";
import { Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import {
	type CfnStateMachine,
	Choice,
	Condition,
	DefinitionBody,
	IntegrationPattern,
	Pass,
	StateMachine,
	StateMachineType,
	TaskInput,
} from "aws-cdk-lib/aws-stepfunctions";
import { SnsPublish } from "aws-cdk-lib/aws-stepfunctions-tasks";
import type { Construct } from "constructs";

export class StandardStepFunctionStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const stateMachineName = "example-standard-state-machine";

		// -------------------------- SNS Topic ---------------------------------

		const email = process.env.SUBSCRIPTION_EMAIL;

		if (!email) {
			throw new Error("No email provided for the SNS subscription");
		}

		const topic = new Topic(this, "ExampleTopic", {
			topicName: `${stateMachineName}-topic`,
		});

		topic.addSubscription(new EmailSubscription(email));

		// ------------------------ State Machine ---------------------------------

		const sendSnsMessage = SnsPublish.jsonata(this, "Publish to SNS topic", {
			integrationPattern: IntegrationPattern.WAIT_FOR_TASK_TOKEN,
			topic,
			message: TaskInput.fromObject({
				token: "{% $states.context.Task.Token %}",
				message: "{% $states.input %}",
			}),
		});

		const checkApproved = Choice.jsonata(this, "Approved?");

		const approval = Pass.jsonata(this, "Approval");
		const rejection = Pass.jsonata(this, "Rejection");

		checkApproved
			.when(
				Condition.jsonata("{% $states.input.approvalStatus.result %}"),
				approval,
			)
			.otherwise(rejection);

		const definitionBody = DefinitionBody.fromChainable(
			sendSnsMessage.next(checkApproved),
		);

		const stateMachine = new StateMachine(this, "StateMachine", {
			stateMachineType: StateMachineType.STANDARD,
			stateMachineName: "example-standard-state-machine",
			definitionBody,
		});

		// ----------------------------- Outputs ---------------------------------

		new CfnOutput(this, "StateMachineDefinition", {
			value:
				(stateMachine.node.defaultChild as CfnStateMachine).definitionString ??
				"",
		});

		new CfnOutput(this, "StateMachineRole", {
			value: stateMachine.role.roleArn,
		});
	}
}
