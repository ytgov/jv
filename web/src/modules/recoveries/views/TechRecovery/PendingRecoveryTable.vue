<template>
  <div class="mt-5 mx-10 mb-5">
    <v-data-table
      :headers="headers"
      :items="recoveries"
      :items-per-page="10"
    >
      <template #item.createDate="{ item }">
        {{ item.createDate }}
      </template>

      <template #item.requestor="{ item }"> {{ item.firstName }} {{ item.lastName }} </template>

      <template #item.recoveryItems="{ item }">
        {{ getRecoveryItems(item) }}
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"

import { useItemCategories } from "@/use/use-item-categories"

const { itemCategories } = useItemCategories(ref({}))

defineProps<{ recoveries: unknown[] }>()

const headers = [
  { text: "Create Date", value: "createDate", class: "blue-grey lighten-4" },
  { text: "Department", value: "department", class: "blue-grey lighten-4" },
  { text: "Reference", value: "refNum", class: "blue-grey lighten-4" },
  { text: "Request", value: "recoveryItems", class: "blue-grey lighten-4" },
  { text: "Requestee", value: "requestor", class: "blue-grey lighten-4" },
  { text: "Status", value: "status", class: "blue-grey lighten-4" },
  { text: "At", value: "createUser", class: "blue-grey lighten-4" },
]

const itemCategoryList = {}

onMounted(() => {
  initItemCategory()
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
