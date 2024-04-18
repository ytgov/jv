import Vue from "vue";
import VueRouter from "vue-router";

import NotFound from "@/views/NotFound.vue";
import NotAuthorized from "@/views/NotAuthorized.vue";
import Login from "@/components/Login";
import LoginComplete from "@/components/LoginComplete";
import store from "@/store";

import homeRoutes from "@/modules/home/router";
import recoveriesRoutes from "@/modules/recoveries/router";

import administrationRoutes from "@/modules/administration/router";

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
  ...recoveriesRoutes,
  ...administrationRoutes,
  {
    path: "/not-authorized",
    name: "NotAuthorized",
    component: NotAuthorized,
  },
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
  var requiresAdmin = to.meta.requiresAdmin || false;

  if (!requiresAuth) {
    return next();
  }

  await store.dispatch("checkAuthentication");
  var isAuthenticated = store.getters.isAuthenticated;
  var isAdmin = store.getters.isAdmin;

  if (requiresAuth && !isAuthenticated) {
    console.log("You aren't authenticatd, redirecting to sign-in");
    return next("/sign-in");
  }

  if (requiresAdmin && !isAdmin) {
    console.log("You aren't an administrator, redirecting to sign-in");
    return next("/not-authorized");
  }

  return next();
});

export default router;
