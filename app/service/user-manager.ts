import { Logger } from "@aws-lambda-powertools/logger";
import { UserModel } from "../model/user-model";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { CustomError } from "../utils/feedback-util";
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { IUserDao, UserDao } from "../repositories/user-dao";

const ddbClient = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1'
})

const ddb = DynamoDBDocumentClient.from(ddbClient, {
    marshallOptions: {
        removeUndefinedValues: true
    }
})

interface IUserManager {
    creatUser(User: UserModel): Promise<UserModel>;
}

class UserManager implements IUserManager {
    private logger: Logger;
    private userDao:IUserDao;
    constructor() {
        this.logger = new Logger({
            logLevel: 'DEBUG',
            environment: process.env.ENVIRONMENT,
            serviceName: 'ServiceDao'
        })

        this.userDao = new UserDao()
    }

    async creatUser(user: UserModel): Promise<UserModel> {
        if(!user){
            this.logger.error(`❌ Required user fields is empty: ${JSON.stringify(user)}`)
            throw new CustomError(400, `❌ Required user fields is empty: ${JSON.stringify(user)}`)
        }
        try {
            let response = await this.userDao.creatUser(user)
            this.logger.info(`✅ User with id: ${response.id} was created with success!`)
            return response
        } catch (error: any) {
            this.logger.error(`❌ Failed to create user: ${error.message}`)
            throw new CustomError(500, `❌ Failed to create user: ${error.message}`)
        }
    }
}


export { UserManager, IUserManager }