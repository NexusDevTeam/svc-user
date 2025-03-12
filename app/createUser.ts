import { Logger } from "@aws-lambda-powertools/logger";
import { UserManager } from "./service/user-manager";
import { CustomError } from "./utils/feedback-util";
import { UserModel } from "./model/user-model";



const logger = new Logger({
    logLevel:"DEBUG",
    serviceName:"createUser"
})

const userManager = new UserManager()

export async function handler(event:any) {
    logger.info(`ℹ️ Event received: ${JSON.stringify(event)}`)
    try {
        const {user} = event.argumments
        let userModel = new UserModel(user.id || '',user.name,user.email,user.password)
        return await userManager.creatUser(userModel)
    } catch (error:any) {
        logger.error(`❌ Error handling event: ${error.message}`)
        throw new CustomError(500, `❌ Error handling event: ${error.message}`)
    }
}