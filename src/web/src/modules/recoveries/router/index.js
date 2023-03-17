
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
  ];
  
  export default routes;