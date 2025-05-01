const routes = [
  {
    path: "/recoveries",
    component: () => import("@/layouts/Layout"),
    meta: { requiresAuth: true },
    children: [
      {
        name: "RecoveryHome",
        path: "",
        component: () => import("../views/Recoveries.vue"),
        meta: { requiresRole: ["Admin", "IctFinance"] },
      },
      {
        name: "Agent",
        path: "agent",
        component: () => import("../views/TechRecoveryDashboard.vue"),
        meta: { requiresRole: ["Admin", "Agent"] },
      },
      {
        name: "UserDashboard",
        path: "user",
        component: () => import("../views/UserRecoveryDashboard.vue"),
        meta: { requiresRole: ["Admin", "Client"] },
      },
      {
        name: "FinanceDashboard",
        path: "finance",
        component: () => import("../views/FinanceUserDashboard.vue"),
        meta: { requiresRole: ["Admin", "DeptFinance"] },
      },
    ],
  },
];

export default routes;
