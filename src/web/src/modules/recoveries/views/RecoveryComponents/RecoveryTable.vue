<template>
    <div class="mt-15 mx-10 mb-5">
        <v-row>
            <new-recovery class="ml-auto mb-5 mr-4 mt-n10"  type="Add New"/>
        </v-row>

        <v-data-table :headers="headers" :items="filteredRecoveries" :items-per-page="5" class="elevation-1">
            <!-- eslint-disable-next-line vue/no-unused-vars -->
            <template v-slot:item[`submissionDate`]="{ item }">
                <!-- eslint-disable-next-line vue/no-parsing-error -->
                {{ item.submissionDate | beautifyDate }}
            </template>
            
            <!-- <template v-slot:item.edit="{ item }">
                <v-row>
                    <div style="width: 4.5rem">
                        <submit-travel
                        v-if="item.status == 'Draft' && admin"
                        :preTSubID="item.preTSubID"
                        :editButton="true"
                        buttonName="Edit"
                        :travelRequests="travelRequests"
                        :selectedRequests="item.preapproved"
                        @updateTable="updateTable"
                        />
                    </div>
                    <div style="width: 6.75rem">
                        <approve-travel
                        v-if="item.status == 'Submitted' && admin"
                        :travelRequests="item.preapproved"
                        :submissionId="item.preTSubID"
                        @updateTable="updateTable"
                        />
                    </div>
                    <div style="width: 5.75rem">
                        <print-report
                        v-if="admin"
                        :travelRequests="item.preapproved"
                        :buttonInsideTable="true"
                        :id="item.preTSubID"
                        buttonName="Print"
                        />
                    </div>
                </v-row>
            </template> -->
        </v-data-table>
    </div>
</template>

<script>
    // import Vue from "vue";
    import NewRecovery from './NewRecovery.vue'
    // import PrintReport from "../Common/PrintReport.vue";
    // import SubmitTravel from "../Common/SubmitTravel.vue";
    // import ApproveTravel from "./ApproveTravel.vue";

    export default {
    components: {
        NewRecovery
        // PrintReport,
        // SubmitTravel,
        // ApproveTravel
    },
    name: "RecoveryTable",
    props: {
        // travelSubmissions: {
        // type: []
        // },
        // travelRequests: {
        // type: []
        // }
    },
    data() {
        return {
            headers: [
                { text: "Recovery Branch", value: "branch", class: "blue-grey lighten-4" },
                { text: "Reference", value: "reference", class: "blue-grey lighten-4" },
                { text: "Technician", value: "technician", class: "blue-grey lighten-4" },
                { text: "Requestor", value: "requestor", class: "blue-grey lighten-4" },
                { text: "Department", value: "department", class: "blue-grey lighten-4" },
                { text: "Items", value: "items", class: "blue-grey lighten-4" },
                { text: "Quantity", value: "quantity", class: "blue-grey lighten-4" },
                { text: "Cost", value: "cost", class: "blue-grey lighten-4" },
                { text: "DateSubmitted", value: "submissionDate", class: "blue-grey lighten-4" },
                { text: "Status", value: "status", class: "blue-grey lighten-4" },
                { text: "JV #", value: "jvNumber", class: "blue-grey lighten-4" },                
                { text: "", sortable: false, value: "edit", class: "blue-grey lighten-4", width: "18rem" }
            ],
            admin: false
        };
    },
    mounted() {
        // this.admin = Vue.filter("isAdmin")();

        // const dialogId = this.$store.state.preapproved.openDialogId;
        // const el = document.getElementById(dialogId);
        // if (el) {
        // this.$store.commit("preapproved/SET_OPEN_DIALOG_ID", "");
        // el.click();
        // }
    },
    methods: {
        // updateTable() {
        // this.$emit("updateTable");
        // }
    }
    };
</script>

<style scoped>
    ::v-deep(tbody tr:nth-of-type(even)) {
        background-color: rgba(0, 0, 0, 0.05);
    }
</style>
