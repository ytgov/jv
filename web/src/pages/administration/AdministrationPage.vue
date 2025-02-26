<template>
  <v-row>
    <v-col
      cols="12"
      md="4"
    >
      <SimpleCard :to="{ name: 'administration/UserListPage' }">
        <div class="d-flex">
          <v-icon
            size="90"
            class="my-n2"
            color="primary"
            style="opacity: 0.4"
            >mdi-account</v-icon
          >
          <v-spacer />
          <div class="text-right">
            <div style="font-size: 40px">{{ userCount }}</div>
            <div
              class="mt-n2"
              style="font-size: 20px"
            >
              Users
            </div>
          </div>
        </div>
      </SimpleCard>
    </v-col>
    <v-col
      cols="12"
      md="4"
    >
      <SimpleCard :to="{ name: 'administration/CodingListPage' }">
        <div class="d-flex">
          <v-icon
            size="90"
            class="my-n2"
            color="primary"
            style="opacity: 0.4"
            >mdi-code-array</v-icon
          >
          <v-spacer />
          <div class="text-right">
            <div style="font-size: 40px">{{ codingCount }}</div>
            <div
              class="mt-n2"
              style="font-size: 20px"
            >
              Coding
            </div>
          </div>
        </div>
      </SimpleCard>
    </v-col>
    <v-col
      cols="12"
      md="4"
    >
      <SimpleCard :to="{ name: 'administration/ItemListPage' }">
        <div class="d-flex">
          <v-icon
            size="90"
            class="my-n2"
            color="primary"
            style="opacity: 0.4"
            >mdi-package</v-icon
          >
          <v-spacer />
          <div class="text-right">
            <div style="font-size: 40px">{{ itemCount }}</div>
            <div
              class="mt-n2"
              style="font-size: 20px"
            >
              Items
            </div>
          </div>
        </div>
      </SimpleCard>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref } from "vue"

import SimpleCard from "@/components/common/SimpleCard.vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useUsers from "@/use/use-users"
import useItemCategories from "@/use/use-item-categories"
import useCodings from "@/use/use-codings"

const { totalCount: userCount } = useUsers(ref({}))
const { totalCount: itemCount } = useItemCategories(ref({}))
const { totalCount: codingCount } = useCodings(ref({}))

useBreadcrumbs("Administration", [
  {
    title: "Administration",
    to: {
      name: "AdministrationPage",
    },
    disabled: true,
  },
])
</script>
