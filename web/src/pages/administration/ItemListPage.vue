<template>
  <SimpleCard>
    <v-row>
      <v-col class="d-flex">
        <v-text-field
          v-model="search"
          label="Search"
        />

        <v-btn
          class="ml-5"
          :height="46"
          @click="addClick"
        >
          Add Item
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :items="itemCategories"
      :headers="headers"
      :loading="isLoading"
      :search="search"
      class="clickable-row"
      @click:row="editClick"
    >
      <template #item.active="{ item }">
        <v-icon
          v-if="item.active"
          color="success"
          >mdi-check</v-icon
        >
        <v-icon
          v-else
          color="error"
          >mdi-close</v-icon
        >
      </template>
      <template #item.price="{ item }">
        {{ formatCurrency(item.price) }}
      </template>
    </v-data-table>
  </SimpleCard>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"

import SimpleCard from "@/components/common/SimpleCard.vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useItemCategories, { ItemCategory } from "@/use/use-item-categories"
import formatCurrency from "@/utils/format-currency"
const { itemCategories, isLoading } = useItemCategories(ref({}))
const router = useRouter()

const search = ref("")

useBreadcrumbs("Items", [
  {
    title: "Administration",
    to: {
      name: "AdministrationPage",
    },
  },
  {
    title: "Items",
    disabled: true,
    to: {
      name: "administration/ItemListPage",
    },
  },
])

const headers = [
  { title: "Active", value: "active", width: "50px" },
  { title: "Name", value: "category" },
  { title: "Branch", value: "branch" },
  { title: "Cost", value: "price" },
  { title: "Description", value: "description" },
]
function addClick() {
  router.push({ name: "administration/ItemEditPage", params: { itemCatID: "add" } })
}
function editClick(_event: PointerEvent, { item }: { item: ItemCategory }) {
  router.push({ name: "administration/ItemEditPage", params: { itemCatID: item.itemCatID } })
}
</script>
<!-- 

