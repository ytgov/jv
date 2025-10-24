import { DB_CONFIG } from "../config"
import knex from "knex"
import { sendPendingApprovalEmail } from "../services/email"
import { updateDepartments, updateEmployees } from "../routes/lookup-router"
import { RecoveryStatuses } from "@/models/recovery"
const db = knex(DB_CONFIG)

export async function emailCronjob() {
  console.log("running a cron job", new Date())

  await updateEmployees()
  await updateDepartments()

  const reminder = true

  const reminderDate = new Date()
  reminderDate.setDate(reminderDate.getDate() - 7)

  const recoveries = await db("Recovery").where({ status: RecoveryStatuses.ROUTED_FOR_APPROVAL })

  for (const recovery of recoveries) {
    const recoveryEmails = await db("RecoveryEmail")
      .where("recoveryID", recovery.recoveryID)
      .where("emailType", "Routed For Approval")

    let dates = recoveryEmails.map((recEmail) => {
      return recEmail.sentDate
    })

    dates = dates.sort((a, b) => {
      return a > b ? -1 : 1
    })

    if (dates[0] < reminderDate) {
      const items = await db("RecoveryItem")
        .innerJoin("ItemCategory", "RecoveryItem.itemCatID", "ItemCategory.itemCatID")
        .select("RecoveryItem.*", "ItemCategory.category")
        .where("recoveryID", recovery.recoveryID)

      // console.log("___SENDING_REMINDER__")
      const emailSent = await sendPendingApprovalEmail(
        reminder,
        "Recovery Branch",
        recovery.modUser,
        recovery.requastorEmail,
        recovery.firstName + " " + recovery.lastName,
        recovery.department,
        recovery.recoveryID,
        items
      )
      // console.log(emailSent)
      if (emailSent)
        await db("RecoveryEmail").insert({
          recoveryID: recovery.recoveryID,
          emailType: recovery.status,
          sentDate: new Date(),
          sendingUser: recovery.modUser,
          recipients: recovery.requastorEmail,
        })
    }
  }
}
