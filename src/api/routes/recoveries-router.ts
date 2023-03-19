import express, { Request, Response } from "express";
import { ReturnValidationErrors , RequiresAuthentication } from "../middleware";
import { DB_CONFIG } from "../config";
import knex from "knex";
import moment from "moment";
import { UserService } from "../services";


const db = knex(DB_CONFIG);

export const recoveriesRouter = express.Router();
const userService = new UserService();


//___CATEGORIES__
recoveriesRouter.get("/item-categories", ReturnValidationErrors, async function (req: Request, res: Response) {
  let itemCategoryList = await db("ItemCategory").select("*");
  res.status(200).json(itemCategoryList);
});



//___DOCUMENTS__
recoveriesRouter.get("/backup-documents/:recoveryID/:docName", RequiresAuthentication, ReturnValidationErrors, async function (req, res) {
  try {
    const recoveryID = req.params.recoveryID;
    const docName = req.params.docName
    const doc = await db("BackUpDocs").select("document").where("recoveryID", recoveryID).where("docName", docName).first();
    res.status(200).send(doc.document);
  } catch (error: any) {
    console.log(error);
    res.status(500).json("PDF not Found");
  }
});

recoveriesRouter.post("/backup-documents/:recoveryID", RequiresAuthentication, ReturnValidationErrors, async function (req: Request, res: Response) {
  
  const file = req.body.file;
  const buffer = db.raw(`CAST('${file}' AS VARBINARY(MAX))`);
  const recoveryID = Number(req.params.recoveryID);
  const user = req.user.display_name  
  const data = JSON.parse(req.body.data);  

  try {
    await db.transaction(async trx => {
      
      const backupDoc = await db("BackUpDocs")
        .select("documentID")
        .where("recoveryID", recoveryID)
        .where("docName", data.docName)        
        .first();
      if (backupDoc) {
        await db("BackUpDocs")
          .update({ 
            document: buffer
          })
          .where("recoveryID", recoveryID);
      } 
      else {
        const newDocument = {
          recoveryID: recoveryID,
          docName: data.docName,
          document: buffer
        };
        await db("BackUpDocs").insert(newDocument, "documentID");
      }

      const action = 'Added File: '+data.docName
      
      await addAudit(recoveryID, user, action)

      res.status(200).json("Successful");
     
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json("Insert failed");
  }
  
});

//____RECOVERIES___
recoveriesRouter.get("/", RequiresAuthentication, ReturnValidationErrors, async function (req: Request, res: Response) {

  const itemState= {
      itemCategoryErr: false,
      descriptionErr: false,
      quantityErr: false,
      unitPriceErr: false
  }


  let tmpId=1000;
  const recoveries = await db("Recovery").select("*");
  for(const recovery of recoveries){
    
    const recoveryItems =  await db("RecoveryItem").select("*").where("recoveryID", recovery.recoveryID);
    for(const recoveryItem of recoveryItems){
      recoveryItem.tmpId = tmpId;
      recoveryItem.state = itemState;
      tmpId++;
    }
    recovery.recoveryItems = recoveryItems;

    const recoveryAudits = await db("RecoveryAudit").select("*").where("recoveryID", recovery.recoveryID);
    recovery.recoveryAudits = recoveryAudits

    const recoveryDocument = await db("BackUpDocs").select("docName").where("recoveryID", recovery.recoveryID);
    recovery.docName = recoveryDocument?.length>0 ? recoveryDocument :''
  }

  res.status(200).json(recoveries);
});

recoveriesRouter.post("/:recoveryID", RequiresAuthentication, ReturnValidationErrors, async function (req: Request, res: Response) {
  
  let recoveryID = Number(req.params.recoveryID)
  const user = req.user.display_name
  try {    
    await db.transaction(async trx => {
      const newRecoveryItems = req.body.recoveryItems;
      delete req.body.recoveryItems;

      const action = req.body.action
      delete req.body.action
      

      var id = [];
      const newRecovery = req.body;
      if (recoveryID > 0) {
        newRecovery.modUser=user
        id = await db("Recovery").update(newRecovery, "recoveryID").where("recoveryID", recoveryID);
      } else {
        newRecovery.createUser=user
        newRecovery.modUser=user
        id = await db("Recovery").insert(newRecovery, "recoveryID");
      }
      recoveryID = id[0].recoveryID

      await addAudit(recoveryID, user, action)

      await db("RecoveryItem").delete().where("recoveryID", recoveryID);
      
      for(const newRecoveryItem of newRecoveryItems){        
        delete newRecoveryItem.state
        delete newRecoveryItem.tmpId
        delete newRecoveryItem.revisedCost

        newRecoveryItem.recoveryID=recoveryID
        if(newRecoveryItem.itemID>0)        
          await insertIntoTable("RecoveryItem", newRecoveryItem);
        else
          await db("RecoveryItem").insert(newRecoveryItem);
      }

    });
    res.status(200).json({recoveryID: recoveryID});
  } catch (error: any) {
    console.log(error);
    res.status(500).json("Insert failed");
  }

});




//___AUDIT___
async function addAudit(recoveryID: number, user: string, action: string){
  const newRecoveryAudit = {
    date: new Date(),
    recoveryID: recoveryID,
    user: user,
    action: action
  }
  return await db("RecoveryAudit").insert(newRecoveryAudit, "recoveryID");  
}


//________
//__UTIL__
async function insertIntoTable(table: string, data: any) {
  const schema='dbo'
  const { bindings, sql } = db
    .withSchema(schema)
    .insert(data)
    .into(table)
    .toSQL();

  const newQuery = `SET IDENTITY_INSERT ${schema}.${table} ON; ${sql} SET IDENTITY_INSERT ${schema}.${table} OFF;`

  return await db.raw(newQuery, bindings)
}