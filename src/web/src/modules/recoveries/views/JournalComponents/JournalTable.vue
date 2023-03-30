<template>
    <div class="mt-15 mx-10 mb-5">       

        <v-data-table 
            :headers="headers" 
            :items="journals" 
            :items-per-page="10"
            class="elevation-1">
            <!-- eslint-disable-next-line vue/no-unused-vars -->
            <template v-slot:[`item.submissionDate`]="{ item }">
                <!-- eslint-disable-next-line vue/no-parsing-error -->
                {{ item.submissionDate | beautifyDate }}
            </template>

            <template v-slot:[`item.jvAmount`]="{ item }">
                $ {{Number(item.jvAmount).toFixed(2) | currency}}
            </template>

            <template v-slot:[`item.refRecoveries`]="{ item }">
                {{getRefs(item)}}
            </template>

            <template v-slot:[`item.edit`]="{ item }">
                <v-row class="mx-0">                                        
                    <edit-journal
                        :allRecoveries="recoveries"
                        :journal="item"
                        @updateTable="updateTable"                                              
                        />                                      
                    <v-btn
                        v-if="item.status=='Draft'"                                    
                        @click="removeItem(item)"
                        style="min-width: 0"
                        color="transparent"
                        class="px-0 my-auto ml-2"
                        small>
                        <v-icon class="" color="red">mdi-delete</v-icon>
                    </v-btn>
                                
                </v-row>
             </template>            
        </v-data-table>

        <v-dialog v-model="deleteJournalDialog" persistent max-width="450px">
            <v-card>
                <v-card-title class="orange lighten-4" style="border-bottom: 1px solid black">
                    <div class="text-h4">Delete Journal</div>
                </v-card-title>

                <v-card-text>
                    <div class="my-5 text-h6">
                        Are you sure you like to delete Journal?                
                    </div>
                </v-card-text>

                <v-card-actions>
                    <v-btn color="grey darken-5" @click="deleteJournalDialog = false"> Cancel </v-btn>
                    <v-btn class="ml-auto" :loading="savingData" color="red darken-1 white--text" @click="confirmedRemoveItem()"> Confirm </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import EditJournal from './EditJournal.vue'
import { RECOVERIES_URL} from "@/urls";
import axios from "axios";

export default {
    components: {
        EditJournal
    },
    name: "JournalTable",
    props: {
        journals: {},
        recoveries: {}
    },
    data() {
        return {
            headers: [
                { text: "Date", value: "submissionDate", class: "blue-grey lighten-4" },
                { text: "JV Number", value: "jvNum", class: "blue-grey lighten-4" },
                { text: "Department", value: "department", class: "blue-grey lighten-4" },
                { text: "Period", value: "period", class: "blue-grey lighten-4" },
                { text: "Affiliated Recoveries", value: "refRecoveries", class: "blue-grey lighten-4" },
                { text: "Amount", value: "jvAmount", class: "blue-grey lighten-4" },                
                { text: "Status", value: "status", class: "blue-grey lighten-4" },
                { text: "", sortable: false, value: "edit", class: "blue-grey lighten-4", width: "6rem" }                             
            ],
            admin: false,
            deleteJournalDialog: false,
            currentItem: {},
            savingData: false
        };
    },
    mounted() {
       
    },
    methods: {
        updateTable() {
            this.$emit("updateTable");
        },

        getRefs(item){
            const refs = item.recoveries.map(recovery => recovery.refNum)
            return refs.join('/')
        },
        removeItem(item){
            this.currentItem = item
            this.deleteJournalDialog=true
        },
        confirmedRemoveItem(){
            this.savingData = true;

            const id= this.currentItem.journalID
            axios.delete(`${RECOVERIES_URL}/journals/${id}`)
                .then(() => {                    
                    this.savingData = false;                    
                    this.deleteJournalDialog=false
                    this.$emit("updateTable");
                })
                .catch(e => {
                    this.savingData = false;
                    console.log(e);
                    // this.alertMsg = e.response.data;
                    // this.alert = true;
                });
            
        }
    }
};
</script>

<style scoped>
    ::v-deep(tbody tr:nth-of-type(even)) {
        background-color: rgba(0, 0, 0, 0.05);
    }
</style>