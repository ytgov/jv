import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import codingsApi, {
  type Coding,
  type CodingWhereOptions,
  type CodingFiltersOptions,
} from "@/api/codings-api"

export { type Coding, type CodingWhereOptions, type CodingFiltersOptions }

const state = reactive<{
  codings: Coding[]
  totalCount: number
  isLoading: boolean
  isErrored: boolean
}>({
  codings: [],
  totalCount: 0,
  isLoading: false,
  isErrored: false,
})

export function useCodings(
  queryOptions: Ref<{
    where?: CodingWhereOptions
    filters?: CodingFiltersOptions
    page?: number
    perPage?: number
  }> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  async function fetch(): Promise<Coding[]> {
    state.isLoading = true
    try {
      const { codings, totalCount } = await codingsApi.list(unref(queryOptions))
      state.isErrored = false
      state.codings = codings
      state.totalCount = totalCount
      return codings
    } catch (error) {
      console.error("Failed to fetch codings:", error)
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

export default useCodings
