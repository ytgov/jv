import { Express, Request, Response } from "express";
import { sqldb } from "./index";
import { join } from "path";
import { rolesUp, seedUp } from "./seeds"

export async function migrateUp() {
    console.log("-------- MIGRATE UP ---------")
    return await sqldb.migrate.up({ directory: join(__dirname, "migrations") });
}

export async function migrateDown() {
    console.log("-------- MIGRATE DOWN ---------")
    return await sqldb.migrate.down({ directory: join(__dirname, "migrations") });
}

export async function migrateLatest() {
    console.log("-------- MIGRATE LATEST ---------")
    const latestMigration = await sqldb.migrate.latest({ directory: join(__dirname, "migrations") });
    await rolesUp()
    return latestMigration
}

export async function CreateMigrationRoutes(app: Express) {

    app.get("/migrate/up", async (req: Request, res: Response) => {
        res.send(await migrateUp());
    });

    app.get("/migrate/down", async (req: Request, res: Response) => {
        res.send(await migrateDown());
    });

    app.get("/migrate/latest", async (req: Request, res: Response) => {
        res.send(await migrateLatest());
    });

    app.get("/migrate/seed", async (req: Request, res: Response) => {
        res.send(await seedUp());
    });
}