<template>
  <v-form>
    <v-row>
      <v-col cols="6">
        <v-text-field
          label="Requestor first name"
          v-model="recovery.FirstName"
          dense
          outlined
          hide-details
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          label="Requestor last name"
          v-model="recovery.LastName"
          dense
          outlined
          hide-details
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field label="Reference #" v-model="recovery.RefNum" dense outlined hide-details></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field label="Department" v-model="recovery.Department" dense outlined></v-text-field>
        <v-text-field label="Branch" v-model="recovery.Branch" dense outlined hide-details></v-text-field
      ></v-col>
    </v-row>
    <v-divider class="mt-5 mb-5" />

    <h3>Items</h3>

    <v-btn @click="addItem" color="info">Add Item</v-btn>

    <v-data-table :items="recovery.items" :headers="itemHeaders"> </v-data-table>

    <v-btn color="primary" @click="saveClick" :disabled="!canSave" class="mr-5">Save</v-btn>
    <v-btn color="secondary" @click="cancelClick">Cancel</v-btn>

    <v-dialog v-model="showEditDialog" persistent width="600">
      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>Item</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="showEditDialog = false">mdi-close</v-icon>
      </v-app-bar>

      <v-card tile>
        <v-card-text class="pt-3">
          <v-text-field v-model="editItem.Description" label="Description" dense outlined></v-text-field>
          
          <v-select required :items="itemCategories" item-text="Category" item-value="ItemCatID" v-model="editItem.itemCatID" dense outlined></v-select>

          <v-text-field
            v-model="editItem.UnitPrice"
            label="Unit price"
            dense
            outlined
            type="number"
            step=".01"
            append-icon="mdi-dollar"
          ></v-text-field>

          <v-text-field
            v-model="editItem.Quantity"
            label="Quantity"
            dense
            outlined
            type="number"
            step="1"
          ></v-text-field>

          <v-btn color="primary" @click="saveItem" :disabled="!canSaveItem">Save</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-form>
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "CreateRecoveryForm",
  props: ["saveComplete"],
  data: () => ({
    recovery: { items: [] },
    itemHeaders: [
      { text: "Type", value: "category.Category" },
      { text: "Description", value: "Description" },
      { text: "Quantity", value: "Quantity" },
      { text: "Price", value: "UnitPrice" },
      { text: "Total", value: "TotalPrice" },
    ],

    itemCategories: [],

    showEditDialog: null,
    editItem: {},
  }),
  computed: {
    canSave() {
      if (
        this.recovery.RequestDesc &&
        this.recovery.FirstName &&
        this.recovery.LastName &&
        this.recovery.Department &&
        this.recovery.Branch &&
        this.recovery.RefNum
      )
        return true;

      return false;
    },
    canSaveItem() {
      return true;
    },
  },
  async mounted() {
    let id = this.$route.params.id;
    this.recovery = await this.getById({ id: id });
    this.loadItemCategories();
  },
  methods: {
    ...mapActions("recovery", ["getById", "update", "getCategories"]),

    async loadItemCategories() {
      this.itemCategories = await this.getCategories();
    },
    cancelClick() {
      this.$router.push("/recovery");
    },
    async saveClick() {
      if (this.canSave) {
        await this.update({ body: this.recovery });
      }

      if (this.saveComplete) this.saveComplete();
    },

    saveItem() {
      this.editItem.recid = this.recovery.recid;
      this.recovery.items.push(this.editItem);
      this.update({ body: this.recovery });

      this.showEditDialog = false;
      this.editItem = {};
    },

    addItem() {
      this.showEditDialog = true;
    },
  },
};
</script>
