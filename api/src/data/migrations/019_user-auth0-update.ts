import * as knex from "knex"

export const up = async function (knex: knex.Knex, Promise: any) {
  await knex.schema.alterTable("user", function (table) {
    table.string("auth0_subject", 100).nullable()
  })

  await knex("user").update({ auth0_subject: knex.raw(`CONCAT('SUB_MISSING', id)`) })
  await knex.schema.alterTable("user", function (table) {
    table.dropNullable("auth0_subject")
    table.unique("auth0_subject", { indexName: "user_auth0_subject_unique_index" })
  })
}

export const down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.alterTable("user", function (table) {
    table.dropUnique(["auth0_subject"], "user_auth0_subject_unique_index")
    table.dropColumn("auth0_subject")
  })
}
