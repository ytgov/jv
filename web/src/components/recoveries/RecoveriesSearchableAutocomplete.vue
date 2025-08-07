<template>
  <v-autocomplete
    :model-value="modelValue"
    :loading="isLoading"
    :items="recoveries"
    item-value="recoveryID"
    :item-title="formatRecoveryTitle"
    :item-props="true"
    label="Click here to select"
    auto-select-first
    chips
    hide-selected
    clearable
    multiple
    @update:model-value="handleChange($event)"
  />
</template>

<script setup lang="ts">
import { computed, nextTick } from "vue"

import { MAX_PER_PAGE } from "@/api/base-api"
import useRecoveries, { Recovery, type RecoveryWhereOptions } from "@/use/use-recoveries"
import formatCurrency from "@/utils/format-currency"

const props = withDefaults(
  defineProps<{
    modelValue: number[] | null | undefined
    where?: RecoveryWhereOptions
  }>(),
  {
    where: () => ({}),
  }
)

const emit = defineEmits<{
  "update:modelValue": [number[] | null | undefined]
  itemsTotal: [number]
}>()

const recoveriesQuery = computed<{
  where?: RecoveryWhereOptions
}>(() => {
  return {
    where: props.where,
    perPage: MAX_PER_PAGE,
  }
})

const { recoveries, isLoading } = useRecoveries(recoveriesQuery)

function formatRecoveryTitle(item: Recovery) {
  return `${item.branch} / ${item.refNum} (${item.recoveryItems?.map((item) => item.category).join(", ")}) = ${formatCurrency(item.totalPrice)}`
}

function handleChange(event: number[] | null | undefined) {
  emit("update:modelValue", event)
  nextTick(() => {
    const selectedRecoveries = recoveries.value.filter((r) =>
      props.modelValue?.includes(r.recoveryID)
    )

    emit(
      "itemsTotal",
      selectedRecoveries.reduce((acc, r) => acc + (r.totalPrice ?? 0), 0)
    )
  })
}
</script>
