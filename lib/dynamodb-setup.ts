import {aws_dynamodb as dynamodb, Stack} from 'aws-cdk-lib'

export class DynamoDBSetup{
    private userTable:dynamodb.Table;
    private stack:Stack

    constructor(stackParameter: Stack){
        this.stack = stackParameter
    }


    setupUserTable():void{
        this.userTable = new dynamodb.Table(this.stack,'UserTableIdentifier',{
            partitionKey:{
                name:"PK",
                type:dynamodb.AttributeType.STRING
            },
            sortKey:{
                name:"SK",
                type:dynamodb.AttributeType.STRING
            },
            billingMode:dynamodb.BillingMode.PAY_PER_REQUEST
        })
    }

    getUserTable():dynamodb.Table{
        return this.userTable;
    }
}