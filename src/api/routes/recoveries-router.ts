import express, { Request, Response } from "express";
import {
  ReturnValidationErrors,
  RequiresAuthentication,
  RequiresRoleAdminOrIctFinance,
  RequiresRoleAdminOrFinance,
  RequiresRoleAdminOrTech,
} from "../middleware";
import { DB_SCHEMA, DB_CONFIG } from "../config";
import knex from "knex";
import { sendPendingApprovalEmail, sendPurchaseApprovedEmail } from "../services/email";
import moment from "moment";
import { UserService } from "../services";
import { v4 as uuid } from "uuid";
import { auth } from "express-openid-connect";

const db = knex(DB_CONFIG);

export const recoveriesRouter = express.Router();
const userService = new UserService();

//____Recovery_DOCUMENTS____
recoveriesRouter.get(
  "/backup-documents/:recoveryID/:docName",
  RequiresAuthentication,
  ReturnValidationErrors,
  async function (req, res) {
    try {
      const recoveryID = req.params.recoveryID;
      const docName = req.params.docName;
      const doc = await db("BackUpDocs")
        .select("document")
        .where("recoveryID", recoveryID)
        .where("docName", docName)
        .first();
      res.status(200).send(doc.document);
    } catch (error: any) {
      console.log(error);
      res.status(500).json("PDF not Found");
    }
  }
);

recoveriesRouter.post(
  "/backup-documents/:recoveryID",
  RequiresAuthentication,
  RequiresRoleAdminOrTech,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    const files = req.body.files;

    const recoveryID = Number(req.params.recoveryID);
    let user = req.user.display_name;
    const data = JSON.parse(req.body.data);

    try {
      await userService.getByEmail(req.user.email).then((resp) => {
        user = resp.display_name;
      });

      await db.transaction(async (trx) => {
        for (const inx in data.docNames) {
          const file = data.docNames.length == 1 ? files : files[inx];
          const docName = data.docNames[inx];

          const buffer = db.raw(`CAST('${file}' AS VARBINARY(MAX))`);
          const backupDoc = await db("BackUpDocs")
            .select("documentID")
            .where("recoveryID", recoveryID)
            .where("docName", docName)
            .first();
          if (backupDoc) {
            await db("BackUpDocs")
              .update({
                document: buffer,
              })
              .where("recoveryID", recoveryID);
          } else {
            const newDocument = {
              recoveryID: recoveryID,
              docName: docName,
              document: buffer,
            };
            await db("BackUpDocs").insert(newDocument, "documentID");
          }
        }

        const action = "Added File(s): " + data.docNames.join(", ");

        await addRecoveryAudit(recoveryID, user, action);

        res.status(200).json("Successful");
      });
    } catch (error: any) {
      console.log(error);
      res.status(500).json("Insert failed");
    }
  }
);

//____Journal_DOCUMENTS____
recoveriesRouter.get(
  "/journal-documents/:journalID/:docName",
  RequiresAuthentication,
  ReturnValidationErrors,
  async function (req, res) {
    try {
      const journalID = req.params.journalID;
      const docName = req.params.docName;
      const doc = await db("JournalDocs")
        .select("document")
        .where("journalID", journalID)
        .where("docName", docName)
        .first();
      res.status(200).send(doc.document);
    } catch (error: any) {
      console.log(error);
      res.status(500).json("PDF not Found");
    }
  }
);

recoveriesRouter.post(
  "/journal-documents/:journalID",
  RequiresAuthentication,
  RequiresRoleAdminOrTech,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    const files = req.body.files;

    const journalID = Number(req.params.journalID);
    let user = req.user.display_name;
    const data = JSON.parse(req.body.data);

    try {
      await userService.getByEmail(req.user.email).then((resp) => {
        user = resp.display_name;
      });

      await db.transaction(async (trx) => {
        for (const inx in data.docNames) {
          const file = data.docNames.length == 1 ? files : files[inx];
          const docName = data.docNames[inx];

          const buffer = db.raw(`CAST('${file}' AS VARBINARY(MAX))`);
          const journalDoc = await db("JournalDocs")
            .select("documentID")
            .where("journalID", journalID)
            .where("docName", docName)
            .first();
          if (journalDoc) {
            await db("JournalDocs")
              .update({
                document: buffer,
              })
              .where("journalID", journalID);
          } else {
            const newDocument = {
              journalID: journalID,
              docName: docName,
              document: buffer,
            };
            await db("JournalDocs").insert(newDocument, "documentID");
          }
        }

        const action = "Added File(s): " + data.docNames.join(", ");

        await addJournalAudit(journalID, user, action);

        res.status(200).json("Successful");
      });
    } catch (error: any) {
      console.log(error);
      res.status(500).json("Insert failed");
    }
  }
);

