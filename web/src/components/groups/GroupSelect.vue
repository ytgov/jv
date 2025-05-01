<template>
  <v-autocomplete
    :items="groups"
    item-title="long_name"
    item-value="short_name"
  />
</template>

<script lang="ts" setup>
import useGroups from "@/use/use-groups"

const { groups } = useGroups()
</script>
