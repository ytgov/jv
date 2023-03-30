import express, { Request, Response } from "express";
import { EnsureAuthenticated } from "./auth"
import { AppUser, Team } from "../models/user";
import { RequiresRoleAdmin } from "../middleware";
import { DB_CONFIG } from "../config";
import knex from "knex";
const db = knex(DB_CONFIG);


export const userRouter = express.Router();

userRouter.get("/all-users", EnsureAuthenticated, async (req: Request, res: Response) => {    
    const users = await db("user").select("*");
    res.status(200).json(users);    
});

userRouter.post("/:id", RequiresRoleAdmin, EnsureAuthenticated, async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    try {    
      await db.transaction(async trx => {        
        const newUserInfo = req.body;
        
        if (id > 0) {
          await db("user").update(newUserInfo).where("id", id);
        } 
        else {
          newUserInfo.create_date = new Date();          
          await db("user").insert(newUserInfo);
        }
      });
      res.status(200).json('successful');
    } catch (error: any) {
      console.log(error);
      res.status(500).json("Insert failed");
    }
});


userRouter.get("/", EnsureAuthenticated, async (req: Request, res: Response) => {
    
    const appUser = req.user;
    const roles = await db("Role").select("*");
    
    appUser.teams = new Array<Team>();
    for(const role of roles){
      if(appUser.roles.indexOf(role.role) > -1)
        appUser.teams.push(role)
    }

    res.send(appUser);
});
