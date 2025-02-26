import Vue from "vue";
import Vuex from "vuex";

import auth from "@/store/auth";
import profile from "@/store/profile";
import breadcrumbs from "@/store/breadcrumbs";

import home from "@/modules/home/store";
import recoveries from "@/modules/recoveries/store";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: { breadcrumbs, auth, profile, home, recoveries },
});
