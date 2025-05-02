export const APPLICATION_NAME = "Recoveries App"
export const ENVIRONMENT = process.env.NODE_ENV ?? "production"
export const RELEASE_TAG = process.env.VUE_APP_RELEASE_TAG
export const GIT_COMMIT_HASH = process.env.VUE_APP_GIT_COMMIT_HASH

const devConfig = {
  API_BASE_URL: "http://localhost:3000",
  AUTH0_DOMAIN: "https://dev-0tc6bn14.eu.auth0.com",
  AUTH0_CLIENT_ID: "WgvhGi9FQvvdZvCGZp07OyRfqqhhnWAV",
  AUTH0_AUDIENCE: "testing",
}

const uatConfig = {
  API_BASE_URL: window.location.origin,
  AUTH0_DOMAIN: "https://dev-0tc6bn14.eu.auth0.com",
  AUTH0_CLIENT_ID: "WgvhGi9FQvvdZvCGZp07OyRfqqhhnWAV",
  AUTH0_AUDIENCE: "testing",
}
const prodConfig = {
  API_BASE_URL: window.location.origin,
  AUTH0_DOMAIN: "https://sign-in.service.yukon.ca",
  AUTH0_CLIENT_ID: "EPc8uJD2QOhhDBvRbpNvItABEXMTrOgA",
  AUTH0_AUDIENCE: "generic-production",
}

let config = prodConfig

if (window.location.host === "localhost:8080") {
  config = devConfig
} else if (window.location.host == "recoveries-uat.ynet.gov.yk.ca") {
  config = uatConfig
}

export const { API_BASE_URL, AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_AUDIENCE } = config
