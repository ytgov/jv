<template>
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
    <template #item.recoveryItems="{ item }">{{ getRecoveryItems(item) }}</template>

    <template #item.totalPrice="{ item }">
      {{ formatMoney(item.totalPrice) }}
    </template>
    <template #item.journal.jvNum="{ item }">
      <div v-if="item.journal && item.journal.jvNum">{{ item.journal.jvNum }}</div>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"

import { useItemCategories } from "@/use/use-item-categories"
import { Recovery } from "@/api/recoveries-api"
import formatMoney from "@/utils/format-currency"
import formatDate from "@/utils/format-date"

const { itemCategories } = useItemCategories(ref({}))

const router = useRouter()
defineProps<{ recoveries: Recovery[]; headers: Array<object> }>()

function getRecoveryItems(recovery: Recovery) {
  const items = recovery.recoveryItems.map((rec) =>
    itemCategories.value.find((item) => item.itemCatID == rec.itemCatID)
  )
  return items.map((i) => i?.category).join(", ")
}

function isFillPhase(item: Recovery) {
  if (
    item.status == "Purchase Approved" ||
    item.status == "Partially Fulfilled" ||
    item.status == "Fulfilled"
  )
    return true
  return false
}

function openRecovery(event: MouseEvent, { item }: { item: Recovery }) {
  router.push({
    name: "RecoveryDetailsPage",
    params: { id: item.recoveryID },
  })
}
</script>
