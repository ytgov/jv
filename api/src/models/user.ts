export type User = {
  id: number
  email: string
  first_name: string
  last_name: string
  display_name: string
  create_date: Date
  preferredBuilding: string
  department: string
  branch: string
  roles: string
  status: string
  mailcode: string
  unit: string
  employeeBranch: string

  teams?: Role[]
}

export type Role = {
  id: number
  name: string
  role: string
}
