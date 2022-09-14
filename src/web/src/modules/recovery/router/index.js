
const routes = [
    {
      path: "/",
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
          path: "/create-recovery",
          meta: { requiresAuth: true },
          component: () => import("../views/CreateRecovery.vue"),
        },
      ]
    },
  ];
  
  export default routes;