<script>
import Vue from "vue";
import Breadcrumbs from "../../../components/Breadcrumbs.vue";
import TitleCard from "../../recoveries/views/Common/TitleCard.vue";
import { ADMIN_URL } from "../../urls";
import axios from "axios";
// import { secureGet } from "@/store/jwt";
export default {
  name: "Items",
  components: {
    Breadcrumbs,
    TitleCard,
  },
  data: () => ({
    loadingData: false,
    items: [],
    branch: "",
    branchErr: false,
    categoryErr: false,
    active: true,
    category: "",
    changeQuantity: false,
    price: "",
    description: "",
    currentItem: {},
    totalLength: 0,
    headers: [
      { text: "Active", value: "active" },
      { text: "Item Name", value: "category" },
      { text: "Branch", value: "branch" },
      { text: "Default Cost", value: "price" },
      { text: "Change Quantity", value: "changeQuantity" },
      { text: "Default Description", value: "description" },
      { text: "", value: "edit", width: "1rem" },
    ],
    branchOptions: [],

    auditHeaders: [
      { text: "Date", value: "date", class: "grey lighten-4", cellClass: "px-1 py-1", width: "20%" },
      { text: "Action", value: "action", class: "grey lighten-4", cellClass: "px-1 py-1", width: "40%" },
      { text: "User", value: "user", class: "grey lighten-4", cellClass: "px-1 py-1", width: "40%" },
    ],

    allUploadingDocuments: [],
    toUpload: [],
    itemAudits: [],
    backupFiles: [],
    update: 0,
    reader: new FileReader(),
    page: 1,
    pageCount: 0,
    iteamsPerPage: 10,
    itemDialog: false,
    alertMsg: "",
    action: "Add",
  }),
  async mounted() {
    await this.updateTable();
  },
  methods: {
    async updateTable() {
      this.loadingData = true;
      this.branchErr = false;
      this.categoryErr = false;
      this.branchOptions = Vue.filter("ictBranches")().map((branch) => branch.text);
      await this.getItems();
      this.loadingData = false;
    },

    async getItems() {
      return axios
        .get(`${ADMIN_URL}/item-categories`)
        .then((resp) => {
          // console.log(resp.data)
          this.items = resp.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },

    clearItemData() {
      this.alertMsg = "";
      this.currentItem = {};
      this.branch = "";
      this.category = "";
      this.changeQuantity = false;
      this.description = "";
      this.price = "";
      this.active = true;
      this.itemAudits = [];
      this.backupFiles = [];
      this.allUploadingDocuments = [];
    },

    addItem() {
      this.clearItemData();
      this.action = "Add";
      this.branchErr = false;
      this.categoryErr = false;
      this.itemDialog = true;
    },

    editItem(value) {
      this.page--;
      this.currentItem = value;
      this.branch = value.branch;
      this.category = value.category;
      this.active = value.active;
      this.price = value.price;
      this.changeQuantity = value.changeQuantity;
      this.description = value.description;
      this.backupFiles = value.docName ? value.docName : [];
      this.allUploadingDocuments = [];
      this.itemAudits = value.itemCategoryAudits
        ? value.itemCategoryAudits.sort((a, b) => {
            return a.date > b.date ? -1 : 1;
          })
        : [];
      this.action = "Edit";
      this.branchErr = false;
      this.categoryErr = false;
      this.itemDialog = true;
    },

    checkFields() {
      this.branchErr = this.branch.length > 0 ? false : true;
      this.categoryErr = this.category ? false : true;
      if (this.branchErr || this.categoryErr) return false;
      else return true;
    },

    async saveItem() {
      if (this.checkFields()) {
        this.alertMsg = "";
        const body = {
          category: this.category,
          branch: this.branch,
          price: this.price,
          description: this.description,
          changeQuantity: this.changeQuantity,
          active: this.active,
          action: this.getActionDescription(),
        };
        const id = this.currentItem?.itemCatID ? this.currentItem.itemCatID : 0;
        return axios
          .post(`${ADMIN_URL}/item-categories/${id}`, body)
          .then(async (resp) => {
            if (this.reader.result) await this.saveBackUPFile(resp.data.itemCatID);
            this.itemDialog = false;
            await this.updateTable();
          })
          .catch((e) => {
            console.log(e);
            this.alertMsg = e.response.data;
          });
      }
    },

    async saveBackUPFile(itemCatID) {
      this.alertMsg = null;
      const formData = new FormData();

      for (const doc of this.toUpload) {
        formData.append("files", doc);
      }

      return await axios
        .post(`${ADMIN_URL}/item-category-documents/${itemCatID}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(() => {
          this.savingData = false;
        })
        .catch((e) => {
          this.savingData = false;
          console.log(e);
          this.alertMsg = e.response.data;
        });
    },

    uploadDocument() {
      this.alert = false;
      const el = document.getElementById("inputfile");
      if (el) el.click();
    },

    handleSelectedFile(event) {
      event.preventDefault();
      event.stopPropagation();

      this.toUpload = event.target.files;

      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];

        // this.quoteFileType = file.type;
        // this.quoteFileName = file.name;

        this.reader.onload = () => {
          this.allUploadingDocuments.push({ file: this.reader.result, name: file.name, type: file.type });
          this.update++;
        };
        this.reader.readAsDataURL(file);
      }
    },

    downloadDocument(docName) {
      if (!this.currentItem.itemCatID) return;

      let url = `${ADMIN_URL}/item-category-documents/${this.currentItem.itemCatID}/${docName}`;
      window.open(url);
    },

    getActionDescription() {
      if (this.action == "Add") return "New item added.";
      else {
        let action = "Item modified.";
        if (this.currentItem.category != this.category)
          action += `\nChanging name from ${this.currentItem.category} to ${this.category};`;
        if (this.currentItem.price != this.price) {
          const price = this.price ? this.price : 0;
          action += `\nChanging cost from ${this.currentItem.price} to ${price};`;
        }
        if (this.currentItem.active != this.active) {
          const status = this.active ? "Active" : "Inactive";
          action += `\nChanging status to ${status};`;
        }

        const branch = this.currentItem.branch;
        if (this.branch != branch) action += `\nChanging branches;`;

        return action;
      }
    },
  },
};
</script>
 -->
