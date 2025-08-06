import http from "@/api/http-client"
import { type Policy } from "@/api/base-api"

/** Keep in sync with api/src/models/recovery.ts */
export enum RecoveryStatuses {
  DRAFT = "Draft",
  RE_DRAFT = "Re-Draft",
  FULFILLED = "Fulfilled",
  PARTIALLY_FULFILLED = "Partially Fulfilled",
  PURCHASE_APPROVED = "Purchase Approved",
  ROUTED_FOR_APPROVAL = "Routed For Approval",
  COMPLETE = "Complete",
}

export type RecoveryItem = {
  approvalCost?: number | null
  changeQuantity: boolean
  clientChange?: string | null
  declineRequest?: string | null
  description: string
  filledBy?: string | null
  itemCatID?: number | null
  itemID?: number
  orderFilled?: boolean
  quantity: number
  reasonForDecline?: string
  recoveryID?: number
  totalPrice: number | string
  unitPrice: number

  revisedCost?: number | string
  approvedCost?: number | string

  category?: string
  originalQuantity?: number
}

export type RecoverAudit = {
  auditID: number
  date: string
  recoveryID: number
  action: string
  user: string
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

  docName: RecoveryDocument[]
  recoveryAudits: RecoverAudit[]
  recoveryItems: Array<RecoveryItem | Partial<RecoveryItem>>
  journal: { jvNum: string }
  action?: string

  // Associations
  // add as needed
}

export type RecoveryDocument = {
  documentID: number
  docName: string
  itemCatName: string

  document?: { data: number[] }
}

export type RecoveryWhereOptions = {
  journalID?: number | null
  department?: string | null
  fiscal_year?: string | null
  status?: string
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type RecoveryFiltersOptions = {}

export const recoveriesApi = {
  async list(
    params: {
      where?: RecoveryWhereOptions
      filters?: RecoveryFiltersOptions
      page?: number
      perPage?: number
    } = {}
  ): Promise<{
    recoveries: Recovery[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/recoveries", {
      params,
    })
    return data
  },
  async get(recoveryId: number): Promise<{
    recovery: Recovery
    policy: Policy
  }> {
    const { data } = await http.get(`/api/recoveries/${recoveryId}`)
    return data
  },
  async create(attributes: Partial<Recovery>): Promise<{
    recovery: Recovery
  }> {
    const { data } = await http.post("/api/recoveries", attributes)
    return data
  },
  async update(
    recoveryId: number,
    attributes: Partial<Recovery>
  ): Promise<{
    recovery: Recovery
  }> {
    const { data } = await http.put(`/api/recoveries/${recoveryId}`, attributes)
    return data
  },
  async delete(recoveryId: number): Promise<void> {
    const { data } = await http.delete(`/api/recoveries/${recoveryId}`)
    return data
  },
  async upload(recoveryId: number, body: object): Promise<void> {
    await http.post(`/api/recoveries/${recoveryId}/backup-documents`, body, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },
  async deleteUpload(recoveryId: number, documentId: number): Promise<void> {
    await http.delete(`/api/recoveries/${recoveryId}/backup-documents/${documentId}`)
  },
  async getUpload(recoveryId: number, documentId: number): Promise<ArrayBuffer | null> {
    const { data } = await http.get(
      `/api/recoveries/${recoveryId}/backup-documents/${documentId}`,
      {
        responseType: "arraybuffer",
      }
    )
    return data
  },
}

export default recoveriesApi
