import express, { Request, Response } from "express";
import { ReturnValidationErrors } from "../middleware";
import { DB_CONFIG } from "../config";
import knex from "knex";
import moment from "moment";
import { UserService } from "../services";


const db = knex(DB_CONFIG);

export const recoveriesRouter = express.Router();
const userService = new UserService();


recoveriesRouter.get("/item-categories", ReturnValidationErrors, async function (req: Request, res: Response) {
  let recoveryList = await db("ItemCategory").select("*");
  res.status(200).json(recoveryList);
});
