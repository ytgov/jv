<template>
  <div class="mx-10 mb-5">
    <div class="d-flex">
      <v-spacer />
      <new-recovery
        type="Add New"
        title="Create"
        max-width="80%"
        :recovery="{}"
        @update-table="updateTable"
      />
    </div>

    <v-data-table
      :headers="headers"
      :items="recoveries"
      :items-per-page="10"
    >
      <template #item.createDate="{ item }">
        {{ item.createDate }}
      </template>
      <template #item.requestor="{ item }"> {{ item.firstName }} {{ item.lastName }} </template>
      <template #item.recoveryItems="{ item }">{{ getRecoveryItems(item) }}</template>

      <template #item.totalPrice="{ item }">
        {{ formatMoney(item.totalPrice) }}
      </template>

      <template #item.jvNum="{ item }">
        <div v-if="item.journal && item.journal.jvNum">{{ item.journal.jvNum }}</div>
      </template>

      <template #item.edit="{ item }">
        <v-row>
          <div style="width: 4.5rem">
            <new-recovery
              :type="isFillPhase(item) ? 'Fill' : 'Edit'"
              :title="isFillPhase(item) ? 'Fill' : 'Edit'"
              :max-width="isFillPhase(item) ? '85%' : '80%'"
              :recovery="item"
              @update-table="updateTable"
            />
          </div>
        </v-row>
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import NewRecovery from "../RecoveryComponents/NewRecovery.vue"

import { useItemCategories } from "@/use/use-item-categories"

const { itemCategories } = useItemCategories(ref({}))

const emit = defineEmits(["updateTable"])
defineProps<{ recoveries: unknown[] }>()

const headers = [
  { text: "Create Date", value: "createDate", class: "blue-grey lighten-4" },
  { text: "Department", value: "department", class: "blue-grey lighten-4" },
  { text: "Reference", value: "refNum", class: "blue-grey lighten-4" },
  { text: "Request", value: "recoveryItems", class: "blue-grey lighten-4" },
  { text: "Requestee", value: "requestor", class: "blue-grey lighten-4" },
  { text: "Status", value: "status", class: "blue-grey lighten-4" },
  { text: "", sortable: false, value: "edit", class: "blue-grey lighten-4", width: "1rem" },
]

const itemCategoryList = {}

onMounted(() => {
  initItemCategory()
})

function updateTable() {
  emit("updateTable")
}

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

function isFillPhase(item) {
  if (
    item.status == "Purchase Approved" ||
    item.status == "Partially Fullfilled" ||
    item.status == "Fullfilled"
  )
    return true
  return false
}
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
