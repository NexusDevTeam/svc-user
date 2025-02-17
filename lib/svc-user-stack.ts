import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DynamoDBSetup } from './dynamodb-setup'
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SvcUserStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    //---------Setup DynamoDB----------//
    const dynamoDBSetup = new DynamoDBSetup(this)
    dynamoDBSetup.setUserTable()
  }
}
