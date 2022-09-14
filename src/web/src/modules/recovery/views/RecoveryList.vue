<template>
  <v-container>
    <h1>Recovery List</h1>
    <v-btn @click="showEdit" color="primary">Create</v-btn>
    <v-data-table></v-data-table>

    <v-dialog v-model="showEditDialog" persistent width="600">
      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>Create Recovery</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="showEditDialog = false">mdi-close</v-icon>
      </v-app-bar>

      <v-card tile>
        <v-card-text class="pt-3">
          <create-recovery-form></create-recovery-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import CreateRecoveryForm from "../components/CreateRecoveryForm.vue";

export default {
  name: "DepartmentList",
  components: { CreateRecoveryForm },
  data: () => ({
    showEditDialog: false,
  }),
  methods: {
    showEdit() {
      //this.showEditDialog = true;

      this.$router.push("/recovery/create")
    },
  },
};
</script>
