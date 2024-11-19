<template>
  <div class="home">
    <v-card :loading="loadingData" style="border:0px solid white !important; margin-top:1rem;" outlined>
      <div v-if="loadingData" class="text-center my-15">Loading...</div>
      <h1 v-if="!loadingData">{{ title }}</h1>
      <div v-if="isAuthenticated && !loadingData">
        <div class="row">
          <div class="col-md-3" v-for="(route, inx) in routes" :key="'dashboard-' + inx">
            <v-card color="#008392" class="white--text py-3 text-center" elevation="10" @click="goto(route.route)">
              <v-card-title style="word-break: normal;">
                <div class="mx-auto text-h5">
                  <v-icon class="white--text text-h4">mdi-monitor</v-icon> {{ route.title }}
                </div>
              </v-card-title>
              <v-card-text>
                <div class="text-center amber--text font-weight-bold font-italic">Role: {{ route.role }}</div>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import Vue from "vue";
import { mapActions, mapState } from "vuex";
import * as config from "@/config";
import store from "@/store";

export default {
  name: "Home",
  data: () => ({
    title: `Welcome to ${config.applicationName}`,
    loadingData: false,
    routes: [],
  }),
  computed: {
    ...mapState("home", ["departments"]),
    isAuthenticated() {
      return store.getters.isAuthenticated;
    },
  },
  async created() {
    await this.loadDepartments();
    await store.dispatch("checkAuthentication");
  },
  async mounted() {
    this.loadingData = true;
    await this.getEmployees();
    await this.getDepartmentBranch();
    this.getRoutes();
    this.loadingData = false;
  },
  methods: {
    ...mapActions("home", ["loadDepartments"]),
    ...mapActions("recoveries", ["getEmployees", "getDepartmentBranch"]),

    getRoutes() {
      this.routes = [];

      if (Vue.filter("isBranchUser")())
        this.routes.push({ title: "Dashboard", role: "User", route: "/recoveries/user" });

      if (Vue.filter("isBranchAgent")())
        this.routes.push({ title: "Dashboard", role: "Agent", route: "/recoveries/agent" });

      if (Vue.filter("isDepartmentalFinance")())
        this.routes.push({ title: "Dashboard", role: "Dept. Finance", route: "/recoveries/finance" });

      if (Vue.filter("isICTFinance")())
        this.routes.push({ title: "Recovery List", role: "ICT Finance", route: "/recoveries" });
    },
    goto(route) {
      this.$router.push({ path: route });
    },
  },
};
</script>
