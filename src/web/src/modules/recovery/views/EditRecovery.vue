<template>
  <v-container fluid class="down-top-padding">
    <h1>Edit Recovery</h1>

    <edit-recovery-form :saveComplete="complete"></edit-recovery-form>
  </v-container>
</template>

<script>
import EditRecoveryForm from "../components/EditRecoveryForm.vue";

export default {
  name: "EditRecovery",
  components: { EditRecoveryForm },

  methods: {
    complete() {
      this.$router.push("/recovery");
    },
  },
};
</script>
