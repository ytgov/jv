import express, { Request, Response } from "express";
import { ReturnValidationErrors , RequiresAuthentication } from "../middleware";
import { DB_CONFIG } from "../config";
import knex from "knex";
import moment from "moment";
import { UserService } from "../services";


const db = knex(DB_CONFIG);

export const adminRouter = express.Router();
const userService = new UserService();


//___CATEGORIES__
adminRouter.get("/item-categories", ReturnValidationErrors, async function (req: Request, res: Response) {
  let itemCategoryList = await db("ItemCategory").select("*");
  res.status(200).json(itemCategoryList);
});

adminRouter.post("/item-categories/:itemCatID", RequiresAuthentication, ReturnValidationErrors, async function (req: Request, res: Response) {
  const itemCatID = Number(req.params.itemCatID)
  const user = req.user.display_name
  try {    
    await db.transaction(async trx => {
      
      const newItemCategory = req.body;
      
      if (itemCatID > 0) {
        newItemCategory.modDate = new Date();
        newItemCategory.modUser = user;
        await db("ItemCategory").update(newItemCategory).where("itemCatID", itemCatID);
      } 
      else {
        newItemCategory.createDate = new Date();
        newItemCategory.modDate = new Date();
        newItemCategory.createUser = user;
        newItemCategory.modUser = user;
        await db("ItemCategory").insert(newItemCategory);
      }
    });
    res.status(200).json('successful');
  } catch (error: any) {
    console.log(error);
    res.status(500).json("Insert failed");
  }
});


//___Department_Info__
adminRouter.get("/department-info", ReturnValidationErrors, async function (req: Request, res: Response) {
  const departmentsInfo = await db("DepartmentInfo").select("*");
  res.status(200).json(departmentsInfo);
});

adminRouter.post("/department-info/:departmentID", RequiresAuthentication, ReturnValidationErrors, async function (req: Request, res: Response) {
  const departmentID = Number(req.params.departmentID)
  const user = req.user.display_name
  try {    
    await db.transaction(async trx => {
      
      const newDepartmentInfo = req.body;
      
      if (departmentID > 0) {
        newDepartmentInfo.modDate = new Date();
        newDepartmentInfo.modUser = user;
        await db("DepartmentInfo").update(newDepartmentInfo).where("departmentID", departmentID);
      } 
      else {
        newDepartmentInfo.createDate = new Date();
        newDepartmentInfo.modDate = new Date();
        newDepartmentInfo.createUser = user;
        newDepartmentInfo.modUser = user;
        await db("DepartmentInfo").insert(newDepartmentInfo);
      }
    });
    res.status(200).json('successful');
  } catch (error: any) {
    console.log(error);
    res.status(500).json("Insert failed");
  }
});

