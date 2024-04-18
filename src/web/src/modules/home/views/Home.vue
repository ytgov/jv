<template>
  <div class="home">
    <v-card :loading="loadingData" style="border:0px solid white !important; margin-top:1rem;" outlined>
      <div v-if="loadingData" class="text-center my-15">Loading...</div>
      <h1 v-if="!loadingData">{{ title }}</h1>
      <!-- <p  v-if="!loadingData">
        This is a template that can be used for many different types of applications
      </p> -->
      <!-- <p>
        It is probably best if you
        <router-link to="/sign-in">sign in</router-link> to see more things.
      </p> -->
      <div v-if="isAuthenticated && !loadingData">
        <!-- <p>    
          <router-link v-if="isBranchUser" to="/recovery-dashboard-user">
            Dashboard (User)
          </router-link>
        </p>
        <p>
          <router-link v-if="isBranchAgent" to="/recovery-dashboard-agent">
            Dashboard (Tech)
          </router-link>
        </p>
        <p>  
          <router-link v-if="isDepartmentalFinance" to="/recovery-dashboard-finance">
            Dashboard (Finance)
          </router-link>
        </p>
        <p> 
          <router-link v-if="isICTFinance" to="/recoveries">
            Recovery List
          </router-link>
        </p> -->
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
// @ is an alias to /src
import * as config from "@/config";
import store from "@/store";
import { mapActions, mapState } from "vuex";
import Vue from "vue";

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
    // isBranchUser() { return Vue.filter("isBranchUser")() },
    // isBranchAgent() { return Vue.filter("isBranchAgent")() },
    // isDepartmentalFinance() { return Vue.filter("isDepartmentalFinance")() },
    // isICTFinance() { return Vue.filter("isICTFinance")() },
  },
  async created() {
    await this.loadDepartments();

    await store.dispatch("checkAuthentication");
    //var isAuth = store.getters.isAuthenticated;

    //if (isAuth) router.push("/");
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
        this.routes.push({ title: "Dashboard", role: "User", route: "/recovery-dashboard-user" });

      if (Vue.filter("isBranchAgent")())
        this.routes.push({ title: "Dashboard", role: "Agent", route: "/recovery-dashboard-agent" });

      if (Vue.filter("isDepartmentalFinance")())
        this.routes.push({ title: "Dashboard", role: "Dept. Finance", route: "/recovery-dashboard-finance" });

      if (Vue.filter("isICTFinance")())
        this.routes.push({ title: "Recovery List", role: "ICT Finance", route: "/recoveries" });
    },
    goto(route) {
      this.$router.push({ path: route });
    },
  },
};
</script>
