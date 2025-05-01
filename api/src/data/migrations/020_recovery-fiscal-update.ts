import * as knex from "knex"

export const up = async function (knex: knex.Knex, Promise: any) {
  await knex.schema.alterTable("Recovery", function (table) {
    table.string("fiscal_year", 10).nullable()
  })
}

export const down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.alterTable("Recovery", function (table) {
    table.dropColumn("fiscal_year")
  })
}
