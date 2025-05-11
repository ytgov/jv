import express, { Request, Response } from "express"
import { isArray } from "lodash"
import knex from "knex"

import { ReturnValidationErrors } from "@/middleware"
import { DB_CONFIG } from "@/config"
import { AuthorizationRequest, RequiresRoleAdmin } from "@/middleware/authorization-middleware"

const db = knex(DB_CONFIG)

export const adminRouter = express.Router()

adminRouter.get("/item-categories", async function (req: Request, res: Response) {
  const itemCategoryList = await db("ItemCategory").select("*")
  for (const itemCategory of itemCategoryList) {
    const itemCategoryAudits = await db("ItemCategoryAudit")
      .select("*")
      .where("itemCatID", itemCategory.itemCatID)
    itemCategory.itemCategoryAudits = itemCategoryAudits

    const itemCategoryDocument = await db("ItemCategoryDocs")
      .select("docName")
      .where("itemCatID", itemCategory.itemCatID)
    itemCategory.docName = itemCategoryDocument?.length > 0 ? itemCategoryDocument : ""
  }
  res.status(200).json({ itemCategories: itemCategoryList, totalCount: itemCategoryList.length })
})

adminRouter.post(
  "/item-categories/:itemCatID",
  RequiresRoleAdmin,
  async function (req: AuthorizationRequest, res: Response) {
    let itemCatID = Number(req.params.itemCatID)
    const user = req.currentUser?.display_name ?? ""

    try {
      await db.transaction(async (trx) => {
        const newItemCategory = req.body
        let action = req.body.action
        delete req.body.action
        delete req.body.audits
        delete req.body.documents
        delete req.body.itemCatID

        var id = []

        if (itemCatID > 0) {
          action = action ?? "Item modified."

          newItemCategory.modDate = new Date()
          newItemCategory.modUser = user

          id = await trx("ItemCategory")
            .update(newItemCategory, "itemCatID")
            .where("itemCatID", itemCatID)
        } else {
          action = action ?? "New item added."

          newItemCategory.createDate = new Date()
          newItemCategory.modDate = new Date()
          newItemCategory.createUser = user
          newItemCategory.modUser = user
          id = await trx("ItemCategory").insert(newItemCategory, "itemCatID")
        }
        itemCatID = id[0].itemCatID
        await addItemCategoryAudit(itemCatID, user, action, trx)
      })
      res.status(200).json({ itemCatID: itemCatID })
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Insert failed")
    }
  }
)

adminRouter.get(
  "/item-categories/:itemCatID",
  RequiresRoleAdmin,
  ReturnValidationErrors,
  async function (req: AuthorizationRequest, res: Response) {
    const { itemCatID } = req.params
    try {
      const item = await db("ItemCategory").where({ itemCatID }).first()

      if (item) {
        item.audits = await db("ItemCategoryAudit").where("itemCatID", itemCatID)
        item.documents = await db("ItemCategoryDocs").where("itemCatID", itemCatID)
      }

      res.json({ itemCategory: item })
    } catch (error: any) {
      console.log(error)
      res.status(404).json("Not found")
    }
  }
)

//___Department_Info__
adminRouter.get(
  "/department-info",
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    const departmentsInfo = await db("DepartmentInfo").orderBy("glCode")
    res.status(200).json({ codings: departmentsInfo, totalCount: departmentsInfo.length })
  }
)

adminRouter.get(
  "/department-info/:departmentID",
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    const { departmentID } = req.params

    const departmentsInfo = await db("DepartmentInfo").where({ departmentID }).first()
    res.status(200).json({ coding: departmentsInfo, totalCount: departmentsInfo.length })
  }
)

adminRouter.post(
  "/department-info/:departmentID",
  RequiresRoleAdmin,
  ReturnValidationErrors,
  async function (req: AuthorizationRequest, res: Response) {
    const departmentID = Number(req.params.departmentID)
    const user = req.currentUser?.display_name ?? ""
    try {
      await db.transaction(async (trx) => {
        const newDepartmentInfo = req.body

        if (departmentID > 0) {
          newDepartmentInfo.modDate = new Date()
          newDepartmentInfo.modUser = user

          delete newDepartmentInfo.departmentID

          await db("DepartmentInfo").update(newDepartmentInfo).where("departmentID", departmentID)
        } else {
          newDepartmentInfo.createDate = new Date()
          newDepartmentInfo.modDate = new Date()
          newDepartmentInfo.createUser = user
          newDepartmentInfo.modUser = user
          await db("DepartmentInfo").insert(newDepartmentInfo)
        }
      })
      res.status(200).json("successful")
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Insert failed")
    }
  }
)

