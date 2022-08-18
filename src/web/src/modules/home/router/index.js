
const routes = [
  {
    path: "/",
    component: () => import("@/layouts/Layout"),
    children: [
      {
        name: "Home",
        path: "",
        meta: { requiresAuth: true },
        component: () => import("../views/Home.vue"),
      },
    ]
  },
];

export default routes;