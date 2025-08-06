import { isNil } from "lodash"

import BaseService from "@/services/base-service"
import db from "@/data/db-client"

export class CreateService extends BaseService {
  constructor(
    private journalID: number,
    private currentUser: any,
    private action: string
  ) {
    super()
  }

  async perform() {
    if (isNil(this.currentUser)) {
      throw new Error("Current user is required")
    }

    const currentUserDisplayName = this.currentUser.display_name

    const journalAuditAttributes = {
      date: new Date(),
      journalID: this.journalID,
      user: currentUserDisplayName,
      action: this.action,
    }

    return db("JournalAudit").insert(journalAuditAttributes, "journalID")
  }
}

export default CreateService
