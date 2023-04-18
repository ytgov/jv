import { sqldb } from "..";
import { DB_SCHEMA } from "../../config";

export async function seedUp() {
  console.log("Seeding");

  await sqldb("user").delete().whereRaw("1=1");
  await sqldb("user").insert([
    {
      email: "Diedre.Davidson@yukon.ca",
      first_name: "Diedre",
      last_name: "Davidson",
      display_name: "Diedre.Davidson",
      mailcode: "",
      department: "",
      status: "Active",
      branch: "ITCS",
      roles: "Admin",
      create_date: "2023-03-27"
    },
    {
      email: "Max.parker@yukon.ca",
      first_name: "Max",
      last_name: "Parker",
      display_name: "Max.Parker",
      mailcode: "",
      department: "",
      status: "Active",
      branch: "ITCS",
      roles: "Admin",
      create_date: "2023-03-27"
    }
  ]);
}

export async function rolesUp() {
  console.log("----Seeding Roles----");
  try {
    await sqldb("Role").delete().whereRaw("1=1");
    await insertIntoTable("Role", [
      { id: 1, name: "System Admin", role: "Admin" },
      { id: 2, name: "Branch User", role: "BranchUser" },
      { id: 3, name: "Branch Technician", role: "BranchTech" },
      { id: 4, name: "Branch Supervisor", role: "BranchAdmin" },
      { id: 5, name: "ICT Finance", role: "IctFinance" },
      { id: 6, name: "Departmental Finance", role: "DeptFinance" }
    ]);
  } catch (e) {}
}

async function insertIntoTable(table: string, data: any) {
  const schema = DB_SCHEMA;
  const { bindings, sql } = sqldb.withSchema(schema).insert(data).into(table).toSQL();

  const newQuery = `SET IDENTITY_INSERT ${schema}.${table} ON; ${sql} SET IDENTITY_INSERT ${schema}.${table} OFF;`;

  return await sqldb.raw(newQuery, bindings);
}
