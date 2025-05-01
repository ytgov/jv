import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNaN, isNil } from "lodash"

import groupsApi, { type Group } from "@/api/groups-api"

export { type Group }

export function useGroup(id: Ref<number | null | undefined>) {
  const state = reactive<{
    group: Partial<Group> | Group | null
    isLoading: boolean
    isErrored: boolean
  }>({
    group: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<Group> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { group } = await groupsApi.get(staticId)
      state.isErrored = false
      state.group = group
      return group
    } catch (error) {
      console.error("Failed to fetch group:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function create(): Promise<Group> {
    if (isNil(state.group)) {
      throw new Error("No group to save")
    }

    state.isLoading = true
    try {
      const { group } = await groupsApi.create(state.group)
      state.isErrored = false
      state.group = group
      return group
    } catch (error) {
      console.error("Failed to save group:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save(): Promise<Group> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    if (isNil(state.group)) {
      throw new Error("No group to save")
    }

    state.isLoading = true
    try {
      const { group } = await groupsApi.update(staticId, state.group)
      state.isErrored = false
      state.group = group
      return group
    } catch (error) {
      console.error("Failed to save group:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(id),
    async (newId) => {
      if (isNaN(newId)) {
        state.group = {}
        return
      }

      if (isNil(newId)) return

      await fetch()
    },
    { immediate: true }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
    create,
    save,
  }
}

export default useGroup
