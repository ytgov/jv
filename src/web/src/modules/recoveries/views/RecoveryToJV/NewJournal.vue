<template>
  <div>
    <v-dialog v-model="addNewJournalDialog" persistent max-width="50%" scrollable>
      <template v-slot:activator="{ on, attrs }">
        <v-btn elevation="5" color="primary" @click="initForm()" v-bind="attrs" v-on="on" :disabled="readonly"
          >Create New Journal
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="primary" style="border-bottom: 1px solid black">
          <div class="text-h5">
            Create Journal
          </div>
        </v-card-title>

        <v-card-text>
          <v-card class="mt-5 mx-2" style="font-size:12pt;">
            <v-row class="mt-3 mx-3"> <b class="mr-5">Department:</b> {{ department }} </v-row>
            <!-- <v-row class="mt-5 mx-3">
                        <b class="mr-5">GL:</b> {{departmentGlCode}}
                    </v-row> -->
            <v-row class="mt-5 mb-4 mx-3"> <b class="mr-5">Amount:</b> $ {{ amount.toFixed(2) | currency }} </v-row>
          </v-card>

          <v-row class="mt-5 mx-0">
            <v-col cols="8">
              <v-text-field
                :readonly="readonly"
                :error="state.journalNumErr"
                @input="state.journalNumErr = false"
                v-model="journalNum"
                label="Journal Number"
                outlined
                hide-details
                :clearable="!readonly"
              />
            </v-col>
            <v-col cols="4">
              <v-select
                :readonly="readonly"
                :error="state.periodErr"
                @change="state.periodErr = false"
                v-model="period"
                :items="periodList"
                label="Period"
                hide-details
                outlined
              />
            </v-col>
          </v-row>
          <v-row class="mt-2 mx-0">
            <v-col cols="8">
              <v-text-field
                :readonly="readonly"
                :error="state.dateErr"
                v-model="date"
                @change="state.dateErr = false"
                label="JV Date"
                outlined
                type="date"
                hide-details
              />
            </v-col>
            <v-col cols="4">
              <v-select
                :readonly="readonly"
                :error="state.fiscalYearErr"
                @change="
                  state.fiscalYearErr = false;
                  getDescription();
                "
                v-model="fiscalYear"
                :items="yearList()"
                label="Fiscal Year"
                hide-details
                outlined
              />
            </v-col>
          </v-row>
          <v-row class="mt-2 mx-0">
            <v-col cols="12">
              <v-text-field
                :readonly="readonly"
                :error="state.descriptionErr"
                @change="state.descriptionErr = false"
                v-model="description"
                label="Description"
                outlined
                hide-details
              />
            </v-col>
          </v-row>

          <v-row class="mt-2 mx-0">
            <v-col cols="6">
              <v-text-field
                :readonly="readonly"
                :error="state.orgDepartmentErr"
                @change="state.orgDepartmentErr = false"
                v-model="orgDepartment"
                label="Originating Department"
                outlined
                hide-details
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                :readonly="readonly"
                :error="state.oDCompletedByErr"
                @input="state.oDCompletedByErr = false"
                v-model="odCompletedBy"
                label="OD Completed By"
                outlined
                hide-details
              />
            </v-col>
          </v-row>

          <v-row class="mt-2 mx-0">
            <v-col cols="6">
              <v-text-field
                :readonly="readonly"
                :error="state.recDepartmentErr"
                @change="state.recDepartmentErr = false"
                v-model="recvDepartment"
                item-text="name"
                label="Receiving Department"
                outlined
                hide-details
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                :readonly="readonly"
                :error="state.rDCompletedByErr"
                @input="state.rDCompletedByErr = false"
                v-model="rdCompletedBy"
                label="RD Completed By"
                outlined
                hide-details
              />
            </v-col>
          </v-row>

          <v-row class="mt-2 mx-0">
            <v-col cols="12">
              <v-textarea
                :readonly="readonly"
                :error="state.explanationErr"
                @change="state.explanationErr = false"
                v-model="explanation"
                label="Journal Explanation"
                :rules="rules"
                :rows="3"
                outlined
                :clearable="!readonly"
              />
            </v-col>
          </v-row>

          <v-row class="mt-15 mx-3">
            <v-alert v-model="alert" dense color="red darken-4" dark dismissible>
              {{ alertMsg }}
            </v-alert>
          </v-row>
        </v-card-text>

        <v-card-actions class="mt-0 mb-3">
          <v-btn color="white" class="ml-5 cyan--text text--darken-4" @click="closeDialog">
            <div v-if="readonly" class="px-3">Close</div>
            <div v-else>Cancel</div>
          </v-btn>
          <v-btn
            v-if="!readonly"
            class="ml-auto mr-5 px-5 white--text"
            color="#005a65"
            @click="saveNewJournal()"
            :loading="savingData"
            >Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { RECOVERIES_URL } from "@/urls";
import axios from "axios";
import _ from "lodash";

