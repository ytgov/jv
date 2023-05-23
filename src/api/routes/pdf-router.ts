import express, { Request, Response } from "express";
import { ReturnValidationErrors , RequiresAuthentication } from "../middleware";
import { DB_CONFIG , PDF_URL} from "../config";
import knex from "knex";
import axios from "axios";
const FormData = require('form-data');
const fs = require('fs');

const db = knex(DB_CONFIG);
const Excel = require('exceljs');
const PDFDocument = require('pdf-lib').PDFDocument;
export const pdfRouter = express.Router();


pdfRouter.get("/excel/:journalID", RequiresAuthentication, ReturnValidationErrors, async function (req: Request, res: Response) {
    
    const journalID = Number(req.params.journalID);
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

    const departmentInfo = await db("DepartmentInfo").select("*").where("department", journal.department);

    for(const recovery of recoveries){
        
        const recoveryItems = await db("RecoveryItem").select("*").where("recoveryID", recovery.recoveryID);
        let items=''
        for(const item of recoveryItems){
            const index = itemCategoryList.findIndex(category => category.itemCatID == item.itemCatID )
            if(index>-1)                    
                items += itemCategoryList[index].category+'#'+item.quantity+'@'+item.unitPrice+', '
        }

        const glcodes = departmentInfo[0]?.glCode? departmentInfo[0].glCode.split('-') : ['','','','','']

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
    res.status(200).send(buffer);
});



pdfRouter.post("/merge", RequiresAuthentication, ReturnValidationErrors, async function (req: Request, res: Response) {
    const pdfsToMerge: any[] = []
    
    try {                
        const logoBlob = Buffer.from(fs.readFileSync('./assets/logo.svg', 'binary'), 'binary');

        for(const recovery of req.body.data){
            
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
            const pdf = await PDFDocument.load(pdfBytes); 
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page: any) => {
                mergedPdf.addPage(page); 
            }); 
        }     
        const pdfBytes = await mergedPdf.save();
        const pdfFile = Buffer.from(pdfBytes.buffer, 'binary');
        res.status(200).send(pdfFile);

    } catch (error: any) {
        console.log(error);
        res.status(500).json("PDF not Found");
    }
});