import express, { Request, Response } from "express";
import { ReturnValidationErrors, RequiresAuthentication, RequiresRoleAdmin } from "../middleware";
import { DB_CONFIG } from "../config";
import knex from "knex";
import moment from "moment";
import { UserService } from "../services";
import { isArray } from "lodash";

const db = knex(DB_CONFIG);

export const adminRouter = express.Router();
const userService = new UserService();

//___CATEGORIES__
adminRouter.get(
  "/item-categories",
  RequiresAuthentication,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    const itemCategoryList = await db("ItemCategory").select("*");
    for (const itemCategory of itemCategoryList) {
      const itemCategoryAudits = await db("ItemCategoryAudit").select("*").where("itemCatID", itemCategory.itemCatID);
      itemCategory.itemCategoryAudits = itemCategoryAudits;

      const itemCategoryDocument = await db("ItemCategoryDocs")
        .select("docName")
        .where("itemCatID", itemCategory.itemCatID);
      itemCategory.docName = itemCategoryDocument?.length > 0 ? itemCategoryDocument : "";
    }
    res.status(200).json(itemCategoryList);
  }
);

adminRouter.post(
  "/item-categories/:itemCatID",
  RequiresAuthentication,
  RequiresRoleAdmin,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    let itemCatID = Number(req.params.itemCatID);
    const user = req.user.display_name;
    try {
      await db.transaction(async (trx) => {
        const newItemCategory = req.body;
        const action = req.body.action;
        delete req.body.action;

        var id = [];

        if (itemCatID > 0) {
          newItemCategory.modDate = new Date();
          newItemCategory.modUser = user;
          id = await db("ItemCategory").update(newItemCategory, "itemCatID").where("itemCatID", itemCatID);
        } else {
          newItemCategory.createDate = new Date();
          newItemCategory.modDate = new Date();
          newItemCategory.createUser = user;
          newItemCategory.modUser = user;
          id = await db("ItemCategory").insert(newItemCategory, "itemCatID");
        }
        itemCatID = id[0].itemCatID;
        await addItemCategoryAudit(itemCatID, user, action);
      });
      res.status(200).json({ itemCatID: itemCatID });
    } catch (error: any) {
      console.log(error);
      res.status(500).json("Insert failed");
    }
  }
);

//___Department_Info__
adminRouter.get(
  "/department-info",
  RequiresAuthentication,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    const departmentsInfo = await db("DepartmentInfo").select("*");
    res.status(200).json(departmentsInfo);
  }
);

adminRouter.post(
  "/department-info/:departmentID",
  RequiresAuthentication,
  RequiresRoleAdmin,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    const departmentID = Number(req.params.departmentID);
    const user = req.user.display_name;
    try {
      await db.transaction(async (trx) => {
        const newDepartmentInfo = req.body;

        if (departmentID > 0) {
          newDepartmentInfo.modDate = new Date();
          newDepartmentInfo.modUser = user;
          await db("DepartmentInfo").update(newDepartmentInfo).where("departmentID", departmentID);
        } else {
          newDepartmentInfo.createDate = new Date();
          newDepartmentInfo.modDate = new Date();
          newDepartmentInfo.createUser = user;
          newDepartmentInfo.modUser = user;
          await db("DepartmentInfo").insert(newDepartmentInfo);
        }
      });
      res.status(200).json("successful");
    } catch (error: any) {
      console.log(error);
      res.status(500).json("Insert failed");
    }
  }
);

//___DOCUMENTS__
adminRouter.get(
  "/item-category-documents/:itemCatID/:docName",
  RequiresAuthentication,
  ReturnValidationErrors,
  async function (req, res) {
    try {
      const itemCatID = Number(req.params.itemCatID);
      const docName = req.params.docName;
      const doc = await db("ItemCategoryDocs")
        .select("document")
        .where("itemCatID", itemCatID)
        .where("docName", docName)
        .first();
      res.status(200).send(doc.document);
    } catch (error: any) {
      console.log(error);
      res.status(500).json("PDF not Found");
    }
  }
);

adminRouter.post(
  "/item-category-documents/:itemCatID",
  RequiresAuthentication,
  RequiresRoleAdmin,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    const files = req.files;

    const itemCatID = Number(req.params.itemCatID);
    let user = req.user.display_name;

    if (files) {
      const fileList = isArray(files.files) ? files.files : [files.files];

      try {
        await db.transaction(async (trx) => {
          for (const file of fileList) {
            const itemCategoryDoc = await trx("ItemCategoryDocs")
              .select("documentID")
              .where("itemCatID", itemCatID)
              .where("docName", file.name)
              .first();
            if (itemCategoryDoc) {
              await trx("ItemCategoryDocs")
                .update({
                  document: file.data,
                })
                .where("itemCatID", itemCatID);
            } else {
              const newDocument = {
                itemCatID: itemCatID,
                docName: file.name,
                document: file.data,
              };
              await trx("ItemCategoryDocs").insert(newDocument, "documentID");
            }
          }

          const action = "Added File(s): " + fileList.map((f) => f.name).join(", ");

          await addItemCategoryAudit(itemCatID, user, action, trx);

          res.status(200).json("Successful");
        });
      } catch (error: any) {
        console.log(error);
        res.status(500).json("Insert failed");
      }
    }
  }
);

//___AUDIT___
async function addItemCategoryAudit(itemCatID: number, user: string, action: string, myDb = db) {
  const newItemCategoryAudit = {
    date: new Date(),
    itemCatID: itemCatID,
    user: user,
    action: action,
  };
  return await myDb("ItemCategoryAudit").insert(newItemCategoryAudit);
}
