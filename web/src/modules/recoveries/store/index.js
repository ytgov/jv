import axios from "axios";
import { LOOKUP_URL } from "../../../urls";

const state = {
  employees: [],
  itemCategoryList: [],
  departmentBranch: {},
  departmentsInfo: [],
  openDialogId: ""
};
const getters = {};
const mutations = {
  SET_EMPLOYEES(state, value) {
    state.employees = value;
  },
  SET_DEPARTMENT_BRANCH(state, value) {
    state.departmentBranch = value;
  },
  SET_OPEN_DIALOG_ID(state, value) {
    state.openDialogId = value;
  },
  SET_ITEM_CATEGORY_LIST(state, value) {
    state.itemCategoryList = value;
  },
  SET_DEPARTMENTS_INFO(state, value) {
    state.departmentsInfo = value;
  }, 
};

const actions = {
  async getEmployees({ commit, state }) {
      if(state.employees.length>0) return
      return axios.get(`${LOOKUP_URL}/employees`)
        .then(resp => {
            commit("SET_EMPLOYEES", resp.data);
        }).catch(e => {
          console.log(e);
        });
  },

  async getDepartmentBranch({ commit, state }) {
      if(Object.keys(state.departmentBranch).length>0) return
      return axios.get(`${LOOKUP_URL}/department-branch`)
        .then(resp => {
            commit("SET_DEPARTMENT_BRANCH", resp.data);
        })
        .catch(e => {
            console.log(e);
        });
  },
};


export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
