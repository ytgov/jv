import express, { Request, Response } from "express";
import { ReturnValidationErrors } from "../middleware";
import { DB_CONFIG } from "../config";
import knex from "knex";
import moment from "moment";
import { UserService } from "../services";
import { v4 as uuid } from "uuid";
import { auth } from "express-openid-connect";

const db = knex(DB_CONFIG);

export const recoveriesRouter = express.Router();
const userService = new UserService();

//Need to get items as well
recoveriesRouter.get("/", ReturnValidationErrors, async function (req: Request, res: Response) {
  try {
    let recoveryList = await db("Recovery").select("*");
    //get items from db for each recovery

    for (let recovery of recoveryList) {
      recovery.display_name = `${recovery.FirstName} ${recovery.LastName}`;
      recovery.display_create_date = moment(recovery.CreateDate).format("YYYY-MM-DD");
      recovery.items = await db("Item").select("*").where("recid", recovery.recid);
    }

    res.status(200).json({ data: recoveryList });
  } catch (error: any) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});

recoveriesRouter.get("/:recid", ReturnValidationErrors, async function (req: Request, res: Response) {
  try {
    let recovery = await db("Recovery").select("*").where("recid", req.params.recid).first();

    recovery.items = await db("Item").select("*").where("recid", recovery.recid);

    res.status(200).json({ data: recovery });
  } catch (error: any) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});

recoveriesRouter.post("/", ReturnValidationErrors, async function (req: Request, res: Response) {
  try {
    await db.transaction(async (trx) => {
      let items = req.body.items;
      delete req.body.items;

      req.body.CreateDate = new Date();
      req.body.CreateUser = req.user.email;

      let recovery = await db("Recovery").insert(req.body).returning("recid").transacting(trx);

      for (let index = 0; index < items.length; index++) {
        items[index].recid = recovery[0];
        await db("Items").insert(items[index]).transacting(trx);
      }
    });
    res.status(200).json({ data: "Recovery created" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ Message: "Insert failed", Error: error });
  }
});

recoveriesRouter.put("/:recid", ReturnValidationErrors, async function (req: Request, res: Response) {
  try {
    await db.transaction(async (trx) => {
      let id = req.params.recid;
      let items = req.body.items;

      delete req.body.items;
      delete req.body.recid;

      let recovery = await db("Recovery")
        .update(req.body)
        .where("Recovery.recid", id)
        .returning("recid")
        .transacting(trx);

      await db("Item").delete().where("recid", "=", id).transacting(trx);

      for (let index = 0; index < items.length; index++) {
        await db("Item").insert(items[index]).transacting(trx);
      }
    });
    res.status(200).json({ data: "Recovery created" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ Message: "Insert failed", Error: error });
  }
});
