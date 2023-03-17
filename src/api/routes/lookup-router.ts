import express, { Request, Response } from "express";
import { RequiresAuthentication, ReturnValidationErrors } from "../middleware";
import { DB_CONFIG, AZURE_KEY } from "../config";
import knex from "knex";
import axios from "axios";

export const lookupRouter = express.Router();
const db = knex(DB_CONFIG);

lookupRouter.get("/department-branch", RequiresAuthentication, ReturnValidationErrors, async function (req: Request, res: Response) {
  let cleanList: any = {};
  try {
    let depList = await axios
      .get(`https://api.gov.yk.ca/directory/divisions`, {
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_KEY
        }
      })
      .then((resp: any) => {
        for (let slice of resp.data.divisions) {
          if (cleanList[slice.department] == null)
            cleanList[slice.department] = {
              branches: []
            };

          if (slice.branch && !cleanList[slice.department].branches.includes(slice.branch))
            cleanList[slice.department].branches.push(slice.branch);
        }
        return cleanList;
      });
    res.status(200).json(depList);
  } catch (error: any) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});

lookupRouter.get("/employees", RequiresAuthentication, ReturnValidationErrors, async function (req: Request, res: Response) {
  const cleanList: any[] = [];
  try {
    let depList = await axios
      .get(`https://api.gov.yk.ca/directory/employees`, {
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_KEY
        }
      })
      .then((resp: any) => {
        for (let slice of resp.data.employees) {
          cleanList.push({
            firstName: slice.first_name,
            lastName: slice.last_name,
            department: slice.department,
            fullName: slice.full_name,
            email: slice.email
          });
        }
        return cleanList;
      });
    res.status(200).json(depList);
  } catch (error: any) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});


