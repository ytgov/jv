import * as knex from "knex";
import { DB_CONFIG } from "../config";

export * from "./auth-user";
export * from "./migrator";
/*
console.log("USING DATABASE AT", SQLITE_FILENAME);

 export const db = knex.knex({
  client: 'sqlite3',
  connection: () => ({
    filename: SQLITE_FILENAME
  })
}); */

export const sqldb = knex.knex(DB_CONFIG);
