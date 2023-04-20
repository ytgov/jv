<template>
    <div style="width:100%;">
        <v-data-table dense :items-per-page="5" :headers="headers" :items="recoveries" class="elevation-1">
            <template v-slot:[`item.refNum`]="{ item }">
                <new-recovery
                    type="Complete"
                    maxWidth="85%"
                    title="Complete"
                    :btnTxt="item.refNum? item.refNum :'View Recovery'"
                    :recovery="item"                    
                />
            </template>
            <template v-slot:[`item.description`]="{ item }">
                {{getRecoveryItems(item)}}               
            </template>
            <template v-slot:[`item.totalPrice`]="{ item }">
                $ {{Number(item.totalPrice).toFixed(2) | currency}}
            </template>
            <template v-slot:[`item.edit`]="{ item }">
                <v-row class="mx-0">                                                                                         
                    <v-btn
                        v-if="status=='Draft' && !readonly"                                    
                        @click="removeItem(item)"
                        style="min-width: 0"
                        color="transparent"
                        class="px-0 my-auto"
                        elevation="0"
                        small>
                        <v-icon class="" color="red">mdi-delete</v-icon>
                    </v-btn>
                                
                </v-row>
             </template>    
        </v-data-table>
    </div>
</template>

<script>
import NewRecovery from '../RecoveryComponents/NewRecovery.vue'
import { RECOVERIES_URL} from "@/urls";
import axios from "axios";

export default { 
    components: {
        NewRecovery
    },
    name: "RecoverableTable",
    props: {        
        recoveries: {},
        status: {type:String},
        journalID: {},
        readonly: {type: Boolean}      
    },
    data() {
        return {
            headers: [
                { text: "Recoverable", value: "refNum",      class: "grey lighten-4",  width: "25%" },                
                { text: "Description", value: "description", class: "grey lighten-4",  width: "50%" },
                { text: "Amount",      value: "totalPrice",  class: "grey lighten-4",  width: "20%" },
                { text: "", sortable: false, value: "edit",  class: "grey lighten-4",  width: "5%" }                 
            ],    
            itemCategoryList: {},
        };
    },
    mounted() {
        this.initItemCategory()
    },
    methods: {
        initItemCategory() {
            this.itemCategoryList = {}
            const itemCategoryList = this.$store.state.recoveries.itemCategoryList
            for(const item of itemCategoryList){
                this.itemCategoryList[item.itemCatID]=item.category
            }
        },
        getRecoveryItems(recovery){
            // console.log(recovery)
            const items= recovery.recoveryItems.map(rec => this.itemCategoryList[rec.itemCatID])
            return items.join(', ')
        },

        removeItem(item){
            const recoveries = this.recoveries.filter(rec => rec.recoveryID != item.recoveryID)
            const recoveryIDs = recoveries.map(rec => rec.recoveryID)          
            let recoveryCost = 0
            
            recoveries.forEach(rec => recoveryCost += Number(rec.totalPrice) )
            const body = {
                recoveryIDs: recoveryIDs,
                jvAmount: recoveryCost
            }
            axios.post(`${RECOVERIES_URL}/recoverable/${this.journalID}`, body)
                .then(() => {                    
                    this.$emit("updateTable");                    
                })
                .catch(e => {                    
                    console.log(e);                    
                });            
        },
    },
}
</script>