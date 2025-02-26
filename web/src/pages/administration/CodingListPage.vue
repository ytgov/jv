<template>
  <SimpleCard>
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
          Add Coding
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :items="codings"
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
import { ref } from "vue"
import { useRouter } from "vue-router"

import SimpleCard from "@/components/common/SimpleCard.vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCodings, { Coding } from "@/use/use-codings"

const { codings, isLoading } = useCodings(ref({}))
const router = useRouter()

const search = ref("")

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
  { title: "Department", value: "department", width: "18%" },
  { title: "ICT Branch", value: "ictBranch", width: "8%" },
  { title: "ICT Unit", value: "ictUnit", width: "14%" },
  { title: "Coding", value: "glCode", width: "17%" },
  { title: "Receiving Department", value: "recvDepartment", width: "17%" },
  { title: "Financial Contact", value: "contactName", width: "11%" },
  { title: "Email", value: "contactEmail", width: "10%" },
  { title: "", value: "edit", width: "5%" },
]
function addClick() {
  router.push({ name: "administration/CodingEditPage", params: { departmentID: "add" } })
}
function editClick(_event: PointerEvent, { item }: { item: Coding }) {
  router.push({ name: "administration/CodingEditPage", params: { departmentID: item.departmentID } })
}
</script>
