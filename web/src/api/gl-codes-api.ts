import http from "@/api/http-client"
import { type Policy } from "@/api/base-api"

/** Keep in sync with api/src/models/glcode.ts */

export type GLCode = {
  glcode: string
  department: string
  recvDepartment: string
  ictUnit: string
  ictBranch: string
  // Associations
  // add as needed
}

export type GLCodeWhereOptions = {
  department?: string
}

export type GLCodeFiltersOptions = {}

export const glCodesApi = {
  async list(
    params: {
      where?: GLCodeWhereOptions
      filters?: GLCodeFiltersOptions
      page?: number
      perPage?: number
    } = {}
  ): Promise<{
    glCodes: GLCode[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/user/agent-glcode", {
      params,
    })
    return data
  },
  async get(glCodeId: number): Promise<{
    glcode: GLCode
    policy: Policy
  }> {
    const { data } = await http.get(`/api/user/agent-glcode/${glCodeId}`)
    return data
  },
  async create(attributes: Partial<GLCode>): Promise<{
    glcode: GLCode
  }> {
    const { data } = await http.post("/api/user/agent-glcode", attributes)
    return data
  },
  async update(
    glCodeId: number,
    attributes: Partial<GLCode>
  ): Promise<{
    glcode: GLCode
  }> {
    const { data } = await http.patch(`/api/user/agent-glcode/${glCodeId}`, attributes)
    return data
  },
  async delete(glCodeId: number): Promise<void> {
    const { data } = await http.delete(`/api/user/agent-glcode/${glCodeId}`)
    return data
  },
}

export default glCodesApi
