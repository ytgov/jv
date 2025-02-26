<template>
    <v-row class="mt-4 mb-1 mx-0" v-if="!loadingData">
        
        <v-data-table class="recovery-items" :headers="itemHeaders" :items="items" style="width:100% !important;" dense hide-default-footer>                                        
            <template v-slot:[`item.orderFilled`]="{ item }">
                <div v-if="item.orderFilled" class="checkmark">L </div>
            </template>                            

            <template v-slot:footer>
                <v-row class="mt-0 mx-0" style="font-weight:600; font-size:8pt;">
                    <div class="ml-auto mr-5">TOTAL</div><div class="mr-1">$ {{total.toFixed(2) | currency}}</div>
                </v-row>
            </template> 
            
        </v-data-table>
    </v-row>
</template>

<script>

export default { 
    components: {
    },
    name: "RecoveryItemsTablePdf",
    props: {        
        recoveryItems: {},      
    },
    data() {
        return {
            itemHeaders: [
                { text: "Item",         value: "itemCategory", class: "blue-grey lighten-4", sortable: false, width: "16%"},
                { text: "Description",  value: "description",  class: "blue-grey lighten-4", sortable: false, width: "22%"},
                { text: "Qty.",         value: "quantity",     class: "blue-grey lighten-4", sortable: false, width: "4%"},
                { text: "Unit Pr. $",   value: "unitPrice",    class: "blue-grey lighten-4", sortable: false, width: "8%"},
                { text: "Cost $",       value: "totalPrice",   class: "blue-grey lighten-4", sortable: false, width: "9%"},  
                { text: "Rev.Cost $",   value: "revisedCost",  class: "blue-grey lighten-4", sortable: false, width: "9%"},
                { text: "Filled",       value: "orderFilled",  class: "blue-grey lighten-4", sortable: false, width: "5%"},
                { text: "Filled By",    value: "filledBy",     class: "blue-grey lighten-4", sortable: false, width: "15%"},
                { text: "Client Change",value: "clientChange", class: "blue-grey lighten-4", sortable: false, width: "12%"},                             
            ],
            items: [],
            loadingData: false,
            total:0,
        };
    },
    mounted() {
        this.loadingData=true
        this.extractRecoveryItems()
        this.calculateTotalPrice()
        this.loadingData=false
    },
    computed: {        
    },
    methods: {

        extractRecoveryItems(){
            const activeItemCategoryList = this.$store.state.recoveries.itemCategoryList
            this.items = this.recoveryItems
            this.items.forEach(item =>{                
                const index = activeItemCategoryList.findIndex(category => category.itemCatID == item.itemCatID )
                if(index>-1)
                    item.itemCategory = activeItemCategoryList[index].category
            })            
        },

        calculateTotalPrice(){
            this.total = 0
            for(const item of this.recoveryItems){
                const total = Number(item.unitPrice) * item.quantity                
                item.unitPrice = Number(item.unitPrice).toFixed(2)
                item.revisedCost = total.toFixed(2)
                item.totalPrice = Number(item.totalPrice).toFixed(2)
                this.total += total
            }
        },
    },
}
</script>