import http from "@/api/http-client"
import { type Policy } from "@/api/base-api"

/** Keep in sync with api/src/models/group.ts */

export type Group = {
  id: number
  branch: string
  unit: string
  short_name: string

  // Associations as needed
}

export type GroupWhereOptions = {
  branch?: string
  unit?: string
}

export type GroupFiltersOptions = {
  search?: string
}

export const groupsApi = {
  async list(
    params: {
      where?: GroupWhereOptions
      filters?: GroupFiltersOptions
      page?: number
      perPage?: number
    } = {}
  ): Promise<{
    groups: Group[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/admin/groups", {
      params,
    })
    return data
  },
  async get(groupId: number): Promise<{
    group: Group
    policy: Policy
  }> {
    const { data } = await http.get(`/api/admin/groups/${groupId}`)
    return data
  },
  async create(attributes: Partial<Group>): Promise<{
    group: Group
  }> {
    const { data } = await http.post("/api/admin/groups", attributes)
    return data
  },
  async update(
    groupId: number,
    attributes: Partial<Group>
  ): Promise<{
    group: Group
  }> {
    const { data } = await http.put(`/api/admin/groups/${groupId}`, attributes)
    return data
  },
  async delete(groupId: number): Promise<void> {
    const { data } = await http.delete(`/api/admin/groups/${groupId}`)
    return data
  },
}

export default groupsApi
