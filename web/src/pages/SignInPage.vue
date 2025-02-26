<template>
  <div class="d-flex justify-center align-center fill-height fill-width">
    <div
      id="login"
      class="d-flex flex-column align-center"
      tag="section"
    >
      <v-row justify="center">
        <v-col
          lg="11"
          sm="8"
          xl="7"
        >
          <v-card
            class="elevation-5"
            style="overflow: hidden"
          >
            <v-row>
              <v-col
                lg="7"
                style="background-color: #f9f4d4"
                class="d-none d-md-flex align-center justify-center"
              >
                <div class="d-none d-sm-block">
                  <img
                    src="@/assets/logo.svg"
                    alt="Logo"
                    class="d-md-block pl-6"
                  />
                  <div class="align-center pa-6">
                    <h2
                      class="display-1 font-weight-medium"
                      style="line-height: 40px"
                    >
                      {{ APPLICATION_NAME }}
                    </h2>
                   
                  </div>
                </div>
              </v-col>
              <v-col lg="5">
                <div class="pa-7 pa-sm-12">
                  <div
                    style="background-color: #f9f4d4"
                    class="pa-5 d-md-none"
                  >
                    <img
                      src="@/assets/logo.svg"
                      alt="Logo"
                      class="d-md-inline"
                    />
                    <h2
                      class="display-1 font-weight-medium"
                      style="line-height: 40px"
                    >
                      {{ APPLICATION_NAME }}
                    </h2>
                  </div>

                  <h2 class="font-weight-bold mt-4 text--darken-2">Sign in</h2>
                  <h5 class="mt-3 mb-5">
                    This application is available to YNET users. If you have an account,
                    click the button below.
                  </h5>
                  <v-btn
                    color="primary"
                    @click="doLogin"
                  >
                    Sign In
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"

import { APPLICATION_NAME } from "@/config"
import useCurrentUser from "@/use/use-current-user"

const { reset: resetCurrentUser } = useCurrentUser()

const { loginWithRedirect } = useAuth0()

onMounted(() => {
  resetCurrentUser()
})

function doLogin() {
  loginWithRedirect({
    appState: { target: "/home" },
  })
}
</script>
