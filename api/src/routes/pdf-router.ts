import express, { Response } from "express"

import { ReturnValidationErrors } from "@/middleware"
import {
  AuthorizationRequest,
  RequiresRoleAdminOrIctFinance,
} from "@/middleware/authorization-middleware"

import { sendJvEmail } from "@/services/email"
import { GenerateExcelService, GeneratePdfService } from "@/services/pdf"
import { CreateService as JournalAuditCreateService } from "@/services/journal-audits"

import db from "@/data/db-client"

export const pdfRouter = express.Router()

pdfRouter.get(
  "/excel/:journalID",
  RequiresRoleAdminOrIctFinance,
  ReturnValidationErrors,
  async function (req: AuthorizationRequest, res: Response) {
    try {
      const journalID = Number(req.params.journalID)

      const excelBuffer = await GenerateExcelService.perform(journalID)
      await JournalAuditCreateService.perform(journalID, req.currentUser, "Download JV Excel file.")

      res.status(200).send(excelBuffer)
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Excel not Found")
    }
  }
)

pdfRouter.post(
  "/merge/:journalID",
  RequiresRoleAdminOrIctFinance,
  ReturnValidationErrors,
  async function (req: AuthorizationRequest, res: Response) {
    const journalID = Number(req.params.journalID)

    try {
      const pdfBuffer = await GeneratePdfService.perform(req.body.data)
      await JournalAuditCreateService.perform(
        journalID,
        req.currentUser,
        "Print JV and Recoverable file."
      )

      res.status(200).send(pdfBuffer)
    } catch (error: any) {
      console.log(error)
      res.status(500).json("PDF not Found")
    }
  }
)

pdfRouter.post(
  "/email/:journalID",
  RequiresRoleAdminOrIctFinance,
  ReturnValidationErrors,
  async function (req: AuthorizationRequest, res: Response) {
    const journalID = Number(req.params.journalID)
    const user = req.currentUser?.display_name ?? ""
    const userEmail = req.currentUser?.email ?? ""

    try {
      const pdfFile = await GeneratePdfService.perform(req.body.data)

      const journal = await db("JournalVoucher").select("*").where("journalID", journalID).first()
      const departmentsInfo = await db("DepartmentInfo")
        .select("*")
        .where("department", journal.department)
        .first()

      if (!departmentsInfo) {
        const action = `Info not provided for ${journal.department}`
        await JournalAuditCreateService.perform(journalID, user, action.slice(0, 49))
        return res.status(500).json(action)
      }

      const emailSent = await sendJvEmail(
        pdfFile,
        journalID,
        user,
        userEmail,
        departmentsInfo.contactEmail,
        departmentsInfo.contactName,
        journal.department
      )

      if (!emailSent) return res.status(500).json("Email failed")

      await db("JournalSentEmail").insert({
        journalID: journalID,
        sentDate: new Date(),
        sendingUser: userEmail,
        recipients: departmentsInfo.contactEmail,
      })

      const action = `Emailed to ${departmentsInfo.contactEmail}.`
      await JournalAuditCreateService.perform(journalID, user, action.slice(0, 49))
      res.status(200).json("Email Sent.")
    } catch (error: any) {
      console.log(error)
      res.status(500).json("PDF not Found")
    }
  }
)
