<template>
    <v-container>		

        <h1>Items</h1>

        <breadcrumbs />
        <div class="mt-2">
            <v-row class="mx-1">
                <v-btn		
                    class="my-4 ml-auto"					
                    color="primary"
                    @click="addItem()">
                    <div>Add Item</div>
                    <v-icon class="mx-0 px-0" color="white">mdi-plus</v-icon>
                </v-btn>
            </v-row>
            <v-card class="default px-3 py-3">
                <v-card-text>
                    <v-data-table
                        :items="items"
                        :headers="headers"
                        :loading="loadingData"						
                        @click:row="editItem"
                        :footer-props="{
                            'items-per-page-options': [10, 30, 100]
                        }"
                        class="clickable-row">

                        <template v-slot:[`item.branch`]="{ item }">
                            {{ item.branch.replace(',', '/') }}
                        </template>

                        <template v-slot:[`item.price`]="{ item }">				
                            <span v-if="item.price">$ {{ Number(item.price).toFixed(2) | currency }}</span>
                        </template>

                        <template v-slot:[`item.edit`]>
                            <v-icon class="primary--text" style="cursor: pointer;">mdi-pencil</v-icon>
                        </template>


                    </v-data-table>
                </v-card-text>
            </v-card>
        </div>

        <v-dialog v-model="itemDialog" persistent max-width="800px">
            <v-card>
                <v-card-title class="primary" style="border-bottom: 1px solid black">
                    <div class="text-h5">{{ action }} Item</div>
                </v-card-title>

                <v-card-text>

                    <v-text-field 
                        label="Item Name" 
                        v-model="category" 
                        class="mt-5"
                        :error="categoryErr"
                        @input="categoryErr = false" 
                        outlined/>

                    <v-text-field 
                        label="Default Cost" 
                        v-model="price" 
                        class="mt-1"						
                        outlined prefix="$"/>		
                    
                    <v-row :style="{border:(branchErr? '1px solid red' : '0px solid')}">
                        <v-col v-for="(branchOption, branchInx) in branchOptions" :key="branchInx">							
                            <v-checkbox								
                                multiple
                                @change="branchErr=false"
                                dense								
                                v-model="branch" 
                                :value="branchOption"
                                :label="branchOption"/>
                        </v-col>
                    </v-row>

                </v-card-text>

                <v-card-actions>
                    <v-btn color="grey darken-5" @click="itemDialog = false"> Cancel </v-btn>
                    <v-btn class="ml-auto" color="green darken-1" @click="saveItem"> Save </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-container>
</template>

<script>
import Breadcrumbs from "../../../components/Breadcrumbs.vue";
import { ADMIN_URL } from "../../../urls";
import axios from "axios";
// import { secureGet } from "@/store/jwt";
export default {
    name: "Items",
    components: {
        Breadcrumbs
    },
    data: () => ({
        loadingData: false,
        items:[],
        branch: [],
        branchErr: false,
        categoryErr: false,				
        category: '',
        price: '',
        currentItem: {},
        totalLength: 0,
        headers: [
            { text: "Item Name", 	 value: "category"},			
            { text: "Branch",		 value: "branch"},
            { text: "Default Cost",  value: "price"},
            { text: "", 			 value: "edit", width:'1rem'},
        ],
        branchOptions: ['ITCS', 'CIM', 'SIS', 'eServices', 'DAS'],
        page: 1,
        pageCount: 0,
        iteamsPerPage: 10,		
        itemDialog: false,
        action: 'Add'
    }),
    async mounted() {
        await this.updateTable()
    },
    methods: {

        async updateTable(){
            this.loadingData = true;
            this.branchErr = false;
            this.categoryErr = false;
            await this.getItems();
            this.loadingData = false;
        },
        
        async getItems(){
            return axios.get(`${ADMIN_URL}/item-categories`)
            .then(resp => {  
                // console.log(resp.data)				
                this.items = resp.data;              
            })
            .catch(e => {
                console.log(e);
            });
        },

        clearItemData(){
            this.currentItem = {};            		
            this.branch = [];		
            this.category = "";
            this.price = "";
        },

        addItem() {
            this.clearItemData();
            this.action = 'Add';
            this.branchErr = false;
            this.categoryErr = false;
            this.itemDialog = true;
        },

        editItem(value) {
            this.currentItem = value
            this.branch = value.branch.split('/');		
            this.category = value.category;
            this.price = value.price;	
            this.action = 'Edit';
            this.branchErr = false;
            this.categoryErr = false;
            this.itemDialog = true;
        },

        checkFields(){
            this.branchErr = this.branch.length>0 ? false : true
            this.categoryErr = this.category? false: true
            if(this.branchErr || this.categoryErr)
                return false
            else
                return true
        },

        async saveItem(){
            if(this.checkFields()){
                this.itemDialog = false;
                const body = {
                    category: this.category,
                    branch: this.branch.join('/'),				
                    price: this.price,
                };                
                const id = this.currentItem?.itemCatID? this.currentItem.itemCatID: 0;
                return axios.post(`${ADMIN_URL}/item-categories/${id}`, body)
                .then(async () => {
                    await this.updateTable()              
                })
                .catch(e => {
                    console.log(e);
                });
            }
        }
        

    }
};
</script>