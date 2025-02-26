import http from "@/api/http-client"
import { type Policy } from "@/api/base-api"

/** Keep in sync with api/src/models/employee.ts */
export type Employee = {
  email: string
  department: string
  branch: string
  firstName: string
  fullName: string
  lastName: string
  mailcode: string
  unit: string
}

export type EmployeeWhereOptions = {
  email?: string
}

export type EmployeeFiltersOptions = {
  department?: string
}

export const employeesApi = {
  async list(
    params: {
      where?: EmployeeWhereOptions
      filters?: EmployeeFiltersOptions
      page?: number
      perPage?: number
    } = {}
  ): Promise<{
    employees: Employee[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/lookup/employees", {
      params,
    })
    return data
  },
  async get(employeeId: number): Promise<{
    employee: Employee
    policy: Policy
  }> {
    const { data } = await http.get(`/api/lookup/employees/${employeeId}`)
    return data
  },
  async create(attributes: Partial<Employee>): Promise<{
    employee: Employee
  }> {
    const { data } = await http.post("/api/lookup/employees", attributes)
    return data
  },
  async update(
    employeeId: number,
    attributes: Partial<Employee>
  ): Promise<{
    employee: Employee
  }> {
    const { data } = await http.patch(`/api/lookup/employees/${employeeId}`, attributes)
    return data
  },
  async delete(employeeId: number): Promise<void> {
    const { data } = await http.delete(`/api/lookup/employees/${employeeId}`)
    return data
  },
}

export default employeesApi
