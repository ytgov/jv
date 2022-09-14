import axios from "axios";
import { DEPARTMENT_URL } from "@/urls";

const state = {
  departments: [],
};

const actions = {
  async initialize() {
    console.log("-- Initializing Home Store");
    
  },
  async loadDepartments({ commit }) {
    axios.get(DEPARTMENT_URL).then((resp) => {
      commit("SET_DEPARTMENTS", resp.data);
    });
  },
};

const mutations = {
  SET_DEPARTMENTS(state, value) {
    state.departments = value;
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
