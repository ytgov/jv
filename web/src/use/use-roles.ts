import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import rolesApi, { type Role } from "@/api/roles-api"

export { type Role }

const state = reactive<{
  roles: Role[]
  totalCount: number
  isLoading: boolean
  isErrored: boolean
}>({
  roles: [],
  totalCount: 0,
  isLoading: false,
  isErrored: false,
})

export function useRoles(
  queryOptions: Ref<{
    page?: number
    perPage?: number
  }> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  async function fetch(): Promise<Role[]> {
    state.isLoading = true
    try {
      const { roles, totalCount } = await rolesApi.list(unref(queryOptions))
      state.isErrored = false
      state.roles = roles
      state.totalCount = totalCount
      return roles
    } catch (error) {
      console.error("Failed to fetch roles:", error)
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

export default useRoles
