import express, { Request, Response } from "express"
import knex from "knex"
import { isArray } from "lodash"

import { ReturnValidationErrors } from "@/middleware"
import { DB_CONFIG } from "@/config"
import { UserService } from "@/services"
import {
  AuthorizationRequest,
  RequiresRoleAdminOrFinance,
  RequiresRoleAdminOrIctFinance,
  RequiresRoleAdminOrTech,
} from "@/middleware/authorization-middleware"

const db = knex(DB_CONFIG)

export const journalsRouter = express.Router()

//____Journal_DOCUMENTS____
journalsRouter.get(
  "/journal-documents/:journalID/:docName",
  ReturnValidationErrors,
  async function (req, res) {
    try {
      const journalID = req.params.journalID
      const docName = req.params.docName
      const doc = await db("JournalDocs")
        .select("document")
        .where("journalID", journalID)
        .where("docName", docName)
        .first()
      res.status(200).send(doc.document)
    } catch (error: any) {
      console.log(error)
      res.status(500).json("PDF not Found")
    }
  }
)

journalsRouter.post(
  "/journal-documents/:journalID",
  RequiresRoleAdminOrTech,
  ReturnValidationErrors,
  async function (req: AuthorizationRequest, res: Response) {
    const files = req.files

    const journalID = Number(req.params.journalID)
    const user = req.currentUser?.display_name ?? ""

    if (files) {
      const fileList = isArray(files.files) ? files.files : [files.files]

      try {
        await db.transaction(async (trx) => {
          for (const file of fileList) {
            const backupDoc = await trx("JournalDocs")
              .select("documentID")
              .where("journalID", journalID)
              .where("docName", file.name)
              .first()

            if (backupDoc) {
              await trx("JournalDocs")
                .update({
                  document: file.data,
                })
                .where({ journalID: journalID, docName: file.name })
            } else {
              const newDocument = {
                journalID: journalID,
                docName: file.name,
                document: file.data,
              }
              await trx("JournalDocs").insert(newDocument)
            }
          }

          const action = "Added File(s): " + fileList.map((f) => f.name).join(", ")

          await addJournalAudit(journalID, user, action, trx)

          return res.status(200).json("Successful")
        })
      } catch (error: any) {
        console.log(error)
        return res.status(500).json("Insert failed")
      }
    }
  }
)

//____JOURNALS___
journalsRouter.get(
  "/:journalID",
  RequiresRoleAdminOrFinance,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    const journalID = Number(req.params.journalID)

    const journal = await db("JournalVoucher").select("*").where("journalID", journalID).first()

    const recoveries = await db("Recovery").select("*").where("journalID", journalID)
    for (const recovery of recoveries) {
      const recoveryItems = await db("RecoveryItem")
        .select("*")
        .where("recoveryID", recovery.recoveryID)
      recovery.recoveryItems = recoveryItems
      const recoveryAudits = await db("RecoveryAudit")
        .select("*")
        .where("recoveryID", recovery.recoveryID)
      recovery.recoveryAudits = recoveryAudits
      const recoveryDocument = await db("BackUpDocs")
        .select("docName")
        .where("recoveryID", recovery.recoveryID)
      recovery.docName = recoveryDocument?.length > 0 ? recoveryDocument : ""
    }
    journal.recoveries = recoveries

    const journalDocument = await db("JournalDocs").select("docName").where("journalID", journalID)
    journal.docName = journalDocument?.length > 0 ? journalDocument : ""

    const journalAudits = await db("JournalAudit").select("*").where("journalID", journal.journalID)
    journal.journalAudits = journalAudits

    res.status(200).json(journal)
  }
)

