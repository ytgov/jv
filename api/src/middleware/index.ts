import { NextFunction, Request, Response } from "express"
import { validationResult } from "express-validator"

import { DB_HOST } from "@/config"

export function ReturnValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  next()
}

export async function doHealthCheck(req: Request, res: Response) {
  res.send(`Connection to database on '<strong>${DB_HOST}</strong>' is connected and functioning.`)
}
