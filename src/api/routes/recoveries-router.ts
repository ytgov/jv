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
import { UserService } from "../services";
import { isArray } from "lodash";

const db = knex(DB_CONFIG);

export const recoveriesRouter = express.Router();
const userService = new UserService();

//____Recovery_DOCUMENTS____
recoveriesRouter.get(
  "/backup-documents/:recoveryID/:docName",
  RequiresAuthentication,
  ReturnValidationErrors,
  async function (req, res) {
    const { recoveryID, docName } = req.params;
    const doc = await db("BackUpDocs").where({ recoveryID: recoveryID, docName: docName }).first();

    if (!doc) return res.status(404).send("Document not found");
    res.setHeader("Content-disposition", `attachment; filename="${doc.docName}"`);
    res.setHeader("Content-type", "application/pdf");
    return res.send(doc.document);
  }
);

recoveriesRouter.post(
  "/backup-documents/:recoveryID",
  RequiresAuthentication,
  RequiresRoleAdminOrTech,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    const files = req.files;
    const recoveryID = parseInt(req.params.recoveryID);
    let user = req.user.display_name;

    if (files) {
      const fileList = isArray(files.files) ? files.files : [files.files];

      try {
        await userService.getByEmail(req.user.email).then((resp) => {
          user = resp.display_name;
        });

        await db.transaction(async (trx) => {
          for (const file of fileList) {
            const backupDoc = await trx("BackUpDocs")
              .select("documentID")
              .where("recoveryID", recoveryID)
              .where("docName", file.name)
              .first();

            if (backupDoc) {
              await trx("BackUpDocs")
                .update({
                  document: file.data,
                })
                .where({ recoveryID: recoveryID, docName: file.name });
            } else {
              const newDocument = {
                recoveryID: recoveryID,
                docName: file.name,
                document: file.data,
              };
              await trx("BackUpDocs").insert(newDocument);
            }
          }

          const action = "Added File(s): " + fileList.map((f) => f.name).join(", ");

          await addRecoveryAudit(recoveryID, user, action);

          return res.status(200).json("Successful");
        });
      } catch (error: any) {
        console.log(error);
        return res.status(500).json("Insert failed");
      }
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
    const files = req.files;

    const journalID = Number(req.params.journalID);
    let user = req.user.display_name;

    if (files) {
      const fileList = isArray(files.files) ? files.files : [files.files];

      try {
        await userService.getByEmail(req.user.email).then((resp) => {
          user = resp.display_name;
        });

        await db.transaction(async (trx) => {
          for (const file of fileList) {
            const backupDoc = await trx("JournalDocs")
              .select("documentID")
              .where("journalID", journalID)
              .where("docName", file.name)
              .first();

            if (backupDoc) {
              await trx("JournalDocs")
                .update({
                  document: file.data,
                })
                .where({ journalID: journalID, docName: file.name });
            } else {
              const newDocument = {
                journalID: journalID,
                docName: file.name,
                document: file.data,
              };
              await trx("JournalDocs").insert(newDocument);
            }
          }

          const action = "Added File(s): " + fileList.map((f) => f.name).join(", ");

          await addJournalAudit(journalID, user, action);

          return res.status(200).json("Successful");
        });
      } catch (error: any) {
        console.log(error);
        return res.status(500).json("Insert failed");
      }
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
          id = await trx("Recovery").update(newRecovery, "recoveryID").where("recoveryID", recoveryID);
        } else {
          newRecovery.createUser = userEmail;
          newRecovery.modUser = userEmail;
          id = await trx("Recovery").insert(newRecovery, "recoveryID");
        }
        recoveryID = id[0].recoveryID;

        if (newRecovery.requastorEmail) {
          let requestorUser = await userService.getByEmail(newRecovery.requastorEmail);

          if (!requestorUser) {
            let reqEmployee = await trx("Employees").where({ email: newRecovery.requastorEmail }).first();

            if (reqEmployee) {
              await trx("user").insert({
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

        await trx("RecoveryAudit").insert({
          date: new Date(),
          recoveryID,
          user,
          action,
        });

        await db("RecoveryItem").delete().where("recoveryID", recoveryID);

        for (const newRecoveryItem of newRecoveryItems) {
          if (
            newRecoveryItem.originalQuantity &&
            Number(newRecoveryItem.originalQuantity) != Number(newRecoveryItem.quantity)
          ) {
            await trx("RecoveryAudit").insert({
              date: new Date(),
              recoveryID,
              user,
              action: `Changing Quantity of ${newRecoveryItem.category} from ${newRecoveryItem.originalQuantity} to ${newRecoveryItem.quantity}`,
            });
          }
          delete newRecoveryItem.state;
          delete newRecoveryItem.tmpId;
          delete newRecoveryItem.revisedCost;
          delete newRecoveryItem.originalQuantity;
          delete newRecoveryItem.category;

          newRecoveryItem.recoveryID = recoveryID;

          if (newRecoveryItem.itemID > 0) await insertIntoTable("RecoveryItem", newRecoveryItem, trx);
          else await trx("RecoveryItem").insert(newRecoveryItem);
        }

        const emailSent = await sendEmail(newRecovery, user, recoveryID, trx);
        if (!emailSent) throw Error("Email failed");
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
        await trx("Recovery").update({ glCode: newGlcode }).where("recoveryID", recoveryID);

        const action = `Update Glcode to ${newGlcode}`;
        await addRecoveryAudit(recoveryID, user, action, trx);

        recoveryAudits = await trx("RecoveryAudit").select("*").where("recoveryID", recovery.recoveryID);
      });
      res.status(200).json({ recoveryAudits: recoveryAudits, glCode: newGlcode });
    } catch (error: any) {
      console.log(error);
      res.status(500).json("Insert failed");
    }
  }
);

//___AUDIT___
async function addRecoveryAudit(recoveryID: number, user: string, action: string, myDb = db) {
  const newRecoveryAudit = {
    date: new Date(),
    recoveryID: recoveryID,
    user: user,
    action: action,
  };
  return myDb("RecoveryAudit").insert(newRecoveryAudit);
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
async function insertIntoTable(table: string, data: any, myDb = db) {
  const schema = DB_SCHEMA;
  const { bindings, sql } = myDb.withSchema(schema).insert(data).into(table).toSQL();

  const newQuery = `SET IDENTITY_INSERT ${schema}.${table} ON; ${sql} SET IDENTITY_INSERT ${schema}.${table} OFF;`;

  return await myDb.raw(newQuery, bindings);
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

async function sendEmail(newRecovery: any, user: any, recoveryID: number, myDb = db) {
  if (
    newRecovery.status == "Purchase Approved" ||
    newRecovery.status == "Re-Draft" ||
    newRecovery.status == "Routed For Approval"
  ) {
    const recovery = await myDb("Recovery").select("*").where("recoveryID", recoveryID).first();

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

    await myDb("RecoveryEmail").insert({
      recoveryID: recoveryID,
      emailType: newRecovery.status,
      sentDate: new Date(),
      sendingUser: sender,
      recipients: recipient,
    });

    const action = `Notification emailed to ${recipient}.`;
    await addRecoveryAudit(recoveryID, user, action.slice(0, 49), myDb);
  }

  return true;
}
