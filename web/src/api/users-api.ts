import http from "@/api/http-client"
import { type Policy } from "@/api/base-api"

/** Keep in sync with api/src/models/user.ts */
export enum UserRoles {
  ADMIN = "Admin",
  BRANCH_USER = "BranchUser",
  USER = "user",
}

export type User = {
  id: number
  email: string
  auth0_Subject: string
  first_name: string
  last_name: string
  display_name: string
  roles: string | null
  title: string | null

  department: string | null
  employeeBranch: string | null
  branch: string | null
  unit: string | null
  mailcode: string | null
  preferredBuilding: string | null
  status: string

  // Virtuals
  teams?: { id: number; name: string; role: string }[]

  // Associations
  // add as needed
}

export type UserWhereOptions = {
  email?: string
  title?: string
  deactivatedAt?: string
}

export type UserFiltersOptions = {
  search?: string | string[]
  active?: boolean | null
  role?: string | string[]
}

export const usersApi = {
  UserRoles,
  async list(
    params: {
      where?: UserWhereOptions
      filters?: UserFiltersOptions
      page?: number
      perPage?: number
    } = {}
  ): Promise<{
    users: User[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/user/all-users", {
      params,
    })
    return data
  },
  async get(userId: number): Promise<{
    user: User
    policy: Policy
  }> {
    const { data } = await http.get(`/api/user/${userId}`)
    return data
  },
  async create(attributes: Partial<User>): Promise<{
    user: User
  }> {
    const { data } = await http.post("/api/user", attributes)
    return data
  },
  async update(
    userId: number,
    attributes: Partial<User>
  ): Promise<{
    user: User
  }> {
    const { data } = await http.post(`/api/user/${userId}`, attributes)
    return data
  },
  async delete(userId: number): Promise<void> {
    const { data } = await http.delete(`/api/user/${userId}`)
    return data
  },
}

export default usersApi
