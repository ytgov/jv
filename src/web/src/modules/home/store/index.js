import axios from "axios";

const state = {
    departments: [],
};

const actions = {
    async initialize() {
        console.log("-- Initializing Home Store")
    },
    async loadDepartments({ commit }) {
        axios.get("/departments").then(resp => {
            commit("SET_DEPARTMENTS", resp.data)
        })
    },
};

const mutations = {
    SET_DEPARTMENTS(state, value) {
        state.departments = value;
    }
};

export default {
    namespaced: true,
    state,
    actions,
    mutations
};