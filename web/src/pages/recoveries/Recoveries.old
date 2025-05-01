<template>
  <v-card
    :loading="loadingData"
    :disabled="loadingData"
    class="px-5 pb-15"
    style="border: 0px solid white !important"
  >
    <div
      v-if="loadingData"
      class="mt-10"
      style="text-align: center"
    >
      loading ...
    </div>
    <v-alert
      v-if="alertMsg"
      class="mt-5"
      type="warning"
      >{{ alertMsg }}</v-alert
    >
    <v-toolbar
      v-if="!loadingData"
      class=""
      height="100px"
      flat
    >
      <v-toolbar-title class="my-10 text-h4">Recoveries</v-toolbar-title>

      <template v-slot:extension>
        <v-tabs
          v-model="tabs"
          active-class="primary--text teal lighten-5"
        >
          <v-tab>Recoveries</v-tab>
          <v-tab>Recoveries To JV</v-tab>
          <v-tab>Journals</v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-tabs-items
      v-if="!loadingData"
      v-model="tabs"
    >
      <v-tab-item>
        <v-card flat>
          <recovery-table
            :recoveries="recoveries"
            @update-table="updateTable(0)"
          />
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat>
          <recovery-to-jv-table
            :recoveries="completedRecoveries"
            @update-table="updateTable(1)"
          />
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat>
          <journal-table
            :journals="journals"
            :recoveries="completedRecoveries"
            @update-table="updateTable(2)"
          />
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"

import RecoveryTable from "@/modules/recoveries/views/RecoveryComponents/RecoveryTable.vue"
import RecoveryToJvTable from "@/modules/recoveries/views/RecoveryToJV/RecoveryToJvTable.vue"
import JournalTable from "@/modules/recoveries/views/JournalComponents/JournalTable.vue"
import { RECOVERIES_URL, ADMIN_URL } from "@/urls"
import axios from "axios"

const tabs = ref(null)
const loadingData = ref(false)
const recoveries = ref([])
const completedRecoveries = ref([])
const journals = ref([])
const alertMsg = ref("")

onMounted(async () => {
  loadingData.value = true
  await getEmployees()
  await getDepartmentBranch()
  await getItemCategoryList()
  await getDepartments()
  await getRecoveries()
  await getJournals()
  loadingData.value = false
})

//  ...mapActions("recoveries", ["getEmployees", "getDepartmentBranch"]),

async function getItemCategoryList() {
  return axios
    .get(`${ADMIN_URL}/item-categories`)
    .then((resp) => {
      this.$store.commit("recoveries/SET_ITEM_CATEGORY_LIST", resp.data)
    })
    .catch((e) => {
      console.log(e)
    })
}

async function getDepartments() {
  return axios
    .get(`${ADMIN_URL}/department-info`)
    .then((resp) => {
      //console.log(resp.data)
      this.$store.commit("recoveries/SET_DEPARTMENTS_INFO", resp.data)
    })
    .catch((e) => {
      console.log(e)
    })
}

async function getRecoveries() {
  this.loadingData = true
  return axios
    .get(`${RECOVERIES_URL}/`)
    .then((resp) => {
      this.recoveries = resp.data
      this.completedRecoveries = resp.data.filter(
        (recovery) => recovery.status == "Complete" && !recovery.journalID
      )
    })
    .catch((e) => {
      console.log(e)
    })
}

async function getJournals() {
  this.loadingData = true
  return axios
    .get(`${RECOVERIES_URL}/journals/`)
    .then((resp) => {
      this.journals = resp.data
    })
    .catch((e) => {
      console.log(e)
    })
}

async function updateTable(tab) {
  this.loadingData = true
  await this.getRecoveries()
  await this.getJournals()
  this.loadingData = false
  tabs.value = tab
  //Vue.nextTick(() => (this.tabs = tab))
}
</script>
