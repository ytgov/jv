<template>
  <v-autocomplete
    :items="ictBranches"
    item-title="name"
    item-value="id"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue"

import useDepartments from "@/use/use-departments"
import { isNil } from "lodash"

const props = defineProps({
  branch: {
    type: String,
    required: false,
    default: null,
  },
})

const { departments } = useDepartments(ref({}))

const ictBranches = computed(() => {
  const hpw = departments.value.find((d) => d.name == "Highways and Public Works")
  if (!hpw) return []

  const ict = hpw?.divisions.find((d) => d.name == "Information and Communications Technology")
  if (!ict) return []

  if (!isNil(props.branch)) {
    const branch = ict.branches.find((b) => b.name.replace(/[^A-Z]/g, "") == props.branch)
    if (!branch) return []
    return branch.units
  }

  const units = ict?.branches.flatMap((b) => b.units)
  if (!ict) return []

  const branchOptions = []

  for (const branch of ict.branches) {
    if (isNil(branch)) return []
    const upperCaseLetters = branch.name.replace(/[^A-Z]/g, "")
    branchOptions.push(upperCaseLetters)
  }

  return units
})
</script>
