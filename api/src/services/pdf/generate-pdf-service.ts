import { readFileSync } from "fs"
import { join } from "path"
import axios from "axios"
import { PDFDocument } from "pdf-lib"
import FormData from "form-data"
import { isNil } from "lodash"

import { LOGO_FILEPATH, PDF_URL } from "@/config"

import BaseService from "@/services/base-service"
import db from "@/data/db-client"

export class GeneratePdfService extends BaseService {
  constructor(private requestBodyData: any[]) {
    super()
  }

  async perform() {
    const pdfsToMerge: Buffer[] = []
    const logoBlob = readFileSync(join(__dirname, LOGO_FILEPATH), "binary")

    for (const recovery of this.requestBodyData) {
      const bodyFormData = new FormData()
      bodyFormData.append("html", Buffer.from(recovery.html, "binary"), "html.txt")
      bodyFormData.append("images", logoBlob, "logo.svg")

      try {
        const response = await axios({
          method: "post",
          url: PDF_URL + "?vuetify=true&images=true",
          data: bodyFormData,
          responseType: "arraybuffer",
          headers: { "Content-Type": "multipart/form-data" },
        })

        if (response?.data) {
          pdfsToMerge.push(response.data)
        }
      } catch (error: any) {
        console.error("Failed to generate PDF:", error)
      }

      const backupDocs = recovery.backupDocs
      const attachedDocNames = new Array<string>()
      for (const backupDoc of backupDocs) {
        let doc = { document: "", docName: "" }

        if (backupDoc.itemCategory) {
          doc = await db("ItemCategoryDocs")
            .select("document", "docName")
            .where("itemCatID", backupDoc.id)
            .where("docName", backupDoc.docName.docName)
            .first()
        } else if (backupDoc.journal) {
          doc = await db("JournalDocs")
            .select("document", "docName")
            .where("journalID", backupDoc.id)
            .where("docName", backupDoc.docName)
            .first()
        } else {
          doc = await db("BackUpDocs")
            .select("document", "docName")
            .where("recoveryID", backupDoc.id)
            .where("docName", backupDoc.docName)
            .first()
        }

        if (!isNil(doc.document) && !attachedDocNames.includes(doc.docName)) {
          const pdfFile = Buffer.isBuffer(doc.document) ? doc.document : Buffer.from(doc.document)
          pdfsToMerge.push(pdfFile)
          attachedDocNames.push(doc.docName)
        }
      }
    }

    const mergedPdf = await PDFDocument.create()
    for (const pdfBytes of pdfsToMerge) {
      try {
        const pdf = await PDFDocument.load(pdfBytes)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        pages.forEach((page) => mergedPdf.addPage(page))
      } catch (error: any) {
        console.error("Failed to merge a PDF:", error)
      }
    }

    const mergedBuffer = await mergedPdf.save()
    return Buffer.from(mergedBuffer)
  }
}

export default GeneratePdfService
