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
      units: ["ATIPP Office", "Records and Information Management"],
    },
    {
      name: "Data and Application Support",
      units: ["Application Platforms", "Database Administration", "Storage and Virtualization"],
    },
    {
      name: "Electronic Services",
      units: ["Geomatics Yukon"],
    },
    {
      name: "Information Technology and Client Services",
      units: [
        "Client Services Liaison",
        "Client Solutions and Project Development",
        "Client Technical Solutions",
        "End User Computing",
        "Information Management",
        "Shared Technology Services",
      ],
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
      units: [
        "Business Analysts Office",
        "Functional Analysts Office",
        "Project Management Office",
      ],
    },
    {
      name: "Technology Infrastructure",
      units: ["Security"],
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
    for (let unit of units) {
      if (isNil(unit) || isEmpty(unit)) continue

      const short_name =`${branchName.replace(/[^A-Z]/g, "")}-${unit.replace(/[^A-Z]/g, "")}`

      await knex("group").insert({
        branch: branchName,
        unit: unit,
        short_name ,
        long_name: `${branchName} : ${unit}`,
      })
    }
  }
}

export const down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("group")
}
