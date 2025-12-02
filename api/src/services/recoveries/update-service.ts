import { isNil, isNumber } from "lodash"

import { DB_SCHEMA } from "@/config"
import BaseService from "@/services/base-service"
import { UserService } from "@/services"
import { sendPendingApprovalEmail, sendPurchaseApprovedEmail } from "@/services/email"
import db from "@/data/db-client"

import { RecoveryStatuses, Recovery, RecoveryUpdateAttributes } from "@/models/recovery"

export class UpdateService extends BaseService {
  constructor(
    private recovery: Recovery,
    private attributes: RecoveryUpdateAttributes,
    private currentUser: any,
    private newRecoveryItems: any[] | null
  ) {
    super()
  }

  async perform() {
    if (isNil(this.currentUser)) {
      throw new Error("Current user is required")
    }

    const currentUserDisplayName = this.currentUser.display_name ?? ""
    const currentUserEmail = this.currentUser.email

    return db.transaction(async (trx) => {
      if (
        this.attributes.status != RecoveryStatuses.PURCHASE_APPROVED &&
        this.attributes.status != RecoveryStatuses.RE_DRAFT
      ) {
        this.attributes.modUser = currentUserEmail
      }

      if (this.attributes.requastorEmail) {
        let requestorUser = await new UserService().getByEmail(this.attributes.requastorEmail)

        if (!requestorUser) {
          let reqEmployee = await trx("Employees")
            .where({ email: this.attributes.requastorEmail })
            .first()

          if (reqEmployee) {
            await trx("user").insert({
              email: this.attributes.requastorEmail,
              first_name: reqEmployee.first_name,
              last_name: reqEmployee.last_name,
              display_name: reqEmployee.full_name,
              roles: "BranchUser",
              department: reqEmployee.department,
              auth0_subject: `SUB_MISSING_${this.attributes.requastorEmail}`,
              status: "Active",
              create_date: new Date(),
            })
          }
        }
      }

      const action = this.getActionType(this.attributes.status)

      await trx("RecoveryAudit").insert({
        date: new Date(),
        recoveryID: this.recovery.recoveryID,
        user: currentUserDisplayName,
        action,
      })

      this.attributes.totalPrice = this.calculateItemTotal()
      const [updatedRecovery] = await trx("Recovery")
        .update(this.attributes)
        .where("recoveryID", this.recovery.recoveryID)
        .returning("*")

      // update the journal voucher's total if linked
      if (updatedRecovery.journalID) {
        const journalTotal = await trx("Recovery")
          .where("journalID", updatedRecovery.journalID)
          .sum<{ sum: number }>("totalPrice as sum")
          .first()

        await trx("JournalVoucher")
          .where("journalID", updatedRecovery.journalID)
          .update({ jvAmount: journalTotal?.sum ?? 0 })
      }

      if (
        // draft -> routed for approval
        this.recovery.status == RecoveryStatuses.DRAFT &&
        this.attributes.status == RecoveryStatuses.ROUTED_FOR_APPROVAL
      ) {
        await this.sendEmail(this.attributes, currentUserDisplayName, this.recovery.recoveryID, trx)
      } else if (
        // routed for approval -> draft (rejected)
        this.recovery.status == RecoveryStatuses.ROUTED_FOR_APPROVAL &&
        this.attributes.status == RecoveryStatuses.DRAFT
      ) {
        await this.sendEmail(this.attributes, currentUserDisplayName, this.recovery.recoveryID, trx)
      } else if (
        // routed for approval -> purchase approved
        this.recovery.status == RecoveryStatuses.ROUTED_FOR_APPROVAL &&
        this.attributes.status == RecoveryStatuses.PURCHASE_APPROVED
      ) {
        await this.sendEmail(this.attributes, currentUserDisplayName, this.recovery.recoveryID, trx)
      } else if (
        // routed for approval -> purchase approved
        this.recovery.status == RecoveryStatuses.ROUTED_FOR_APPROVAL &&
        this.recovery.requastorEmail != this.attributes.requastorEmail
      ) {
        await this.sendEmail(this.attributes, currentUserDisplayName, this.recovery.recoveryID, trx)

        await trx("RecoveryAudit").insert({
          date: new Date(),
          recoveryID: this.recovery.recoveryID,
          user: currentUserDisplayName,
          action: `Changing Client from ${this.recovery.requastorEmail} to ${this.attributes.requastorEmail}`,
        })
      }

      if (isNil(this.newRecoveryItems)) {
        return updatedRecovery
      }

      await trx("RecoveryItem").delete().where("recoveryID", this.recovery.recoveryID)
      await trx("BackUpDocs")
        .delete()
        .where({ recoveryID: this.recovery.recoveryID })
        .whereNotNull("itemCatID")

      for (const newRecoveryItem of this.newRecoveryItems) {
        if (
          newRecoveryItem.originalQuantity &&
          Number(newRecoveryItem.originalQuantity) != Number(newRecoveryItem.quantity)
        ) {
          await trx("RecoveryAudit").insert({
            date: new Date(),
            recoveryID: this.recovery.recoveryID,
            user: currentUserDisplayName,
            action: `Changing Quantity of ${newRecoveryItem.category} from ${newRecoveryItem.originalQuantity} to ${newRecoveryItem.quantity}`,
          })
        }

        await trx.raw(`INSERT INTO BackUpDocs (recoveryID, docName, document, itemCatName, itemCatID)
            SELECT ${this.recovery.recoveryID}, docName, document, ItemCategory.category, ItemCategory.itemCatID
            FROM ItemCategory INNER JOIN ItemCategoryDocs ON ItemCategory.itemCatID = ItemCategoryDocs.itemCatID
            WHERE ItemCategory.itemCatID = ${newRecoveryItem.itemCatID}`)

        delete newRecoveryItem.state
        delete newRecoveryItem.tmpId
        delete newRecoveryItem.revisedCost
        delete newRecoveryItem.originalQuantity
        delete newRecoveryItem.category

        newRecoveryItem.recoveryID = this.recovery.recoveryID

        if (newRecoveryItem.itemID > 0) {
          await this.insertIntoTable("RecoveryItem", newRecoveryItem, trx)
        } else {
          await trx("RecoveryItem").insert(newRecoveryItem)
        }
      }

      return updatedRecovery
    })
  }