//____JOURNALS___
recoveriesRouter.get(
  "/journal/:journalID",
  RequiresAuthentication,
  RequiresRoleAdminOrFinance,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    const journalID = Number(req.params.journalID);

    const journal = await db("JournalVoucher").select("*").where("journalID", journalID).first();

    const recoveries = await db("Recovery").select("*").where("journalID", journalID);
    for (const recovery of recoveries) {
      const recoveryItems = await db("RecoveryItem").select("*").where("recoveryID", recovery.recoveryID);
      recovery.recoveryItems = recoveryItems;
      const recoveryAudits = await db("RecoveryAudit").select("*").where("recoveryID", recovery.recoveryID);
      recovery.recoveryAudits = recoveryAudits;
      const recoveryDocument = await db("BackUpDocs").select("docName").where("recoveryID", recovery.recoveryID);
      recovery.docName = recoveryDocument?.length > 0 ? recoveryDocument : "";
    }
    journal.recoveries = recoveries;

    const journalDocument = await db("JournalDocs").select("docName").where("journalID", journalID);
    journal.docName = journalDocument?.length > 0 ? journalDocument : "";

    const journalAudits = await db("JournalAudit").select("*").where("journalID", journal.journalID);
    journal.journalAudits = journalAudits;

    res.status(200).json(journal);
  }
);

recoveriesRouter.get(
  "/journals/",
  RequiresAuthentication,
  RequiresRoleAdminOrFinance,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    let user = req.user;
    await userService.getByEmail(req.user.email).then((resp) => {
      user = resp;
    });

    const adminQuery = function (queryBuilder: any) {
      if (user.roles?.indexOf("Admin") >= 0) queryBuilder.select("*");
      else if (user.roles?.indexOf("IctFinance") >= 0) queryBuilder.select("*");
      else queryBuilder.where("department", user.department).whereNot("status", "Draft").select("*");
    };

    const journals = await db("JournalVoucher").modify(adminQuery);
    for (const journal of journals) {
      const recoveries = await db("Recovery").select("*").where("journalID", journal.journalID);
      for (const recovery of recoveries) {
        const recoveryItems = await db("RecoveryItem").select("*").where("recoveryID", recovery.recoveryID);
        recovery.recoveryItems = recoveryItems;
      }
      journal.recoveries = recoveries;

      const journalDocument = await db("JournalDocs").select("docName").where("journalID", journal.journalID);
      journal.docName = journalDocument?.length > 0 ? journalDocument : "";

      const journalAudits = await db("JournalAudit").select("*").where("journalID", journal.journalID);
      journal.journalAudits = journalAudits;
    }

    res.status(200).json(journals);
  }
);

recoveriesRouter.post(
  "/journals/:journalID",
  RequiresAuthentication,
  RequiresRoleAdminOrIctFinance,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    let journalID = Number(req.params.journalID);
    let user = req.user.display_name;

    try {
      await userService.getByEmail(req.user.email).then((resp) => {
        user = resp.display_name;
      });

      await db.transaction(async (trx) => {
        const recoveryIDs = req.body.recoveryIDs;
        delete req.body.recoveryIDs;

        var id = [];
        const newJournal = req.body;
        if (journalID > 0) {
          id = await db("JournalVoucher").update(newJournal, "journalID").where("journalID", journalID);
        } else {
          newJournal.submissionDate = new Date();
          id = await db("JournalVoucher").insert(newJournal, "journalID");
        }
        journalID = id[0].journalID;

        if (recoveryIDs) {
          await db("Recovery")
            .update({ journalID: null })
            .where("journalID", journalID)
            .whereNotIn("recoveryID", recoveryIDs);
          await db("Recovery").update({ journalID: journalID }).whereIn("recoveryID", recoveryIDs);
        }

        await addJournalAudit(journalID, user, req.body.status);
      });
      res.status(200).json({ journalID: journalID });
    } catch (error: any) {
      console.log(error);
      res.status(500).json("Insert failed");
    }
  }
);

