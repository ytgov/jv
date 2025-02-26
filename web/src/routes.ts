import { type RouteRecordRaw } from "vue-router"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "SignInPage",
    component: () => import("@/pages/SignInPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/callback",
    name: "CallbackPage",
    component: () => import("@/pages/CallbackPage.vue"),
    meta: { requiresAuth: false },
  },

  {
    path: "/home",
    component: () => import("@/layouts/Layout.vue"),
    children: [
      {
        path: "",
        name: "DashboardPage",
        component: () => import("@/pages/DashboardPage.vue"),
        meta: { title: "Dashboard" },
      },
      {
        path: "profile",
        name: "ProfilePage",
        component: () => import("@/pages/UserProfilePage.vue"),
        meta: { title: "My Profile" },
      },
    ],
  },
  {
    path: "/recoveries",
    component: () => import("@/layouts/Layout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        name: "RecoveryHome",
        path: "",
        component: () => import("@/pages/recoveries/Recoveries.vue"),
        meta: { requiresRole: ["Admin", "IctFinance"] },
      },
      {
        name: "RecoveryAddPage",
        path: "add",
        component: () => import("@/pages/recoveries/RecoveryAddPage.vue"),
        meta: { requiresRole: ["Admin", "BranchAgent", "BranchAdmin"] },
      },
      {
        name: "Agent",
        path: "agent",
        component: () => import("@/pages/recoveries/TechRecoveryDashboard.vue"),
        meta: { requiresRole: ["Admin", "BranchAgent", "BranchAdmin"] },
      },
      {
        name: "UserDashboard",
        path: "user",
        component: () => import("@/pages/recoveries/UserRecoveryDashboard.vue"),
        meta: { requiresRole: ["Admin", "BranchUser"] },
      },
      {
        name: "FinanceDashboard",
        path: "finance",
        component: () => import("@/pages/recoveries/FinanceUserDashboard.vue"),
        meta: { requiresRole: ["Admin", "DeptFinance"] },
      },
    ],
  },
  {
    path: "/administration",
    component: () => import("@/layouts/Layout.vue"),
    children: [
      {
        name: "AdministrationPage",
        path: "",
        meta: { requiresAuth: true, requiresAdmin: true },
        component: () => import("@/pages/administration/AdministrationPage.vue"),
      },
      {
        path: "/administration/users",
        name: "administration/UserListPage",
        meta: { requiresAuth: true, requiresAdmin: true },
        component: () => import("@/pages/administration/UserListPage.vue"),
      },
      {
        path: "/administration/users/:id",
        name: "administration/UserEditPage",
        meta: { requiresAuth: true, requiresAdmin: true },
        component: () => import("@/pages/administration/UserEditPage.vue"),
        props: true,
      },
      {
        path: "/administration/departmental-coding",
        name: "administration/CodingListPage",
        meta: { requiresAuth: true, requiresAdmin: true },
        component: () => import("@/pages/administration/CodingListPage.vue"),
      },
      {
        path: "/administration/departmental-coding/:departmentID",
        name: "administration/CodingEditPage",
        meta: { requiresAuth: true, requiresAdmin: true },
        component: () => import("@/pages/administration/CodingEditPage.vue"),
        props: true,
      },
      {
        path: "/administration/items",
        name: "administration/ItemListPage",
        meta: { requiresAuth: true, requiresAdmin: true },
        component: () => import("@/pages/administration/ItemListPage.vue"),
      },
      {
        path: "/administration/items/:itemCatID",
        name: "administration/ItemEditPage",
        meta: { requiresAuth: true, requiresAdmin: true },
        component: () => import("@/pages/administration/ItemEditPage.vue"),
        props: true,
      },
    ],
  },
  {
    path: "/status",
    name: "StatusPage",
    component: () => import("@/pages/StatusPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/errors/unauthorized",
    name: "UnauthorizedPage",
    component: () => import("@/pages/UnauthorizedPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFoundPage",
    component: () => import("@/pages/NotFoundPage.vue"),
    meta: { requiresAuth: false },
  },
]

export default routes
