import express, { Request, Response } from "express";
import { ReturnValidationErrors , RequiresAuthentication, RequiresRoleAdminOrIctFinance} from "../middleware";
import { DB_CONFIG , PDF_URL} from "../config";
import { sendJvEmail } from "../services/email";
import knex from "knex";
import axios from "axios";
const FormData = require('form-data');
const fs = require('fs');

const db = knex(DB_CONFIG);
const Excel = require('exceljs');
const PDFDocument = require('pdf-lib').PDFDocument;
export const pdfRouter = express.Router();


pdfRouter.get("/excel/:journalID", RequiresAuthentication, RequiresRoleAdminOrIctFinance, ReturnValidationErrors, async function (req: Request, res: Response) {
    
    const user = req.user.display_name;
    const journalID = Number(req.params.journalID);
    const buffer = await generateExcelFile(journalID)
    await addJournalAudit(journalID, user, "Download JV Excel file.");
    res.status(200).send(buffer);
});



pdfRouter.post("/merge/:journalID", RequiresAuthentication, RequiresRoleAdminOrIctFinance, ReturnValidationErrors, async function (req: Request, res: Response) {

    const journalID = Number(req.params.journalID);
    const user = req.user.display_name;

    try { 
        const pdfFile = await generatePdfFile(req.body.data)
        await addJournalAudit(journalID, user, "Print JV and Recoverable file.");
        res.status(200).send(pdfFile);

    } catch (error: any) {
        console.log(error);
        res.status(500).json("PDF not Found");
    }
});


pdfRouter.post("/email/:journalID", RequiresAuthentication, RequiresRoleAdminOrIctFinance, ReturnValidationErrors, async function (req: Request, res: Response) {

    const journalID = Number(req.params.journalID);
    const user = req.user.display_name;
    const userEmail = req.user.email;

    try {
        const pdfFile = await generatePdfFile(req.body.data)

        const journal = await db("JournalVoucher").select("*").where("journalID", journalID).first();
        const departmentsInfo = await db("DepartmentInfo").select("*").where("department", journal.department).first();
        
        if(!departmentsInfo){
            const action = `Info not provided for ${journal.department}`
            await addJournalAudit(journalID, user, action.slice(0,49));
            return res.status(500).json(action);
        } 

        const emailSent = await sendJvEmail(pdfFile, journalID, user, userEmail, departmentsInfo.contactEmail, departmentsInfo.contactName, journal.department)
        
        if(!emailSent) return res.status(500).json("Email failed");

        await db("JournalSentEmail").insert({
            journalID: journalID,
            sentDate: new Date(),
            sendingUser: userEmail,
            recipients: departmentsInfo.contactEmail
        })

        const action = `Emailed to ${departmentsInfo.contactEmail}.`
        await addJournalAudit(journalID, user, action.slice(0,49));
        res.status(200).json('Email Sent.');

    } catch (error: any) {
        console.log(error);
        res.status(500).json("PDF not Found");
    }
});



//______________________
//______________________
async function generatePdfFile(requestBodyData: any[]){
    
    const pdfsToMerge: any[] = []
    
    try {                
        const logoBlob = Buffer.from(fs.readFileSync('./assets/logo.svg', 'binary'), 'binary');

        for(const recovery of requestBodyData){

            const bodyFormData = new FormData();                        
            bodyFormData.append("html", Buffer.from(recovery.html, 'binary'), 'html.txt');
            bodyFormData.append("images", logoBlob, 'logo.svg');
            
            await axios({method:'post', url:(PDF_URL+'?vuetify=true&images=true'), data:bodyFormData, responseType: 'arraybuffer', headers:{"Content-Type": "multipart/form-data"}})            
                .then((resp: any) => {
                    if(resp?.data){                   
                        pdfsToMerge.push(resp.data);
                    }
                }).catch((err: any) => {
                    console.log(err)
                });

            const backupDocs = recovery.backupDocs
            for(const backupDoc of backupDocs){
                let doc = {document:''}

                if(backupDoc.itemCategory)
                    doc = await db("ItemCategoryDocs")
                        .select("document")
                        .where("itemCatID", backupDoc.id)
                        .where("docName", backupDoc.docName)
                        .first();
                else if(backupDoc.journal)
                    doc = await db("JournalDocs")
                        .select("document")
                        .where("journalID", backupDoc.id)
                        .where("docName", backupDoc.docName)
                        .first();
                else
                    doc = await db("BackUpDocs")
                        .select("document")
                        .where("recoveryID", backupDoc.id)
                        .where("docName", backupDoc.docName)
                        .first();
                
                if(doc?.document){
                    const pdfFile = Buffer.from(doc.document, 'base64').toString('utf-8');
                    pdfsToMerge.push(pdfFile)
                }
            }
        }

        const mergedPdf = await PDFDocument.create(); 
        for (const pdfBytes of pdfsToMerge) {
            try{ 
                const pdf = await PDFDocument.load(pdfBytes);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page: any) => {
                    mergedPdf.addPage(page); 
                });
            }catch (error: any) {
                console.log(error);
            } 
        }     
        const pdfBytes = await mergedPdf.save();
        const pdfFile = Buffer.from(pdfBytes.buffer, 'binary');
        return pdfFile

    } catch (error: any) {
        console.log(error);
        return null
    }
}