recoveriesRouter.delete(
  "/journals/:journalID",
  RequiresAuthentication,
  RequiresRoleAdminOrIctFinance,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    const journalID = Number(req.params.journalID);

    try {
      await db.transaction(async (trx) => {
        await db("JournalVoucher").delete().where("journalID", journalID);
      });
      res.status(200).json("successful");
    } catch (error: any) {
      console.log(error);
      res.status(500).json("Delete failed");
    }
  }
);

//____RECOVERABLES___
recoveriesRouter.post(
  "/recoverable/:journalID",
  RequiresAuthentication,
  RequiresRoleAdminOrIctFinance,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    const journalID = Number(req.params.journalID);
    let user = req.user.display_name;

    try {
      await db.transaction(async (trx) => {
        await userService.getByEmail(req.user.email).then((resp) => {
          user = resp.display_name;
        });

        const recoveryIDs = req.body.recoveryIDs;
        const jvAmount = req.body.jvAmount;

        if (recoveryIDs) {
          await db("Recovery")
            .update({ journalID: null })
            .where("journalID", journalID)
            .whereNotIn("recoveryID", recoveryIDs);
          await db("Recovery").update({ journalID: journalID }).whereIn("recoveryID", recoveryIDs);

          await db("JournalVoucher")
            .update({ jvAmount: Number(jvAmount) })
            .where("journalID", journalID);

          await addJournalAudit(journalID, user, "Modified Recoverables");
        }
      });
      res.status(200).json("successful");
    } catch (error: any) {
      console.log(error);
      res.status(500).json("Remove failed");
    }
  }
);

//____RECOVERIES___

recoveriesRouter.get(
  "/:recoveryID",
  RequiresAuthentication,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    const itemState = {
      itemCategoryErr: false,
      descriptionErr: false,
      quantityErr: false,
      unitPriceErr: false,
      approvedCostErr: false,
      clientChangeErr: false,
    };

    const recoveryID = Number(req.params.recoveryID);

    let tmpId = 2000;

    const adminQuery = recoveryRoleCheck(req);

    const recovery = await db("Recovery").modify(adminQuery).where("recoveryID", recoveryID).first();
    if (!recovery) return res.status(400).json("Recovery Not Found!");

    const recoveryItems = await db("RecoveryItem").select("*").where("recoveryID", recovery.recoveryID);
    for (const recoveryItem of recoveryItems) {
      recoveryItem.tmpId = tmpId;
      recoveryItem.state = itemState;
      tmpId++;
    }
    recovery.recoveryItems = recoveryItems;

    const recoveryAudits = await db("RecoveryAudit").select("*").where("recoveryID", recovery.recoveryID);
    recovery.recoveryAudits = recoveryAudits;

    const recoveryDocument = await db("BackUpDocs").select("docName").where("recoveryID", recovery.recoveryID);
    recovery.docName = recoveryDocument?.length > 0 ? recoveryDocument : "";

    res.status(200).json(recovery);
  }
);

recoveriesRouter.get("/", RequiresAuthentication, ReturnValidationErrors, async function (req: Request, res: Response) {
  const itemState = {
    itemCategoryErr: false,
    descriptionErr: false,
    quantityErr: false,
    unitPriceErr: false,
    approvedCostErr: false,
    clientChangeErr: false,
  };

  let tmpId = 1000;

  const adminQuery = recoveryRoleCheck(req);

  const recoveries = await db("Recovery").modify(adminQuery);
  for (const recovery of recoveries) {
    const recoveryItems = await db("RecoveryItem").select("*").where("recoveryID", recovery.recoveryID);
    for (const recoveryItem of recoveryItems) {
      recoveryItem.tmpId = tmpId;
      recoveryItem.state = itemState;
      tmpId++;
    }
    recovery.recoveryItems = recoveryItems;

    const recoveryAudits = await db("RecoveryAudit").select("*").where("recoveryID", recovery.recoveryID);
    recovery.recoveryAudits = recoveryAudits;

    const recoveryDocument = await db("BackUpDocs").select("docName").where("recoveryID", recovery.recoveryID);
    recovery.docName = recoveryDocument?.length > 0 ? recoveryDocument : "";

    const journal = await db("JournalVoucher").select("*").where("journalID", recovery.journalID).first();
    recovery.journal = journal ? journal : null;
  }

  res.status(200).json(recoveries);
});

