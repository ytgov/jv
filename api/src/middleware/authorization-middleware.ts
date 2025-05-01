import { type NextFunction, type Response } from "express"
import { type Request as JwtRequest } from "express-jwt"
import { isNil } from "lodash"

import { User } from "@/models"
import { UserService } from "@/services"
import { auth0Integration } from "@/integrations"

export type AuthorizationRequest = JwtRequest & {
  currentUser?: User | null
}

// Requires api/src/middlewares/jwt-middleware.ts to be run first
// I'd love to merge that code in here at some point, or make all this code a controller "before action"
// I'm uncomfortable with creating users automatically here, I'd rather the front-end requested
// user creation directly, and might switch to that in the future.
export async function ensureAndAuthorizeCurrentUser(
  req: AuthorizationRequest,
  res: Response,
  next: NextFunction
) {
  const userService = new UserService()

  const user = await userService.getBySub(req.auth?.sub ?? "")

  if (!isNil(user)) {
    req.currentUser = user
    return next()
  }

  const token = req.headers.authorization || ""

  const { auth0Subject, email } = await auth0Integration.getUserInfo(token)

  const emailUser = await new UserService().getByEmail(email)

  if (isNil(emailUser) || !emailUser.auth0_subject.startsWith("SUB_MISSING")) {
    return res.status(401).json({ message: "User authentication failed." })
  }

  await userService.update(emailUser.email, { auth0_subject: auth0Subject })

  req.currentUser = emailUser
  return next()
}

export function RequiresRoleAdmin(req: AuthorizationRequest, res: Response, next: NextFunction) {
  if (req.currentUser && req.currentUser.roles.indexOf("Admin") == -1) {
    return res.status(401).send("You are not an Administrator")
  }

  next()
}

export function RequiresRoleAdminOrIctFinance(
  req: AuthorizationRequest,
  res: Response,
  next: NextFunction
) {
  const roles = (req.currentUser?.roles || "").split(",")

  if (roles.includes("Admin") || roles.includes("IctFinance")) {
    next()
  } else return res.status(401).send("You are not an authorized person!")
}

export function RequiresRoleAdminOrFinance(
  req: AuthorizationRequest,
  res: Response,
  next: NextFunction
) {
  const roles = (req.currentUser?.roles || "").split(",")
  if (roles.includes("Admin") || roles.includes("IctFinance") || roles.includes("DeptFinance")) {
    next()
  } else return res.status(401).send("You are not an authorized person!")
}

export function RequiresRoleAdminOrTech(
  req: AuthorizationRequest,
  res: Response,
  next: NextFunction
) {
  const roles = (req.currentUser?.roles || "").split(",")
  if (roles.includes("Admin")  || roles.includes("Agent")) {
    next()
  } else return res.status(401).send("You are not an authorized person!")
}
