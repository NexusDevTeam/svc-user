import {
    aws_ssm as ssm,
    aws_appsync as appsync,
    Stack,
    aws_iam as iam,
    aws_sqs as sqs,
    CfnOutput,
    aws_logs as logs,
    RemovalPolicy
  } from "aws-cdk-lib";
  
  import { LambdaFunctions } from "./lambda-setup";
  import path from "path";
  import * as fs from "fs";
  import { RetentionDays } from "aws-cdk-lib/aws-logs";
  
  /**
  * Class responsible for setting up the AppSync API within a given CDK stack.
  */
  export class AppsyncSetup {
    private stack: Stack;
    private userApi: appsync.CfnGraphQLApi;
  
    constructor(stack: Stack) {
      this.stack = stack;
    }
  
    /**
     * Configures the AppSync API, including authentication, logging, schema, API keys, SSM parameters, outputs, and resolvers.
     *
     * @param lambdas - An array of LambdaFunctions to be integrated with the AppSync API.
     * @param sqsService - The SQS queue to be used by the AppSync API.
     */
    setupAppsync() {
  
      // Define roles to access Logs
      const roleApi = new iam.Role(this.stack, "userApiRole", {
        assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
        description: "Role to link to likert api",
        roleName: "userApiRole",
        inlinePolicies: {
          CloudWatchLogsPolicy: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                  "logs:CreateLogGroup",
                  "logs:CreateLogStream",
                  "logs:PutLogEvents",
                ],
                resources: ["arn:aws:logs:*:*:*"],
              }),
            ],
          }),
        },
      });
  
      // Define likert API
      this.userApi = new appsync.CfnGraphQLApi(this.stack, "UseApi", {
        authenticationType: appsync.AuthorizationType.API_KEY,
        name: "UseApi",
        logConfig: {
          fieldLogLevel: "ALL",
          cloudWatchLogsRoleArn: roleApi.roleArn,
        },
      });
  
      new logs.LogGroup(this.stack, "userApiLogsGroup", {
        logGroupName: `/aws/appsync/apis/${this.userApi.attrApiId}`,
        removalPolicy: RemovalPolicy.DESTROY,
        retention: RetentionDays.THREE_DAYS
      });
  
      // Define schema and link to likert api
      const graphqlSchema = fs.readFileSync(
        path.join(__dirname, "../graphql/schema.graphql"),
        { encoding: "utf-8" }
      );
      new appsync.CfnGraphQLSchema(this.stack, "userApiSchema", {
        apiId: this.userApi.attrApiId,
        definition: graphqlSchema,
      });
    }
  
    /**
     * Sets up resolvers for the AppSync API, linking Lambda functions and SQS services with appropriate roles and permissions.
     *
     * @param lambdaFunctions - An array of LambdaFunctions to be used as data sources.
     */
    setupResolvers(lambdaFunctions: LambdaFunctions[]) {
      const ignoreLambdas = [''];
  
      lambdaFunctions.forEach(({ name, lambda }) => {
        if (ignoreLambdas.includes(name)) {
          return;
        }
        const dataSourceRole = new iam.Role(this.stack, `${name}DataSourceRole`, {
          assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
          inlinePolicies: {
            LambdaInvokePolicy: new iam.PolicyDocument({
              statements: [
                new iam.PolicyStatement({
                  actions: ["lambda:InvokeFunction"],
                  resources: [lambda.functionArn],
                })
              ],
            }),
          },
        });
        const dataSourceLambda = new appsync.CfnDataSource(
          this.stack,
          `${name}DataSource`,
          {
            apiId: this.userApi.attrApiId,
            name: `${name}DataSource`,
            type: "AWS_LAMBDA",
            lambdaConfig: {
              lambdaFunctionArn: lambda.functionArn,
            },
            serviceRoleArn: dataSourceRole.roleArn, // Attach the role to the data source
          }
        );
        new appsync.CfnResolver(this.stack, `${name}Resolver`, {
          apiId: this.userApi.attrApiId,
          typeName:
            name.startsWith("get") || name.startsWith("list")
              ? "Query"
              : "Mutation",
          fieldName: name,
          dataSourceName: dataSourceLambda.name,
          requestMappingTemplate:
          `
          {
    "version": "2018-05-29",
    "operation": "Invoke",
    "payload": {
      "arguments": $util.toJson($context.arguments),
      "identity": $util.toJson($context.identity),
      "source": $util.toJson($context.source),
      "request": $util.toJson($context.request),
      "prev": $util.toJson($context.prev),
      "info":$util.toJson($context.info),
      "selectionSetList": $util.toJson($context.info.selectionSetList)
    }
  }`,
          responseMappingTemplate:
            appsync.MappingTemplate.lambdaResult().renderTemplate(),
        }).addDependency(dataSourceLambda);
      });
    }
  
    /**
     * Retrieves the configured AppSync GraphQL API instance.
     *
     * @returns The configured CfnGraphQLApi instance representing the likert API.
     */
    getuserApi(): appsync.CfnGraphQLApi {
      return this.userApi;
    }
  }