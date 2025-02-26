import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import recoveriesApi, {
  type Recovery,
  type RecoveryWhereOptions,
  type RecoveryFiltersOptions,
} from "@/api/recoveries-api"

export { type Recovery, type RecoveryWhereOptions, type RecoveryFiltersOptions }

export function useRecoveries(
  queryOptions: Ref<{
    where?: RecoveryWhereOptions
    filters?: RecoveryFiltersOptions
    page?: number
    perPage?: number
  }> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    recoveries: Recovery[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    recoveries: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<Recovery[]> {
    state.isLoading = true
    try {
      const { recoveries, totalCount } = await recoveriesApi.list(unref(queryOptions))
      state.isErrored = false
      state.recoveries = recoveries
      state.totalCount = totalCount
      return recoveries
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

      await fetch()
    },
    { deep: true, immediate: true }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useRecoveries
