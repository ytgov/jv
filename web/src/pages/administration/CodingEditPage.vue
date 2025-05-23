<template>
  <SimpleCard title="Coding Details">
    <v-row v-if="item">
      <v-col
        cols="12"
        md="4"
      >
        <DepartmentSelect
          v-model="item.department"
          label="Department"
          hide-details
        />
      </v-col>

      <v-col
        cols="12"
        md="4"
      >
        <EmployeeSelect
          v-model="item.contactName"
          label="Financial contact"
          hide-details
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-text-field
          v-model="item.contactEmail"
          label="Financial contact email"
          hide-details
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <GroupSelect
          v-model="item.ictBranch"
          label="Group"
          hide-details
        />
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="item.recvDepartment"
          label="Receiving department"
          hide-details
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <CodingTextField
          v-model="item.glCode"
          label="Coding"
          hide-details
        />
      </v-col>
    </v-row>

    <v-btn
      class="mt-5"
      :disabled="!isValid"
      @click="saveClick"
      >Save Coding</v-btn
    >
  </SimpleCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { isNil } from "lodash"

import DepartmentSelect from "@/components/departments/DepartmentSelect.vue"
import EmployeeSelect from "@/components/employees/EmployeeSelect.vue"
import CodingTextField from "@/components/coding/CodingTextField.vue"
import SimpleCard from "@/components/common/SimpleCard.vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCoding from "@/use/use-coding"
import useEmployees from "@/use/use-employees"
import GroupSelect from "@/components/groups/GroupSelect.vue"

const props = defineProps({
  departmentID: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const { coding: item, save } = useCoding(ref(parseInt(props.departmentID)))
const { employees } = useEmployees(ref({}))

const isValid = computed(() => {
  if (isNil(item) || isNil(item.value)) {
    return false
  }

  if (
    isNil(item.value.department) ||
    isNil(item.value.glCode) ||
    isNil(item.value.contactName || isNil(item.value.contactEmail))
  )
    return false

  return true
})

watch(
  () => [item.value?.ictBranch],
  ([newValue], [oldValue]) => {
    if (item.value && newValue != oldValue && !isNil(oldValue)) {
      item.value.ictUnit = null
    }
  }
)
watch(
  () => [item.value?.contactName],
  ([newValue]) => {
    if (item.value && item.value?.contactName) {
      const selectedEmployee = employees.value.find((e) => e.fullName == newValue)

      if (selectedEmployee) {
        item.value.contactEmail = selectedEmployee.email
      }
    }
  }
)

useBreadcrumbs("Coding Details", [
  {
    title: "Administration",
    to: {
      name: "AdministrationPage",
    },
  },
  {
    title: "Coding",
    to: {
      name: "administration/CodingListPage",
    },
  },
  {
    title: "Coding Details",
    disabled: true,
    to: {
      name: "administration/CodingEditPage",
      params: { departmentID: props.departmentID },
    },
  },
])

async function saveClick() {
  await save()
  router.push({ name: "administration/CodingListPage" })
}
</script>
