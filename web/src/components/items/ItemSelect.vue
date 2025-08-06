<template>
  <v-autocomplete
    :items="items"
    item-title="category"
    item-value="itemCatID"
    :item-props="true"
  >
    <template #selection="{ item }">
      <div class="no-wrap text-subtitle-2">
        <strong>{{ item.title }}</strong> : {{ item.raw.subtitle }}
      </div>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { computed } from "vue"

import useItemCategories from "@/use/use-item-categories"

const props = defineProps<{ supplier?: string | null }>()

const { itemCategories } = useItemCategories()

const items = computed(() => {
  let filteredItems = itemCategories.value

  if (!isNil(props.supplier)) {
    const supplierBranch = props.supplier
    filteredItems = filteredItems.filter((item) => item.branch.startsWith(supplierBranch))
  }

  return filteredItems.map((e) => ({
    itemCatID: e.itemCatID,
    category: e.category,
    subtitle: `${e.description ? `${e.description} (${e.branch})` : e.branch}`,
  }))
})
</script>
