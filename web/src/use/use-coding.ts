import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNaN, isNil } from "lodash"

import codingsApi, { type Coding } from "@/api/codings-api"

export { type Coding }

export function useCoding(id: Ref<number | null | undefined>) {
  const state = reactive<{
    coding: Partial<Coding> | Coding | null
    isLoading: boolean
    isErrored: boolean
  }>({
    coding: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<Coding> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { coding } = await codingsApi.get(staticId)
      state.isErrored = false
      state.coding = coding
      return coding
    } catch (error) {
      console.error("Failed to fetch coding:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save(): Promise<Coding> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    if (isNil(state.coding)) {
      throw new Error("No coding to save")
    }

    state.isLoading = true
    try {
      const { coding } = await codingsApi.update(staticId, state.coding)
      state.isErrored = false
      state.coding = coding
      return coding
    } catch (error) {
      console.error("Failed to save coding:", error)
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
        state.coding = {}
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
    save,
  }
}

export default useCoding
