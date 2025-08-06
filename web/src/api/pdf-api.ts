import http from "@/api/http-client"

export const pdfApi = {
  async getExcel(journalId: number): Promise<Blob> {
    const { data } = await http.get(`/api/pdf/excel/${journalId}`, {
      responseType: "blob",
    })
    return data
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async merge(journalId: number, bodyData: any[]): Promise<Blob> {
    const { data } = await http.post(
      `/api/pdf/merge/${journalId}`,
      { data: bodyData },
      {
        responseType: "blob",
      }
    )
    return data
  },
  async email(journalId: number): Promise<void> {
    const { data } = await http.post(`/api/pdf/email/${journalId}`)
    return data
  },
}

export default pdfApi
