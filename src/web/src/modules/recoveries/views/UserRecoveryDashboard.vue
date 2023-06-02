<template>
    <v-card :loading="loadingData" :disabled="loadingData" en class="px-5 pb-15" style="border:0px solid white !important;">
        <div v-if="loadingData" class="mt-10" style="text-align: center">loading ...</div>
        <v-alert v-if="alertMsg" class="mt-5" type="warning">{{ alertMsg }}</v-alert>

        <div v-if="!loadingData">          
            <div class="my-10 mx-3 text-h4">Recoveries</div> 

            <title-card class="mt-5" titleWidth="11rem">
                <template #title>
                    <div>Pending Requests</div>
                </template>
                <template #body>
                    <inprogress-recovery-table :recoveries="inprogressRecoveries" @updateTable="updateTable(0)"/>
                </template>
            </title-card>

            <title-card class="mt-15" titleWidth="11rem">
                <template #title>
                    <div>Pending Approvals</div>
                </template>
                <template #body>
                    <approval-recovery-table :recoveries="approvalRecoveries" @updateTable="updateTable(0)"/>
                </template>
            </title-card>
        </div>
    </v-card>
</template>

<script>
import Vue from "vue";
import InprogressRecoveryTable from "./UserRecovery/InprogressRecoveryTable.vue";
import ApprovalRecoveryTable from "./UserRecovery/ApprovalRecoveryTable.vue"
import { RECOVERIES_URL, ADMIN_URL} from "../../../urls";
import { mapActions } from "vuex";
import axios from "axios";
import TitleCard from './Common/TitleCard.vue';
// import { secureGet } from "../../../store/jwt";

export default {
    name: "TechRecoveryDashboard",
    components: {
        InprogressRecoveryTable,
        ApprovalRecoveryTable,
        TitleCard
    },
    data() {
        return {
            tabs: null,
            loadingData: false,
            
            inprogressRecoveries: [],
            approvalRecoveries: [],

            alertMsg: ""
        };
    },

    async mounted() {
        this.loadingData = true;
        await this.getItemCategoryList();
        await this.getEmployees();
        await this.getDepartmentBranch();         
        await this.getRecoveries();
        this.loadingData = false;
    },

    methods: {
        ...mapActions("recoveries", ["getEmployees", "getDepartmentBranch"]),

        async getItemCategoryList(){
            return axios.get(`${ADMIN_URL}/item-categories`)
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
                // this.recoveries=resp.data
                this.approvalRecoveries = resp.data.filter(recovery =>
                    recovery.status=='Routed For Approval'
                )

                this.inprogressRecoveries = resp.data.filter(recovery => 
                    recovery.status=='Draft' ||
                    recovery.status=='Re-Draft' ||
                    recovery.status=='Purchase Approved' ||
                    recovery.status=='Partially Fullfilled' ||
                    recovery.status=='Fullfilled'
                )
            })
            .catch(e => {
                console.log(e);
            });
        },
       
        async updateTable(tab){
            this.loadingData = true;
            await this.getRecoveries();
            this.loadingData = false;
            Vue.nextTick(()=> this.tabs=tab)
        }
    
    }
};
</script>