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

    const parts = newVal.toString().substring(0, 22).split("")

    let res = ""

    for (let i = 0; i < parts.length; i++) {
      if (i == 3 || i == 9 || i == 13 || i == 17) res += "-"
      res += parts[i]
    }

    localValue.value = res

    emit("update:modelValue", res)
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
    let i = `${input}`.replace(/[^0-9.]+/g, "")

    if (isNull(i)) {
      return null
    }

    return i
  }
  return input
}

formatValue(true)
</script>
