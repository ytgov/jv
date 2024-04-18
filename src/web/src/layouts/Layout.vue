<template>
  <v-app>
    <v-navigation-drawer
      v-bind:app="hasSidebar"
      permanent
      :expand-on-hover="hasSidebarClosable"
      clipped
      color="#f1f1f1"
      v-bind:class="{ 'd-none': !hasSidebar }"
    >
      <v-list dense nav style="" class="mt-4">
        <v-list-item
          link
          nav
          v-bind:title="section.name"
          v-bind:to="section.url"
          v-for="section in sections"
          v-bind:key="section.name"
        >
          <v-list-item-icon>
            <v-icon>{{ section.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ section.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="#fff" flat height="70" style="left: 0; border-bottom: 3px #f3b228 solid">
      <!-- <v-icon color="#f3b228" class="mr-5">{{ applicationIcon }}</v-icon> -->
      <img src="/yukon.svg" style="margin: -8px 155px 0 0" height="44" />
      <v-toolbar-title>
        <span style="font-weight: 700">{{ applicationName }}</span>

        <v-progress-circular
          :class="loadingClass"
          indeterminate
          color="#f3b228"
          size="20"
          width="2"
          class="ml-4"
        ></v-progress-circular>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- <v-label dark>License Year:</v-label>
      <v-select
        v-model="licenseYear"
        smaller
        :items="licenseYears"
        dense
        style="margin-left: 15px; max-width: 150px; margin-right: 20px"
        hide-details
      ></v-select> -->

      <div v-if="isAuthenticated">
        <v-menu offset-y class="ml-0">
          <template v-slot:activator="{ on, attrs }">
            <v-btn text color="primary" v-bind="attrs" v-on="on">
              {{ routeTitle }}<v-icon>mdi-menu-down</v-icon>
            </v-btn>
          </template>
          <v-list dense style="min-width: 200px">
            <v-list-item @click="routeTitle = 'Home'" to="/">
              <v-list-item-title>Home</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="isBranchUser" @click="routeTitle = 'Dashboard (User)'" to="/recovery-dashboard-user">
              <v-list-item-title>Dashboard (User)</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="isBranchAgent" @click="routeTitle = 'Dashboard (Agent)'" to="/recovery-dashboard-agent">
              <v-list-item-title>Dashboard (Agent)</v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="isDepartmentalFinance"
              @click="routeTitle = 'Dashboard (Finance)'"
              to="/recovery-dashboard-finance"
            >
              <v-list-item-title>Dashboard (Finance)</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="isICTFinance" @click="routeTitle = 'Recovery List'" to="/recoveries">
              <v-list-item-title>Recovery List</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <span>{{ username }}</span>
        <v-menu bottom left class="ml-0">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon color="primary" v-bind="attrs" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list dense style="min-width: 200px">
            <v-list-item to="/administration" v-if="isSystemAdmin">
              <v-list-item-icon>
                <v-icon>mdi-table-edit</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Administration</v-list-item-title>
            </v-list-item>

            <v-list-item to="/profile">
              <v-list-item-icon>
                <v-icon>mdi-account</v-icon>
              </v-list-item-icon>
              <v-list-item-title>My profile</v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item @click="signOut">
              <v-list-item-icon>
                <v-icon>mdi-exit-run</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Sign out</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      <div v-else>
        <router-link to="/sign-in">Sign in</router-link>
      </div>

      <!-- <v-app-bar-nav-icon @click.stop="drawerRight = !drawerRight"></v-app-bar-nav-icon> -->
    </v-app-bar>

    <v-main v-bind:style="{ 'padding-left: 33px !important': !hasSidebar }">
      <!-- Provides the application the proper gutter -->
      <v-container fluid>
        <v-row>
          <v-col>
            <router-view></router-view>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Vue from "vue";
import router from "@/router";
import store from "@/store";
import * as config from "@/config";
import { mapState } from "vuex";
import { LOGOUT_URL } from "../urls";

export default {
  name: "App",
  components: {},
  computed: {
    ...mapState(["isAuthenticated"]),
    username() {
      return store.getters.fullName;
    },
    isAuthenticated() {
      return store.getters.isAuthenticated;
    },
    isBranchUser() {
      return Vue.filter("isBranchUser")();
    },
    isBranchAgent() {
      return Vue.filter("isBranchAgent")();
    },
    isDepartmentalFinance() {
      return Vue.filter("isDepartmentalFinance")();
    },
    isICTFinance() {
      return Vue.filter("isICTFinance")();
    },
    isSystemAdmin() {
      return Vue.filter("isSystemAdmin")();
    },
  },
  data: () => ({
    dialog: false,
    drawer: null,
    drawerRight: null,
    headerShow: false,
    menuShow: false,
    routeTitle: "Home",
    loadingClass: "d-none",
    applicationName: config.applicationName,
    applicationIcon: config.applicationIcon,
    sections: config.sections,
    hasSidebar: false, //config.hasSidebar,
    hasSidebarClosable: config.hasSidebarClosable,
  }),
  created: async function() {
    await store.dispatch("checkAuthentication");
    //this.username = store.getters.fullName
    //console.log(this.isAuthenticated);

    if (!this.isAuthenticated) this.hasSidebar = false;
    else this.hasSidebar = config.hasSidebar;
  },
  watch: {
    isAuthenticated: function(val) {
      if (!val) this.hasSidebar = false;
      else this.hasSidebar = config.hasSidebar;
    },
    $route: function() {
      this.getDropdownTitle();
    },
  },
  mounted() {
    this.getDropdownTitle();
  },
  methods: {
    nav: function(location) {
      router.push(location);
      console.log(location);
    },
    toggleHeader: function() {
      this.headerShow = !this.headerShow;
    },
    toggleMenu: function() {
      this.menuShow = !this.menuShow;
    },
    signOut: function() {
      store.dispatch("signOut");
      // router.push("/sign-in");
      window.location.replace(LOGOUT_URL);
    },
    getDropdownTitle() {
      const path = this.$route.path;
      if (path.includes("/recovery-dashboard-user")) this.routeTitle = "Dashboard (User)";
      else if (path.includes("/recovery-dashboard-agent")) this.routeTitle = "Dashboard (Agent)";
      else if (path.includes("/recovery-dashboard-finance")) this.routeTitle = "Dashboard (Finance)";
      else if (path.includes("/recoveries")) this.routeTitle = "Recovery List";
      else if (path.includes("/administration")) this.routeTitle = "Administration";
      else if (path.includes("/profile")) this.routeTitle = "My Profile";
    },
  },
};
</script>
