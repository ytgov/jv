
import Vue from "vue";

async function isICTFinance(to, from, next) {
  if (Vue.filter("isICTFinance")())
    next();
  else
    next({ path: '/' });
}

async function isBranchUser(to, from, next) {
  if (Vue.filter("isBranchUser")())
    next();
  else
    next({ path: '/' });
}

async function isBranchAgent(to, from, next) {
  if (Vue.filter("isBranchAgent")())
    next();
  else
    next({ path: '/' });
}

async function isDepartmentalFinance(to, from, next) {
  if (Vue.filter("isDepartmentalFinance")())
    next();
  else
    next({ path: '/' });
}


const routes = [
    {
      path: "/recoveries",
      component: () => import("@/layouts/Layout"),
      children: [
        {
          name: "RecoveryHome",
          path: "",
          meta: { requiresAuth: true },
          beforeEnter: isICTFinance,
          component: () => import("../views/Recoveries.vue"),
        },       
      ]
    },
    {
      path: "/recovery-dashboard-agent",
      component: () => import("@/layouts/Layout"),
      children: [
        {
          name: "TechDashboard",
          path: "",
          meta: { requiresAuth: true },
          beforeEnter: isBranchAgent,
          component: () => import("../views/TechRecoveryDashboard.vue"),
        },       
      ]
    },
    {
      path: "/recovery-dashboard-user",
      component: () => import("@/layouts/Layout"),
      children: [
        {
          name: "UserDashboard",
          path: "",
          meta: { requiresAuth: true },
          beforeEnter: isBranchUser,
          component: () => import("../views/UserRecoveryDashboard.vue"),
        },       
      ]
    },
    {
      path: "/recovery-dashboard-finance",
      component: () => import("@/layouts/Layout"),
      children: [
        {
          name: "FinanceDashboard",
          path: "",
          meta: { requiresAuth: true },
          beforeEnter: isDepartmentalFinance,
          component: () => import("../views/FinanceUserDashboard.vue"),
        },       
      ]
    },
  ];
  
  export default routes;