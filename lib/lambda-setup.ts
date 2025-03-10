import { aws_lambda, Stack } from 'aws-cdk-lib'


export class LambdaSetup {
    private stack: Stack
    private lambda: aws_lambda.Function
    constructor(stackParameter: Stack) {
        this.stack = stackParameter
    }


    setupLambda():void{
        
    }

    getLambda(){

    }
}