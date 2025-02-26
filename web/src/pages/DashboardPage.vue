<template>
  <div v-if="routes.length == 0">Your access doesn't have any roles attached to it.</div>

  <v-row>
    <v-col
      cols="12"
      md="8"
    >
      <v-row>
        <v-col
          v-for="(route, idx) in routes"
          :key="idx"
          cols="12"
          md="6"
        >
          <SimpleCard
            :to="route.route"
          >
            <v-card-title style="word-break: normal">
              <v-icon class="white--text text-h4">mdi-monitor</v-icon> {{ route.title }}
            </v-card-title>
            <v-card-text>
              <div class="text-center amber--text font-weight-bold font-italic">
                Role: {{ route.role }}
              </div>
            </v-card-text>
          </SimpleCard>
        </v-col>
      </v-row>
    </v-col>
    <v-col
      cols="12"
      md="4"
    >
      <v-btn :to="{ name: 'RecoveryAddPage' }"> <v-icon>mdi-plus</v-icon> Create New Recovery </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from "vue"

import { APPLICATION_NAME } from "@/config"
//import useDepartments from "@/use/use-departments"
import useCurrentUser from "@/use/use-current-user"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import SimpleCard from "@/components/common/SimpleCard.vue"

const title = `${APPLICATION_NAME} Home`

const { isBranchUser, isBranchAgent, isDepartmentalFinance, isICTFinance } = useCurrentUser()

useBreadcrumbs("Dashboard", [])

//const { departments } = useDepartments()

const routes = computed(() => {
  const items = new Array<{ title: string; role: string; route: string }>()

  if (isBranchUser) items.push({ title: "Dashboard", role: "User", route: "/recoveries/user" })
  if (isBranchAgent) items.push({ title: "Dashboard", role: "Agent", route: "/recoveries/agent" })
  if (isDepartmentalFinance)
    items.push({ title: "Dashboard", role: "Dept. Finance", route: "/recoveries/finance" })

  if (isICTFinance)
    items.push({ title: "Recovery List", role: "ICT Finance", route: "/recoveries" })

  return items
})
</script>
