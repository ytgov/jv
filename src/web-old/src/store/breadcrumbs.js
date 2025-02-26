const state = {
  title: "",
  breadcrumbs: [],
};
const getters = {
  firstName: (state) => state.firstName,
  lastName: (state) => state.lastName,
  email: (state) => state.email,
  id: (state) => state.id,
  username: (state) => state.username,
  teams: (state) => state.teams,
};
const actions = {
  set({ commit }, value) {
    commit("setBreadcrumbs", value);
  },
};
const mutations = {
  setBreadcrumbs(state, value) {
    state.breadcrumbs = value.breadcrumbs;
    state.title = value.title;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