recoveriesRouter.post(
  "/:recoveryID",
  RequiresAuthentication,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    let recoveryID = Number(req.params.recoveryID);
    let user = req.user.display_name;
    const userEmail = req.user.email;

    if (recoveryID > 0) {
      const adminQuery = recoveryRoleCheck(req);
      const recovery = await db("Recovery").modify(adminQuery).where("recoveryID", recoveryID).first();
      if (!recovery) return res.status(400).json("Recovery Not Found!");
    } else {
      if (
        !req.user?.roles ||
        (req.user?.roles?.indexOf("Admin") == -1 &&
          req.user?.roles?.indexOf("BranchAdmin") == -1 &&
          req.user?.roles?.indexOf("BranchAgent") == -1)
      ) {
        return res.status(401).send("You are not an authorized person!");
      }
    }

    try {
      await userService.getByEmail(req.user.email).then((resp) => {
        user = resp.display_name;
      });

      await db.transaction(async (trx) => {
        const newRecoveryItems = req.body.recoveryItems;
        delete req.body.recoveryItems;

        const action = req.body.action;
        delete req.body.action;

        var id = [];
        const newRecovery = req.body;
        if (recoveryID > 0) {
          if (newRecovery.status != "Purchase Approved" && newRecovery.status != "Re-Draft")
            newRecovery.modUser = userEmail;
          id = await db("Recovery").update(newRecovery, "recoveryID").where("recoveryID", recoveryID);
        } else {
          newRecovery.createUser = userEmail;
          newRecovery.modUser = userEmail;
          id = await db("Recovery").insert(newRecovery, "recoveryID");
        }
        recoveryID = id[0].recoveryID;

        if (newRecovery.requastorEmail) {
          let requestorUser = await userService.getByEmail(newRecovery.requastorEmail);

          if (!requestorUser) {
            let reqEmployee = await db("Employees").where({ email: newRecovery.requastorEmail }).first();

            if (reqEmployee) {
              await db("user").insert({
                email: newRecovery.requastorEmail,
                first_name: reqEmployee.first_name,
                last_name: reqEmployee.last_name,
                display_name: reqEmployee.full_name,
                roles: "BranchUser",
                department: reqEmployee.department,
                status: "Active",
                create_date: new Date(),
              });
            }
          }
        }

        await addRecoveryAudit(recoveryID, user, action);

        await db("RecoveryItem").delete().where("recoveryID", recoveryID);

        for (const newRecoveryItem of newRecoveryItems) {
          if (
            newRecoveryItem.originalQuantity &&
            Number(newRecoveryItem.originalQuantity) != Number(newRecoveryItem.quantity)
          ) {
            await addRecoveryAudit(
              recoveryID,
              user,
              `Changing Quantity of ${newRecoveryItem.category} from ${newRecoveryItem.originalQuantity} to ${newRecoveryItem.quantity}`
            );
          }
          delete newRecoveryItem.state;
          delete newRecoveryItem.tmpId;
          delete newRecoveryItem.revisedCost;
          delete newRecoveryItem.originalQuantity;
          delete newRecoveryItem.category;

          newRecoveryItem.recoveryID = recoveryID;
          if (newRecoveryItem.itemID > 0) await insertIntoTable("RecoveryItem", newRecoveryItem);
          else await db("RecoveryItem").insert(newRecoveryItem);
        }

        const emailSent = await sendEmail(newRecovery, user, recoveryID);
        if (!emailSent) return res.status(500).json("Email failed");
      });
      res.status(200).json({ recoveryID: recoveryID });
    } catch (error: any) {
      console.log(error);
      res.status(500).json("Insert failed");
    }
  }
);

recoveriesRouter.delete(
  "/:recoveryID",
  RequiresAuthentication,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    let recoveryID = Number(req.params.recoveryID);
    let user = req.user.display_name;
    const userEmail = req.user.email;

    console.log("YOU ARE TRYING TO DELETE", recoveryID);

    await db("RecoveryEmail").where({ recoveryID }).delete();
    await db("RecoveryAudit").where({ recoveryID }).delete();
    await db("RecoveryItem").where({ recoveryID }).delete();
    await db("Recovery").where({ recoveryID }).delete();

    res.json({});
  }
);

