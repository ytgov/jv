import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import departmentsApi, {
  type Department,
  type DepartmentWhereOptions,
  type DepartmentFiltersOptions,
} from "@/api/departments-api"

export { type Department, type DepartmentWhereOptions, type DepartmentFiltersOptions }

const state = reactive<{
  departments: Department[]
  totalCount: number
  isLoading: boolean
  isErrored: boolean
}>({
  departments: [],
  totalCount: 0,
  isLoading: false,
  isErrored: false,
})

export function useDepartments(
  queryOptions: Ref<{
    where?: DepartmentWhereOptions
    filters?: DepartmentFiltersOptions
    page?: number
    perPage?: number
  }> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  async function fetch(): Promise<Department[]> {
    state.isLoading = true
    try {
      const { departments, totalCount } = await departmentsApi.list(unref(queryOptions))
      state.isErrored = false
      state.departments = departments
      state.totalCount = totalCount
      return departments
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

export default useDepartments