export default {
  components: {},
  name: "NewJournal",
  props: {
    readonly: { type: Boolean },
    recoveries: {},
  },
  data() {
    return {
      addNewJournalDialog: false,

      journalNum: "",
      period: "",
      amount: 0,
      department: "",
      departmentGlCode: "",
      periodList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14],

      date: "",
      fiscalYear: "",
      description: "",
      orgDepartment: "",
      odCompletedBy: "",
      recvDepartment: "",
      rdCompletedBy: "",
      explanation: "",
      rules: [(v) => v.length <= 200 || "Max 200 characters"],

      savingData: false,

      tmpId: 0,
      alert: false,
      alertMsg: "",

      state: {
        journalNumErr: false,
        periodErr: false,
        dateErr: false,
        fiscalYearErr: false,
        orgDepartmentErr: false,
        oDCompletedByErr: false,
        recDepartmentErr: false,
        rDCompletedByErr: false,
        explanationErr: false,
      },
    };
  },
  methods: {
    initForm() {
      this.alert = false;
      this.initStates();
      this.department = this.recoveries[0].department;
      this.journalNum = "";
      this.period = "";
      this.date = new Date().toISOString().slice(0, 10);
      this.fiscalYear = this.getFiscalYear();
      this.orgDepartment = "HPW-ICT W10";
      this.odCompletedBy = "HPW-ICT-Invoices@yukon.ca";
      this.recvDepartment = this.getRD(this.department);
      this.rdCompletedBy = this.getRdCompletedBy(this.department);
      this.explanation = "";
      this.amount = this.getTotalAmount();
      this.departmentGlCode = this.getGlCode(this.department);
      this.getDescription();
      this.savingData = false;
      this.update++;
    },

    initStates() {
      for (const key of Object.keys(this.state)) {
        this.state[key] = false;
      }
    },

    getTotalAmount() {
      let total = 0;
      for (const recovery of this.recoveries) total += recovery.totalPrice;
      return total;
    },

    getFiscalYear() {
      const submissionDate = this.recoveries[0].submissionDate.slice(0, 10);
      let fiscalYear = submissionDate.slice(0, 4);
      if (submissionDate < fiscalYear + "-04-01") fiscalYear = String(Number(fiscalYear) - 1);

      return fiscalYear;
    },

    getDescription() {
      this.description =
        this.fiscalYear + "/" + (Number(this.fiscalYear.slice(2, 4)) + 1) + `-ICT Recovery to ${this.department}`;
    },

    yearList() {
      const d = new Date();
      const year = d.getFullYear();
      const years = _.range(year, 2000);
      return years.map((year) => String(year));
    },

    checkFields() {
      this.state.journalNumErr = this.journalNum ? false : true;
      this.state.periodErr = this.period ? false : true;
      this.state.dateErr = this.date ? false : true;

      for (const key of Object.keys(this.state)) {
        if (this.state[key]) return false;
      }
      return true;
    },

    saveNewJournal() {
      if (this.checkFields()) {
        this.alert = false;
        this.savingData = true;

        const recoveryIDs = this.recoveries.map((recovery) => recovery.recoveryID);

        let body = {};
        body = {
          jvNum: this.journalNum,
          period: this.period,
          department: this.department,
          jvAmount: this.amount,
          status: "Draft",
          recoveryIDs: recoveryIDs,
          jvDate: this.date,
          fiscalYear: this.fiscalYear,
          description: this.description,
          orgDepartment: this.orgDepartment,
          odCompletedBy: this.odCompletedBy,
          recvDepartment: this.recvDepartment,
          rdCompletedBy: this.rdCompletedBy,
          explanation: this.explanation,
        };
        const id = 0;
        axios
          .post(`${RECOVERIES_URL}/journals/${id}`, body)
          .then(async () => {
            this.savingData = false;
            this.closeDialog();
          })
          .catch((e) => {
            this.savingData = false;
            console.log(e);
            this.alertMsg = e.response.data;
            this.alert = true;
          });
      }
    },

    getGlCode(department) {
      const departmentInfo = this.$store.state.recoveries.departmentsInfo.filter(
        (info) => info.department == department
      );
      return departmentInfo[0] ? departmentInfo[0].glCode : "";
    },

    getRD(department) {
      const departmentInfo = this.$store.state.recoveries.departmentsInfo.filter(
        (info) => info.department == department
      );
      return departmentInfo[0] ? departmentInfo[0].recvDepartment : "";
    },

    getRdCompletedBy(department) {
      const departmentInfo = this.$store.state.recoveries.departmentsInfo.filter(
        (info) => info.department == department
      );
      return departmentInfo[0] ? departmentInfo[0].contactName : "";
    },

    closeDialog() {
      this.addNewJournalDialog = false;
      this.$emit("updateTable");
    },
  },
};
</script>

<style scoped>
.v-text-field--solo.error--text {
  background: red;
  border: 1px solid red;
}
/* 
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
} */
</style>
