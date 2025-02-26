<template>
  <div class="home">
    <v-card :loading="isLoading" style="border:0px solid white !important; margin-top:1rem;" outlined>
      <div v-if="isLoading" class="text-center my-15">Loading...</div>
      <h1 v-if="!isLoading">{{ title }}</h1>
      <div v-if="isAuthenticated && !isLoading">
        <div>
          <div v-if="routes.length == 0">
            Your access doesn't have any roles attached to it.
          </div>

          <v-row>
            <v-col v-for="(route, idx) in routes" :key="idx" cols="12" md="3">
              <v-card color="#008392" class="white--text py-3 text-center" elevation="10" :to="route.route">
                <v-card-title style="word-break: normal;">
                  <div class="mx-auto text-h5">
                    <v-icon class="white--text text-h4">mdi-monitor</v-icon> {{ route.title }}
                  </div>
                </v-card-title>
                <v-card-text>
                  <div class="text-center amber--text font-weight-bold font-italic">Role: {{ route.role }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from "vuex";
import * as config from "@/config";

export default {
  name: "Home",
  data: () => ({
    title: `Welcome to ${config.applicationName}`,
    isLoading: false,
  }),
  computed: {
    ...mapState("home", ["departments"]),
    ...mapGetters(["isAuthenticated", "isBranchUser", "isBranchAgent", "isDepartmentalFinance", "isICTFinance"]),

    routes() {
      let routes = [];

      if (this.isBranchUser) routes.push({ title: "Dashboard", role: "User", route: "/recoveries/user" });
      if (this.isBranchAgent) routes.push({ title: "Dashboard", role: "Agent", route: "/recoveries/agent" });
      if (this.isDepartmentalFinance)
        routes.push({ title: "Dashboard", role: "Dept. Finance", route: "/recoveries/finance" });

      if (this.isICTFinance) routes.push({ title: "Recovery List", role: "ICT Finance", route: "/recoveries" });

      return routes;
    },
  },
  async mounted() {
    this.isLoading = true;
    await this.loadDepartments();
    await this.getEmployees();
    await this.getDepartmentBranch();
    this.isLoading = false;
  },
  methods: {
    ...mapActions("home", ["loadDepartments"]),
    ...mapActions("recoveries", ["getEmployees", "getDepartmentBranch"]),
  },
};
</script>
