
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
            {
        name: "Profile",
        path: "/profile",
        meta: { requiresAuth: true },
        component: () => import("../views/Profile.vue"),
      },
    ]
  },
];

export default routes;