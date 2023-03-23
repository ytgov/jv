<template>
    <div style="width:100%;">
        <v-data-table dense :items-per-page="5" :headers="headers" :items="recoveries" class="elevation-1">
            <template v-slot:[`item.refNum`]="{ item }">
                <new-recovery
                    type="Complete"
                    maxWidth="85%"
                    title="Complete"
                    :btnTxt="item.refNum"
                    :recovery="item"                    
                />
            </template>
            <template v-slot:[`item.description`]="{ item }">
                {{getRecoveryItems(item)}}               
            </template>
            <template v-slot:[`item.totalPrice`]="{ item }">
                $ {{Number(item.totalPrice).toFixed(2) | currency}}
            </template>
        </v-data-table>
    </div>
</template>

<script>
import NewRecovery from '../RecoveryComponents/NewRecovery.vue'

export default { 
    components: {
        NewRecovery
    },
    name: "RecoverableTable",
    props: {        
        recoveries: {},      
    },
    data() {
        return {
            headers: [
                { text: "Recoverable", value: "refNum",      class: "grey lighten-4",  width: "25%" },                
                { text: "Description", value: "description", class: "grey lighten-4",  width: "55%" },
                { text: "Amount",      value: "totalPrice",  class: "grey lighten-4",  width: "20%" },                
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
    },
}
</script>