async function generateExcelFile(journalID: any){
    try {
        const journal = await db("JournalVoucher").select("*").where("journalID", journalID).first();
        const recoveries = await db("Recovery").select("*").where("journalID", journalID);
    
        const workbook = new Excel.Workbook();
        await workbook.xlsx.readFile('./JV_Template.xlsx');
        const worksheet = workbook.getWorksheet('GL Journal');
        const jvDetails=[
            {col:'G', row:3,  value:journal.jvNum},
            {col:'G', row:4,  value:journal.description},
            {col:'G', row:5,  value:journal.jvDate},
            {col:'G', row:6,  value:journal.period},
            {col:'G', row:7,  value:journal.fiscalYear},        
            {col:'G', row:10, value:journal.orgDepartment},
            {col:'G', row:11, value:journal.odCompletedBy},
            {col:'G', row:12, value:journal.recvDepartment},
            {col:'G', row:13, value:journal.rdCompletedBy},
            {col:'D', row:29, value:journal.explanation},
        ]
        for(const jvDetail of jvDetails){
            const row = worksheet.getRow(jvDetail.row);
            row.getCell(jvDetail.col).value = jvDetail.value;
        }
        
        let rowCounter =16;
        let total = 0;
        let totalCredit = 0;
        let totalDebit = 0;
        const itemCategoryList = await db("ItemCategory").select("*");

        // const departmentInfo = await db("DepartmentInfo").select("*").where("department", journal.department);

        for(const recovery of recoveries){
            
            const recoveryItems = await db("RecoveryItem").select("*").where("recoveryID", recovery.recoveryID);
            let items=''
            for(const item of recoveryItems){
                const index = itemCategoryList.findIndex(category => category.itemCatID == item.itemCatID )
                if(index>-1)                    
                    items += itemCategoryList[index].category+'#'+item.quantity+'@'+item.unitPrice+', '
            }

            // const glcodes = departmentInfo[0]?.glCode? departmentInfo[0].glCode.split('-') : ['','','','','']
            const glcodes = recovery?.glCode? recovery.glCode.split('-') : ['','','','','']

            const explanation = `${recovery.firstName} ${recovery.lastName}; ${items.slice(0,-2)}`
            rowCounter++;
            if(rowCounter>26) {
                worksheet.duplicateRow(rowCounter-1,1,true);            
            }
            const row = worksheet.getRow(rowCounter);
            row.getCell('B').value = glcodes[0]
            row.getCell('C').value = glcodes[1]
            row.getCell('D').value = glcodes[2]
            row.getCell('E').value = glcodes[3]+glcodes[4]
            row.getCell('F').value = Number(recovery.totalPrice);
            row.getCell('G').value = explanation.slice(0,40);
            row.getCell('K').value = recovery.recoveryID;
            
            total += Number(recovery.totalPrice);
            if(Number(recovery.totalPrice)>0)
                totalDebit += Number(recovery.totalPrice)
            else
                totalCredit -= Number(recovery.totalPrice)
        }
        
        if(rowCounter<26) rowCounter=26;
        let row = worksheet.getRow(rowCounter+1);
        row.getCell('F').value ={ formula: `=SUM(F17:F${rowCounter})`, result: total };
        
        row = worksheet.getRow(8);
        row.getCell('G').value ={ formula: `=SUMIF(F17:F${rowCounter},">0")`, result: totalDebit };        

        row = worksheet.getRow(9);
        row.getCell('G').value ={ formula: `=SUMIF(F17:F${rowCounter},"<0")`, result: totalCredit };
        
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer

    } catch (error: any) {
        console.log(error);
        return null
    }
}



//___AUDIT___
async function addJournalAudit(journalID: number, user: string, action: string) {
    const newJournalAudit = {
      date: new Date(),
      journalID: journalID,
      user: user,
      action: action
    };
    return await db("JournalAudit").insert(newJournalAudit, "journalID");
}