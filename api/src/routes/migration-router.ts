import express, { Request, Response } from "express"

import { migrateDown, migrateUp } from "@/data/migrator"
import { RequiresRoleAdmin } from "@/middleware/authorization-middleware"

export const migrationRouter = express.Router()

migrationRouter.get("/up", RequiresRoleAdmin, async (req: Request, res: Response) => {
  res.send(await migrateUp())
})

migrationRouter.get("/down", RequiresRoleAdmin, async (req: Request, res: Response) => {
  res.send(await migrateDown())
})
