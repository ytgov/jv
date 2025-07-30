<template>
  <v-autocomplete
    label="Coding"
    :items="codings"
    item-title="glCode"
    item-value="glCode"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"

import useCodings, { CodingWhereOptions } from "@/use/use-codings"

const props = withDefaults(
  defineProps<{
    where?: CodingWhereOptions
  }>(),
  {
    where: () => ({}),
  }
)
const codingQuery = computed(() => {
  return {
    where: props.where,
    perPage: 1000,
  }
})
const { codings } = useCodings(codingQuery)
</script>
