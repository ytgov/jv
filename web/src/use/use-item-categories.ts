import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import itemCategoriesApi, {
  type ItemCategory,
  type ItemCategoryWhereOptions,
  type ItemCategoryFiltersOptions,
} from "@/api/item-categories-api"

export { type ItemCategory, type ItemCategoryWhereOptions, type ItemCategoryFiltersOptions }

const state = reactive<{
  itemCategories: ItemCategory[]
  totalCount: number
  isLoading: boolean
  isErrored: boolean
}>({
  itemCategories: [],
  totalCount: 0,
  isLoading: false,
  isErrored: false,
})

export function useItemCategories(
  queryOptions: Ref<{
    where?: ItemCategoryWhereOptions
    filters?: ItemCategoryFiltersOptions
    page?: number
    perPage?: number
  }> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  async function fetch(): Promise<ItemCategory[]> {
    state.isLoading = true
    try {
      const { itemCategories, totalCount } = await itemCategoriesApi.list(unref(queryOptions))
      state.isErrored = false
      state.itemCategories = itemCategories
      state.totalCount = totalCount
      return itemCategories
    } catch (error) {
      console.error("Failed to fetch departments:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => [skipWatchIf(), unref(queryOptions)],
    async ([skip]) => {
      if (skip) return

      if (state.totalCount === 0 && !state.isLoading) {
        await fetch()
      }
    },
    { deep: true, immediate: true }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useItemCategories
