<template>
  <v-container>
    <h1>Administration: Items</h1>
    <v-btn @click="showEdit" color="primary">Create</v-btn>

    <v-data-table :items="items" :headers="headers" @click:row="rowClick"></v-data-table>

    <v-dialog v-model="showEditDialog" persistent width="600">
      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>Create Item</v-toolbar-title>
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
import CreateItemForm from "../components/CreateItemForm.vue";

export default {
  components: { CreateItemForm },
  data: () => ({
    showEditDialog: false,
    items: [],
    headers: [
      { text: "Category", value: "Category" },
      { text: "Branch", value: "Branch" },
      { text: "Recovery Type", value: "RecoveryType" },
      { text: "Create Date", value: "CreateDate" },
      { text: "Create User", value: "CreateUser" },
      { text: "Modified Date", value: "ModDate" },
    { text: "Modified User", value: "ModUser" },
    ],
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
    rowClick(item) {
      this.$router.push(`/recovery/${item.recid}`);
    },
  },
};
</script>