<template>
  <div class="home">
    <h1>{{ title }}</h1>
    <p>
      This is a template that can be used for many different types of applications
    </p>
    <p>
      It is probably best if you
      <router-link to="/sign-in">sign in</router-link> to see more things.
    </p>
    <p>
      <router-link to="/recovery">Recovery</router-link>
    </p>
    {{ departments }}
  </div>
</template>

<script>
// @ is an alias to /src
import * as config from "@/config";
import store from "@/store";
import { mapActions, mapState } from "vuex";

export default {
  name: "Home",
  data: () => ({
    title: `Welcome to ${config.applicationName}`,
  }),
  computed: {
    ...mapState("home", ["departments"]),
  },
  async created() {
    await this.loadDepartments();

    await store.dispatch("checkAuthentication");
    //var isAuth = store.getters.isAuthenticated;

    //if (isAuth) router.push("/");
  },
  methods: {
    ...mapActions("home", ["loadDepartments"]),
  },
};
</script>
