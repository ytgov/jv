import Vue from "vue";

async function isICTFinance(to, from, next) {
  if (Vue.filter("isICTFinance")()) next();
  else next({ path: "/" });
}

async function isBranchUser(to, from, next) {
  if (Vue.filter("isBranchUser")()) next();
  else next({ path: "/" });
}

async function isBranchAgent(to, from, next) {
  if (Vue.filter("isBranchAgent")()) next();
  else next({ path: "/" });
}

async function isDepartmentalFinance(to, from, next) {
  if (Vue.filter("isDepartmentalFinance")()) next();
  else next({ path: "/" });
}

const routes = [
  {
    path: "/recoveries",
    component: () => import("@/layouts/Layout"),
    meta: { requiresAuth: true },
    children: [
      {
        name: "RecoveryHome",
        path: "",
        beforeEnter: isICTFinance,
        component: () => import("../views/Recoveries.vue"),
      },
      {
        name: "Agent",
        path: "agent",
        beforeEnter: isBranchAgent,
        component: () => import("../views/TechRecoveryDashboard.vue"),
      },
      {
        name: "UserDashboard",
        path: "user",
        beforeEnter: isBranchUser,
        component: () => import("../views/UserRecoveryDashboard.vue"),
      },
      {
        name: "FinanceDashboard",
        path: "finance",
        beforeEnter: isDepartmentalFinance,
        component: () => import("../views/FinanceUserDashboard.vue"),
      },
    ],
  },
];

export default routes;
