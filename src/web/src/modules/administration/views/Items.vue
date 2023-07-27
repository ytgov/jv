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

                        <template v-slot:[`item.active`]="{ item }">
                            <v-icon v-if="item.active" class="success--text">mdi-check</v-icon>
                            <v-icon v-else color="red">mdi-close</v-icon>
                        </template>

                        <template v-slot:[`item.branch`]="{ item }">
                            {{ item.branch.replace(',', '/') }}
                        </template>

                        <template v-slot:[`item.price`]="{ item }">				
                            <span v-if="item.price">$ {{ Number(item.price).toFixed(2) | currency }}</span>
                        </template>

                        <template v-slot:[`item.changeQuantity`]="{ item }">
                            <v-icon v-if="item.changeQuantity" class="warning--text">mdi-check</v-icon>                            
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
                    <v-switch
                        v-model="active"
                        label="Active"
                        color="primary"
                        />
                    <v-checkbox 
                        label="Can Change Quantity"
                        v-model="changeQuantity"
                        />
                    
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
                        
                    <v-text-field 
                        label="Default Description" 
                        v-model="description" 
                        class="mt-1"						
                        outlined/>
                    
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

                    <v-row class="mt-10 ml-3">                      
                        <title-card class="mr-6" titleWidth="6.85rem">
                            <template #title>
                                <div>Documents</div>
                            </template>
                            <template #body>
                                <div style="width:15rem; min-height:2rem;" :key="update" class=" mx-4 blue--text text-h7 text-decoration-underline">
                                    <div v-if="allUploadingDocuments.length>0">
                                        <div v-for="doc,inx in allUploadingDocuments" :key="inx" class="my-1"> 
                                            <a :href="doc.file" :download="doc.name" target="_blank" style="color:#643f5d;">
                                                {{ doc.name }}
                                            </a>
                                        </div>
                                    </div>
                                    <div v-if="backupFiles" >
                                        <div v-for="doc,inx in backupFiles" :key="inx" class="my-1">
                                            <a color="transparent" class="my-3" @click="downloadDocument(doc.docName)">                                    
                                                <b>{{ doc.docName }}</b>                                    
                                            </a> 
                                        </div>
                                    </div>       
                                </div>
                            </template>
                        </title-card>
                        <v-col >
                            <div>
                                <v-btn class="mx-0 my-0" color="primary" elevation="5" @click="uploadDocument">
                                    Upload File
                                    <input
                                        id="inputfile"
                                        type="file"
                                        style="display: none"
                                        accept="application/pdf"
                                        @change="handleSelectedFile"
                                        onclick="this.value=null;"/>
                                </v-btn>
                            </div>
                            <div>
                                <v-btn v-if="allUploadingDocuments.length>0" class="mx-0 mt-5 cyan--text text--darken-2" color="secondary"  @click="allUploadingDocuments=[]">
                                    Clear Uploaded File(s)
                                </v-btn>
                            </div>
                        </v-col>
                    </v-row>

                    <v-row class="mt-15 ml-3">
                        <v-data-table dense :page="page" :items-per-page="5" :headers="auditHeaders" :items="itemAudits" class="elevation-1">
                            <template v-slot:[`item.date`]="{ item }">
                                {{item.date | getDate}}
                            </template>
                            <template v-slot:[`item.action`]="{ item }">
                                <div style="white-space: pre;">{{item.action}}</div>
                            </template>
                        </v-data-table>
                    </v-row>

                </v-card-text>

                <v-card-actions>
                    <v-btn class="ml-3" color="secondary primary--text" @click="itemDialog = false"> Cancel </v-btn>
                    <v-btn class="mr-3 ml-auto px-6" color="primary" @click="saveItem"> Save </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-container>
</template>

