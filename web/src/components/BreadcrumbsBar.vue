<template>
  <SimpleBreadcrumbs
    :class="classes"
    :items="items"
  />
</template>

<script setup>
import SimpleBreadcrumbs from "@/components/common/SimpleBreadcrumbs.vue"

defineProps({
  items: {
    type: Array,
    required: true,
  },
  classes: {
    type: [String, Array, Object],
    default: "default-style",
  },
})
</script>

<style scoped>
.default-style {
  background-color: #eee;
  margin: -12px -24px 16px;
  padding: 16px 24px 16px;
  border-bottom: 1px #ddd solid;
}
</style>
