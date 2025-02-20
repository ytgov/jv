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
      <img src="/yukon.svg" style="margin: -8px 45px 0 0" height="44" />
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
            <v-list-item v-if="isBranchUser" @click="routeTitle = 'Dashboard (User)'" to="/recoveries/user">
              <v-list-item-title>Dashboard (User)</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="isBranchAgent" @click="routeTitle = 'Dashboard (Agent)'" to="/recoveries/agent">
              <v-list-item-title>Dashboard (Agent)</v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="isDepartmentalFinance"
              @click="routeTitle = 'Dashboard (Finance)'"
              to="/recoveries/finance"
            >
              <v-list-item-title>Dashboard (Finance)</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="isICTFinance" @click="routeTitle = 'Recovery List'" to="/recoveries" exact>
              <v-list-item-title>Recovery List</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <span>{{ fullName }}</span>
        <v-menu bottom left class="ml-0">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon color="primary" v-bind="attrs" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          {{ isSystemAdmin }}
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
import router from "@/router";
import store from "@/store";
import * as config from "@/config";
import { mapGetters, mapState } from "vuex";
import { LOGOUT_URL } from "../urls";

export default {
  name: "App",
  components: {},
  computed: {
    ...mapState(["isAuthenticated"]),
    ...mapGetters([
      "fullName",
      "isAuthenticated",
      "isBranchUser",
      "isBranchAgent",
      "isDepartmentalFinance",
      "isICTFinance",
      "isSystemAdmin",
    ]),
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
    },
    toggleHeader: function() {
      this.headerShow = !this.headerShow;
    },
    toggleMenu: function() {
      this.menuShow = !this.menuShow;
    },
    signOut: function() {
      store.dispatch("signOut");
      window.location.replace(LOGOUT_URL);
    },
    getDropdownTitle() {
      const path = this.$route.path;
      if (path.includes("/recoveries/user")) this.routeTitle = "Dashboard (User)";
      else if (path.includes("/recoveries/agent")) this.routeTitle = "Dashboard (Agent)";
      else if (path.includes("/recoveries/finance")) this.routeTitle = "Dashboard (Finance)";
      else if (path.includes("/recoveries")) this.routeTitle = "Recovery List";
      else if (path.includes("/administration")) this.routeTitle = "Administration";
      else if (path.includes("/profile")) this.routeTitle = "My Profile";
    },
  },
};
</script>
