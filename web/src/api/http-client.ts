import qs from "qs"
import axios from "axios"

import { API_BASE_URL } from "@/config"
import auth0 from "@/plugins/auth0-plugin"

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: {
    serialize: (params) => {
      return qs.stringify(params, {
        arrayFormat: "brackets",
        strictNullHandling: true,
      })
    },
  },
})

httpClient.interceptors.request.use(async (config) => {
  // Only add the Authorization header to requests that start with "/api"
  if (config.url?.startsWith("/api")) {
    const accessToken = await auth0.getAccessTokenSilently()
    config.headers["Authorization"] = `Bearer ${accessToken}`
  }

  return config
})

// Any status codes that falls outside the range of 2xx causes this function to trigger
httpClient.interceptors.response.use(null, async (error) => {

  console.log("ERR rror", error.message) 

  if (error?.error === "login_required") {
    throw new Error("You must be logged in to access this endpoint")
  } else if (error?.response?.data?.message) {
    throw new Error(error.response.data.message)
  } else if (error.message) {
    throw new Error(error.message)
  } else {
    throw new Error("An unknown error occurred")
  }
})

export default httpClient
