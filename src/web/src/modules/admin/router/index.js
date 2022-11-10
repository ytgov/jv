
const routes = [
    {
      path: "/admin",
      component: () => import("@/layouts/Layout"),
      children: [
        {
          name: "",
          path: "",
          meta: { requiresAuth: true },
          component: () => import("../views/Home.vue"),
        },
        {
          name: "DeptCodeList",
          path: "DeptCodeList",
          meta: { requiresAuth: true },
          component: () => import("../views/DeptCodeList.vue"),
        },
        {
          name: "CreateDeptCode",
          path: "CreateDeptCode",
          meta: { requiresAuth: true },
          component: () => import("../views/CreateDeptCode.vue"),
        },
        {
          name: "ItemList",
          path: "ItemList",
          meta: { requiresAuth: true },
          component: () => import("../views/ItemList.vue"),
        },
        {
          name: "CreateItem",
          path: "CreateItem",
          meta: { requiresAuth: true },
          component: () => import("../views/CreateItem.vue"),
        },
        {
        name: "UserList",
        path: "UserList",
        meta: { requiresAuth: true },
        component: () => import("../views/UserList.vue"),
      },
      {
        name: "CreateUser",
        path: "CreateUser",
        meta: { requiresAuth: true },
        component: () => import("../views/CreateUser.vue"),
      },
      ]
    },
  ];
  
  export default routes;