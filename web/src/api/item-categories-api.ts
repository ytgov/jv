import http from "@/api/http-client"
import { type Policy } from "@/api/base-api"

/** Keep in sync with api/src/models/itemcategory.ts */

export type ItemCategoryAudit = {
  auditID: number
  itemCatID: number
  action: string
  date: string
  user: string
}
export type ItemCategoryDocument = {
  documentID: number
  itemCatID: number
  docName: string

  document?: { data: number[] }
}

export type ItemCategory = {
  itemCatID: number
  category: string
  branch: string
  unit: string
  price: number
  createDate: Date
  createUser: string
  active: boolean
  description: string
  changeQuantity: boolean
  docName: string

  // Associations
  documents?: ItemCategoryDocument[]
  audits?: ItemCategoryAudit[]
  // add as needed
}

export type ItemCategoryWhereOptions = {
  supplier?: string
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type ItemCategoryFiltersOptions = {}

export const itemCategoriesApi = {
  async list(
    params: {
      where?: ItemCategoryWhereOptions
      filters?: ItemCategoryFiltersOptions
      page?: number
      perPage?: number
    } = {}
  ): Promise<{
    itemCategories: ItemCategory[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/admin/item-categories", {
      params,
    })
    return data
  },
  async get(itemCategoryId: number): Promise<{
    itemCategory: ItemCategory
    policy: Policy
  }> {
    const { data } = await http.get(`/api/admin/item-categories/${itemCategoryId}`)
    return data
  },
  async create(attributes: Partial<ItemCategory>): Promise<{
    itemcategory: ItemCategory
  }> {
    const { data } = await http.post("/api/admin/item-categories", attributes)
    return data
  },
  async update(
    itemCategoryId: number,
    attributes: Partial<ItemCategory>
  ): Promise<{
    itemcategory: ItemCategory
  }> {
    const { data } = await http.post(`/api/admin/item-categories/${itemCategoryId}`, attributes)
    return data
  },
  async delete(itemCategoryId: number): Promise<void> {
    const { data } = await http.delete(`/api/admin/item-categories/${itemCategoryId}`)
    return data
  },
}

export default itemCategoriesApi
