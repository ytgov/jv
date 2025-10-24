import { Express, Request, Response } from "express"
import { sqldb } from "./index"
import { join } from "path"
import { rolesUp, seedUp } from "./seeds"
import {
  AuthorizationRequest,
  ensureAndAuthorizeCurrentUser,
  RequiresRoleAdmin,
} from "@/middleware/authorization-middleware"
import jwtMiddleware from "@/middleware/jwt-middleware"

export async function migrateUp() {
  console.log("-------- MIGRATE UP ---------")
  return await sqldb.migrate.up({ directory: join(__dirname, "migrations") })
}

export async function migrateDown() {
  console.log("-------- MIGRATE DOWN ---------")
  return await sqldb.migrate.down({ directory: join(__dirname, "migrations") })
}

export async function migrateLatest() {
  console.log("-------- MIGRATE LATEST ---------")
  const latestMigration = await sqldb.migrate.latest({ directory: join(__dirname, "migrations") })
  await rolesUp()
  return latestMigration
}

export async function CreateMigrationRoutes(app: Express) {
  app.use("/migrate", jwtMiddleware, ensureAndAuthorizeCurrentUser, RequiresRoleAdmin)

  app.get("/migrate/up", async (req: AuthorizationRequest, res: Response) => {
    console.log("req", req.currentUser)
    res.send(await migrateUp())
  })

  app.get("/migrate/down", async (req: AuthorizationRequest, res: Response) => {
    res.send(await migrateDown())
  })

  app.get("/migrate/latest", async (req: AuthorizationRequest, res: Response) => {
    res.send(await migrateLatest())
  })

  app.get("/migrate/seed", async (req: AuthorizationRequest, res: Response) => {
    res.send(await seedUp())
  })
}
