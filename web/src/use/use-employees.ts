import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import employeesApi, {
  type Employee,
  type EmployeeWhereOptions,
  type EmployeeFiltersOptions,
} from "@/api/employees-api"

export { type Employee, type EmployeeWhereOptions, type EmployeeFiltersOptions }

const state = reactive<{
  employees: Employee[]
  totalCount: number
  isLoading: boolean
  isErrored: boolean
}>({
  employees: [],
  totalCount: 0,
  isLoading: false,
  isErrored: false,
})

export function useEmployees(
  queryOptions: Ref<{
    where?: EmployeeWhereOptions
    filters?: EmployeeFiltersOptions
    page?: number
    perPage?: number
  }> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  async function fetch(): Promise<Employee[]> {
    state.isLoading = true
    try {
      const { employees, totalCount } = await employeesApi.list(unref(queryOptions))
      state.isErrored = false
      state.employees = employees
      state.totalCount = totalCount
      return employees
    } catch (error) {
      console.error("Failed to fetch employees:", error)
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

export default useEmployees
