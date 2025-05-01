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
import { computed } from "vue"

import useItemCategories from "@/use/use-item-categories"

const props = defineProps({
  supplier: {
    type: String,
    default: null,
  },
})

const { itemCategories } = useItemCategories()

const items = computed(() => {
  let filteredItems = itemCategories.value

  if (props.supplier && props.supplier.length > 0) {
    filteredItems = filteredItems.filter((item) => item.branch.startsWith(props.supplier))
  }

  return filteredItems.map((e) => ({
    itemCatID: e.itemCatID,
    category: e.category,
    subtitle: `${e.description ? `${e.description} (${e.branch})` : e.branch}`,
  }))
})
</script>
