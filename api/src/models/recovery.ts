export enum RecoveryStatuses {
  DRAFT = "Draft",
  RE_DRAFT = "Re-Draft",
  FULFILLED = "Fulfilled",
  PARTIALLY_FULFILLED = "Partially Fulfilled",
  PURCHASE_APPROVED = "Purchase Approved",
  ROUTED_FOR_APPROVAL = "Routed For Approval",
  ON_JOURNAL = "On Journal",
  RECOVERED = "Recovered",
  COMPLETE = "Complete",
}

export type Recovery = {
  recoveryID: number // primary key
  journalID: number | null
  firstName: string
  lastName: string
  department: string
  branch: string | null
  refNum: string | null
  createDate: string
  createUser: string
  modUser: string | null
  status: RecoveryStatuses | null
  submissionDate: string | null
  completeDate: string | null
  completeUser: string | null
  totalPrice: number | null
  mailcode: string | null
  employeeBranch: string | null
  description: string | null
  declineRequest: boolean | null
  reasonForDecline: string | null
  employeeUnit: string | null
  requastorEmail: string | null
  glCode: string | null
  fiscal_year: string | null
  supplier: string | null
}

export type RecoveryUpdateAttributes = Partial<
  Pick<
    Recovery,
    | "journalID"
    | "firstName"
    | "lastName"
    | "department"
    | "branch"
    | "refNum"
    | "createDate"
    | "createUser"
    | "modUser"
    | "status"
    | "submissionDate"
    | "completeDate"
    | "completeUser"
    | "totalPrice"
    | "mailcode"
    | "employeeBranch"
    | "description"
    | "declineRequest"
    | "reasonForDecline"
    | "employeeUnit"
    | "requastorEmail"
    | "glCode"
    | "fiscal_year"
    | "supplier"
  >
>

export function sanitizeRecoveryAttributes(body: any): Recovery {
  const allowedFields: (keyof Recovery)[] = [
    "recoveryID",
    "journalID",
    "firstName",
    "lastName",
    "department",
    "branch",
    "refNum",
    "createDate",
    "createUser",
    "modUser",
    "status",
    "submissionDate",
    "completeDate",
    "completeUser",
    "totalPrice",
    "mailcode",
    "employeeBranch",
    "description",
    "declineRequest",
    "reasonForDecline",
    "employeeUnit",
    "requastorEmail",
    "glCode",
    "fiscal_year",
    "supplier",
  ]

  const sanitized: Partial<Recovery> = {}
  for (const key of allowedFields) {
    if (key in body) sanitized[key] = body[key]
  }

  return sanitized as Recovery
}

export function sanitizeRecoveryUpdateAttributes(body: any): RecoveryUpdateAttributes {
  const allowedFields: (keyof RecoveryUpdateAttributes)[] = [
    "journalID",
    "firstName",
    "lastName",
    "department",
    "branch",
    "refNum",
    "createDate",
    "createUser",
    "modUser",
    "status",
    "submissionDate",
    "completeDate",
    "completeUser",
    "totalPrice",
    "mailcode",
    "employeeBranch",
    "description",
    "declineRequest",
    "reasonForDecline",
    "employeeUnit",
    "requastorEmail",
    "glCode",
    "fiscal_year",
    "supplier",
  ]

  const sanitized: RecoveryUpdateAttributes = {}
  for (const key of allowedFields) {
    if (key in body) sanitized[key] = body[key]
  }

  return sanitized
}

export const RECOVERY_WHERE_OPTIONS = Object.freeze([
  "journalID",
  "department",
  "fiscal_year",
  "status",
])
