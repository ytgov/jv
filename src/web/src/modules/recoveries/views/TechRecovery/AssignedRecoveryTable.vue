<template>
  <div class="mx-10 mb-5">
    <div class="d-flex">
      <v-spacer />
      <new-recovery type="Add New" title="Create" maxWidth="80%" :recovery="{}" @updateTable="updateTable" />
    </div>

    <v-data-table :headers="headers" :items="recoveries" :items-per-page="10" class="elevation-1">
      <!-- eslint-disable-next-line vue/no-unused-vars -->
      <template v-slot:[`item.createDate`]="{ item }">
        <!-- eslint-disable-next-line vue/no-parsing-error -->
        {{ item.createDate | beautifyDate }}
      </template>

      <template v-slot:[`item.requestor`]="{ item }"> {{ item.firstName }} {{ item.lastName }} </template>

      <template v-slot:[`item.recoveryItems`]="{ item }">
        {{ getRecoveryItems(item) }}
      </template>

      <template v-slot:[`item.totalPrice`]="{ item }"> ${{ item.totalPrice.toFixed(2) | currency }} </template>

      <template v-slot:[`item.jvNum`]="{ item }">
        <div v-if="item.journal && item.journal.jvNum">{{ item.journal.jvNum }}</div>
      </template>

      <template v-slot:[`item.edit`]="{ item }">
        <v-row>
          <div style="width: 4.5rem">
            <new-recovery
              :type="isFillPhase(item) ? 'Fill' : 'Edit'"
              :title="isFillPhase(item) ? 'Fill' : 'Edit'"
              :maxWidth="isFillPhase(item) ? '85%' : '80%'"
              :recovery="item"
              @updateTable="updateTable"
            />
          </div>
        </v-row>
      </template>
    </v-data-table>
  </div>
</template>

<script>
// import Vue from "vue";
import NewRecovery from "../RecoveryComponents/NewRecovery.vue";

export default {
  components: {
    NewRecovery,
  },
  name: "AssignedRecoveryTable",
  props: {
    recoveries: {},
  },
  data() {
    return {
      headers: [
        { text: "Create Date", value: "createDate", class: "blue-grey lighten-4" },
        { text: "Department", value: "department", class: "blue-grey lighten-4" },
        { text: "Reference", value: "refNum", class: "blue-grey lighten-4" },
        { text: "Request", value: "recoveryItems", class: "blue-grey lighten-4" },
        { text: "Requestee", value: "requestor", class: "blue-grey lighten-4" },
        { text: "Status", value: "status", class: "blue-grey lighten-4" },
        { text: "", sortable: false, value: "edit", class: "blue-grey lighten-4", width: "1rem" },
      ],
      admin: false,
      itemCategoryList: {},
      fillPhase: false,
    };
  },
  mounted() {
    this.initItemCategory();
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
    isFillPhase(item) {
      if (item.status == "Purchase Approved" || item.status == "Partially Fullfilled" || item.status == "Fullfilled")
        return true;
      return false;
    },
  },
};
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
