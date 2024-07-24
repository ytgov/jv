<template>
  <div class="mt-5 mx-10 mb-5">
    <!-- <v-row>
            <new-recovery 
                class="ml-auto mb-5 mr-4 mt-n10"  
                type="Add New"
                title="Create"
                maxWidth="55%"
                :recovery="{}" 
                @updateTable="updateTable"
            />
        </v-row> -->

    <v-row class="my-0 mx-0">
      <v-col cols="3">
        <v-text-field v-model="searchPhrase" label="Search Key" outlined clearable dense />
      </v-col>

      <v-col cols="7">
        <v-radio-group class="mt-1" v-model="searchKey" dense row>
          <v-radio
            v-for="(searchitem, inx) in searchKeyList"
            :key="inx"
            :label="searchitem.text"
            :value="searchitem.value"
          />
        </v-radio-group>
      </v-col>
      <v-col cols="2">
        <v-btn
          :disabled="filteredRecoveries.length == 0"
          @click="exportToExcel()"
          class="float-right mt-0"
          elevation="5"
          color="primary"
        >
          Export To Excel
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="filteredRecoveries"
      :items-per-page="10"
      :sort-by="['journal', 'status', 'submissionDate']"
      :sort-desc="[false, false, false]"
      class="elevation-1"
    >
      <!-- eslint-disable-next-line vue/no-unused-vars -->
      <template v-slot:[`item.submissionDate`]="{ item }">
        <!-- eslint-disable-next-line vue/no-parsing-error -->
        {{ item.submissionDate | beautifyDate }}
      </template>

      <template v-slot:[`item.requestor`]="{ item }"> {{ item.firstName }} {{ item.lastName }} </template>

      <template v-slot:[`item.recoveryItems`]="{ item }">
        {{ getRecoveryItems(item) }}
      </template>

      <template v-slot:[`item.totalPrice`]="{ item }"> ${{ item.totalPrice.toFixed(2) | currency }} </template>

      <template v-slot:[`item.journal`]="{ item }">
        <div v-if="item.journal && item.journal.jvNum">{{ item.journal.jvNum }}</div>
      </template>

      <template v-slot:[`item.edit`]="{ item }">
        <v-row>
          <div>
            <v-btn x-small color="warning" fab @click="deleteRecoveryClick(item)"><v-icon>mdi-delete</v-icon></v-btn>
            <!-- <new-recovery
                            v-if="item.status"
                            type="Edit"
                            title="Edit"
                            maxWidth="55%"
                            :recovery="item"
                            @updateTable="updateTable"                                              
                        />
                        <new-recovery
                            v-if="item.status"
                            type="Approve"
                            maxWidth="70%"
                            title="Approve and Update"
                            :recovery="item"
                            @updateTable="updateTable"                                              
                        />
                        <new-recovery
                            v-if="item.status"
                            type="Fill"
                            maxWidth="85%"
                            title="Fill"
                            :recovery="item"
                            @updateTable="updateTable"                                              
                        /> -->
            <new-recovery
              v-if="item.status == 'Complete'"
              :noGlCode="!Boolean(item.glCode)"
              :editGlCode="!item.journalID"
              type="Complete"
              maxWidth="85%"
              title="Complete"
              :recovery="item"
              @updateTable="updateTable"
            />
          </div>
        </v-row>
      </template>
    </v-data-table>

    <v-dialog v-model="deleteRecoveryDialog" persistent max-width="450px">
      <v-card>
        <v-card-title class="orange lighten-4" style="border-bottom: 1px solid black">
          <div class="text-h4">Delete Recovery</div>
        </v-card-title>

        <v-card-text>
          <div class="my-5 text-h6">
            Are you sure you would like to delete this Recovery?
          </div>
        </v-card-text>

        <v-card-actions>
          <v-btn color="grey darken-5" @click="deleteRecoveryDialog = false"> Cancel </v-btn>
          <v-btn class="ml-auto" color="red darken-1 white--text" @click="deleteRecovery"> Confirm </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Vue from "vue";
import { RECOVERIES_URL } from "@/urls";
import axios from "axios";
import NewRecovery from "./NewRecovery.vue";
import { ExportToCsv } from "export-to-csv";

