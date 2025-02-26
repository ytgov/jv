const routes = [
  {
    path: "/administration",
    component: () => import("@/layouts/Layout"),
    children: [
      {
        name: "Administration",
        path: "",
        meta: { requiresAuth: true, requiresAdmin: true },
        component: () => import("../AdminDashboard.vue"),
      },
      {
        path: "/administration/users",
        name: "User Management",
        meta: { requiresAuth: true, requiresAdmin: true },
        component: () => import("../views/UserManagement.vue"),
      },
      {
        path: "/administration/departmental-coding",
        name: "Departmental Coding",
        meta: { requiresAuth: true, requiresAdmin: true },
        component: () => import("../views/Departments.vue"),
      },
      {
        path: "/administration/items",
        name: "Items",
        meta: { requiresAuth: true, requiresAdmin: true },
        component: () => import("../views/Items.vue"),
      },
    ],
  },
];

export default routes;