//___DOCUMENTS__
adminRouter.get(
  "/item-category-documents/:itemCatID/:docName",
  ReturnValidationErrors,
  async function (req, res) {
    try {
      const itemCatID = Number(req.params.itemCatID)
      const docName = req.params.docName
      const doc = await db("ItemCategoryDocs")
        .select("document")
        .where("itemCatID", itemCatID)
        .where("docName", docName)
        .first()
      res.status(200).send(doc.document)
    } catch (error: any) {
      console.log(error)
      res.status(500).json("PDF not Found")
    }
  }
)

adminRouter.delete(
  "/item-category-documents/:itemCatID/:documentID",
  ReturnValidationErrors,
  async function (req: AuthorizationRequest, res: Response) {
    const { itemCatID, documentID } = req.params

    try {
      const doc = await db("ItemCategoryDocs").where({ itemCatID, documentID }).first()

      await db("ItemCategoryDocs").where({ itemCatID, documentID }).delete()

      await addItemCategoryAudit(
        parseInt(itemCatID),
        req.currentUser?.display_name ?? "",
        `Deleted File: ${doc.docName}`
      )
      res.json({ success: true })
    } catch (error: any) {
      console.log(error)
      res.status(500).json("PDF not Found")
    }
  }
)

adminRouter.post(
  "/item-category-documents/:itemCatID",
  RequiresRoleAdmin,
  ReturnValidationErrors,
  async function (req: AuthorizationRequest, res: Response) {
    const files = req.files

    const itemCatID = Number(req.params.itemCatID)
    const user = req.currentUser?.display_name ?? ""

    if (files) {
      const fileList = isArray(files.files) ? files.files : [files.files]

      try {
        await db.transaction(async (trx) => {
          for (const file of fileList) {
            const itemCategoryDoc = await trx("ItemCategoryDocs")
              .select("documentID")
              .where("itemCatID", itemCatID)
              .where("docName", file.name)
              .first()
            if (itemCategoryDoc) {
              await trx("ItemCategoryDocs")
                .update({
                  document: file.data,
                })
                .where("itemCatID", itemCatID)
            } else {
              const newDocument = {
                itemCatID: itemCatID,
                docName: file.name,
                document: file.data,
              }
              await trx("ItemCategoryDocs").insert(newDocument, "documentID")
            }
          }

          const action = "Added File: " + fileList.map((f) => f.name).join(", ")

          await addItemCategoryAudit(itemCatID, user, action, trx)

          res.status(200).json("Successful")
        })
      } catch (error: any) {
        console.log(error)
        res.status(500).json("Insert failed")
      }
    }
  }
)

adminRouter.get("/groups", async function (req: Request, res: Response) {
  const groups = await db("Group").select("*")
  res.status(200).json({ groups: groups, totalCount: groups.length })
})
adminRouter.post(
  "/groups",
  RequiresRoleAdmin,
  async function (req: AuthorizationRequest, res: Response) {
    const newGroup = req.body
    try {
      await db.transaction(async (trx) => {
        newGroup.long_name = `${newGroup.branch}${newGroup.unit ? ` : ${newGroup.unit}` : ""}`
        await trx("Group").insert(newGroup)
      })
      res.status(200).json("successful")
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Insert failed")
    }
  }
)
adminRouter.get(
  "/groups/:id",
  RequiresRoleAdmin,
  async function (req: AuthorizationRequest, res: Response) {
    const id = Number(req.params.id)
    res.json({ group: await db("Group").where({ id }).first() })
  }
)
adminRouter.put(
  "/groups/:id",
  RequiresRoleAdmin,
  async function (req: AuthorizationRequest, res: Response) {
    const id = Number(req.params.id)
    const newGroup = req.body
    delete newGroup.id
    try {
      await db.transaction(async (trx) => {
        newGroup.long_name = `${newGroup.branch}${newGroup.unit ? ` : ${newGroup.unit}` : ""}`
        await trx("Group").where({ id }).update(newGroup)
      })
      res.status(200).json("successful")
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Insert failed")
    }
  }
)
adminRouter.delete(
  "/groups/:id",
  RequiresRoleAdmin,
  async function (req: AuthorizationRequest, res: Response) {
    const id = Number(req.params.id)
    try {
      await db.transaction(async (trx) => {
        await trx("Group").where({ id }).delete()
      })
      res.status(200).json("successful")
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Insert failed")
    }
  }
)

//___AUDIT___
async function addItemCategoryAudit(itemCatID: number, user: string, action: string, myDb = db) {
  const newItemCategoryAudit = {
    date: new Date(),
    itemCatID: itemCatID,
    user: user,
    action: action,
  }
  return await myDb("ItemCategoryAudit").insert(newItemCategoryAudit)
}
