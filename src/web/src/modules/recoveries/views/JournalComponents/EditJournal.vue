<template>
  <div>
        <v-dialog v-model="addNewJournalDialog" persistent max-width="65%">
            <template v-slot:activator="{ on, attrs }">
                <v-btn                    
                    color="transparent"
                    class="px-1"
                    style="min-width: 0"
                    @click="initForm()"
                    v-bind="attrs"
                    v-on="on"
                    >
                    <v-icon v-if="readonly" dense color="primary">mdi-magnify</v-icon>
                    <v-icon v-else dense color="primary">mdi-pencil</v-icon>                    
                </v-btn>
            </template>

        <v-card>
            <v-card-title class="primary" style="border-bottom: 1px solid black">
                <div class="text-h5">
                    JV {{journal.jvNum}} ({{journal.status}})
                </div>
            </v-card-title>           

            <v-card-text>                

                <v-row class="mt-5 mx-0">
                    <v-col cols="7">
                        <v-select
                            readonly
                            :error="state.departmentErr"
                            @change="state.departmentErr=false;"
                            v-model="journal.department"
                            :items="departmentList"
                            item-text="name"
                            label="Department"
                            outlined
                            hide-details
                        />
                    </v-col>
                    <v-col cols="3">
                        <v-text-field
                            :readonly="readonly"
                            :error="state.amountErr"
                            @input="state.amountErr = false"
                            @change="fixJvAmount"
                            v-model="journal.jvAmount"
                            label="Amount"
                            prefix="$"
                            outlined
                            hide-details
                        />
                    </v-col>                            
                    <v-col cols="2">
                        <v-select
                            :readonly="readonly"
                            :error="state.periodErr"
                            @change="state.periodErr=false;"
                            v-model="journal.period"
                            :items="periodList"                            
                            label="Period"
                            hide-details
                            outlined
                        />
                    </v-col>
                </v-row>

                <v-row class="mt-3 mx-0">
                    <v-col cols="3" >
                        <v-text-field
                            :readonly="readonly"
                            :error="state.dateErr"
                            v-model="journal.jvDate"
                            @change="state.dateErr=false;"
                            label="JV Date"
                            outlined
                            type="date"
                            hide-details
                        />                        
                    </v-col>                            
                    <v-col cols="2">
                        <v-select
                            :readonly="readonly"
                            :error="state.fiscalYearErr"
                            @change="state.fiscalYearErr=false;"
                            v-model="journal.fiscalYear"
                            :items="yearList()"                            
                            label="Fiscal Year"
                            hide-details
                            outlined
                        />
                    </v-col>
                    <v-col cols="7">
                        <v-text-field
                            :readonly="readonly"
                            :error="state.descriptionErr"
                            @change="state.descriptionErr=false;"
                            v-model="journal.description"                           
                            label="Description"
                            outlined
                            hide-details
                        />
                    </v-col>                    
                </v-row>

                <v-row class="mt-3 mx-0">
                    <v-col cols="6">
                        <v-text-field
                            :readonly="readonly"
                            :error="state.orgDepartmentErr"
                            @change="state.orgDepartmentErr=false;"
                            v-model="journal.orgDepartment"                            
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
                            v-model="journal.odCompletedBy"
                            label="OD Completed By"
                            outlined
                            hide-details
                        />
                        
                    </v-col>
                </v-row>

                <v-row class="mt-3 mx-0">

                    <v-col cols="6">
                        <v-text-field
                            :readonly="readonly"
                            :error="state.recDepartmentErr"
                            @change="state.recDepartmentErr=false;"
                            v-model="journal.recvDepartment"                            
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
                            v-model="journal.rdCompletedBy"
                            label="RD Completed By"
                            outlined
                            hide-details
                        />
                        
                    </v-col>

                </v-row>

                <v-row class="mt-3 mx-0">
                    <v-col cols="12">
                        <v-textarea
                            :readonly="readonly"
                            :error="state.explanationErr"
                            @change="state.explanationErr=false;"
                            v-model="journal.explanation"                           
                            label="Journal Explanation"
                            :rules="rules"
                            :rows="3"
                            outlined
                            :clearable="!readonly"
                        />
                    </v-col>
                </v-row>

                <v-row v-if="journal.status=='Draft' && !loadingData && !readonly" >
                    <edit-recoverable-table 
                        class="ml-auto"
                        :existingRecoveries="recoveries" 
                        :recoveries="allDeptRecoveries" 
                        :journalID="journal.journalID" 
                        @updateTable="updateTable()"/>
                </v-row>
                <v-row class="mt-5 mx-3" v-if="!loadingData" >
                    <recoverable-table
                        :readonly="readonly"
                        :recoveries="recoveries" 
                        :status="journal.status" 
                        :journalID="journal.journalID"
                        @updateTable="updateTable()"/>
                </v-row>

                <v-row class="mt-10 mb-3 mx-0">
                    <v-btn color="white" class="ml-5 cyan--text text--darken-4" @click="closeDialog">
                        <div class="px-3">Close</div>
                    </v-btn>
                    <create-journal-export v-if="!readonly" :journalID="journal.journalID" class="ml-auto mr-5"/>
                    <v-btn
                        v-if="!readonly"
                        class="ml-auto mr-5 px-5 white--text"
                        color="#005a65"
                        @click="saveNewJournal('Draft')"
                        :loading="savingData"
                        >Draft
                    </v-btn>
                     <v-btn
                        v-if="!readonly"
                        class="ml-2 mr-5 px-5 white--text"
                        color="#005a65"
                        @click="saveNewJournal('Send')"
                        :loading="savingData"
                        >Send
                    </v-btn>
                     <v-btn
                        v-if="!readonly"
                        class="ml-2 mr-5 px-5 white--text"
                        color="#005a65"
                        @click="saveNewJournal('Paid')"
                        :loading="savingData"
                        >Cleared
                    </v-btn>          
                </v-row>

                <v-row class="mt-15 mx-3">
                    <v-alert v-model="alert" dense color="red darken-4" dark dismissible>
                        {{ alertMsg }}
                    </v-alert>
                </v-row>

                <v-row class="mt-15 ml-3 mb-2" >
                    <audit-table :audits="audits" />
                </v-row>

            </v-card-text>

            
        </v-card>
    </v-dialog>
   
  </div>
