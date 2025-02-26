import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNaN, isNil } from "lodash"

import itemCategoriesApi, { type ItemCategory } from "@/api/item-categories-api"

export { type ItemCategory }

export function useItemCategory(id: Ref<number | null | undefined>) {
  const state = reactive<{
    itemCategory: Partial<ItemCategory> | ItemCategory | null
    isLoading: boolean
    isErrored: boolean
  }>({
    itemCategory: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<ItemCategory> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { itemCategory } = await itemCategoriesApi.get(staticId)
      state.isErrored = false
      state.itemCategory = itemCategory
      return itemCategory
    } catch (error) {
      console.error("Failed to fetch itemCategory:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save(): Promise<ItemCategory> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    if (isNil(state.itemCategory)) {
      throw new Error("No itemcategory to save")
    }

    state.isLoading = true
    try {
      const { itemcategory } = await itemCategoriesApi.update(staticId, state.itemCategory)
      state.isErrored = false
      state.itemCategory = itemcategory
      return itemcategory
    } catch (error) {
      console.error("Failed to save itemcategory:", error)
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
        state.itemCategory = { active: true, price: 10 }
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

export default useItemCategory
