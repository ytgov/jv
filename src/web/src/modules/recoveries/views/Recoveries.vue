<template>
    <v-card :loading="loadingData" :disabled="loadingData" en class="px-5 pb-15">
        <div v-if="loadingData" class="mt-10" style="text-align: center">loading ...</div>
        <v-alert v-if="alertMsg" class="mt-5" type="warning">{{ alertMsg }}</v-alert>
        <v-toolbar v-if="!loadingData" class="" height="100px" flat>
            <v-toolbar-title>Recoveries</v-toolbar-title>

            <template v-slot:extension>
                <v-tabs v-model="tabs" active-class="primary--text teal lighten-5">
                    <v-tab>Recoveries</v-tab>
                    <v-tab>Recoveries To JV</v-tab>
                    <v-tab>Journals</v-tab>
                </v-tabs>
            </template>
        </v-toolbar>

        <v-tabs-items v-if="!loadingData" v-model="tabs">
            <v-tab-item>
                <v-card flat>
                    <recovery-table :recoveries="recoveries" @updateTable="getRecoveries"/>                    
                </v-card>
            </v-tab-item>
            <v-tab-item>
                <v-card flat>
                    
                </v-card>
            </v-tab-item>
        </v-tabs-items>
    </v-card>
</template>

<script>
import RecoveryTable from "./RecoveryComponents/RecoveryTable.vue";
import { LOOKUP_URL , RECOVERIES_URL} from "../../../urls";
import axios from "axios";
// import { secureGet } from "../../../store/jwt";

export default {
    name: "Recoveries",
    components: {
        RecoveryTable
    },
    data() {
        return {
            tabs: null,
            loadingData: false,
            recoveries: [],
            alertMsg: ""
        };
    },

    async mounted() {
        this.loadingData = true;
        await this.getEmployees();
        await this.getDepartmentBranch();
        await this.getItemCategoryList(); 
        await this.getRecoveries();
    },

    methods: {
        async getEmployees() {            
            return axios.get(`${LOOKUP_URL}/employees`)
            .then(resp => {
                this.$store.commit("recoveries/SET_EMPLOYEES", resp.data);        
            })
            .catch(e => {
                console.log(e);
            });
        },

        async getDepartmentBranch() {
            return axios.get(`${LOOKUP_URL}/department-branch`)
            .then(resp => {
                this.$store.commit("recoveries/SET_DEPARTMENT_BRANCH", resp.data);
            })
            .catch(e => {
                console.log(e);
            });
        },

        async getItemCategoryList(){
            return axios.get(`${RECOVERIES_URL}/item-categories`)
            .then(resp => {          
                this.$store.commit("recoveries/SET_ITEM_CATEGORY_LIST", resp.data);              
            })
            .catch(e => {
                console.log(e);
            });
        },

        async getRecoveries(){
            this.loadingData = true;
            return axios.get(`${RECOVERIES_URL}/`)
            .then(resp => {
                this.recoveries=resp.data
                this.loadingData = false;
            })
            .catch(e => {
                this.loadingData = false;
                console.log(e);
            });
        },
       
        // determineDepartment() {
        //   this.alertMsg = "";
        //   if (!this.$store.state.auth.department) {
        //     const email = this.$store.state.auth.user.email;
        //     const employee = this.$store.state.preapproved.employees.filter(emp => emp.email == email);
        //     if (employee.length > 0) {
        //       this.$store.dispatch("UpdateUserDepartment", employee[0].department);
        //     } else {
        //       this.alertMsg = "Your department is undefined. Please contact system administrator.";
        //     }
        //   }
        //   this.loadingData = false;
        // }
    }
};
</script>
