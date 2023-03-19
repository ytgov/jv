import * as config from "./config";

export const LOGIN_URL = `${config.apiBaseUrl}/api/auth/login`;
export const AUTH_CHECK_URL = `${config.apiBaseUrl}/api/auth/isAuthenticated`;
export const LOGOUT_URL = `${config.apiBaseUrl}/api/auth/logout`;
export const PROFILE_URL = `${config.apiBaseUrl}/api/user`;

export const DEPARTMENT_URL = `${config.apiBaseUrl}/api/department`;
export const RECOVERY_URL = `${config.apiBaseUrl}/api/recovery`;

export const LOOKUP_URL = `${config.apiBaseUrl}/api/lookup`;
export const RECOVERIES_URL = `${config.apiBaseUrl}/api/recoveries`;

export const USERS_URL = `${config.apiBaseUrl}/api/user`;
export const GL_CODE_URL = `${config.apiBaseUrl}/api/glCodes`;//TODO
export const ITEMS_URL = `${config.apiBaseUrl}/api/items`;//TODO