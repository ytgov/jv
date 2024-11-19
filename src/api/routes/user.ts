import express, { Request, Response } from "express";
import { EnsureAuthenticated } from "./auth";
import { AppUser, Team } from "../models/user";
import { RequiresAuthentication, RequiresRoleAdmin } from "../middleware";
import { DB_CONFIG } from "../config";
import knex from "knex";
const db = knex(DB_CONFIG);

export const userRouter = express.Router();

userRouter.post("/agent-glcode", RequiresAuthentication, async function (req: Request, res: Response) {
  try {
    const agentEmail = req.body.email;
    const agent = await db("user").select("*").where("email", agentEmail);
    if (!agent) return res.status(400).json("Agent Not Found!");
    const departmentsInfo = await db("DepartmentInfo").select("*");

    const byDefault = departmentsInfo
      .filter(
        (dept: any) =>
          dept.department == agent[0].department && dept.ictBranch == agent[0].branch && dept.ictUnit == agent[0].unit
      )
      .map((dept: any) => {
        return {
          ictBranch: dept.ictBranch,
          ictUnit: dept.ictUnit,
          glcode: dept.glCode,
          department: "",
          recvDepartment: dept.recvDepartment,
        };
      });

    const byDepartment = departmentsInfo
      .filter(
        (dept: any) =>
          dept.department == agent[0].department && (dept.ictBranch != agent[0].branch || dept.ictUnit != agent[0].unit)
      )
      .map((dept: any) => {
        return {
          ictBranch: dept.ictBranch,
          ictUnit: dept.ictUnit,
          glcode: dept.glCode,
          department: "",
          recvDepartment: dept.recvDepartment,
        };
      });

    const byBranchUnit = departmentsInfo
      .filter(
        (dept: any) =>
          dept.ictBranch == agent[0].branch && dept.ictUnit == agent[0].unit && dept.department != agent[0].department
      )
      .map((dept: any) => {
        return {
          ictBranch: dept.ictBranch,
          ictUnit: dept.ictUnit,
          glcode: dept.glCode,
          department: dept.department,
          recvDepartment: dept.recvDepartment,
        };
      });

    res.status(200).json({ byDefault, byDepartment, byBranchUnit });
  } catch (error: any) {
    console.log(error);
    res.status(500).json("GlCode Not found!");
  }
});

userRouter.get("/all-users", EnsureAuthenticated, async (req: Request, res: Response) => {
  const users = await db("user").select("*");
  res.status(200).json(users);
});

userRouter.post("/:id", RequiresRoleAdmin, EnsureAuthenticated, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    await db.transaction(async (trx) => {
      const newUserInfo = req.body;

      if (id > 0) {
        await db("user").update(newUserInfo).where("id", id);
      } else {
        newUserInfo.create_date = new Date();
        await db("user").insert(newUserInfo);
      }
    });
    res.status(200).json("successful");
  } catch (error: any) {
    console.log(error);
    res.status(500).json("Insert failed");
  }
});

userRouter.get("/", EnsureAuthenticated, async (req: Request, res: Response) => {
  const appUser = req.user;
  const roles = await db("Role").select("*");

  appUser.teams = new Array<Team>();
  for (const role of roles) {
    if (appUser.roles.indexOf(role.role) > -1) appUser.teams.push(role);
  }

  res.send(appUser);
});
