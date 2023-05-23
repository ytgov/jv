import Vue from "vue";
import Vuex from "vuex";

import auth from "./auth";
import profile from "./profile";

import home from "@/modules/home/store"
import recoveries from "@/modules/recoveries/store"

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: { auth, profile, home, recoveries }
});
