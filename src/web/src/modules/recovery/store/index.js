import axios from "axios";
import { RECOVERY_URL } from "@/urls";

const state = {};

const actions = {
  async initialize() {
    console.log("-- Initializing Recovery Store");
  },
  async getAll() {
    return axios.get(RECOVERY_URL).then((resp) => {
      return resp.data.data;
    });
  },
  async getById(store, { id }) {
    return axios.get(`${RECOVERY_URL}/${id}`).then((resp) => {
      return resp.data.data;
    });
  },
  async create(store, { body }) {
    console.log(body);

    return axios.post(RECOVERY_URL, body).then((resp) => {
      return resp.data;
    });
  },
  async update(store, { body }) {
    let id = body.recid;

    return axios.put(`${RECOVERY_URL}/${id}`, body).then((resp) => {
      return resp.data;
    });
  },
  async delete(store, { id }) {
    return axios.post(`${RECOVERY_URL}.${id}`).then((resp) => {
      return resp.data;
    });
  },
};

const mutations = {};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
