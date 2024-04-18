import express, { Request, Response } from "express";
import { RequiresAuthentication, ReturnValidationErrors } from "../middleware";
import { DB_CONFIG, AZURE_KEY } from "../config";
import knex from "knex";
import axios from "axios";

export const lookupRouter = express.Router();
const db = knex(DB_CONFIG);

lookupRouter.get(
  "/department-branch",
  RequiresAuthentication,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    let cleanList: any = {};
    try {
      let departments = await db("Departments").select("*");
      const updateRequired = timeToUpdate(departments[0]);

      if (!departments[0] || updateRequired) {
        await updateDepartments();
        departments = await db("Departments").select("*");
      }

      for (const slice of departments) {
        if (cleanList[slice.department] == null)
          cleanList[slice.department] = {
            branches: [],
            units: [],
            branchUnits: {},
            ictBranchUnits: {},
          };

        if (slice.branch && !cleanList[slice.department].branches.includes(slice.branch)) {
          cleanList[slice.department].branches.push(slice.branch);
          cleanList[slice.department].branchUnits[slice.branch] = [];

          if (
            slice.department == "Highways and Public Works" &&
            slice.division == "Information and Communications Technology"
          ) {
            cleanList[slice.department].ictBranchUnits[slice.branch] = [];
          }
        }

        if (slice.unit && !cleanList[slice.department].units.includes(slice.unit))
          cleanList[slice.department].units.push(slice.unit);

        if (slice.branch && slice.unit && !cleanList[slice.department].branchUnits[slice.branch].includes(slice.unit))
          cleanList[slice.department].branchUnits[slice.branch].push(slice.unit);

        if (
          slice.department == "Highways and Public Works" &&
          slice.division == "Information and Communications Technology" &&
          slice.branch &&
          slice.unit &&
          !cleanList[slice.department].ictBranchUnits[slice.branch].includes(slice.unit)
        )
          cleanList[slice.department].ictBranchUnits[slice.branch].push(slice.unit);
      }
      res.status(200).json(cleanList);
    } catch (error: any) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  }
);

lookupRouter.get(
  "/employees",
  RequiresAuthentication,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    const cleanList: any[] = [];
    try {
      let employees = await db("Employees").select("*");
      const updateRequired = timeToUpdate(employees[0]);

      if (!employees[0] || updateRequired) {
        await updateEmployees();
        employees = await db("Employees").select("*");
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
        });
      }
      res.status(200).json(cleanList);
    } catch (error: any) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  }
);

lookupRouter.get(
  "/roles",
  RequiresAuthentication,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    try {
      const roles = await db("Role").select("*");
      res.status(200).json(roles);
    } catch (error: any) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  }
);

function timeToUpdate(item: any) {
  const updateTime = new Date();
  // updateTime.setMinutes(updateTime.getMinutes()-1); //Update Time is 24 hours after last update
  updateTime.setDate(updateTime.getDate() - 1); //Update Time is 24 hours after last update
  const lastUpdate = item?.update_date ? new Date(item.update_date) : new Date("2000-01-01");
  return updateTime > lastUpdate;
}

export async function updateEmployees() {
  console.log("___________UPDATING EMPLOYEE LIST___________");
  const today = new Date();
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
            console.log("_____START_Updating_Employees_____");
            await db("Employees").del();
            await db.raw(`DBCC CHECKIDENT(Employees, RESEED, 0);`);

            const employees = resp.data.employees;
            for (const employee of employees) {
              employee.update_date = today;
            }

            for (let ctt = 0; ctt < employees.length; ctt = ctt + 70)
              await db("Employees").insert(employees.slice(ctt, ctt + 70));

            console.log("_____FINISH______");
          });
      })
      .catch(async (er) => {
        console.log("_____err_____________", er);
        await db("Employees").update({ update_date: today });
      });
  } catch (error: any) {
    console.log(error);
  }
}

export async function updateDepartments() {
  console.log("___________UPDATING DEPARTMENTS___________");
  const today = new Date();
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
            console.log("_____START_Updating_Departments______");
            await db("Departments").del();
            await db.raw(`DBCC CHECKIDENT(Departments, RESEED, 0);`);

            const departments = resp.data.divisions;

            for (const department of departments) {
              department.update_date = today;
            }

            for (let ctt = 0; ctt < departments.length; ctt = ctt + 70)
              await db("Departments").insert(departments.slice(ctt, ctt + 70));

            console.log("_____FINISH______");
          });
      })
      .catch(async (er) => {
        console.log("_____err_____________", er);
        await db("Departments").update({ update_date: today });
      });
  } catch (error: any) {
    console.log(error);
  }
}
