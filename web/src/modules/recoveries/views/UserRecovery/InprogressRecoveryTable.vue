<template>
  <div v-if="!loadingData">
    <v-data-table
      :headers="headers"
      :items="recoveries"
      :items-per-page="10"
    >
      <template #item.createDate="{ item }">
        {{ item.createDate }}
      </template>

      <template #item.recoveryItems="{ item }">
        {{ getRecoveryItems(item) }}
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"

import { useItemCategories } from "@/use/use-item-categories"

const { itemCategories } = useItemCategories(ref({}))

defineProps<{
  recoveries: unknown[]
}>()

const headers = ref([
  { title: "Create Date", value: "createDate", class: "blue-grey lighten-4" },
  { title: "Reference", value: "refNum", class: "blue-grey lighten-4" },
  { title: "Request", value: "recoveryItems", class: "blue-grey lighten-4" },
  { title: "Status", value: "status", class: "blue-grey lighten-4" },
  { title: "Request At", value: "modUser", class: "blue-grey lighten-4" },
])

const itemCategoryList = ref(null)
const loadingData = ref(false)

onMounted(() => {
  loadingData.value = true
  initItemCategory()
  loadingData.value = false
})

function initItemCategory() {
  itemCategoryList.value = {}

  //const itemCategoryList = itemCategories.value

  for (const item of itemCategories.value) {
    itemCategoryList.value[item.itemCatID] = item.category
  }
}

function getRecoveryItems(recovery) {
  const items = recovery.recoveryItems.map((rec) => itemCategoryList.value[rec.itemCatID])
  return items.join(", ")
}
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
