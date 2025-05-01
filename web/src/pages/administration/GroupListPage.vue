<template>
  <SimpleCard title="Groups">
    <v-row>
      <v-col class="d-flex">
        <v-text-field
          v-model="search"
          label="Search"
        />

        <v-btn
          class="ml-5"
          :height="46"
          @click="addClick"
        >
          Add Group
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :items="groups"
      :headers="headers"
      :loading="isLoading"
      :search="search"
      class="clickable-row"
      @click:row="editClick"
    >
    </v-data-table>
  </SimpleCard>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"

import SimpleCard from "@/components/common/SimpleCard.vue"

import { Group } from "@/api/groups-api"
import useGroups from "@/use/use-groups"
import useBreadcrumbs from "@/use/use-breadcrumbs"

const { groups, isLoading, fetch } = useGroups()
const router = useRouter()

onMounted(async () => {
  await fetch()
})

const search = ref("")

useBreadcrumbs("Groups", [
  {
    title: "Administration",
    to: {
      name: "AdministrationPage",
    },
  },
  {
    title: "Groups",
    disabled: true,
    to: {
      name: "administration/GroupListPage",
    },
  },
])

const headers = [
  { title: "Short Name", value: "short_name" },
  { title: "Branch", value: "branch" },
  { title: "Unit", value: "unit" },
]

function addClick() {
  router.push({ name: "administration/GroupEditPage", params: { id: "add" } })
}

function editClick(_event: PointerEvent, { item }: { item: Group }) {
  router.push({ name: "administration/GroupEditPage", params: { id: item.id } })
}
</script>
