import { Logger } from "@aws-lambda-powertools/logger";
import { UserModel } from "../model/user-model";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { CustomError } from "../utils/feedback-util";
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'

const ddbClient = new DynamoDBClient({
    region:process.env.AWS_REGION || 'us-east-1'
})

const ddb = DynamoDBDocumentClient.from(ddbClient, {
    marshallOptions:{
        removeUndefinedValues:true
    }
})

interface IUserDao{
    creatUser(User:UserModel):Promise<UserModel>;
}

class UserDao implements IUserDao{
    private logger:Logger;
    constructor(){
        this.logger = new Logger({
            logLevel: 'DEBUG',
            environment:process.env.ENVIRONMENT,
            serviceName:'ServiceDao'
        })
    }

    async creatUser(user: UserModel): Promise<UserModel> {
        if(!user){
            this.logger.error(`❌ Required user fields is empty: ${JSON.stringify(user)}`)
            throw new CustomError(400, `❌ Required user fields is empty: ${JSON.stringify(user)}`)
        }
        this.logger.info(`🔁 Initing creating user: ${JSON.stringify(user.id)}`)
        const command = new PutCommand({
            TableName:process.env.USER_TABLE,
            Item:user.toItem()
        })
        try{
            this.logger.info(`▶️ Inserting Item User in dynamoDB: ${JSON.stringify(command)}`)
            await ddb.send(command)
            this.logger.info(`✅ User with id: ${user.id} was created with success!`)
            return user
        }catch(error:any){
            this.logger.error(`❌ Failed to create user: ${error.message}`)
            throw new CustomError(500, `❌ Failed to create user: ${error.message}`)
        }
    }
}

export { UserDao, IUserDao }