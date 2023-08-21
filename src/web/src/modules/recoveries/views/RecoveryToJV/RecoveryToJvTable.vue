<template>
    <div class="mt-15 mx-10 mb-5">
        <v-row>
            <v-col cols="4">
                <v-autocomplete
                    dense 
                    label="Search by Department" 
                    v-model="firstSelectionDept"
                    item-text="name" 
                    :items="departmentList"
                    :error="searchErr"
                    @input="searchErr = false"
                    clearable 
                    class="mt-n7"
                    @change="loadRecoveryData"						
                    outlined/>	
            </v-col>
            <v-col cols="6" />
            <v-col cols="2">
                <new-journal
                    :readonly="selectedRecoveries.length==0"
                    class="mb-5 mt-n10"                  
                    :recoveries="selectedRecoveries" 
                    @updateTable="updateTable"
                />
            </v-col>
        </v-row>

        <v-data-table 
            :headers="headers" 
            :items="filteredRecoveries" 
            :items-per-page="10"
            v-model="selectedRecoveries"
            item-key="recoveryID"
            show-select
            @item-selected="applySameDeptSelection"
            @toggle-select-all="applyAllSameDeptSelection"
            class="elevation-1">
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
            <!-- <template v-slot:[`item.jvNum`]="{ item }">
                {{item.journal}}
            </template> -->

            <template v-slot:[`item.edit`]="{ item }">
                <v-row>
                    <div style="width: 3.5rem">                        
                        <new-recovery
                            v-if="item.status=='Complete'"
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
    </div>
</template>

<script>
import Vue from "vue";
import NewJournal from './NewJournal.vue'
import NewRecovery from '../RecoveryComponents/NewRecovery.vue'

export default {
    components: {
        NewJournal,
        NewRecovery
    },
    name: "RecoveryToJvTable",
    props: {
        recoveries: {}
    },
    data() {
        return {
            headers: [
                { text: "Recovery Branch", value: "branch", class: "blue-grey lighten-4" },
                { text: "Reference", value: "refNum", class: "blue-grey lighten-4" },
                { text: "Agent", value: "createUser", class: "blue-grey lighten-4" },
                { text: "Requestor", value: "requestor", class: "blue-grey lighten-4" },
                { text: "Department", value: "department", class: "blue-grey lighten-4" },
                { text: "Items", value: "recoveryItems", class: "blue-grey lighten-4" },                
                { text: "Cost", value: "totalPrice", class: "blue-grey lighten-4" },
                { text: "DateSubmitted", value: "submissionDate", class: "blue-grey lighten-4" },
                { text: "Gl Code", value: "glCode", class: "blue-grey lighten-4" },
                { text: "Status", value: "status", class: "blue-grey lighten-4" },
                // { text: "JV #", value: "jvNum", class: "blue-grey lighten-4" }, 
                { text: "", sortable: false, value: "edit", class: "blue-grey lighten-4", width: "3.5rem" },                               
            ],
            admin: false,
            selectedRecoveries: [],
            firstSelectionDept: "",
            itemCategoryList: {},
            department: "",
            searchErr: false,
            departmentList: [],
            filteredRecoveries: []
        };
    },
    mounted() {
        this.searchErr= false
        this.initItemCategory() 
        this.initDepartments() 
        this.loadRecoveryData()
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
        initDepartments() {
            this.departmentList = [];
            const depts = this.$store.state.recoveries.departmentBranch;
            for (const key of Object.keys(depts)) {
                this.departmentList.push({ name: key });
            }
        },
        loadRecoveryData(){
            if(this.firstSelectionDept)
                this.filteredRecoveries = this.recoveries.filter(rec => rec.department==this.firstSelectionDept)
            else{
                this.filteredRecoveries = this.recoveries
                this.selectedRecoveries = [];
            }
        },
        applySameDeptSelection(selection) {
            this.searchErr= false
            Vue.nextTick(() => {
                if (this.selectedRecoveries.length == 1) {
                    this.firstSelectionDept = this.selectedRecoveries[0].department;
                } else if (this.selectedRecoveries.length == 0) {
                    this.firstSelectionDept = "";
                }

                if (selection.value == true && selection.item.department != this.firstSelectionDept) {
                    this.selectedRecoveries = this.selectedRecoveries.filter(req => req.recoveryID != selection.item.recoveryID);
                }
                this.loadRecoveryData()
            });
        },
        applyAllSameDeptSelection(selection) {
            // console.log(selection);
            const dept = this.filteredRecoveries[0]?.department
            let sameDepartment = dept? true : false
            this.filteredRecoveries.forEach(rec => {if(rec.department!=dept) sameDepartment = false;})
            if(sameDepartment) this.firstSelectionDept = dept
            
            Vue.nextTick(() => {
                if (selection.value == true && !this.firstSelectionDept) this.searchErr = true;

                if (selection.value == true && this.firstSelectionDept) {
                    this.selectedRecoveries = this.selectedRecoveries.filter(req => req.department == this.firstSelectionDept);
                } else {
                    this.selectedRecoveries = [];
                    this.firstSelectionDept = "";
                }
                this.loadRecoveryData()
            });
        },

    }
};
</script>

<style scoped>
    ::v-deep(tbody tr:nth-of-type(even)) {
        background-color: rgba(0, 0, 0, 0.05);
    }
</style>
