<template>
  <div>
        <v-dialog v-model="addNewJournalDialog" persistent max-width="60%">
            <template v-slot:activator="{ on, attrs }">
                <v-btn                    
                    color="transparent"
                    @click="initForm()"
                    v-bind="attrs"
                    v-on="on"
                    ><v-icon dense color="primary">mdi-pencil</v-icon>                    
                </v-btn>
            </template>

        <v-card>
            <v-card-title class="primary" style="border-bottom: 1px solid black">
                <div class="text-h5">
                    JV {{journal.jvNum}}
                </div>
            </v-card-title>           

            <v-card-text>                

                <v-row class="mt-5 mx-0">
                    <v-col cols="7">
                        <v-select
                            :readonly="readonly"
                            :error="state.departmentErr"
                            @change="state.departmentErr=false;"
                            v-model="journal.department"
                            :items="departmentList"
                            item-text="name"
                            label="Department"
                            outlined
                        />
                    </v-col>
                    <v-col cols="3">
                        <v-text-field
                            :readonly="readonly"
                            :error="state.amountErr"
                            @input="state.amountErr = false"
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

                <v-row class="mt-5 mx-3" >
                    <recoverable-table :recoveries="recoveries" />
                </v-row>

                <v-row class="mt-10 mb-3 mx-0">
                    <v-btn color="white" class="ml-5 cyan--text text--darken-4" @click="closeDialog">
                        <div v-if="readonly" class="px-3">Close</div>
                        <div v-else>Cancel</div>
                    </v-btn>            
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
                        >Paid
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
import AuditTable from './AuditTable.vue';
import RecoverableTable from './RecoverableTable.vue'


export default { 
    components: {  
        AuditTable,
        RecoverableTable
    },
    name: "EditJournal",
    props: {
        readonly: { type: Boolean},
        journal: {},
    },
    data() {
        return {
           
            admin: false,
            addNewJournalDialog: false,
            
            periodList: [1,2,3,4,5,6,7,8,9,10,11,12,14],
            departmentList: [],
            audits: [],
            recoveries: [],

            savingData: false,
                 
            tmpId: 0,
            alert:false,
            alertMsg:'',

            state: {
                departmentErr: false,
                amountErr: false,          
                periodErr: false,
            },
        };
    },
    mounted() {},

    methods: {

        initForm() {            
            this.admin = Vue.filter("isAdmin")();  
                      
            this.alert=false;
            this.initDepartments()     
            this.initStates();
            this.audits=this.journal.journalAudits
            this.recoveries=this.journal.recoveries

            this.savingData = false            
            this.update++;
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



        checkFields() {          
            this.state.departmentErr = this.journal.department? false : true;          
            this.state.periodErr = this.journal.period? false : true;
            this.state.amountErr = this.journal.jvAmount? false : true;
            
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
                    status: status,
                    // recoveryIDs: recoveryIDs     
                };                
                const id = this.journal.journalID;
                axios.post(`${RECOVERIES_URL}/journals/${id}`, body)
                .then(async () => {                    
                    this.savingData = false;                    
                    this.closeDialog()
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
