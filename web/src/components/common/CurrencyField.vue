<template>
  <v-text-field
    v-model="localValue"
    :readonly="props.readonly"
    @focus="parseValue"
    @blur="formatValue"
  />
</template>

<script setup>
import { isNil, isNull } from "lodash"
import { ref, watch } from "vue"

const props = defineProps(["modelValue", "readonly"])
const emit = defineEmits(["update:modelValue"])

const localValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    localValue.value = val
    formatValue(true)
  }
)

function formatValue() {
  const newVal = cleanNumber(localValue.value)

  if (!isNil(newVal)) {
    if (newVal === "") {
      localValue.value = null
      emit("update:modelValue", null)
      return
    }
    localValue.value = `$${newVal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
    emit("update:modelValue", newVal)
  } else {
    localValue.value = null
    emit("update:modelValue", null)
  }
}

const parseValue = () => {
  if (!props.readonly) {
    const numberValue = cleanNumber(localValue.value)
    localValue.value = isNaN(numberValue) ? null : numberValue
  }
}

function cleanNumber(input) {
  if (input) {
    if (input == 0) {
      return 0
    }

    let i = parseFloat(`${input}`.replace(/[^0-9.]+/g, ""))
    if (isNaN(i) || isNull(i)) {
      return null
    }

    i = Math.round(i * 100) / 100

    return i
  }
  return input
}

formatValue(true)
</script>
