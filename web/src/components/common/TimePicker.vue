<template>
  <v-menu
    :close-on-content-click="false"
    :nudge-right="40"
    transition="scale-transition"
    offset-y
    min-width="auto"
    v-model="menu"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        dense
        :value="value"
        :label="label || text"
        prepend-icon="mdi-clock"
        background-color="white"
        outlined
        readonly
        v-bind="attrs"
        v-on="on"
        :disabled="review"
        :rules="requiredRules"
      >
      </v-text-field>
    </template>
    <v-time-picker
      format="24hr"
      scrollable
      :value="value"
      :rules="requiredRules"
      @input="input"
    >
    </v-time-picker>
  </v-menu>
</template>
<script>
export default {
  props: {
    value: String,
    text: {
      type: String,
      default: undefined,
      validator(value) {
        if (value !== undefined) {
          console.warn('The "text" prop is deprecated; prefer using "label" instead.')
        }
        return true
      },
    },
    label: String,
    review: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      menu: false,
      requiredRules: [(v) => !!v || "This field is required"],
    }
  },
  methods: {
    input(value) {
      this.menu = false
      this.$emit("input", value)
    },
  },
}
</script>
