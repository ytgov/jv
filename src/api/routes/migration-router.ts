import express, { Request, Response } from "express";
import { RequiresAuthentication, RequiresRoleAdmin } from "../middleware";
import { migrateDown, migrateUp } from "../data/migrator"

export const migrationRouter = express.Router();


migrationRouter.get("/up", RequiresAuthentication, RequiresRoleAdmin, async (req: Request, res: Response) => {
  res.send(await migrateUp());
});

migrationRouter.get("/down", RequiresAuthentication, RequiresRoleAdmin, async (req: Request, res: Response) => {
  res.send(await migrateDown());
});
