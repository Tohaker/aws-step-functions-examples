#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { StandardStepFunctionStack } from "../lib/StandardStepFunctionStack";

const env = {
	account: process.env.CDK_DEFAULT_ACCOUNT,
	region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new StandardStepFunctionStack(app, "StandardStepFunctionStack", {
	env,
});
