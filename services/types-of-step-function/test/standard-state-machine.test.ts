import { SFNClient, TestStateCommand } from "@aws-sdk/client-sfn";

import outputs from "../cdk-outputs.json" with { type: "json" };

const sfnClient = new SFNClient();

describe("example-standard-state-machine", () => {
	it.skip("should publish a message to the SNS topic", () => {
		// States with a .waitForTaskToken integration pattern are not supported by the Test State API
		// https://docs.aws.amazon.com/step-functions/latest/dg/test-state-isolation.html#supported-test-states
	});

	it.each([
		{ nextState: "Approval", result: true },
		{ nextState: "Rejection", result: false },
	])(
		"should send to the $nextState state if approvalStatus result is $result",
		async ({ nextState, result }) => {
			const definition = JSON.stringify(
				JSON.parse(outputs.StandardStepFunctionStack.StateMachineDefinition)
					.States["Approved?"],
			);

			const input = {
				approvalStatus: {
					result,
				},
			};

			const command = new TestStateCommand({
				definition,
				input: JSON.stringify(input),
				inspectionLevel: "INFO",
			});

			const response = await sfnClient.send(command);

			expect(response.nextState).toBe(nextState);
		},
	);
});
