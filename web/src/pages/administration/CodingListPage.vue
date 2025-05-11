<template>
  <SimpleCard>
    <v-row>
      <v-col class="d-flex">
        <v-text-field
          v-model="search"
          label="Search"
          style="width: 200px"
        />

        <GroupSelect
          v-model="group"
          class="ml-5"
          label="Group"
          clearable
          style="width: 200px"
        />

        <v-btn
          class="ml-5"
          :height="46"
          :to="{ name: 'administration/CodingEditPage', params: { departmentID: 'add' } }"
        >
          Add Coding
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
    </v-data-table>
  </SimpleCard>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

import SimpleCard from "@/components/common/SimpleCard.vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCodings, { Coding } from "@/use/use-codings"
import GroupSelect from "@/components/groups/GroupSelect.vue"
import { isEmpty, isNil } from "lodash"

const { codings, isLoading, fetch } = useCodings(ref({}))
fetch()
const router = useRouter()

const search = ref("")
const group = ref("")

useBreadcrumbs("Coding", [
  {
    title: "Administration",
    to: {
      name: "AdministrationPage",
    },
  },
  {
    title: "Coding",
    disabled: true,
    to: {
      name: "administration/CodingListPage",
    },
  },
])

const headers = [
  { title: "Group", value: "ictBranch", width: "8%" },
  { title: "Department", value: "department", width: "18%" },
  { title: "Coding", value: "glCode", width: "17%" },
  { title: "Receiving Department", value: "recvDepartment", width: "17%" },
  { title: "Financial Contact", value: "contactName", width: "11%" },
]

const filteredList = computed(() => {
  if (isNil(group.value) || isEmpty(group.value)) return codings.value

  return codings.value.filter((item) => item.ictBranch.startsWith(group.value))
})

function editClick(_event: PointerEvent, { item }: { item: Coding }) {
  router.push({
    name: "administration/CodingEditPage",
    params: { departmentID: item.departmentID },
  })
}
</script>
