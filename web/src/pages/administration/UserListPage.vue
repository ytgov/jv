<template>
  <SimpleCard title="Users">
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
          Add User
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :items="users"
      :headers="headers"
      :loading="isLoading"
      :search="search"
      class="clickable-row"
      @click:row="editClick"
    >
    </v-data-table>
  </SimpleCard>

  <UserEditDialog></UserEditDialog>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"

import UserEditDialog from "@/components/users/UserEditDialog.vue"
import SimpleCard from "@/components/common/SimpleCard.vue"

import { User } from "@/api/users-api"
import useUsers from "@/use/use-users"
import useBreadcrumbs from "@/use/use-breadcrumbs"

const { users, isLoading } = useUsers(ref({}))
const router = useRouter()

const search = ref("")

useBreadcrumbs("Users", [
  {
    title: "Administration",
    to: {
      name: "AdministrationPage",
    },
  },
  {
    title: "Users",
    disabled: true,
    to: {
      name: "administration/UserListPage",
    },
  },
])

const headers = [
  { title: "Name", value: "display_name" },
  { title: "Email", value: "email" },
  { title: "Department", value: "department" },
  { title: "Branch", value: "branch" },
  { title: "Unit", value: "unit" },
  { title: "Roles", value: "roles" },
  { title: "Status", value: "status" },
]

function addClick() {
  router.push({ name: "administration/UserEditPage", params: { id: "add" } })
}

function editClick(_event: PointerEvent, { item }: { item: User }) {
  router.push({ name: "administration/UserEditPage", params: { id: item.id } })
}
</script>
