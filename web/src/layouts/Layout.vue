<template>
  <v-app-bar
    flat
    color="white"
    style="border-bottom: 1px #bbb solid"
  >
    <!-- <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon> -->

    <v-app-bar-title
      class="ml-4 mt-n2"
      style="font-weight: bold"
    >
      <router-link
        to="/home"
        class="d-flex float-left"
        style="text-decoration: none; color: black"
      >
        <img
          src="@/assets/logo.svg"
          style="margin-right: 20px"
        />
        <div style="padding-top: 30px">{{ APPLICATION_NAME }}</div>
      </router-link>
    </v-app-bar-title>

    <KebabMenu />
  </v-app-bar>

  <v-main class="page-wrapper">
    <SimpleBreadcrumbs />

    <v-container fluid>
      <router-view />
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import SimpleBreadcrumbs from "@/components/common/SimpleBreadcrumbs.vue"
import KebabMenu from "@/components/default-layout/KebabMenu.vue"
//import LeftSidebarNavigationDrawer from "@/components/default-layout/LeftSidebarNavigationDrawer.vue"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import { APPLICATION_NAME } from "@/config"

const { title } = useBreadcrumbs()
</script>
