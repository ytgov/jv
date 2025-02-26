import express, { Request, Response } from "express"
import knex from "knex"

import { DB_CONFIG } from "../config"
import { AuthorizationRequest, RequiresRoleAdmin } from "@/middleware/authorization-middleware"
import { isNaN, isNil, isNumber } from "lodash"
const db = knex(DB_CONFIG)

export const userRouter = express.Router()

userRouter.get("/current-user", async (req: AuthorizationRequest, res: Response) => {
  const user = req.currentUser

  if (isNil(user)) return res.status(401).json("Not Authenticated")

  const roles = await db("Role")
  const userRoles = user.roles.split(",")
  user.teams = roles.filter((role) => userRoles.includes(role.role))

  res.json({ user })
})

userRouter.get("/agent-glcode", async function (req: AuthorizationRequest, res: Response) {
  try {
    const agent = req.currentUser
    if (isNil(agent)) return res.status(401).json("Not Authenticated")

    const departmentsInfo = await db("DepartmentInfo")

    const byDefault = departmentsInfo
      .filter(
        (dept: any) =>
          dept.department == agent.department &&
          dept.ictBranch == agent.branch &&
          dept.ictUnit == agent.unit
      )
      .map((dept: any) => {
        return {
          ictBranch: dept.ictBranch,
          ictUnit: dept.ictUnit,
          glcode: dept.glCode,
          department: "",
          recvDepartment: dept.recvDepartment,
        }
      })

    const byDepartment = departmentsInfo
      .filter(
        (dept: any) =>
          dept.department == agent.department &&
          (dept.ictBranch != agent.branch || dept.ictUnit != agent.unit)
      )
      .map((dept: any) => {
        return {
          ictBranch: dept.ictBranch,
          ictUnit: dept.ictUnit,
          glcode: dept.glCode,
          department: "",
          recvDepartment: dept.recvDepartment,
        }
      })

    const byBranchUnit = departmentsInfo
      .filter(
        (dept: any) =>
          dept.ictBranch == agent.branch &&
          dept.ictUnit == agent.unit &&
          dept.department != agent.department
      )
      .map((dept: any) => {
        return {
          ictBranch: dept.ictBranch,
          ictUnit: dept.ictUnit,
          glcode: dept.glCode,
          department: dept.department,
          recvDepartment: dept.recvDepartment,
        }
      })

    res.status(200).json({ byDefault, byDepartment, byBranchUnit })
  } catch (error: any) {
    console.log(error)
    res.status(500).json("GlCode Not found!")
  }
})

userRouter.get("/all-users", async (req: Request, res: Response) => {
  const users = await db("user").orderBy("display_name")
  res.status(200).json({ users, totalCount: users.length })
})

userRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params
  const user = await db("user").where({ id }).first()
  res.json({ user })
})

userRouter.post("/:id", RequiresRoleAdmin, async (req: Request, res: Response) => {
  const { id } = req.params
  const { department, branch, unit, status, roles, mailcode, preferredBulding, employeeBranch } =
    req.body

  try {
    const newUserInfo = req.body
    newUserInfo.auth0_subject = `SUB_MISSING-${newUserInfo.email}`

    if (!isNaN(parseInt(id))) {
      await db("user").where({ id }).update({
        department,
        branch,
        unit,
        status,
        roles,
        mailcode,
        preferredBulding,
        employeeBranch,
      })
    } else {
      newUserInfo.create_date = new Date()
      await db("user").insert(newUserInfo)
    }
    res.status(200).json("successful")
  } catch (error: any) {
    console.log(error)
    res.status(500).json("Insert failed")
  }
})
