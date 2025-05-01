<template>
  <SimpleCard>
    <v-row>
      <v-col class="d-flex">
        <v-text-field
          v-model="search"
          class="mr-5"
          label="Search"
          style="width: 200px"
        />
        <GroupSelect
          v-model="group"
          label="Group"
          clearable
          style="width: 200px"
        />

        <v-btn
          class="ml-5"
          :height="46"
          :to="{ name: 'administration/ItemEditPage', params: { itemCatID: 'add' } }"
        >
          Add Item
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :items="filteredList"
      :headers="headers"
      :loading="isLoading"
      :search="search"
      class="clickable-row"
      @click:row="editClick"
    >
      <template #item.active="{ item }">
        <v-icon
          v-if="item.active"
          color="success"
          >mdi-check</v-icon
        >
        <v-icon
          v-else
          color="error"
          >mdi-close</v-icon
        >
      </template>
      <template #item.price="{ item }">
        {{ formatCurrency(item.price) }}
      </template>
    </v-data-table>
  </SimpleCard>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

import SimpleCard from "@/components/common/SimpleCard.vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useItemCategories, { ItemCategory } from "@/use/use-item-categories"
import formatCurrency from "@/utils/format-currency"
import GroupSelect from "@/components/groups/GroupSelect.vue"
import { isEmpty, isNil } from "lodash"

const { itemCategories, isLoading } = useItemCategories(ref({}))
const router = useRouter()

const search = ref("")
const group = ref("")

useBreadcrumbs("Items", [
  {
    title: "Administration",
    to: {
      name: "AdministrationPage",
    },
  },
  {
    title: "Items",
    disabled: true,
    to: {
      name: "administration/ItemListPage",
    },
  },
])

const filteredList = computed(() => {
  if (isNil(group.value) || isEmpty(group.value)) return itemCategories.value

  return itemCategories.value.filter((item) => item.branch.startsWith(group.value))
})

const headers = [
  { title: "Active", value: "active", width: "50px" },
  { title: "Group", value: "branch" },
  { title: "Name", value: "category" },
  { title: "Cost", value: "price" },
  { title: "Description", value: "description" },
]

function editClick(_event: PointerEvent, { item }: { item: ItemCategory }) {
  router.push({ name: "administration/ItemEditPage", params: { itemCatID: item.itemCatID } })
}
</script>
