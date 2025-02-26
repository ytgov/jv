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
import { computed, ref } from "vue"

import useItemCategories from "@/use/use-item-categories"

const { itemCategories } = useItemCategories(ref({}))

const items = computed(() => {
  return itemCategories.value.map((e) => ({
    itemCatID: e.itemCatID,
    category: e.category,
    subtitle: `${e.description ? `${e.description} (${e.branch})` : e.branch}`,
  }))
})
</script>
