import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import usersApi, { type User } from "@/api/users-api"

export { type User }

export function useUser(id: Ref<number | null | undefined>) {
  const state = reactive<{
    user: Partial<User> | User | null
    isLoading: boolean
    isErrored: boolean
  }>({
    user: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<User> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { user } = await usersApi.get(staticId)
      state.isErrored = false
      state.user = user
      return user
    } catch (error) {
      console.error("Failed to fetch user:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save(): Promise<User> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    if (isNil(state.user)) {
      throw new Error("No user to save")
    }

    state.isLoading = true
    try {
      const { user } = await usersApi.update(staticId, state.user)
      state.isErrored = false
      state.user = user
      return user
    } catch (error) {
      console.error("Failed to save user:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function activate(): Promise<void> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      if (!state.user) return
      await usersApi.update(staticId, state.user)
      state.isErrored = false
    } catch (error) {
      console.error("Failed to deactivate user:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function deactivate(): Promise<void> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      if (!state.user) return
      await usersApi.update(staticId, state.user)
      state.isErrored = false
    } catch (error) {
      console.error("Failed to deactivate user:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(id),
    async (newId) => {
      if (isNil(newId)) return

      if (isNaN(newId)) {
        state.user = { status: "Active" }
        return
      }

      await fetch()
    },
    { immediate: true }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
    save,
    activate,
    deactivate,
  }
}

export default useUser
