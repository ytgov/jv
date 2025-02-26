import { createApp } from "vue"

// Plugins
import vuetifyPlugin from "@/plugins/vuetify-plugin"
import auth0Plugin from "@/plugins/auth0-plugin"
import routerPlugin from "@/plugins/router-plugin"

import App from "@/App.vue"

const app = createApp(App)
app.use(routerPlugin).use(vuetifyPlugin).use(auth0Plugin)

app.mount("#app")
