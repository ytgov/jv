export enum JournalStatuses {
  DRAFT = "JV Draft",
  ROUTED = "Routed to Client",
  PAID = "Paid",
}

export type Journal = {
  journalID: number // primary key
  submissionDate: string
  jvNum: string
  department: string
  period: number
  jvAmount: number
  status: JournalStatuses | null
  jvDate: string | null
  fiscalYear: string | null
  description: string | null
  orgDepartment: string | null
  odCompletedBy: string | null
  recvDepartment: string | null
  rdCompletedBy: string | null
  explanation: string | null
}
