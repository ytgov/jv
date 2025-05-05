import * as knex from "knex"
import { isEmpty, isNil } from "lodash"

export const up = async function (knex: knex.Knex, Promise: any) {
  await knex.schema.createTable("group", function (table) {
    table.increments("id").primary()
    table.string("branch", 50).notNullable()
    table.string("unit", 50).nullable()
    table.string("short_name", 50).nullable()
    table.string("long_name", 250).nullable()
  })

  const branches = [
    {
      name: "Corporate Information Management",
      units: [],
    },
    {
      name: "Data and Application Support",
      units: [],
    },
    {
      name: "Electronic Services",
      units: [],
    },
    {
      name: "Information Technology and Client Services",
      units: [],
    },
    {
      name: "Office of the CIO",
      units: [],
    },
    {
      name: "Planning and Administration",
      units: [],
    },
    {
      name: "Records Program Improvement Initiative",
      units: [],
    },
    {
      name: "Service Innovation and Support",
      units: [],
    },
    {
      name: "Technology Infrastructure",
      units: [],
    },
  ]

  for (let branch of branches) {
    const branchName = branch.name
    const units = branch.units

    // Insert the branch into the group table
    await knex("group").insert({
      branch: branchName,
      unit: null,
      short_name: branchName.replace(/[^A-Z]/g, ""),
      long_name: branchName,
    })

    // Insert each unit into the group table
    /* for (let unit of units) {
      if (isNil(unit) || isEmpty(unit)) continue

      const short_name = `${branchName.replace(/[^A-Z]/g, "")}-${unit.replace(/[^A-Z]/g, "")}`

      await knex("group").insert({
        branch: branchName,
        unit: unit,
        short_name,
        long_name: `${branchName} : ${unit}`,
      })
    } */
  }
}

export const down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("group")
}
