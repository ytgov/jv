<template>
    <div v-if="!loadingData" class="mt-5 mx-10 mb-5">
        <v-data-table :headers="headers" :items="recoveries" :items-per-page="10" class="elevation-1">
            <!-- eslint-disable-next-line vue/no-unused-vars -->
            <template v-slot:[`item.createDate`]="{ item }">
                <!-- eslint-disable-next-line vue/no-parsing-error -->
                {{ item.createDate | beautifyDate }}
            </template>

            <template v-slot:[`item.requestor`]="{ item }">
                {{item.firstName}} {{item.lastName}}
            </template>

            <template v-slot:[`item.recoveryItems`]="{ item }">
                {{getRecoveryItems(item)}}
            </template>
           
            
            <template v-slot:[`item.edit`]="{ item }">
                <v-row>
                    <div class="mr-5">                        
                        <new-recovery                            
                            type="Approve"
                            maxWidth="70%"
                            title="Approve and Update"
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
import NewRecovery from '../RecoveryComponents/NewRecovery.vue'


export default {
    components: {
        NewRecovery
    },
    name: "ApprovalRecoveryTable",
    props: {
        recoveries: {}
    },
    data() {
        return {
            headers: [
                { text: "Create Date", value: "createDate", class: "blue-grey lighten-4" },                
                { text: "Reference", value: "refNum", class: "blue-grey lighten-4" },
                { text: "Request",     value: "recoveryItems", class: "blue-grey lighten-4" },
                { text: "Requestee", value: "requestor", class: "blue-grey lighten-4" },
                { text: "Status",      value: "status", class: "blue-grey lighten-4" },
                { text: "", sortable: false, value: "edit", class: "blue-grey lighten-4", width: "1rem" }
            ],
            admin: false,
            itemCategoryList: {},
            loadingData: true,
        };
    },
    mounted() {
        // this.admin = Vue.filter("isAdmin")();
        this.loadingData = true;
        this.initItemCategory();
        Vue.nextTick(() => this.loadingData = false);        
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
