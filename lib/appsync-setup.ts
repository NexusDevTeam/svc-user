import { aws_appsync, Stack } from 'aws-cdk-lib'


export class AppsyncSetup {
    private stack: Stack
    private userApi: aws_appsync.GraphqlApi
    constructor(stackParameter: Stack) {
        this.stack = stackParameter
    }


    setupAppsync():void{
        
    }
    
}