
const routes = [
    {
      path: "/recovery",
      component: () => import("@/layouts/Layout"),
      children: [
        {
          name: "Home",
          path: "",
          meta: { requiresAuth: true },
          component: () => import("../views/RecoveryList.vue"),
        },
        {
          name: "CreateRecovery",
          path: "create",
          meta: { requiresAuth: true },
          component: () => import("../views/CreateRecovery.vue"),
        },
        {
          name: "EditRecovery",
          path: ":id",
          meta: { requiresAuth: true },
          component: () => import("../views/EditRecovery.vue"),
        },
      ]
    },
  ];
  
  export default routes;