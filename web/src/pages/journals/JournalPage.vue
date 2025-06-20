<template>Journal Page</template>

<script lang="ts" setup>
import useBreadcrumbs from "@/use/use-breadcrumbs"

useBreadcrumbs("Journals", [
  { title: "Journals", to: { name: "JournalsPage" } },
  { title: "Edit Journal", to: { name: "JournalPage" }, disabled: true },
])
</script>
