
export const applicationName = "Recoveries App";
export const applicationIcon = "mdi-cash-register";
export const hasSidebar = false;
export const hasSidebarClosable = false;

export const sections = [
    {
        name: "Dashboard",
        url: "/",
        icon: "mdi-view-dashboard"
    },
];
export const environment = process.env.NODE_ENV;
export const apiBaseUrl = process.env.NODE_ENV == "production" ? "" : "http://localhost:3000";
