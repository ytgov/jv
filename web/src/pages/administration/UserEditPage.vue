<template>
  <SimpleCard title="User Details">
    <v-row v-if="item">
      <v-col
        cols="12"
        md="3"
      >
        <EmployeeSelect
          v-if="!item.id"
          v-model="item.display_name"
          label="Name"
          hide-details
        />
        <v-text-field
          v-else
          v-model="item.display_name"
          label="Name"
          hide-details
          readonly
          append-inner-icon="mdi-lock"
        />
      </v-col>
      <v-col cols="3">
        <v-text-field
          v-model="item.email"
          label="Email"
          hide-details
          readonly
          append-inner-icon="mdi-lock"
        />
      </v-col>
      <v-col cols="3">
        <DepartmentSelect
          v-model="item.department"
          label="Department"
          hide-details
        />
      </v-col>
      <v-col cols="3">
        <v-select
          v-model="item.status"
          :items="['Active', 'Inactive']"
          label="Status"
          hide-details
        />
      </v-col>

      <v-col cols="12">
        <v-select
          v-model="userRoles"
          :items="roles"
          item-title="name"
          item-value="role"
          multiple
          label="Roles"
          hide-details
        />
      </v-col>
      <v-col
        v-if="isAgent"
        cols="12"
      >
        <GroupSelect
          v-model="item.branch"
          label="Agent group"
        />
      </v-col>
    </v-row>

    <v-btn
      class="mt-5"
      :disabled="!isValid"
      @click="saveClick"
      >Save User</v-btn
    >
  </SimpleCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { isNil } from "lodash"

import SimpleCard from "@/components/common/SimpleCard.vue"
import DepartmentSelect from "@/components/departments/DepartmentSelect.vue"
import EmployeeSelect from "@/components/employees/EmployeeSelect.vue"
import GroupSelect from "@/components/groups/GroupSelect.vue"

import useUser from "@/use/use-user"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import useEmployees from "@/use/use-employees"
import useRoles from "@/use/use-roles"
import useSnack from "@/use/use-snack"

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const { roles } = useRoles(ref({}))
const { employees } = useEmployees(ref({}))
const userRoles = ref<string[]>([])
const snack = useSnack()

const router = useRouter()
const { user: item, save } = useUser(ref(parseInt(props.id)))

const isAgent = computed(() => {
  if (isNil(item.value) || isNil(userRoles.value)) return false

  return userRoles.value.includes("Agent") ?? false
})

const isValid = computed(() => {
  if (isNil(item) || isNil(item.value)) {
    return false
  }

  if (isNil(item.value.display_name) || isNil(item.value.email) || isNil(item.value.status))
    return false

  return true
})

useBreadcrumbs("User Details", [
  {
    title: "Administration",
    to: {
      name: "AdministrationPage",
    },
  },
  {
    title: "Users",
    to: {
      name: "administration/UserListPage",
    },
  },
  {
    title: "Item Details",
    disabled: true,
    to: {
      name: "administration/UserEditPage",
      params: { id: props.id },
    },
  },
])

watch(
  () => [item.value?.display_name],
  ([newValue]) => {
    if (item.value && newValue) {
      const selectedEmployee = employees.value.find((e) => e.fullName == newValue)

      if (selectedEmployee) {
        item.value.department = selectedEmployee.department
        item.value.email = selectedEmployee.email
      }
    }
    userRoles.value = item.value?.roles?.split(",") ?? []
  }
)

watch(
  () => [userRoles.value],
  ([newValue]) => {
    if (item.value) {
      if (isNil(newValue) || newValue.length == 0 || newValue[0] == "") item.value.roles = null
      else item.value.roles = newValue.join(",")
    }
  }
)

async function saveClick() {
  if (isNil(item.value)) return
  if (!isAgent.value) item.value.branch = null
  item.value.unit = null

  await save()
    .then(() => {
      console.log("User saved successfully")
      snack.success("User saved")
      router.push({ name: "administration/UserListPage" })
    })
    .catch((error) => {
      snack.error("Error saving user")
      console.error("Error saving user:", error)
    })
}
</script>
