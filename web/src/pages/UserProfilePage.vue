<template>
  <v-skeleton-loader v-if="isNil(currentUser)" />
  <v-container v-else>
    {{ currentUser }}
  </v-container>
</template>

<script lang="ts" setup>
import { isNil } from "lodash"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"

const { currentUser } = useCurrentUser<true>()

useBreadcrumbs("My Profile", [
  {
    title: "My Profile",
    to: { name: "ProfilePage" },
  },
])
</script>

<style scoped></style>