<script>
import Breadcrumbs from "../../../components/Breadcrumbs.vue";
import TitleCard from '../../recoveries/views/Common/TitleCard.vue';
import { ADMIN_URL } from "../../../urls";
import axios from "axios";
// import { secureGet } from "@/store/jwt";
export default {
    name: "Items",
    components: {
        Breadcrumbs,
        TitleCard
    },
    data: () => ({
        loadingData: false,
        items:[],
        branch: [],
        branchErr: false,
        categoryErr: false,		
        active: true,		
        category: '',
        changeQuantity: false,
        price: '',
        description: '',
        currentItem: {},
        totalLength: 0,
        headers: [
            { text: "Active", 	            value: "active"},	    
            { text: "Item Name", 	        value: "category"},			
            { text: "Branch",		        value: "branch"},
            { text: "Default Cost",         value: "price"},
            { text: "Change Quantity",      value: "changeQuantity"},
            { text: "Default Description",  value: "description"},
            { text: "", 			        value: "edit", width:'1rem'},
        ],
        branchOptions: ['ITCS', 'CIM', 'SIS', 'eServices', 'DAS'],

        auditHeaders: [
            { text: "Date",   value: "date",   class: "grey lighten-4", cellClass: "px-1 py-1", width: "20%" },                
            { text: "Action", value: "action", class: "grey lighten-4", cellClass: "px-1 py-1", width: "40%" },
            { text: "User",   value: "user",   class: "grey lighten-4", cellClass: "px-1 py-1", width: "40%" },                
        ],

        allUploadingDocuments: [],
        itemAudits: [],
        backupFiles: [],
        update: 0,
        reader: new FileReader(),
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
            this.changeQuantity = false;
            this.description = "";
            this.price = "";
            this.active = true;
            this.itemAudits = [];
            this.backupFiles = []; 
            this.allUploadingDocuments = [];
        },

        addItem() {
            this.clearItemData();
            this.action = 'Add';
            this.branchErr = false;
            this.categoryErr = false;
            this.itemDialog = true;
        },

        editItem(value) {
            this.page--;
            this.currentItem = value
            this.branch = value.branch.split('/');		
            this.category = value.category;
            this.active = value.active;
            this.price = value.price;
            this.changeQuantity = value.changeQuantity;	
            this.description = value.description;
            this.backupFiles = value.docName? value.docName: [];
            this.allUploadingDocuments = [];
            this.itemAudits = value.itemCategoryAudits?value.itemCategoryAudits.sort((a,b)=>{ return (a.date > b.date ? -1 :1) }):[];
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
                    description: this.description,
                    changeQuantity: this.changeQuantity,
                    active: this.active,
                    action: this.getActionDescription()
                };                
                const id = this.currentItem?.itemCatID? this.currentItem.itemCatID: 0;
                return axios.post(`${ADMIN_URL}/item-categories/${id}`, body)
                .then(async (resp) => {
                    if (this.reader.result) await this.saveBackUPFile(resp.data.itemCatID)                    
                    await this.updateTable()              
                })
                .catch(e => {
                    console.log(e);
                });
            }
        },

        async saveBackUPFile(itemCatID) {
            this.alert = false;
            const docNames = []
            const bodyFormData = new FormData();

            for(const doc of this.allUploadingDocuments){
                bodyFormData.append("files", doc.file);
                docNames.push(doc.name)
            }

            const data = {
                docNames: docNames,  
            };
            bodyFormData.append("data", JSON.stringify(data));

            const header = {
                responseType: "application/pdf",
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            };

            return await axios.post(`${ADMIN_URL}/item-category-documents/${itemCatID}`, bodyFormData, header)
                .then(() => {
                    this.savingData = false;                    
                })
                .catch(e => {
                    this.savingData = false;
                    console.log(e.response.data);
                    this.alertMsg = e.response.data;
                    this.alert = true;
                });      
        },

        uploadDocument() { 
            this.alert=false;           
            const el = document.getElementById("inputfile");
            if (el) el.click();
        },

        handleSelectedFile(event) {
            event.preventDefault();
            event.stopPropagation();

            if (event.target.files && event.target.files[0]) {
                const file = event.target.files[0];

                // this.quoteFileType = file.type;
                // this.quoteFileName = file.name;

                this.reader.onload = () => {
                    this.allUploadingDocuments.push({file: this.reader.result, name: file.name, type: file.type})                    
                    this.update++;
                };
                this.reader.readAsDataURL(file);
            }
        },

        downloadDocument(docName){
            if(!this.currentItem.itemCatID) return

            this.savingData = true;
            const header = {
                responseType: "application/pdf",
                headers: {
                "Content-Type": "application/text"
                }
            };

            axios.get(`${ADMIN_URL}/item-category-documents/${this.currentItem.itemCatID}/${docName}`, header)
                .then(res => {
                    this.savingData = false;
                    const link = document.createElement("a");
                    link.href = res.data;
                    document.body.appendChild(link);
                    link.download = docName;
                    link.click();
                    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
                })
                .catch(e => {
                    this.savingData = false;
                    console.log(e);
                });            
        },

        getActionDescription(){
            if(this.action=='Add') 
                return 'New item added.'
            else{
                let action="Item modified."
                if(this.currentItem.category != this.category) 
                    action += `\nChanging name from ${this.currentItem.category} to ${this.category};`
                if(this.currentItem.price != this.price){
                    const price = this.price? this.price : 0
                    action += `\nChanging cost from ${this.currentItem.price} to ${price};`
                }
                if(this.currentItem.active != this.active){
                    const status = this.active? 'Active': 'Inactive'
                    action += `\nChanging status to ${status};`
                }

                const branch = this.currentItem.branch.split('/');
                if(this.branch.length != branch.length)
                    action += `\nChanging branches;`                
                
                return action  
            }
        },        

    }
};
</script>