import { SendTaskSuccessCommand, SFNClient } from "@aws-sdk/client-sfn";

const sfnClient = new SFNClient();

const taskToken = process.env.TASK_TOKEN;

const sendTaskSuccessCommand = new SendTaskSuccessCommand({
	taskToken,
	output: JSON.stringify({
		approvalStatus: {
			result: true,
		},
	}),
});

await sfnClient.send(sendTaskSuccessCommand);
