import express, { Request, Response } from "express"
import knex from "knex"
import axios from "axios"

import { ReturnValidationErrors } from "../middleware"
import { DB_CONFIG, AZURE_KEY } from "../config"
import { isNil, uniq } from "lodash"

export const lookupRouter = express.Router()
const db = knex(DB_CONFIG)

lookupRouter.get(
  "/department-branch",
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    let departments = await db("Departments").orderBy("department").orderBy("order")

    const updateRequired = timeToUpdate(departments[0])

    if (!departments[0] || updateRequired) {
      await updateDepartments()
      departments = await db("Departments").orderBy("department").orderBy("order")
    }

    try {
      const result = departments.reduce((acc: any[], curr) => {
        // Find existing department or create new one
        let department = acc.find((d) => d.name === curr.department)
        if (!department) {
          department = {
            name: curr.department,
            divisions: [],
          }
          acc.push(department)
        }

        // Find existing division or create new one
        if (curr.division) {
          let division = department.divisions.find((d: any) => d.name === curr.division)
          if (!division) {
            division = {
              name: curr.division,
              branches: [],
            }
            department.divisions.push(division)
          }

          // Find existing branch or create new one
          if (curr.branch) {
            let branch = division.branches.find((b: any) => b.name === curr.branch)
            if (!branch) {
              branch = {
                name: curr.branch,
                units: [],
              }
              division.branches.push(branch)
            }

            // Add unit if it exists and isn't already in the array
            if (curr.unit && !branch.units.includes(curr.unit)) {
              branch.units.push(curr.unit)
            }
          }
        }

        return acc
      }, [])

      res.status(200).json({ departments: result })
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Internal Server Error")
    }
  }
)

lookupRouter.get(
  "/employees",
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    const cleanList: any[] = []
    try {
      let employees = await db("Employees").orderBy("full_name")
      const updateRequired = timeToUpdate(employees[0])

      if (!employees[0] || updateRequired) {
        await updateEmployees()
        employees = await db("Employees").orderBy("full_name")
      }

      for (const employee of employees) {
        cleanList.push({
          firstName: employee.first_name,
          lastName: employee.last_name,
          department: employee.department,
          fullName: employee.full_name,
          email: employee.email,
          branch: employee.branch,
          unit: employee.unit,
          mailcode: employee.mailcode,
        })
      }
      res.status(200).json({ employees: cleanList })
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Internal Server Error")
    }
  }
)

lookupRouter.get("/roles", async function (req: Request, res: Response) {
  try {
    const roles = await db("Role").orderBy("name")
    res.json({ roles, totalCount: roles.length })
  } catch (error: any) {
    console.log(error)
    res.status(500).json("Internal Server Error")
  }
})

function timeToUpdate(item: any) {
  const updateTime = new Date()
  // updateTime.setMinutes(updateTime.getMinutes()-1); //Update Time is 24 hours after last update
  updateTime.setDate(updateTime.getDate() - 1) //Update Time is 24 hours after last update
  const lastUpdate = item?.update_date ? new Date(item.update_date) : new Date("2000-01-01")
  return updateTime > lastUpdate
}

export async function updateEmployees() {
  console.log("___________UPDATING EMPLOYEE LIST___________")
  const today = new Date()
  try {
    await axios
      .get(`https://api.gov.yk.ca/directory/employees`, {
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_KEY,
        },
        timeout: 200000,
      })
      .then(async (resp: any) => {
        if (resp?.data?.employees)
          await db.transaction(async (trx) => {
            console.log("_____START_Updating_Employees_____")
            await db("Employees").del()
            await db.raw(`DBCC CHECKIDENT(Employees, RESEED, 0);`)

            const employees = resp.data.employees
            for (const employee of employees) {
              employee.update_date = today
            }

            for (let ctt = 0; ctt < employees.length; ctt = ctt + 70)
              await db("Employees").insert(employees.slice(ctt, ctt + 70))

            console.log("_____FINISH______")
          })
      })
      .catch(async (er) => {
        console.log("_____err_____________", er)
        await db("Employees").update({ update_date: today })
      })
  } catch (error: any) {
    console.log(error)
  }
}

export async function updateDepartments() {
  console.log("___________UPDATING DEPARTMENTS___________")
  const today = new Date()
  try {
    await axios
      .get(`https://api.gov.yk.ca/directory/divisions`, {
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_KEY,
        },
        timeout: 150000,
      })
      .then(async (resp: any) => {
        if (resp?.data?.divisions)
          await db.transaction(async (trx) => {
            console.log("_____START_Updating_Departments______")
            await db("Departments").del()
            await db.raw(`DBCC CHECKIDENT(Departments, RESEED, 0);`)

            const departments = resp.data.divisions

            for (const department of departments) {
              department.update_date = today
            }

            for (let ctt = 0; ctt < departments.length; ctt = ctt + 70)
              await db("Departments").insert(departments.slice(ctt, ctt + 70))

            console.log("_____FINISH______")
          })
      })
      .catch(async (er) => {
        console.log("_____err_____________", er)
        await db("Departments").update({ update_date: today })
      })
  } catch (error: any) {
    console.log(error)
  }
}
