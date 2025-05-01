<template>
  <v-select
    :items="fiscalYears"
    label="Select Fiscal Year"
    hide-details
  />
</template>

<script lang="ts" setup>
import { computed } from "vue"

const fiscalYears = computed(() => {
  const currentYear = new Date().getFullYear() + 1
  const years = new Array<string>()

  for (let i = 0; i < 5; i++) {
    const nextYear = currentYear - i
    const nextYearString = (nextYear + 1).toString().slice(2, 4)
    years.push(`${nextYear}/${nextYearString}`)
  }

  return years
})
</script>
