<template>
  <v-card
    class="mb-5 simple-card"
    color="#f2a90016"
    variant="flat"
    style="border: 1px solid #f2a90046"
  >
    <v-tabs
      v-model="activeTab"
      bg-color="#fae2a9"
      color="primary"
      slider-color="primary"
      :items="tabs"
      density="comfortable"
    >
      <v-tab
        v-for="tab of tabs"
        :key="tab.value"
        :value="tab.value"
        base-color="#222e3b"
      >
        <v-icon
          :icon="tab.icon"
          class="mr-2"
        ></v-icon
        >{{ tab.title }}</v-tab
      >
    </v-tabs>
    <v-divider />

    <v-card-text>
      <v-tabs-window v-model="activeTab">
        <slot></slot>
      </v-tabs-window>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue"

const props = defineProps<{
  tabs: { value: number; title: string; icon: string }[]
  defaultTab?: number
}>()

const activeTab = ref(props.defaultTab ?? 0)
</script>
