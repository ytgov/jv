<template>
  <div>
        <v-dialog v-model="addNewJournalDialog" persistent max-width="40%">
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    elevation="5"                    
                    color="primary"
                    @click="initForm()"
                    v-bind="attrs"
                    v-on="on"
                    :disabled="readonly"
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
                    <v-row class="mt-3 mx-3">
                        <b class="mr-5">Department:</b> {{department}}
                    </v-row>
                    <v-row class="mt-5 mx-3">
                        <b class="mr-5">GL:</b> 
                    </v-row>
                    <v-row class="mt-5 mb-4 mx-3">
                        <b class="mr-5">Amount:</b> $ {{amount}}
                    </v-row>
                </v-card>

                <v-row class="mt-5 mx-0">
                    <v-col cols="9">
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
                </v-row>
                <v-row class="mt-5 mx-0">                    
                    <v-col cols="9">
                        <v-select
                            :readonly="readonly"
                            :error="state.periodErr"
                            @change="state.periodErr=false;"
                            v-model="period"
                            :items="periodList"                            
                            label="Period"
                            hide-details
                            outlined
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
import Vue from "vue";
import { RECOVERIES_URL} from "@/urls";
import axios from "axios";


export default { 
    components: {  
 
    },
    name: "NewJournal",
    props: {
        readonly: { type: Boolean},
        recoveries: {},
    },
    data() {
        return {
           
            admin: false,
            addNewJournalDialog: false,
            
            journalNum: "",
            period: "",
            amount:0,
            department:'',
            periodList: [1,2,3,4,5,6,7,8,9,10,11,12,14],
            
            savingData: false,
                 
            tmpId: 0,
            alert:false,
            alertMsg:'',

            state: {
                journalNumErr: false,          
                periodErr: false,
            },
        };
    },
    mounted() {},

    methods: {

        initForm() {
            this.admin = Vue.filter("isAdmin")();  
                      
            this.alert=false;           
            this.initStates(); 
            this.journalNum = ""
            this.period = ""
            this.amount = this.getTotalAmount()
            this.department = this.recoveries[0].department
            this.savingData = false            
            this.update++;
        },

        
        initStates() {    
            for (const key of Object.keys(this.state)) {
                this.state[key] = false;
            }
        },

        getTotalAmount(){
            let total=0
            for(const recovery of this.recoveries)
                total+= recovery.totalPrice
            return total
        },

        checkFields() {          
            this.state.journalNumErr = this.journalNum? false : true;          
            this.state.periodErr = this.period? false : true;
            
            for (const key of Object.keys(this.state)) {
                if (this.state[key]) return false;
            }       
            return true;
        },

        saveNewJournal() {
            if (this.checkFields()) {
                this.alert = false;
                this.savingData = true;

                const recoveryIDs = this.recoveries.map(recovery => recovery.recoveryID)
                
                let body = {}                
                body = {
                    jvNum: this.journalNum,
                    period: this.period,
                    department: this.department,		
                    jvAmount: this.amount,
                    status:'Draft',
                    recoveryIDs: recoveryIDs     
                };                
                const id = 0;
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