export default {
  components: {
    NewRecovery,
  },
  name: "RecoveryTable",
  props: {
    recoveries: {},
  },
  data() {
    return {
      headers: [
        { text: "Recovery Branch", value: "branch", class: "blue-grey lighten-4" },
        { text: "Reference", value: "refNum", class: "blue-grey lighten-4" },
        { text: "Agent", value: "createUser", class: "blue-grey lighten-4" },
        { text: "Requestor", value: "requestor", class: "blue-grey lighten-4" },
        { text: "Department", value: "department", class: "blue-grey lighten-4" },
        { text: "Unit", value: "employeeUnit", class: "blue-grey lighten-4" },
        { text: "Items", value: "recoveryItems", class: "blue-grey lighten-4" },
        // { text: "Quantity", value: "quantity", class: "blue-grey lighten-4" },
        { text: "Cost", value: "totalPrice", class: "blue-grey lighten-4" },
        { text: "Date Submitted", value: "submissionDate", class: "blue-grey lighten-4" },
        { text: "Status", value: "status", class: "blue-grey lighten-4" },
        { text: "JV #", value: "journal", class: "blue-grey lighten-4" },
        { text: "", sortable: false, value: "edit", class: "blue-grey lighten-4" },
      ],
      admin: false,
      itemCategoryList: {},
      searchKey: "all",
      searchPhrase: "",
      searchKeyList: [
        { text: "Any", value: "all" },
        { text: "Agent", value: "createUser" },
        { text: "Branch", value: "branch" },
        { text: "Department", value: "department" },
        { text: "Unit", value: "employeeUnit" },
        { text: "Requestor", value: "requestor" },
        { text: "Items", value: "recoveryItem" },
        { text: "Status", value: "status" },
      ],
      searchAllList: [
        "branch",
        "refNum",
        "createUser",
        "requestor",
        "department",
        "employeeUnit",
        "recoveryItem",
        "status",
        "jvNum",
        "submissionDate",
      ],
      deleteRecoveryDialog: false,
      recoveryToDelete: null,
    };
  },
  mounted() {
    // this.admin = Vue.filter("isAdmin")();
    this.initItemCategory();
  },
  computed: {
    filteredRecoveries() {
      for (const recovery of this.recoveries) {
        recovery.requestor = recovery.firstName + " " + recovery.lastName;
        recovery.recoveryItem = this.getRecoveryItems(recovery);
      }
      if (this.searchKey == "all" && this.searchPhrase)
        return this.recoveries.filter((rec) => {
          for (const key of this.searchAllList) {
            if (rec[key]?.toLowerCase().includes(this.searchPhrase.toLowerCase())) return true;
          }
          return false;
        });
      else if (this.searchKey && this.searchPhrase)
        return this.recoveries.filter((rec) =>
          rec[this.searchKey]?.toLowerCase().includes(this.searchPhrase.toLowerCase())
        );
      else return this.recoveries;
    },
  },
  methods: {
    updateTable() {
      this.$emit("updateTable");
    },
    initItemCategory() {
      this.itemCategoryList = {};
      const itemCategoryList = this.$store.state.recoveries.itemCategoryList;
      for (const item of itemCategoryList) {
        this.itemCategoryList[item.itemCatID] = item.category;
      }
    },
    getRecoveryItems(recovery) {
      const items = recovery.recoveryItems.map((rec) => this.itemCategoryList[rec.itemCatID]);
      return items.join(", ");
    },
    exportToExcel() {
      const csvInfo = this.filteredRecoveries.map((rec) => {
        return {
          branch: rec.branch ? rec.branch : "",
          refNum: rec.refNum ? rec.refNum : "",
          createUser: rec.createUser ? rec.createUser : "",
          requestor: (rec.firstName ? rec.firstName + " " : "") + (rec.lastName ? rec.lastName : ""),
          department: rec.department ? rec.department : "",
          unit: rec.employeeUnit ? rec.employeeUnit : "",
          recoveryItems: rec.recoveryItems ? this.getRecoveryItems(rec) : "",
          totalPrice: rec.totalPrice ? "$" + rec.totalPrice : "",
          submissionDate: rec.submissionDate ? Vue.filter("beautifyDate")(rec.submissionDate) : "",
          status: rec.status ? rec.status : "",
          jvNum: rec.journal && rec.journal.jvNum ? rec.journal.jvNum : "",
        };
      });
      const options = {
        fieldSeparator: ",",
        quoteStrings: '"',
        decimalSeparator: ".",
        showLabels: true,
        showTitle: false,
        title: "",
        filename: "Recoveries",
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: false,
        headers: [
          "Recovery Branch",
          "Reference",
          "Agent",
          "Requestor",
          "Department",
          "Unit",
          "Items",
          "Cost",
          "Date Submitted",
          "Status",
          "JV #",
        ],
      };
      const csvExporter = new ExportToCsv(options);
      csvExporter.generateCsv(csvInfo);
    },

    deleteRecoveryClick(item) {
      this.recoveryToDelete = item;
      this.deleteRecoveryDialog = true;
    },
    deleteRecovery() {
      console.log("CONFIRMED", this.recoveryToDelete);

      axios
        .delete(`${RECOVERIES_URL}/${this.recoveryToDelete.recoveryID}`)
        .then(async (resp) => {
          console.log(resp);
          this.deleteRecoveryDialog = false;
          this.$emit("updateTable");
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
};
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
