import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil, isNull } from "lodash"

import recoverysApi, { type Recovery } from "@/api/recoveries-api"
import { getCurrentFiscalYear } from "@/utils/format-date"

export { type Recovery }

export function useRecovery(id: Ref<number | null | undefined>) {
  const state = reactive<{
    recovery: Partial<Recovery> | Recovery | null
    isLoading: boolean
    isErrored: boolean
  }>({
    recovery: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<Recovery> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { recovery } = await recoverysApi.get(staticId)
      state.isErrored = false
      state.recovery = recovery
      return recovery
    } catch (error) {
      console.error("Failed to fetch recovery:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function create(): Promise<Recovery> {
    if (isNil(state.recovery)) {
      throw new Error("No recovery to save")
    }

    state.isLoading = true
    try {
      const { recovery } = await recoverysApi.create(state.recovery)
      state.isErrored = false
      state.recovery = recovery
      return recovery
    } catch (error) {
      console.error("Failed to create recovery:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save(): Promise<Recovery> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    if (isNil(state.recovery)) {
      throw new Error("No recovery to save")
    }

    state.isLoading = true
    try {
      await recoverysApi.update(staticId, state.recovery)
      state.isErrored = false
      return fetch()
    } catch (error) {
      console.error("Failed to save recovery:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(id),
    async (newId) => {
      if (isNull(newId) || newId == 0) {
        state.recovery = {
          fiscal_year: getCurrentFiscalYear(),
          recoveryItems: [],
        }
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

export default useRecovery
