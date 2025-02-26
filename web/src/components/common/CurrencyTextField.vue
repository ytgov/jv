<template>
  <v-text-field
    :value="localValue"
    :prefix="prefix"
    @input="updateValue"
    @blur="formatValue"
    @focus="selectAll"
    v-bind="$attrs"
  ></v-text-field>
</template>

<script>
import { isNaN } from "lodash"

export default {
  name: "CurrencyTextField",
  inheritAttrs: false,
  props: {
    value: {
      type: [Number, String],
      default: 0,
    },
    prefix: {
      type: String,
      default: "$",
    },
  },
  data() {
    return {
      localValue: this.value,
    }
  },
  watch: {
    value(newVal) {
      this.localValue = newVal
    },
  },
  methods: {
    updateValue(value) {
      this.localValue = value
      const numericValue = parseFloat(value)
      this.$emit("input", isNaN(numericValue) ? 0 : numericValue)
    },
    formatValue() {
      this.localValue = (parseFloat(this.localValue) || 0).toFixed(2)
    },
    selectAll(event) {
      this.$nextTick(() => {
        event.target.select()
      })
    },
  },
}
</script>
