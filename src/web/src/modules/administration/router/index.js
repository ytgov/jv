const routes = [
  {
    path: "/administration",
    component: () => import("@/layouts/Layout"),
    children: [
      {
        name: "Administration",
        path: "",
        meta: { requiresAuth: true },
        component: () => import("../AdminDashboard.vue"),
      },
      {
        path: "/administration/users",
        name: "User Management",
        component: () => import("../views/UserManagement.vue")
      },
    ]
  },
];

export default routes;