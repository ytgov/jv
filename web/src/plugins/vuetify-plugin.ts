/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles - Note that order matters here!
import "@/assets/normalize.css"
import "@mdi/font/css/materialdesignicons.css"
import "vuetify/styles"
import "@/assets/main.scss"
import "@/assets/yk-style.css"

// Composables
import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import * as labsComponents from "vuetify/labs/components"
import { StringDateAdapter } from "vuetify/date/adapters/string"

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components: {
    ...components,
    ...labsComponents,
  },
  date: {
    adapter: StringDateAdapter,
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#0097a9",
          secondary: "#fff",
          anchor: "#00818f",
        },
      },
    },
  },
  directives,

  defaults: {
    VCard: {
      rounded: "md",
    },
    VTextField: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
      autocomplete: "null",
      bgColor: "white",
      /* hideDetails: "auto" */
    },
    VTextarea: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
    },
    VSelect: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
    },
    VAutocomplete: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
    },
    VNumberInput: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
    },
    VDateInput: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
      prependInnerIcon: "mdi-calendar",
      prependIcon: "",
    },
    VFileInput: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
      prependIcon: "",
      appendInnerIcon: "mdi-paperclip",
    },
    VCombobox: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
    },
    VListItem: {
      minHeight: "45px",
    },
    VTooltip: {
      location: "top",
    },
    VSwitch: { color: "primary", baseColor: "#777", density: "comfortable" },
    VBtn: { color: "primary", style: "text-transform: none;", variant: "flat" },
  },
})

/* --blue:#007bff;
--indigo:#6610f2;
--purple:#6f42c1;
--pink:#e83e8c;
--red:#dc3545;
--orange:#fd7e14;
--yellow:#ffc107;
--green:#28a745;
--teal:#20c997;
--cyan:#17a2b8;
--white:#fff;
--gray:#6c757d;
--gray-dark:#343a40;
--primary:#007bff;
--secondary:#6c757d;
--success:#28a745;
--info:#17a2b8;
--warning:#ffc107;
--danger:#dc3545;
--light:#f8f9fa;
--dark:#343a40;
 */
