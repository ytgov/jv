<template>
  <v-navigation-drawer
    v-model="showDrawer"
    :disable-resize-watcher="false"
    :rail="showRail"
    :permanent="mdAndUp"
    :location="!mdAndUp ? 'bottom' : undefined"
    color="#FEE6C2"
  >
    <v-list
      v-model:opened="open"
      class="pt-0"
      color="black"
    >
      <v-list-item style="height: 64px; margin: 0; padding: 0">
        <div
          v-if="showRail"
          class="d-flex"
        >
          <img
            src="@/assets/logo-small.png"
            style="margin-left: 0px; width: 53px"
          />
          <div
            v-if="!mdAndUp"
            style="margin-left: 20px; padding-top: 13px; font-weight: bold; font-size: 19px"
          >
            Vendor Portal
          </div>
        </div>
        <div
          v-else
          class="d-flex"
        >
          <img
            src="@/assets/logo.svg"
            style="margin-left: 15px"
          />
        </div>
      </v-list-item>

      <v-list-item
        title="Recoveries App"
        prepend-icon="mdi-home"
        :to="{ name: 'DashboardPage' }"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useDisplay } from "vuetify/lib/framework.mjs"

const { mdAndUp } = useDisplay()
defineProps<{ showRail: boolean }>()

const showDrawer = defineModel<boolean>({
  default: false,
})
const open = ref([])
</script>
