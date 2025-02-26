import http from "@/api/http-client"
import { type Policy } from "@/api/base-api"

/** Keep in sync with api/src/models/role.ts */
export type Role = {
  id: number
  name: string
  role: string
}

export const rolesApi = {
  async list(
    params: {
      page?: number
      perPage?: number
    } = {}
  ): Promise<{
    roles: Role[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/lookup/roles", {
      params,
    })
    return data
  },
  async get(roleId: number): Promise<{
    role: Role
    policy: Policy
  }> {
    const { data } = await http.get(`/api/lookup/roles/${roleId}`)
    return data
  },
  async create(attributes: Partial<Role>): Promise<{
    role: Role
  }> {
    const { data } = await http.post("/api/lookup/roles", attributes)
    return data
  },
  async update(
    roleId: number,
    attributes: Partial<Role>
  ): Promise<{
    role: Role
  }> {
    const { data } = await http.patch(`/api/lookup/roles/${roleId}`, attributes)
    return data
  },
  async delete(roleId: number): Promise<void> {
    const { data } = await http.delete(`/api/lookup/roles/${roleId}`)
    return data
  },
}

export default rolesApi
