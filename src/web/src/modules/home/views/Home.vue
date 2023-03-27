<template>
  <div class="home">
    <v-card :loading="loadingData" style="border:0px solid white !important; margin-top:1rem;" outlined>
      
      <div v-if="loadingData" class="text-center my-15"> Loading... </div>
      <h1 v-if="!loadingData" >{{ title }}</h1>
      <!-- <p  v-if="!loadingData">
        This is a template that can be used for many different types of applications
      </p> -->
      <!-- <p>
        It is probably best if you
        <router-link to="/sign-in">sign in</router-link> to see more things.
      </p> -->
      <div v-if="isAuthenticated && !loadingData">
        <p>    
          <router-link v-if="isBranchUser" to="/recovery-dashboard-user">
            Dashboard (User)
          </router-link>
        </p>
        <p>
          <router-link v-if="isBranchTech" to="/recovery-dashboard-tech">
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
        </p>

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
  }),
  computed: {
    ...mapState("home", ["departments"]),
    isAuthenticated() {
      return store.getters.isAuthenticated;
    },
    isBranchUser() { return Vue.filter("isBranchUser")() },
    isBranchTech() { return Vue.filter("isBranchTech")() },
    isDepartmentalFinance() { return Vue.filter("isDepartmentalFinance")() },
    isICTFinance() { return Vue.filter("isICTFinance")() },
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
    this.loadingData = false;
  },
  methods: {
    ...mapActions("home", ["loadDepartments"]),
    ...mapActions("recoveries", ["getEmployees", "getDepartmentBranch"]),
  },
};
</script>
