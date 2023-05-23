<template>
    <div class="mt-15 mx-10 mb-5">
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
			
            <v-btn 
                :disabled="recoveries.length == 0"     
                @click="exportToExcel()"          
                class="ml-auto"
                elevation="5"
                color="primary">
                Export To Excel
            </v-btn>
		
		</v-row>

        <v-data-table :headers="headers" :items="recoveries" :items-per-page="10" class="elevation-1">
            <!-- eslint-disable-next-line vue/no-unused-vars -->
            <template v-slot:[`item.submissionDate`]="{ item }">
                <!-- eslint-disable-next-line vue/no-parsing-error -->
                {{ item.submissionDate | beautifyDate }}
            </template>

            <template v-slot:[`item.requestor`]="{ item }">
                {{item.firstName}} {{item.lastName}}
            </template>

            <template v-slot:[`item.recoveryItems`]="{ item }">
                {{getRecoveryItems(item)}}
            </template>

            <template v-slot:[`item.totalPrice`]="{ item }">
                ${{item.totalPrice.toFixed(2)|currency}}
            </template>

            <template v-slot:[`item.jvNum`]="{ item }">
                <div v-if="item.journal && item.journal.jvNum">{{item.journal.jvNum}}</div>
            </template>
            
            <template v-slot:[`item.edit`]="{ item }">
                <v-row>
                    <div style="width: 4.5rem">
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
                            v-if="item.status=='Complete'"
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
    </div>
</template>

<script>
import Vue from "vue";
import NewRecovery from './NewRecovery.vue'
import { ExportToCsv } from 'export-to-csv';


export default {
    components: {
        NewRecovery
    },
    name: "RecoveryTable",
    props: {
        recoveries: {}
    },
    data() {
        return {
            headers: [
                { text: "Recovery Branch", value: "branch", class: "blue-grey lighten-4" },
                { text: "Reference", value: "refNum", class: "blue-grey lighten-4" },
                { text: "Technician", value: "createUser", class: "blue-grey lighten-4" },
                { text: "Requestor", value: "requestor", class: "blue-grey lighten-4" },
                { text: "Department", value: "department", class: "blue-grey lighten-4" },
                { text: "Items", value: "recoveryItems", class: "blue-grey lighten-4" },
                // { text: "Quantity", value: "quantity", class: "blue-grey lighten-4" },
                { text: "Cost", value: "totalPrice", class: "blue-grey lighten-4" },
                { text: "Date Submitted", value: "submissionDate", class: "blue-grey lighten-4" },
                { text: "Status", value: "status", class: "blue-grey lighten-4" },
                { text: "JV #", value: "jvNum", class: "blue-grey lighten-4" },                
                { text: "", sortable: false, value: "edit", class: "blue-grey lighten-4", width: "1rem" }
            ],
            admin: false,
            itemCategoryList: {},
        };
    },
    mounted() {
        // this.admin = Vue.filter("isAdmin")();
        this.initItemCategory()
        // const dialogId = this.$store.state.preapproved.openDialogId;
        // const el = document.getElementById(dialogId);
        // if (el) {
        // this.$store.commit("preapproved/SET_OPEN_DIALOG_ID", "");
        // el.click();
        // }
    },
    methods: {
        updateTable() {
            this.$emit("updateTable");
        },
        initItemCategory() {
            this.itemCategoryList = {}
            const itemCategoryList = this.$store.state.recoveries.itemCategoryList
            for(const item of itemCategoryList){
                this.itemCategoryList[item.itemCatID]=item.category
            }
        },
        getRecoveryItems(recovery){
            const items= recovery.recoveryItems.map(rec => this.itemCategoryList[rec.itemCatID])
            return items.join(', ')
        },
        exportToExcel(){           

            const csvInfo = this.recoveries.map(rec =>{
                return {
                    branch: rec.branch?rec.branch:'',
                    refNum: rec.refNum?rec.refNum:'', 
                    createUser: rec.createUser?rec.createUser:'', 
                    requestor: (rec.firstName?rec.firstName + ' ':'')+ (rec.lastName?rec.lastName:''),
                    department: rec.department?rec.department:'',
                    recoveryItems: rec.recoveryItems?this.getRecoveryItems(rec):'',					
                    totalPrice: rec.totalPrice?'$'+rec.totalPrice:'',                   
                    submissionDate: rec.submissionDate?Vue.filter('beautifyDate')(rec.submissionDate):'',
                    status: rec.status? rec.status:'',
                    jvNum: (rec.journal && rec.journal.jvNum)?rec.journal.jvNum:''					
                }
            })
            const options = { 
                fieldSeparator: ',',
                quoteStrings: '"',
                decimalSeparator: '.',
                showLabels: true, 
                showTitle: false,
                title: '',
                filename: 'Recoveries',
                useTextFile: false,
                useBom: true,
                useKeysAsHeaders: false,
                headers: ['Recovery Branch', 'Reference', 'Technician', 'Requestor', 'Department', 'Items', 'Cost', 'Date Submitted', 'Status', 'JV #']
            };
            const csvExporter = new ExportToCsv(options);
            csvExporter.generateCsv(csvInfo);
        }

    }
};
</script>

<style scoped>
    ::v-deep(tbody tr:nth-of-type(even)) {
        background-color: rgba(0, 0, 0, 0.05);
    }
</style>
