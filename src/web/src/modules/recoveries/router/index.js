
const routes = [
    {
      path: "/recoveries",
      component: () => import("@/layouts/Layout"),
      children: [
        {
          name: "RecoveryHome",
          path: "",
          meta: { requiresAuth: true },
          component: () => import("../views/Recoveries.vue"),
        },       
      ]
    },
    {
      path: "/recovery-dashboard-tech",
      component: () => import("@/layouts/Layout"),
      children: [
        {
          name: "TechDashboard",
          path: "",
          meta: { requiresAuth: true },
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
          component: () => import("../views/FinanceUserDashboard.vue"),
        },       
      ]
    },
  ];
  
  export default routes;