recoveriesRouter.post(
  "/glcode/:recoveryID",
  RequiresAuthentication,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    let recoveryID = Number(req.params.recoveryID);
    let user = req.user.display_name;
    let recoveryAudits: any[] = [];
    const adminQuery = recoveryRoleCheck(req);
    const recovery = await db("Recovery").modify(adminQuery).where("recoveryID", recoveryID).first();
    if (!recovery) return res.status(400).json("Recovery Not Found!");
    const newGlcode = req.body.glCode;

    try {
      await db.transaction(async (trx) => {
        await db("Recovery").update({ glCode: newGlcode }).where("recoveryID", recoveryID);

        const action = `Update Glcode to ${newGlcode}`;
        await addRecoveryAudit(recoveryID, user, action);

        recoveryAudits = await db("RecoveryAudit").select("*").where("recoveryID", recovery.recoveryID);
      });
      res.status(200).json({ recoveryAudits: recoveryAudits, glCode: newGlcode });
    } catch (error: any) {
      console.log(error);
      res.status(500).json("Insert failed");
    }
  }
);

//___AUDIT___
async function addRecoveryAudit(recoveryID: number, user: string, action: string) {
  const newRecoveryAudit = {
    date: new Date(),
    recoveryID: recoveryID,
    user: user,
    action: action,
  };
  return await db("RecoveryAudit").insert(newRecoveryAudit, "recoveryID");
}

async function addJournalAudit(journalID: number, user: string, action: string) {
  const newJournalAudit = {
    date: new Date(),
    journalID: journalID,
    user: user,
    action: action,
  };
  return await db("JournalAudit").insert(newJournalAudit, "journalID");
}

//________
//__UTIL__
async function insertIntoTable(table: string, data: any) {
  const schema = DB_SCHEMA;
  const { bindings, sql } = db.withSchema(schema).insert(data).into(table).toSQL();

  const newQuery = `SET IDENTITY_INSERT ${schema}.${table} ON; ${sql} SET IDENTITY_INSERT ${schema}.${table} OFF;`;

  return await db.raw(newQuery, bindings);
}

function recoveryRoleCheck(req: any) {
  // console.log(req.user)
  let user = req.user;
  let userLastName = "";
  let userFirstName = "";
  const userEmail = req.user.email;

  if (user.first_name && user.last_name) {
    userFirstName = user.first_name;
    userLastName = user.last_name;
  } else {
    const fullname = user.display_name.split("@");
    const names = fullname[0]?.split(".");
    userFirstName = names[0];
    userLastName = names[1] ? names[1] : "";
  }

  const adminQuery = function (queryBuilder: any) {
    if (user.roles?.indexOf("Admin") >= 0) queryBuilder.select("*");
    else if (user.roles?.indexOf("IctFinance") >= 0) queryBuilder.select("*");
    else if (user.roles?.indexOf("BranchAdmin") >= 0) queryBuilder.whereLike("branch", `%${user.branch}%`).select("*");
    else if (user.roles?.indexOf("BranchAgent") >= 0) queryBuilder.whereLike("branch", `%${user.branch}%`).select("*");
    else if (user.roles?.indexOf("DeptFinance") >= 0) queryBuilder.where("department", user.department).select("*");
    else
      queryBuilder
        .where({ lastName: userLastName, firstName: userFirstName })
        .orWhere("requastorEmail", userEmail)
        .select("*");
  };

  return adminQuery;
}

async function sendEmail(newRecovery: any, user: any, recoveryID: number) {
  if (
    newRecovery.status == "Purchase Approved" ||
    newRecovery.status == "Re-Draft" ||
    newRecovery.status == "Routed For Approval"
  ) {
    const recovery = await db("Recovery").select("*").where("recoveryID", recoveryID).first();

    const sender = newRecovery.status == "Routed For Approval" ? recovery.modUser : recovery.requastorEmail;
    const recipient = newRecovery.status == "Routed For Approval" ? recovery.requastorEmail : recovery.modUser;
    const recipientName =
      newRecovery.status == "Routed For Approval" ? recovery.firstName + " " + recovery.lastName : "Recovery Agent";

    let emailSent = null;

    if (newRecovery.status == "Routed For Approval") {
      const reminder = false;
      emailSent = await sendPendingApprovalEmail(reminder, user, sender, recipient, recipientName, recovery.department);
    } else {
      const approved = newRecovery.status == "Purchase Approved";
      emailSent = await sendPurchaseApprovedEmail(
        approved,
        user,
        sender,
        recipient,
        recovery.refNum,
        recovery.department,
        recovery.reasonForDecline
      );
    }

    if (!emailSent) return false;

    await db("RecoveryEmail").insert({
      recoveryID: recoveryID,
      emailType: newRecovery.status,
      sentDate: new Date(),
      sendingUser: sender,
      recipients: recipient,
    });

    const action = `Notification emailed to ${recipient}.`;
    await addRecoveryAudit(recoveryID, user, action.slice(0, 49));
  }
  return true;
}
