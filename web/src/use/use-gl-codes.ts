import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import glCodesApi, {
  type GLCode,
  type GLCodeWhereOptions,
  type GLCodeFiltersOptions,
} from "@/api/gl-codes-api"

export { type GLCode, type GLCodeWhereOptions, type GLCodeFiltersOptions }

export function useGLCodes(
  queryOptions: Ref<{
    where?: GLCodeWhereOptions
    filters?: GLCodeFiltersOptions
    page?: number
    perPage?: number
  }> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    glCodes: GLCode[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    glCodes: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<GLCode[]> {
    state.isLoading = true
    try {
      const { glCodes, totalCount } = await glCodesApi.list(unref(queryOptions))
      state.isErrored = false
      state.glCodes = glCodes
      state.totalCount = totalCount
      return glCodes
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

export default useGLCodes
