<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="recoveries"
      :items-per-page="10"
      class="striped"
      @click:row="openRecovery"
    >
      <template #item.createDate="{ item }">
        {{ formatDate(item.createDate) }}
      </template>

      <template #item.requestor="{ item }"> {{ item.firstName }} {{ item.lastName }} </template>

      <template #item.recoveryItems="{ item }">
        {{ getRecoveryItems(item) }}
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

import { useItemCategories } from "@/use/use-item-categories"
import formatDate from "@/utils/format-date"
import { useRouter } from "vue-router"
import { Recovery } from "@/api/recoveries-api"

const { itemCategories } = useItemCategories(ref({}))

defineProps<{ recoveries: Recovery[] }>()

const headers = [
  { title: "Create Date", value: "createDate", class: "blue-grey lighten-4" },
  { title: "Department", value: "department", class: "blue-grey lighten-4" },
  { title: "Reference", value: "refNum", class: "blue-grey lighten-4" },
  { title: "Request", value: "recoveryItems", class: "blue-grey lighten-4" },
  { title: "Requestee", value: "requestor", class: "blue-grey lighten-4" },
  { title: "Status", value: "status", class: "blue-grey lighten-4" },
  { title: "At", value: "createUser", class: "blue-grey lighten-4" },
]

const router = useRouter()

function getRecoveryItems(recovery: Recovery) {
  const items = recovery.recoveryItems.map((rec) =>
    itemCategories.value.find((item) => item.itemCatID == rec.itemCatID)
  )
  return items.map((i) => i?.category).join(", ")
}

function openRecovery(event: MouseEvent, { item }: { item: Recovery }) {
  router.push({
    name: "RecoveryDetailsPage",
    params: { id: item.recoveryID },
  })
}
</script>
