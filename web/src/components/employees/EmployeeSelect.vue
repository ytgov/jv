<template>
  <v-autocomplete
    :items="items"
    item-title="fullName"
    :item-props="true"
    item-value="id"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue"

import useEmployees from "@/use/use-employees"

const { employees } = useEmployees(ref({}))

const items = computed(() => {
  return employees.value.map((e) => ({
    fullName: `${e.firstName} ${e.lastName}`,
    id: e.fullName,
    subtitle: `${e.department} ${e.branch ? `(${e.branch})` : ""}`,
  }))
})
</script>
