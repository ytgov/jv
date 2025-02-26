<template>
  <v-card
    :loading="loadingData"
    :disabled="loadingData"
    en
    class="px-5 pb-15"
    style="border:0px solid white !important;"
  >
    <div v-if="loadingData" class="mt-10" style="text-align: center">loading ...</div>
    <v-alert v-if="alertMsg" class="mt-5" type="warning">{{ alertMsg }}</v-alert>
    <v-toolbar v-if="!loadingData" class="" height="100px" flat>
      <v-toolbar-title class="my-10 text-h4">Recoveries</v-toolbar-title>

      <template v-slot:extension>
        <v-tabs v-model="tabs" active-class="primary--text teal lighten-5">
          <v-tab>Recoveries</v-tab>
          <v-tab>Recoveries To JV</v-tab>
          <v-tab>Journals</v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-tabs-items v-if="!loadingData" v-model="tabs">
      <v-tab-item>
        <v-card flat>
          <recovery-table :recoveries="recoveries" @updateTable="updateTable(0)" />
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat>
          <recovery-to-jv-table :recoveries="completedRecoveries" @updateTable="updateTable(1)" />
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat>
          <journal-table :journals="journals" :recoveries="completedRecoveries" @updateTable="updateTable(2)" />
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script>
import Vue from "vue";
import RecoveryTable from "./RecoveryComponents/RecoveryTable.vue";
import RecoveryToJvTable from "./RecoveryToJV/RecoveryToJvTable.vue";
import JournalTable from "./JournalComponents/JournalTable.vue";
import { mapActions } from "vuex";
import { RECOVERIES_URL, ADMIN_URL } from "../../../urls";
import axios from "axios";
// import { secureGet } from "../../../store/jwt";

export default {
  name: "Recoveries",
  components: {
    RecoveryTable,
    RecoveryToJvTable,
    JournalTable,
  },
  data() {
    return {
      tabs: null,
      loadingData: false,
      recoveries: [],
      completedRecoveries: [],
      journals: [],
      alertMsg: "",
    };
  },

  async mounted() {
    this.loadingData = true;
    await this.getEmployees();
    await this.getDepartmentBranch();
    await this.getItemCategoryList();
    await this.getDepartments();
    await this.getRecoveries();
    await this.getJournals();
    this.loadingData = false;
  },

  methods: {
    ...mapActions("recoveries", ["getEmployees", "getDepartmentBranch"]),

    async getItemCategoryList() {
      return axios
        .get(`${ADMIN_URL}/item-categories`)
        .then((resp) => {
          this.$store.commit("recoveries/SET_ITEM_CATEGORY_LIST", resp.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },

    async getDepartments() {
      return axios
        .get(`${ADMIN_URL}/department-info`)
        .then((resp) => {
          //console.log(resp.data)
          this.$store.commit("recoveries/SET_DEPARTMENTS_INFO", resp.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },

    async getRecoveries() {
      this.loadingData = true;
      return axios
        .get(`${RECOVERIES_URL}/`)
        .then((resp) => {
          this.recoveries = resp.data;
          this.completedRecoveries = resp.data.filter(
            (recovery) => recovery.status == "Complete" && !recovery.journalID
          );
        })
        .catch((e) => {
          console.log(e);
        });
    },

    async getJournals() {
      this.loadingData = true;
      return axios
        .get(`${RECOVERIES_URL}/journals/`)
        .then((resp) => {
          this.journals = resp.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },

    async updateTable(tab) {
      this.loadingData = true;
      await this.getRecoveries();
      await this.getJournals();
      this.loadingData = false;
      Vue.nextTick(() => (this.tabs = tab));
    },
    // determineDepartment() {
    //   this.alertMsg = "";
    //   if (!this.$store.state.auth.department) {
    //     const email = this.$store.state.auth.user.email;
    //     const employee = this.$store.state.preapproved.employees.filter(emp => emp.email == email);
    //     if (employee.length > 0) {
    //       this.$store.dispatch("UpdateUserDepartment", employee[0].department);
    //     } else {
    //       this.alertMsg = "Your department is undefined. Please contact system administrator.";
    //     }
    //   }
    //   this.loadingData = false;
    // }
  },
};
</script>
