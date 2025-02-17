import { aws_dynamodb, Stack } from "aws-cdk-lib";


export class DynamoDBSetup {
    private userTable: aws_dynamodb.Table;
    private stack: Stack;

    constructor( stack:Stack ) {
        this.stack = stack;
    }

    setUserTable(): void {
        this.userTable = new aws_dynamodb.Table(this.stack, 'UserTable', { 
            tableName:'UserTable', 
            partitionKey: {
                name:'PK',
                type:aws_dynamodb.AttributeType.STRING
            },
            sortKey: {
                name:'SK',
                type:aws_dynamodb.AttributeType.STRING
            },
            billingMode:aws_dynamodb.BillingMode.PAY_PER_REQUEST
        })
    }
    getUserTable(): aws_dynamodb.Table {
        return this.userTable 
    }
}