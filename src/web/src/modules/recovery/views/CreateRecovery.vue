<template>
  <v-container fluid class="down-top-padding">
    <h1>Create Recovery</h1>

    <create-recovery-form :saveComplete="reloadList"></create-recovery-form>
  </v-container>
</template>

<script>
import CreateRecoveryForm from "../components/CreateRecoveryForm.vue";

export default {
  name: "DepartmentList",
  components: { CreateRecoveryForm },
};
</script>
