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
          <create-recovery-form :saveComplete="loadList"></create-recovery-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
import CreateRecoveryForm from "../components/CreateRecoveryForm.vue";

export default {
  name: "DepartmentList",
  components: { CreateRecoveryForm },
  data: () => ({
    showEditDialog: false,
    items: [],
  }),
  mounted() {
    this.loadList();
  },
  methods: {
    ...mapActions("recovery", ["getAll"]),
    showEdit() {
      this.showEditDialog = true;

      //this.$router.push("/recovery/create");
    },
    async loadList() {
      this.items = await this.getAll();
    },
  },
};
</script>
