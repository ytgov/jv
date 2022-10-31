
const routes = [
    {
      path: "/admin",
      component: () => import("@/layouts/Layout"),
      children: [
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
          component: () => import("../views/DeptCodeList.vue"),
        },
        {
          name: "CreateItem",
          path: "CreateItem",
          meta: { requiresAuth: true },
          component: () => import("../views/DeptCodeList.vue"),
        },
        {
        name: "UserList",
        path: "UserList",
        meta: { requiresAuth: true },
        component: () => import("../views/DeptCodeList.vue"),
      },
      {
        name: "CreateUser",
        path: "CreateUser",
        meta: { requiresAuth: true },
        component: () => import("../views/DeptCodeList.vue"),
      },
      ]
    },
  ];
  
  export default routes;