  private calculateItemTotal(): number {
    if (isNil(this.newRecoveryItems)) {
      return this.recovery.totalPrice ?? 0
    }

    return this.newRecoveryItems.reduce(
      (acc, item) => acc + (isNumber(item.totalPrice) ? item.totalPrice : 0),
      0
    )
  }

  private async insertIntoTable(table: string, data: any, myDb = db) {
    const schema = DB_SCHEMA
    const { bindings, sql } = myDb.withSchema(schema).insert(data).into(table).toSQL()

    const newQuery = `SET IDENTITY_INSERT ${schema}.${table} ON; ${sql} SET IDENTITY_INSERT ${schema}.${table} OFF;`

    return await myDb.raw(newQuery, bindings)
  }

  private addRecoveryAudit(recoveryID: number, user: string, action: string, myDb = db) {
    const newRecoveryAudit = {
      date: new Date(),
      recoveryID: recoveryID,
      user: user,
      action: action,
    }
    return myDb("RecoveryAudit").insert(newRecoveryAudit)
  }

  private async sendEmail(newRecovery: any, user: any, recoveryID: number, myDb = db) {
    const allowedStatuses = [
      RecoveryStatuses.PURCHASE_APPROVED,
      RecoveryStatuses.DRAFT,
      RecoveryStatuses.ROUTED_FOR_APPROVAL,
    ]

    if (!allowedStatuses.includes(newRecovery.status)) return true

    const recovery = await myDb("Recovery").where("recoveryID", recoveryID).first()

    const sender =
      newRecovery.status == RecoveryStatuses.ROUTED_FOR_APPROVAL
        ? recovery.createUser
        : recovery.requastorEmail

    const recipient =
      newRecovery.status == RecoveryStatuses.ROUTED_FOR_APPROVAL
        ? recovery.requastorEmail
        : recovery.createUser

    const recipientName =
      newRecovery.status == RecoveryStatuses.ROUTED_FOR_APPROVAL
        ? recovery.firstName + " " + recovery.lastName
        : "Recovery Agent"

    let emailSent = null

    if (newRecovery.status == RecoveryStatuses.ROUTED_FOR_APPROVAL) {
      const reminder = false

      const items = await db("RecoveryItem")
        .innerJoin("ItemCategory", "RecoveryItem.itemCatID", "ItemCategory.itemCatID")
        .select("RecoveryItem.*", "ItemCategory.category")
        .where("recoveryID", recoveryID)

      emailSent = await sendPendingApprovalEmail(
        reminder,
        user,
        sender,
        recipient,
        recipientName,
        recovery.department,
        recoveryID,
        items
      )
    } else {
      const approved = newRecovery.status == RecoveryStatuses.PURCHASE_APPROVED

      emailSent = await sendPurchaseApprovedEmail(
        approved,
        user,
        sender,
        recipient,
        recovery.refNum,
        recovery.department,
        recovery.reasonForDecline,
        recoveryID
      )
    }

    if (!emailSent) return false

    await myDb("RecoveryEmail").insert({
      recoveryID: recoveryID,
      emailType: newRecovery.status,
      sentDate: new Date(),
      sendingUser: sender,
      recipients: recipient,
    })

    const action = `Notification emailed to ${recipient}.`
    await this.addRecoveryAudit(recoveryID, user, action.slice(0, 49), myDb)

    return true
  }

  private getActionType(status?: string | null) {
    if (isNil(status)) return "Updated Request"

    const reasonForDecline = this.attributes.reasonForDecline?.slice(0, 25)

    switch (status) {
      case RecoveryStatuses.ROUTED_FOR_APPROVAL:
        return "Routed For Approval"
      case RecoveryStatuses.RE_DRAFT:
        return `Request Declined (${reasonForDecline ?? ""}...)`
      case RecoveryStatuses.PURCHASE_APPROVED:
        return "Purchase Approved"
      case RecoveryStatuses.PARTIALLY_FULFILLED:
        return "Partially Filled Items"
      case RecoveryStatuses.FULFILLED:
        return "Filled Items"
      case RecoveryStatuses.COMPLETE:
        return "Completed Request"
      default:
        return "Updated Request"
    }
  }
}

export default UpdateService
