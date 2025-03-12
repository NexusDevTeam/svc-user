/**
 * @fileoverview
 * Location: lib/lambda-setup.ts
 */

import {
    Stack,
    aws_lambda as lambda,
    aws_dynamodb as dynamodb,
    aws_ssm as ssm,
    aws_iam as iam,
    aws_sns as sns,
    aws_lambda_event_sources as eventsources,
    aws_kinesisfirehose as kf,
    aws_sqs as sqs,
    Duration,
    aws_logs as logs,
    RemovalPolicy,
    aws_kinesis as kinesis,
    aws_appsync as appsync,
  } from "aws-cdk-lib";
  import * as sns_subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
  import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
  import * as dotenv from "dotenv";
  
  dotenv.config();
  
  export interface LambdaFunctions {
    name: string;
    lambda: lambda.Function;
  }
  
  export class LambdaSetup {
    private stack: Stack;
    private lambdaFunctions: LambdaFunctions[];
  
    constructor(stack: Stack) {
      this.stack = stack;
      this.lambdaFunctions = [];
    }
  
    public setupLambdas(
      userTable: dynamodb.Table
    ): void {
      // Define Lambda function names
      const lambdaNames: string[] = [
        'createLambda',
      ];
  
      lambdaNames.forEach((name: string) => {
        // Create IAM role for each Lambda
        const lambdaRole = new iam.Role(this.stack, `${name}Role`, {
          assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
          inlinePolicies: {
            LogAccess: new iam.PolicyDocument({
              statements: [
                new iam.PolicyStatement({
                  effect: iam.Effect.ALLOW,
                  actions: [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents",
                  ],
                  resources: [
                    `arn:aws:logs:${this.stack.region}:${this.stack.account}:log-group:/aws/lambda/${name}:*`,
                  ],
                }),
              ]
            }),
            DynamoDBAccess: new iam.PolicyDocument({
              statements: [
                new iam.PolicyStatement({
                  actions: ["dynamodb:*"],
                  resources: [
                    userTable.tableArn,
                  ],
                })
              ],
            }),
          },
          managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName(
              "service-role/AWSLambdaBasicExecutionRole"
            ),
          ],
        });
  
        // Define Lambda function configuration
        const codePath = `app/`;
        const functionConfig = {
          runtime: lambda.Runtime.NODEJS_20_X,
          handler: `${name}.handler`,
          code: lambda.Code.fromAsset(codePath, {
            exclude: ["tests", "*.md"],
          }),
          environment: {
            USER_TABLE: userTable.tableName,
            REGION: this.stack.region,
            LOG_LEVEL: "DEBUG"
          },
          role: lambdaRole,
          timeout: Duration.seconds(30), // Default timeout
        };
  
        // Create Lambda function
        const createdLambda = new lambda.Function(
          this.stack,
          `${name}Function`,
          functionConfig
        );
        
        // Store the created Lambda function
        this.lambdaFunctions.push({
          name: name,
          lambda: createdLambda,
        });
      });
    }
  
    /**
     * Retrieves the configured Lambda functions.
     *
     * @returns An array of Lambda functions with their names and instances.
     */
    public getLambdasFunctions(): LambdaFunctions[] {
      return this.lambdaFunctions;
    }
  }
  