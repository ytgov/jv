
import { DB_CONFIG } from "../config";
import knex from "knex";
import { sendPendingApprovalEmail } from "../services/email";
const db = knex(DB_CONFIG);

export async function emailCronjob(){
    console.log('running a cron job');
    const reminder = true

    const reminderDate = new Date()
    reminderDate.setDate(reminderDate.getDate()-7);

    const recoveries = await db("Recovery").select("*").where("status", "Routed For Approval");
    // console.log(recoveries)
    for (const recovery of recoveries){
        const recoveryEmails = await db("RecoveryEmail")
            .select("*")
            .where("recoveryID", recovery.recoveryID)
            .where("emailType", "Routed For Approval");
        let dates = recoveryEmails.map(recEmail => {return recEmail.sentDate})
        dates = dates.sort((a, b) => {return a>b? -1 :1 })
        // console.log(dates)
        // console.log(reminderDate)
        if(dates[0]<reminderDate){
            // console.log("___SENDING_REMINDER__")
            const emailSent = await sendPendingApprovalEmail(reminder, 'Recovery Branch', recovery.modUser, recovery.requastorEmail, (recovery.firstName+' '+recovery.lastName), recovery.department)            
            // console.log(emailSent)            
            if(emailSent)
                await db("RecoveryEmail").insert({
                    recoveryID: recovery.recoveryID,
                    emailType: recovery.status,
                    sentDate: new Date(),
                    sendingUser: recovery.modUser,
                    recipients: recovery.requastorEmail
                })
        }
    }
}



