import * as knex from "knex"

export const up = async function (knex: knex.Knex, Promise: any) {
  await knex.raw(`UPDATE [user] SET roles = REPLACE(roles, 'BranchUser','Client')`)
  await knex.raw(`UPDATE [user] SET roles = REPLACE(roles, 'BranchAgent','Agent')`)
  await knex("Role").where({ role: "BranchUser" }).update({ name: "Client", role: "Client" })
  await knex("Role").where({ role: "BranchAgent" }).update({ name: "Agent", role: "Agent" })
  await knex("Role").where({ role: "BranchAdmin" }).delete()
}

export const down = async function (knex: knex.Knex, Promise: any) {
  await knex.raw(`UPDATE [user] SET roles = REPLACE(roles, 'Client', 'BranchUser')`)
  await knex.raw(`UPDATE [user] SET roles = REPLACE(roles, 'Agent', 'BranchAgent')`)
  await knex("Role").where({ role: "Client" }).update({ name: "Branch User", role: "BranchUser" })
  await knex("Role").where({ role: "Agent" }).update({ name: "Branch Agent", role: "BranchAgent" })
  await knex("Role").insert({ role: "BranchAdmin", name: "Branch Admin" })
}
