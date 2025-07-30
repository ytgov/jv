import http from "@/api/http-client"
import { type Policy } from "@/api/base-api"

/** Keep in sync with api/src/models/coding.ts */
export type Coding = {
  departmentID: string
  contactEmail: string
  contactName: string
  createDate: string
  createUser: string
  department: string
  glCode: string
  ictBranch: string
  ictUnit: string | null
  modDate: string
  modUser: string
  recvDepartment: string
}

export type CodingWhereOptions = {
  department?: string
  ictBranch?: string
}

export type CodingFiltersOptions = {
  department?: string
}

export const codingsApi = {
  async list(
    params: {
      where?: CodingWhereOptions
      filters?: CodingFiltersOptions
      page?: number
      perPage?: number
    } = {}
  ): Promise<{
    codings: Coding[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/admin/department-info", {
      params,
    })
    return data
  },
  async get(codingId: number): Promise<{
    coding: Coding
    policy: Policy
  }> {
    const { data } = await http.get(`/api/admin/department-info/${codingId}`)
    return data
  },
  async create(attributes: Partial<Coding>): Promise<{
    coding: Coding
  }> {
    const { data } = await http.post("/api/admin/department-info", attributes)
    return data
  },
  async update(
    codingId: number,
    attributes: Partial<Coding>
  ): Promise<{
    coding: Coding
  }> {
    const { data } = await http.post(`/api/admin/department-info/${codingId}`, attributes)
    return data
  },
  async delete(codingId: number): Promise<void> {
    const { data } = await http.delete(`/api/admin/department-info/${codingId}`)
    return data
  },
}

export default codingsApi