</template>

<script>
import Vue from "vue";
import { RECOVERIES_URL} from "@/urls";
import axios from "axios";
import _ from "lodash";
import AuditTable from './AuditTable.vue';
import RecoverableTable from './RecoverableTable.vue'
import EditRecoverableTable from "./EditRecoverableTable.vue"
import CreateJournalExport from './JournalExport/CreateJournalExport.vue';

export default { 
    components: {  
        AuditTable,
        RecoverableTable,
        EditRecoverableTable,
        CreateJournalExport
    },
    name: "EditJournal",
    props: {
        readonly: { type: Boolean},
        journal: {},
        allRecoveries: {},
    },
    data() {
        return {
           
            admin: false,
            addNewJournalDialog: false,
            
            periodList: [1,2,3,4,5,6,7,8,9,10,11,12,14],
            departmentList: [],
            audits: [],
            recoveries: [],
            allDeptRecoveries :[],
            savingData: false,
            loadingData: false,

            tmpId: 0,
            alert:false,
            alertMsg:'',
            rules: [v => v?.length <= 200 || 'Max 200 characters'],

            state: {
                departmentErr: false,
                amountErr: false,          
                periodErr: false,
                descriptionErr: false,
                dateErr: false,
                fiscalYearErr: false,
                orgDepartmentErr: false,
                oDCompletedByErr: false,
                recDepartmentErr: false,
                rDCompletedByErr: false,
                explanationErr: false
            },
        };
    },
    mounted() {},

    methods: {

        initForm() {            
            this.admin = Vue.filter("isSystemAdmin")();  
                      
            this.alert=false;
            this.initDepartments()     
            this.initStates();
            this.audits=this.journal.journalAudits
            this.recoveries=this.journal.recoveries
            this.journal.jvDate = this.journal?.jvDate?.slice(0,10)
            this.allDeptRecoveries=this.allRecoveries.filter(rec => rec.department==this.journal.department)
            this.fixJvAmount()
            this.savingData = false
            this.loadingData = false            
        },

        
        initStates() {    
            for (const key of Object.keys(this.state)) {
                this.state[key] = false;
            }
        },

        initDepartments() {
            this.departmentList = [];
            const depts = this.$store.state.recoveries.departmentBranch;
            for (const key of Object.keys(depts)) {
                this.departmentList.push({ name: key });
            }
        },

        async updateTable(){
            this.loadingData = true
            await this.getJournal()
            await this.getRecoveries()
            this.loadingData = false
        },

        async getJournal() {             
            const id = this.journal.journalID;
            return axios.get(`${RECOVERIES_URL}/journal/${id}`)
            .then((resp) => {                    
                this.journal.journalAudits = resp.data.journalAudits;
                this.journal.recoveries = resp.data.recoveries;
                this.journal.jvAmount = resp.data.jvAmount;
                this.journal.description = resp.data.description;
                this.journal.jvDate = resp.data.jvDate.slice(0,10);
                this.journal.fiscalYear = resp.data.fiscalYear;
                this.journal.orgDepartment = resp.data.orgDepartment;
                this.journal.odCompletedBy = resp.data.odCompletedBy;
                this.journal.recvDepartment = resp.data.recvDepartment;
                this.journal.rdCompletedBy = resp.data.rdCompletedBy;
                this.journal.explanation = resp.data.explanation;
                this.fixJvAmount();
                this.recoveries=this.journal.recoveries;
                //console.log(this.recoveries)                           
            })
            .catch(e => {                
                console.log(e);
                this.loadingData = false                 
            });
        },

        async getRecoveries(){
            return axios.get(`${RECOVERIES_URL}/`)
            .then(resp => {                
                this.allDeptRecoveries = resp.data.filter(recovery => recovery.status=='Complete' && !recovery.journalID && recovery.department==this.journal.department)
            })
            .catch(e => {
                console.log(e);
            });
        },

        fixJvAmount(){
            this.journal.jvAmount=this.journal.jvAmount? Number(this.journal.jvAmount).toFixed(2) : '0.00'
        },

        yearList(){
            const d = new Date();
            const year = d.getFullYear();
            const years = _.range(year, 2000)
            return years.map(year => String(year))
        },

        checkFields() {          
            this.state.departmentErr = this.journal.department? false : true;          
            this.state.periodErr = this.journal.period? false : true;
            this.state.amountErr = this.journal.jvAmount? false : true;
            this.state.descriptionErr = this.journal.description? false : true;
            this.state.dateErr = this.journal.jvDate? false : true;
            this.state.fiscalYearErr = this.journal.fiscalYear? false : true;
            // this.state.orgDepartmentErr = this.journal.orgDepartment? false : true;
            // this.state.oDCompletedByErr = this.journal.odCompletedBy? false : true;
            // this.state.recDepartmentErr = this.journal.recvDepartment? false : true;
            // this.state.rDCompletedByErr = this.journal.rdCompletedBy? false : true;
            // this.state.explanationErr = this.journal.explanation? false : true;
            
            for (const key of Object.keys(this.state)) {
                if (this.state[key]) return false;
            }       
            return true;
        },

        saveNewJournal(status) {
            if (this.checkFields()) {
                this.alert = false;
                this.savingData = true;

                // const recoveryIDs = this.recoveries.map(recovery => recovery.recoveryID)
                
                let body = {}                
                body = {                    
                    period: this.journal.period,
                    department: this.journal.department,		
                    jvAmount: this.journal.jvAmount,
                    description: this.journal.description,
                    jvDate: this.journal.jvDate,
                    fiscalYear: this.journal.fiscalYear,
                    orgDepartment: this.journal.orgDepartment,
                    odCompletedBy: this.journal.odCompletedBy,
                    recvDepartment: this.journal.recvDepartment,
                    rdCompletedBy: this.journal.rdCompletedBy,
                    explanation: this.journal.explanation,
                    status: status,
                    // recoveryIDs: recoveryIDs     
                };                
                const id = this.journal.journalID;
                axios.post(`${RECOVERIES_URL}/journals/${id}`, body)
                .then(async () => {                    
                    this.savingData = false; 
                    this.$emit("updateTable");                                       
                })
                .catch(e => {
                    this.savingData = false;
                    console.log(e);
                    this.alertMsg = e.response.data;
                    this.alert = true;
                });
            }
        },
               

        closeDialog(){
            this.addNewJournalDialog = false;
            this.$emit("updateTable");
        },
    }
  
};
</script>

<style scoped>
.v-text-field--solo.error--text{
    background: red;
    border: 1px solid red;
}
/* 
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
} */
</style>
