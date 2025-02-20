import axios from "axios";
import { AUTH_CHECK_URL, LOGOUT_URL } from "../urls";

const state = {
  user: null,
  fullName: "",
  isInitialized: false,
};
const getters = {
  isAuthenticated: (state) => !!state.user,
  fullName: (state) => {
    return state.fullName;
  },
  isAdmin: (state) => {
    if (state.user) {
      let rolesStr = state.user.roles || "";
      return rolesStr.split(",").includes("Admin");
    }

    return false;
  },
  isDepartmentalFinance: (state) => {
    const userRoles = state.user.roles.split(",");
    const admin = userRoles?.includes("Admin");
    const role = userRoles?.includes("DeptFinance");
    const hasRequiredRoles = admin || role;
    return hasRequiredRoles;
  },
  isICTFinance: (state) => {
    const userRoles = state.user.roles.split(",");
    const admin = userRoles?.includes("Admin");
    const role = userRoles?.includes("IctFinance");
    const hasRequiredRoles = admin || role;
    return hasRequiredRoles;
  },
  isBranchAdmin: (state) => {
    const userRoles = state.user.roles.split(",");
    const admin = userRoles?.includes("Admin");
    const role = userRoles?.includes("BranchAdmin");
    const hasRequiredRoles = admin || role;
    return hasRequiredRoles;
  },

  isBranchAgent: (state) => {
    const userRoles = state.user.roles.split(",");
    const admin = userRoles?.includes("Admin");
    const role1 = userRoles?.includes("BranchAgent");
    const role2 = userRoles?.includes("BranchAdmin");
    const hasRequiredRoles = admin || role1 || role2;
    return hasRequiredRoles;
  },

  isBranchUser: (state) => {
    const userRoles = state.user.roles.split(",");
    const admin = userRoles?.includes("Admin");
    const role = userRoles?.includes("BranchUser");
    const hasRequiredRoles = admin || role;
    return hasRequiredRoles;
  },

  isSystemAdmin: (state) => {
    const userRoles = state.user.roles.split(",");
    const admin = userRoles.includes("Admin");
    return admin;
  },
};
const actions = {
  async checkAuthentication({ commit }) {
    return await axios
      .get(AUTH_CHECK_URL)
      .then((resp) => {
        commit("setUser", resp.data);
        return true;
      })
      .catch(() => {
        commit("clearUser");
        return false;
      });
  },
  async signOut({ commit }) {
    await axios
      .get(LOGOUT_URL)
      .then(() => {
        commit("clearUser");
      })
      .catch((err) => {
        console.error(err);
      });
  },
};
const mutations = {
  setUser(state, user) {
    state.user = user;
    state.fullName = user.display_name;
    state.isInitialized = true;
  },
  clearUser(state) {
    state.user = null;
    state.fullName = null;
    state.isInitialized = true;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