journalsRouter.get(
  "/",
  RequiresRoleAdminOrFinance,
  ReturnValidationErrors,
  async function (req: AuthorizationRequest, res: Response) {
    const roles = (req.currentUser?.roles ?? "").split(",")

    const adminQuery = function (queryBuilder: any) {
      if (roles.indexOf("Admin") >= 0) queryBuilder.select("*")
      else if (roles.indexOf("IctFinance") >= 0) queryBuilder.select("*")
      else
        queryBuilder
          .where("department", req.currentUser?.department)
          .whereNot("status", "Draft")
          .select("*")
    }

    const journals = await db("JournalVoucher").modify(adminQuery)
    for (const journal of journals) {
      const recoveries = await db("Recovery").select("*").where("journalID", journal.journalID)
      for (const recovery of recoveries) {
        const recoveryItems = await db("RecoveryItem")
          .select("*")
          .where("recoveryID", recovery.recoveryID)
        recovery.recoveryItems = recoveryItems
      }
      journal.recoveries = recoveries

      const journalDocument = await db("JournalDocs")
        .select("docName")
        .where("journalID", journal.journalID)
      journal.docName = journalDocument?.length > 0 ? journalDocument : ""

      const journalAudits = await db("JournalAudit")
        .select("*")
        .where("journalID", journal.journalID)
      journal.journalAudits = journalAudits
    }

    res.status(200).json({ journals, totalCount: journals.length })
  }
)

journalsRouter.post(
  "/:journalID",
  RequiresRoleAdminOrIctFinance,
  ReturnValidationErrors,
  async function (req: AuthorizationRequest, res: Response) {
    let journalID = Number(req.params.journalID)
    const user = req.currentUser?.display_name ?? ""

    try {
      await db.transaction(async (trx) => {
        const recoveryIDs = req.body.recoveryIDs
        delete req.body.recoveryIDs

        var id = []
        const newJournal = req.body
        if (journalID > 0) {
          id = await trx("JournalVoucher")
            .update(newJournal, "journalID")
            .where("journalID", journalID)
        } else {
          newJournal.submissionDate = new Date()
          id = await trx("JournalVoucher").insert(newJournal, "journalID")
        }
        journalID = id[0].journalID

        if (recoveryIDs) {
          await trx("Recovery")
            .update({ journalID: null })
            .where("journalID", journalID)
            .whereNotIn("recoveryID", recoveryIDs)
          await trx("Recovery").update({ journalID: journalID }).whereIn("recoveryID", recoveryIDs)
        }

        await addJournalAudit(journalID, user, req.body.status, trx)
      })
      res.status(200).json({ journalID: journalID })
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Insert failed")
    }
  }
)

journalsRouter.delete(
  "/:journalID",
  RequiresRoleAdminOrIctFinance,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    const journalID = Number(req.params.journalID)

    try {
      await db("JournalVoucher").delete().where("journalID", journalID)
      res.status(200).json("successful")
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Delete failed")
    }
  }
)

//____RECOVERABLES___
journalsRouter.post(
  "/recoverable/:journalID",
  RequiresRoleAdminOrIctFinance,
  ReturnValidationErrors,
  async function (req: AuthorizationRequest, res: Response) {
    const journalID = Number(req.params.journalID)
    const user = req.currentUser?.display_name ?? ""

    try {
      await db.transaction(async (trx) => {
        const recoveryIDs = req.body.recoveryIDs
        const jvAmount = req.body.jvAmount

        if (recoveryIDs) {
          await trx("Recovery")
            .update({ journalID: null })
            .where("journalID", journalID)
            .whereNotIn("recoveryID", recoveryIDs)
          await trx("Recovery").update({ journalID: journalID }).whereIn("recoveryID", recoveryIDs)

          await trx("JournalVoucher")
            .update({ jvAmount: Number(jvAmount) })
            .where("journalID", journalID)

          await addJournalAudit(journalID, user, "Modified Recoverables", trx)
        }
      })
      res.status(200).json("successful")
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Remove failed")
    }
  }
)

async function addJournalAudit(journalID: number, user: string, action: string, myDb = db) {
  const newJournalAudit = {
    date: new Date(),
    journalID: journalID,
    user: user,
    action: action,
  }
  return await db("JournalAudit").insert(newJournalAudit, "journalID")
}
