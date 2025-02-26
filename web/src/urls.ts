import { API_BASE_URL } from "./config";

// TODO: refactor these into apis/xxx-api.js files
// The base url can be handled by the axios config.
export const PROFILE_URL = `${API_BASE_URL}/api/user/me`;

export const DEPARTMENT_URL = `${API_BASE_URL}/api/department`;
export const RECOVERY_URL = `${API_BASE_URL}/api/recovery`;

export const LOOKUP_URL = `${API_BASE_URL}/api/lookup`;
export const RECOVERIES_URL = `${API_BASE_URL}/api/recoveries`;

export const USERS_URL = `${API_BASE_URL}/api/user`;
export const ADMIN_URL = `${API_BASE_URL}/api/admin`;
export const AUTH_URL = `${API_BASE_URL}/api/auth`;

export const PDF_URL = `${API_BASE_URL}/api/pdf`;
