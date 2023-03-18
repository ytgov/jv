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
			{
				path: "/administration/departments",
				name: "Departments",
				component: () => import("../views/Departments.vue")
			},
			{
				path: "/administration/items",
				name: "Items",
				component: () => import("../views/Items.vue")
			}
		]
	},
];

export default routes;