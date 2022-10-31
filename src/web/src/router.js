import Vue from "vue";
import VueRouter from "vue-router";

import NotFound from "@/views/NotFound.vue";
import Login from "@/components/Login";
import LoginComplete from "@/components/LoginComplete";
import store from "@/store";

import homeRoutes from "@/modules/home/router";
import recoveryRoutes from "@/modules/recovery/router";

import adminRoutes from "@/modules/admin/router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/sign-in",
    name: "Login",
    component: Login,
  },
  {
    path: "/login-complete",
    name: "LoginComplete",
    component: LoginComplete,
  },
  ...homeRoutes,
  ...recoveryRoutes,
  ...adminRoutes,
  {
    path: "*",
    name: "Not Found",
    component: NotFound,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach(async (to, from, next) => {
  var requiresAuth = to.meta.requiresAuth || false;

  if (!requiresAuth) {
    return next();
  }

  await store.dispatch("checkAuthentication");
  var isAuthenticated = store.getters.isAuthenticated;

  if (requiresAuth && !isAuthenticated) {
    console.log("You aren't authenticatd, redirecting to sign-in");
    next("/sign-in");
    return;
  }

  return next();
});

export default router;
