import { isNil } from "lodash"

import BaseService from "@/services/base-service"
import db from "@/data/db-client"
import { RecoveryStatuses } from "@/models/recovery"
import { JournalStatuses } from "@/models/journal"

export class UpdateService extends BaseService {
  constructor(
    private attributes: any,
    private currentUser: any,
    private recoveryIDs: number[]
  ) {
    super()
  }

  async perform() {
    if (isNil(this.currentUser)) {
      throw new Error("Current user is required")
    }

    const currentUserDisplayName = this.currentUser.display_name

    const {
      submissionDate,
      jvNum,
      period,
      jvAmount,
      status,
      jvDate,
      description,
      orgDepartment,
      odCompletedBy,
      recvDepartment,
      rdCompletedBy,
      explanation,
    } = this.attributes

    if (isNil(this.attributes.journalID)) {
      throw new Error("Journal ID is required")
    }

    const safeAttributes = {
      submissionDate,
      jvNum,
      period,
      jvAmount,
      status,
      jvDate,
      description,
      orgDepartment,
      odCompletedBy,
      recvDepartment,
      rdCompletedBy,
      explanation,
    }

    return db.transaction(async (trx) => {
      const existingJournal = await trx("JournalVoucher")
        .where("journalID", this.attributes.journalID)
        .first()

      if (isNil(existingJournal)) return existingJournal

      const existingStatus = existingJournal.status

      const [updatedJournal] = await trx("JournalVoucher")
        .where("journalID", this.attributes.journalID)
        .update(safeAttributes)
        .returning("*")

      if (isNil(updatedJournal)) {
        throw new Error("Journal update failed or not found")
      }

      console.log("HEREIN TRANS 333333", this.recoveryIDs)

      if (this.recoveryIDs) {
        // Remove association of recoveries that are not recoveryIDs
        await trx("Recovery")
          .update({ journalID: null, status: RecoveryStatuses.COMPLETE })
          .where("journalID", updatedJournal.journalID)
          .whereNotIn("recoveryID", this.recoveryIDs)

        // Add association of recoveries that are in recoveryIDs
        await trx("Recovery")
          .update({ journalID: updatedJournal.journalID, status: RecoveryStatuses.ON_JOURNAL })
          .whereIn("recoveryID", this.recoveryIDs)
      }

      if (safeAttributes.status == JournalStatuses.PAID) {
        await trx("Recovery")
          .update({ status: RecoveryStatuses.RECOVERED })
          .where("journalID", updatedJournal.journalID)
      } else if (safeAttributes.status == JournalStatuses.DRAFT) {
        await trx("Recovery")
          .update({ status: RecoveryStatuses.ON_JOURNAL })
          .where("journalID", updatedJournal.journalID)
      } else if (safeAttributes.status == JournalStatuses.ROUTED) {
        await trx("Recovery")
          .update({ status: RecoveryStatuses.ON_JOURNAL })
          .where("journalID", updatedJournal.journalID)
      }

      await this.addJournalAudit(
        updatedJournal.journalID,
        currentUserDisplayName,
        this.attributes.status,
        trx
      )

      return updatedJournal
    })
  }

  private async addJournalAudit(journalID: number, user: string, action: string, trx: any) {
    const newJournalAudit = {
      date: new Date(),
      journalID,
      user,
      action,
    }
    return trx("JournalAudit").insert(newJournalAudit, "journalID")
  }
}

export default UpdateService
