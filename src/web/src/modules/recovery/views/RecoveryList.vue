<template>
  <v-container>
    <h1>Recovery List</h1>
    <v-btn @click="showEdit" color="primary">Create</v-btn>

    <v-data-table :items="items" :headers="headers" @click:row="rowClick"></v-data-table>

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
    headers: [
      { text: "Create date", value: "display_create_date" },
      { text: "Department", value: "Department" },
      { text: "Request", value: "RequestDesc" },
      { text: "Requestee", value: "display_name" },
      { text: "Status", value: "" },
      { text: "Item Status", value: "items.length" },
    ],
  }),
  mounted() {
    this.loadList();
  },
  methods: {
    ...mapActions("recovery", ["getAll"]),
    showEdit() {
      this.showEditDialog = true;
    },
    async loadList() {
      this.showEditDialog = false;
      this.items = await this.getAll();
    },
    rowClick(item) {
      this.$router.push(`/recovery/${item.recid}`);
    },
  },
};
</script>
