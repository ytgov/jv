import Excel from "exceljs"
import { isUndefined } from "lodash"
import { join } from "path"

import { JV_TEMPLATE_XLSX_FILEPATH } from "@/config"

import BaseService from "@/services/base-service"
import db from "@/data/db-client"

export class GenerateExcelService extends BaseService {
  constructor(private journalID: number) {
    super()
  }

  async perform() {
    const journal = await db("JournalVoucher")
      .select("*")
      .where("journalID", this.journalID)
      .first()
    const recoveries = await db("Recovery").select("*").where("journalID", this.journalID)

    const workbook = new Excel.Workbook()
    await workbook.xlsx.readFile(join(__dirname, JV_TEMPLATE_XLSX_FILEPATH))

    const worksheet = workbook.getWorksheet("GL Journal")
    if (isUndefined(worksheet)) {
      throw new Error("Worksheet not found")
    }

    const jvDetails = [
      { col: "G", row: 3, value: journal.jvNum },
      { col: "G", row: 4, value: journal.description },
      { col: "G", row: 5, value: journal.jvDate },
      { col: "G", row: 6, value: journal.period },
      { col: "G", row: 7, value: journal.fiscalYear },
      { col: "G", row: 10, value: journal.orgDepartment },
      { col: "G", row: 11, value: journal.odCompletedBy },
      { col: "G", row: 12, value: journal.recvDepartment },
      { col: "G", row: 13, value: journal.rdCompletedBy },
      { col: "D", row: 29, value: journal.explanation },
    ]
    for (const jvDetail of jvDetails) {
      const row = worksheet.getRow(jvDetail.row)
      row.getCell(jvDetail.col).value = jvDetail.value
    }

    let rowCounter = 16
    let total = 0
    let totalCredit = 0
    let totalDebit = 0
    const itemCategoryList = await db("ItemCategory").select("*")

    // const departmentInfo = await db("DepartmentInfo").select("*").where("department", journal.department);

    for (const recovery of recoveries) {
      const recoveryItems = await db("RecoveryItem")
        .select("*")
        .where("recoveryID", recovery.recoveryID)
      let items = ""
      for (const item of recoveryItems) {
        const index = itemCategoryList.findIndex((category) => category.itemCatID == item.itemCatID)
        if (index > -1)
          items +=
            itemCategoryList[index].category + "#" + item.quantity + "@" + item.unitPrice + ", "
      }

      // const glcodes = departmentInfo[0]?.glCode? departmentInfo[0].glCode.split('-') : ['','','','','']
      const glcodes = recovery?.glCode ? recovery.glCode.split("-") : ["", "", "", "", ""]

      const explanation = `${recovery.firstName} ${recovery.lastName}; ${items.slice(0, -2)}`
      rowCounter++
      if (rowCounter > 26) {
        worksheet.duplicateRow(rowCounter - 1, 1, true)
      }
      const row = worksheet.getRow(rowCounter)
      row.getCell("B").value = glcodes[0]
      row.getCell("C").value = glcodes[1]
      row.getCell("D").value = glcodes[2]
      row.getCell("E").value = glcodes[3] + glcodes[4]
      row.getCell("F").value = Number(recovery.totalPrice * -1)
      row.getCell("G").value = explanation.slice(0, 40)
      row.getCell("K").value = recovery.recoveryID

      total += Number(recovery.totalPrice)
      if (Number(recovery.totalPrice) > 0) totalDebit += Number(recovery.totalPrice)
      else totalCredit -= Number(recovery.totalPrice)
    }

    if (rowCounter < 26) rowCounter = 26
    let row = worksheet.getRow(rowCounter + 1)
    row.getCell("F").value = { formula: `=SUM(F17:F${rowCounter})`, result: total }

    row = worksheet.getRow(8)
    row.getCell("G").value = { formula: `=SUMIF(F17:F${rowCounter},">0")`, result: totalDebit }

    row = worksheet.getRow(9)
    row.getCell("G").value = { formula: `=SUMIF(F17:F${rowCounter},"<0")`, result: totalCredit }

    return workbook.xlsx.writeBuffer()
  }
}

export default GenerateExcelService
