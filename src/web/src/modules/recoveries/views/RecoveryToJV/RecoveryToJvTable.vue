<template>
    <div class="mt-15 mx-10 mb-5">
        <v-row>
            <new-journal
                :readonly="selectedRecoveries.length==0"
                class="ml-auto mb-5 mr-4 mt-n10"                  
                :recoveries="recoveries" 
                @updateTable="updateTable"
            />
        </v-row>

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

            <!-- <template v-slot:[`item.jvNum`]="{ item }">
                {{item.journal}}
            </template> -->
            
        </v-data-table>
    </div>
</template>

<script>
import NewJournal from './NewJournal.vue'


export default {
    components: {
        NewJournal
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
                { text: "Technician", value: "createUser", class: "blue-grey lighten-4" },
                { text: "Requestor", value: "requestor", class: "blue-grey lighten-4" },
                { text: "Department", value: "department", class: "blue-grey lighten-4" },
                { text: "Items", value: "recoveryItems", class: "blue-grey lighten-4" },                
                { text: "Cost", value: "totalPrice", class: "blue-grey lighten-4" },
                { text: "DateSubmitted", value: "submissionDate", class: "blue-grey lighten-4" },
                { text: "Status", value: "status", class: "blue-grey lighten-4" },
                // { text: "JV #", value: "jvNum", class: "blue-grey lighten-4" },                                
            ],
            admin: false,
            selectedRecoveries: [],
            itemCategoryList: {},
        };
    },
    mounted() {
        this.initItemCategory()        
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

    }
};
</script>

<style scoped>
    ::v-deep(tbody tr:nth-of-type(even)) {
        background-color: rgba(0, 0, 0, 0.05);
    }
</style>
