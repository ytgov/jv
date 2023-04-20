<template>
    <div class="mt-0 mx-6 mb-5">
        <v-dialog v-model="addNewRecoverableDialog" persistent max-width="80%">
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    small
                    elevation="5"                    
                    color="primary"
                    @click="initForm()"
                    v-bind="attrs"
                    v-on="on"                    
                    >Add to JV                    
                </v-btn>
            </template>

            <v-card>
                <v-card-title class="primary" style="border-bottom: 1px solid black">
                    <div class="text-h5">
                        Add Recoveries To Journal Voucher
                    </div>
                </v-card-title>           

                <v-card-text class="mt-5">
                    <v-data-table 
                        :headers="headers" 
                        :items="recoveries" 
                        :items-per-page="10"
                        v-model="selectedRecoveries"
                        item-key="recoveryID"
                        show-select
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
                        
                    </v-data-table>
                </v-card-text>
                <v-card-actions class="mt-0 mb-3">
                    <v-btn color="white" class="ml-5 cyan--text text--darken-4" @click="addNewRecoverableDialog=false">                    
                        <div>Cancel</div>
                    </v-btn>            
                    <v-btn
                        :disabled="selectedRecoveries.length==0"                    
                        class="ml-auto mr-5 px-5 white--text"
                        color="#005a65"
                        @click="modifyJournal()"
                        :loading="savingData"
                        >Save
                    </v-btn>            
                </v-card-actions>
            </v-card>
        </v-dialog>  
    </div>
</template>

<script>
import { RECOVERIES_URL} from "@/urls";
import axios from "axios";

export default {
    components: {
    },
    name: "EditRecoverableTable",
    props: {
        recoveries: {},
        journalID: {},
        existingRecoveries: {}, 
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
                { text: "Cost", value: "totalPrice", class: "blue-grey lighten-4" },
                { text: "DateSubmitted", value: "submissionDate", class: "blue-grey lighten-4" },                            
            ],
            selectedRecoveries: [],
            addNewRecoverableDialog: false,
            itemCategoryList: {},
            savingData: false,            
        };
    },
    mounted() {
        this.initItemCategory()
    },
    methods: {
        initForm(){
            this.savingData = false
            this.selectedRecoveries = []
            // console.log(this.existingRecoveries)
        },        

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

        modifyJournal(){ 
            this.savingData = true
            const allRecoveries = [...this.existingRecoveries, ...this.selectedRecoveries]
            const recoveryIDs = allRecoveries.map(rec => rec.recoveryID) 
            let recoveryCost = 0
            allRecoveries.forEach(rec => recoveryCost += Number(rec.totalPrice) )
            const body = {
                recoveryIDs: recoveryIDs,
                jvAmount: Number(recoveryCost.toFixed(2))
            }
            axios.post(`${RECOVERIES_URL}/recoverable/${this.journalID}`, body)
                .then(() => { 
                    this.savingData = false               
                    this.$emit("updateTable");
                    this.addNewRecoverableDialog = false
                })
                .catch(e => {
                    this.savingData = false                    
                    console.log(e);                    
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
