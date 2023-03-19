<template>
  <div>
        <v-dialog v-model="addNewRecoveryDialog" persistent :max-width="maxWidth">
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    :elevation="type == 'Add New' ? '5' : '0'"
                    style="min-width: 0"                    
                    :color="type == 'Add New' ? 'primary' : 'transparent'"
                    @click="initForm()"
                    v-bind="attrs"
                    v-on="on">
                    <div v-if="type == 'Add New'">Create New Recovery</div>
                    <v-icon v-else dense color="primary">mdi-pencil</v-icon>
                </v-btn>
            </template>

        <v-card>
            <v-card-title class="primary" style="border-bottom: 1px solid black">
                <div class="text-h5">
                    {{title}} Recovery
                </div>
            </v-card-title>

            <v-card-text>
                <v-row class="mt-5 mx-0">
                    <v-col cols="6">
                        <v-autocomplete
                            :readonly="readonly"
                            @change="state.employeeNameErr = false;employeeChanged();"
                            :error="state.employeeNameErr"
                            :items="employeeList"
                            item-text="fullName"
                            item-value="fullName"
                            v-model="employeeName"
                            label="Requestor Name"
                            outlined
                        />                        
                    </v-col>
                    <v-col cols="6">
                        <v-select
                            :readonly="readonly"
                            :error="state.departmentErr"
                            @change="state.departmentErr=false;"
                            v-model="department"
                            :items="departmentList"
                            item-text="name"
                            label="Requestor Department"
                            outlined
                        />
                    </v-col>
                </v-row>

                <v-row class="mt-0 mx-0">
                    <v-col cols="6">
                        <v-text-field
                            :readonly="readonly"
                            :error="state.refNumErr"
                            @input="state.refNumErr = false"
                            v-model="refNum"
                            label="Reference"
                            persistent-hint
                            hint="Footprints Incident #, Project #"
                            outlined
                            :clearable="!readonly"
                        />
                    </v-col>
                </v-row>

                <v-row class="mt-0 mx-0">
                    <v-btn 
                        v-if="!readonly"                       
                        class="ml-auto mr-5"
                        color="primary"
                        @click="addRecoveryItem()"
                        small
                        >Add Item
                    </v-btn>
                </v-row>

                <v-row class="mt-5 mx-0">
                    <v-col cols="12">
                        <v-data-table :headers="itemHeaders" :items="recoveryItems" class="elevation-1" hide-default-footer>
                            <template v-slot:[`item.itemCategory`]="{ item }">
                                <v-autocomplete  
                                    dense                                   
                                    hide-details
                                    :error="item.state.itemCategoryErr"
                                    @change="item.state.itemCategoryErr=false;itemCategoryChanged(item)"
                                    :readonly="readonly"                                    
                                    :items="itemCategoryList"                                                           
                                    v-model="item.itemCatID"
                                    solo
                                />
                            </template>
                            <template v-slot:[`item.description`]="{ item }">
                                <v-text-field
                                    dense
                                    :error="item.state.descriptionErr"
                                    @input="item.state.descriptionErr=false;"
                                    hide-details
                                    :readonly="readonly"
                                    v-model="item.description"
                                    solo
                                />
                            </template>
                            <template v-slot:[`item.quantity`]="{ item }">
                                <v-text-field
                                    dense
                                    hide-details
                                    :readonly="type=='Fill' || type=='Complete'"
                                    :error="item.state.quantityErr"
                                    @input="item.state.quantityErr=false; calculateTotalPrice();"                                    
                                    v-model="item.quantity"
                                    solo
                                />
                            </template>
                            <template v-slot:[`item.unitPrice`]="{ item }">
                                <v-text-field
                                    dense
                                    hide-details
                                    :error="item.state.unitPriceErr"
                                    @input="item.state.unitPriceErr=false; calculateTotalPrice();"
                                    :readonly="readonly"
                                    v-model="item.unitPrice"
                                    prefix="$"
                                    solo
                                />
                            </template>
                            <template v-slot:[`item.totalPrice`]="{ item }">                               
                                <v-text-field
                                    dense 
                                    solo
                                    hide-details
                                    readonly
                                    v-model="item.totalPrice"                                    
                                    prefix="$"                                    
                                />
                            </template>

                            <template v-slot:[`item.revisedCost`]="{ item }">                               
                                <v-text-field
                                    dense 
                                    solo
                                    hide-details
                                    readonly
                                    v-model="item.revisedCost"                                    
                                    prefix="$"                                    
                                />
                            </template>

                            <template v-slot:[`item.clientChange`]="{ item }">
                                <v-text-field
                                    dense                                    
                                    hide-details  
                                    :readonly="type !='Approve'"                                  
                                    v-model="item.clientChange"
                                    solo
                                />
                            </template>

                            <template v-slot:[`item.orderFilled`]="{ item }">
                                <v-checkbox
                                    class="ml-4 mt-n1"
                                    dense
                                    @change="fillOrderChanged(item)"
                                    :readonly="type=='Complete'"                                    
                                    hide-details                                    
                                    v-model="item.orderFilled"
                                    solo
                                />
                            </template>

                            <template v-slot:[`item.filledBy`]="{ item }">
                                <v-text-field
                                    dense
                                    readonly                                    
                                    hide-details                                    
                                    v-model="item.filledBy"
                                    solo
                                />
                            </template>

                            <template v-slot:[`item.remove`]="{ item }">
                                <v-btn
                                    v-if="!readonly"                                    
                                    @click="removeItem(item)"
                                    style="min-width: 0"
                                    color="transparent"
                                    class="px-0 mt-0"
                                    small>
                                    <v-icon class="" color="red">mdi-delete</v-icon>
                                </v-btn>
                            </template>

                            <template v-slot:footer>
                                <v-row class="my-2 pb-2 mx-0" style="font-weight:600; font-size:13pt;">
                                    <div class="ml-auto mr-15">TOTAL</div><div style="width:8.5rem;">$ {{total.toFixed(2) | currency}}</div>
                                </v-row>
                            </template>
                            <template v-slot:no-data>
                                <div :class="state.recoveryItemsErr?'red white--text':''"> No data available</div>
                            </template>
                        </v-data-table>
                    </v-col>
                </v-row>

                <v-row class="mt-10 ml-3">
                    <title-card class="mr-6" titleWidth="4.5rem">
                        <template #title>
                            <div>Back-up</div>
                        </template>
                        <template #body>
                            <div style="width:10rem;min-height:2rem;" :key="update" class=" mx-4 blue--text text-h7 text-decoration-underline">
                                <a v-if="reader.result" :href="reader.result" download="UploadedFile.pdf" target="_blank">
                                    {{ quoteFileName }}
                                </a>
                                <div v-if="recovery" >
                                    <div v-for="doc,inx in recovery.docName" :key="inx" class="my-2">
                                        <a color="transparent" class="my-3" @click="downloadDocument(doc.docName)">                                    
                                            {{ doc.docName }}                                    
                                        </a> 
                                    </div>
                                </div>       
                            </div>
                        </template>
                    </title-card>
                    <v-btn v-if="uploadBtn" class="mx-0 my-auto" color="primary" elevation="5" @click="uploadDocument">
                        Upload Back-up
                        <input
                            id="inputfile"
                            type="file"
                            style="display: none"
                            accept="application/pdf,image/x-png,image/jpeg"
                            @change="handleSelectedFile"
                            onclick="this.value=null;"
                        />
                    </v-btn>

                    <v-btn v-if="!readonly" class="ml-auto mr-5 my-auto" color="primary" elevation="5" @click="saveNewRecovery('Routed For Approval')">
                        Route For Approval                        
                    </v-btn>

                    <v-btn v-if="revertBtn" class="ml-auto mr-5 my-auto" color="primary" elevation="5" @click="saveNewRecovery('Re-Draft')">
                        Revert to Draft                        
                    </v-btn>

                    <v-btn v-if="approveBtn" :class="(revertBtn?'ml-2 ':'ml-auto ')+'mr-5 my-auto'" color="primary" elevation="5" @click="saveNewRecovery('Purchase Approved')">
                        Approve Purchase                        
                    </v-btn>

                    <v-btn v-if="saveBtn" class="ml-auto mr-5 my-auto" color="primary" elevation="5" @click="saveNewRecovery(completeBtn?'Fullfilled':'Partially Fullfilled')">
                        Save Changes                        
                    </v-btn>
                    
                </v-row>

                <v-row class="mt-15 ml-3">
                    <v-data-table dense :items-per-page="5" :headers="auditHeaders" :items="recoveryAudits" class="elevation-1">
                        <template v-slot:[`item.date`]="{ item }">
                            {{item.date | getDate}}
                        </template>
                    </v-data-table>
                </v-row>

                <v-row class="mt-15 mx-3">
                    <v-alert v-model="alert" dense color="red darken-4" dark dismissible>
                        {{ alertMsg }}
                    </v-alert>
                </v-row>
                
            </v-card-text>

        <v-card-actions class="mt-0 mb-3">
            <v-btn color="white" class="ml-5 cyan--text text--darken-4" @click="closeDialog">
                <div v-if="readonly" class="px-3">Close</div>
                <div v-else>Cancel</div>
            </v-btn>            
            <v-btn
                v-if="!readonly"
                class="ml-auto mr-5 px-5 white--text"
                color="#005a65"
                @click="saveNewRecovery('Draft')"
                :loading="savingData"
                >Save
            </v-btn>
            <v-btn 
                v-if="saveBtn && completeBtn" 
                class="ml-auto mr-5 px-5 white--text" color="#005a65" 
                @click="saveNewRecovery('Complete')"
                > Complete Recoverable                        
            </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
   
  </div>
</template>

<script>
import Vue from "vue";
import { RECOVERIES_URL} from "@/urls";
import axios from "axios";
import TitleCard from '../Common/TitleCard.vue';

export default { 
    components: {  
        TitleCard     
    },
    name: "NewRecovery",
    props: {
        type: { type: String },
        title: { type: String},
        recovery: {},
        maxWidth: {}
    },
    data() {
        return {
            itemHeaders: [],
            itemHeadersWidth:[],             

            auditHeaders: [
                { text: "Date",   value: "date",   class: "grey lighten-4", cellClass: "px-1 py-1", width: "20%" },                
                { text: "Action", value: "action", class: "grey lighten-4", cellClass: "px-1 py-1", width: "40%" },
                { text: "User",   value: "user",   class: "grey lighten-4", cellClass: "px-1 py-1", width: "40%" },                
            ],

            admin: false,
            addNewRecoveryDialog: false,
            
            department: "",
            employeeName: "",
            refNum: '',
            recoveryItems: [],

            recoveryAudits: [],

            departmentList: [],
            employeeList: [],
            itemCategoryList: [],
            
            savingData: false,
            readonly: false,         
            tmpId: 0,

            revertBtn: false,
            approveBtn: false,
            saveBtn: false,
            uploadBtn: false,
            completeBtn: false,

            total: 0,

            reader: new FileReader(),
            quoteFileName: "",
            quoteFileType: "",
            update: 0,
            alert:false,
            alertMsg:'',

            state: {
                employeeNameErr: false,          
                refNumErr: false,
                departmentErr: false,
                recoveryItemsErr: false,          
            },
        };
    },
    mounted() {},

    methods: {

        initForm() {
            this.admin = Vue.filter("isAdmin")();  
            this.readonly = this.type != "Add New" && this.type != "Edit";
            this.approveBtn = this.type == "Approve";
            this.revertBtn = this.type == "Approve" && this.admin;
            this.saveBtn = this.type == "Fill";
            this.uploadBtn = this.type != "Approve" && this.type != "Complete"

            this.alert=false;
            this.initItemHeader();
            this.initStates();
            this.initEmployees();
            this.initDepartments();
            this.initItemCategory();
            if(this.type=="Add New"){
                this.department = ""
                this.employeeName = ""
                this.refNum = ''
                this.recoveryItems = []
                this.recoveryAudits = []
            }else{
                this.department = this.recovery.department;                                
                this.employeeName = this.recovery.firstName+'.'+this.recovery.lastName;
                this.refNum = this.recovery.refNum;
                this.recoveryItems = this.recovery.recoveryItems;
                this.recoveryAudits = this.recovery.recoveryAudits.sort((a,b)=>{ return (a.date > b.date ? -1 :1) });
                this.calculateTotalPrice()
            }
            
            this.savingData = false
            if(this.type=="Fill"){
                this.recoveryItems.forEach(item => {if(!item.quantity) item.orderFilled=true;})
            }
            this.checkOrderCompleted()
            this.update++;
        },

        initItemHeader(){
            const item =  { text: "Item",         value: "itemCategory", class: "blue-grey lighten-4", cellClass: "px-1 py-1", sortable: false};
            const desc =  { text: "Description",  value: "description",  class: "blue-grey lighten-4", cellClass: "px-1 py-1", sortable: false};
            const qnt =   { text: "Quantity",     value: "quantity",     class: "blue-grey lighten-4", cellClass: "px-1 py-1", sortable: false};
            const price = { text: "Unit Price",   value: "unitPrice",    class: "blue-grey lighten-4", cellClass: "px-1 py-1", sortable: false};
            const cost =  { text: "Cost",         value: "totalPrice",   class: "blue-grey lighten-4", cellClass: "px-1 py-1", sortable: false};  
            const rvCost= { text: "Revised Cost", value: "revisedCost",  class: "blue-grey lighten-4", cellClass: "px-1 py-1", sortable: false};
            const fill  = { text: "Filled",       value: "orderFilled",  class: "blue-grey lighten-4", cellClass: "px-1 py-1", sortable: false};
            const fillBy= { text: "Filled By",    value: "filledBy",     class: "blue-grey lighten-4", cellClass: "px-1 py-1", sortable: false};
            const change= { text: "Client Change",value: "clientChange", class: "blue-grey lighten-4", cellClass: "px-1 py-1", sortable: false};
            const remove= { text: "",             value: "remove",       class: "blue-grey lighten-4", cellClass: "px-1 py-1", sortable: false};
            
            if(this.type=='Add New' || this.type=='Edit'){
                this.itemHeadersWidth=[19,40,10,13,15,3];
                this.itemHeaders.push(item,desc,qnt,price,cost,remove);
            }
            if(this.type=='Approve'){
                this.itemHeadersWidth=[13,25,8,10,12,12,20];
                this.itemHeaders.push(item,desc,qnt,price,cost,rvCost,change);
            }
            if(this.type=='Fill'|| this.type=='Complete'){
                this.itemHeadersWidth=[11,22,7,9,9,9,4,14,15];
                this.itemHeaders.push(item,desc,qnt,price,cost,rvCost,fill,fillBy,change)
            }

            for(const inx in this.itemHeaders){
                this.itemHeaders[inx]['width']=this.itemHeadersWidth[inx]+'%'
            }            
        },

        initStates() {    
            for (const key of Object.keys(this.state)) {
                this.state[key] = false;
            }
        },

        initEmployees() {
            this.employeeList = this.$store.state.recoveries.employees.map(item => {
                return {
                    fullName: item.fullName,
                    department: item.department
                };//.sort((a, b) => (a.fullName >= b.fullName ? 1 : -1));
            });
        },

        initItemCategory() {
            this.itemCategoryList = this.$store.state.recoveries.itemCategoryList.map(item => {
                return { text: item.category,  value:item.itemCatID, price:item.price}
            })
        },

        initDepartments() {
            this.departmentList = [];
            const depts = this.$store.state.recoveries.departmentBranch;
            for (const key of Object.keys(depts)) {
                this.departmentList.push({ name: key });
            }
        },

        addRecoveryItem(){
            const recoveryItem = {
                tmpId: this.tmpId,
                itemCatID: null,
                description: '',
                quantity: 0,
                unitPrice: 0,
                totalPrice: '', 
                state: {
                    itemCategoryErr: false,
                    descriptionErr: false,
                    quantityErr: false,
                    unitPriceErr: false
                }
            }
            this.tmpId++;
            this.recoveryItems.push(recoveryItem)
            this.state.recoveryItemsErr=false;
        },

        calculateTotalPrice(){
            this.total = 0
            for(const item of this.recoveryItems){
                const total = Number(item.unitPrice) * item.quantity
                item.unitPrice = Number(item.unitPrice).toFixed(2)
                if(this.type=='Add New' || this.type=='Edit')
                    item.totalPrice = total.toFixed(2)//Vue.filter('currency')();
                else{
                    item.revisedCost = total.toFixed(2)
                    item.totalPrice = Number(item.totalPrice).toFixed(2)
                }
                    
                this.total += total
            }
        },

        itemCategoryChanged(item){
            const category = this.itemCategoryList.filter(cat => cat.value==item.itemCatID)[0]
            item.unitPrice = category? category.price : 0
            this.calculateTotalPrice()
        },

        employeeChanged() {
            if (this.employeeName) {                
                const employee= this.employeeList.filter(employee => employee.fullName == this.employeeName)[0]
                this.state.departmentErr = false
                this.department =employee? employee.department :''                    
            }            
        }, 
        
        fillOrderChanged(item){
            if(item.orderFilled){
                item.filledBy = this.$store.state.auth.user?.data?.display_name
            }
            this.checkOrderCompleted()
        },

        checkOrderCompleted(){
            this.completeBtn = true
            for(const item of this.recoveryItems){
                if(!item.orderFilled){
                    this.completeBtn = false;
                    return
                }
            }
        },

        checkFields() {
            if (this.reader.result && this.quoteFileType != "application/pdf") {
                this.alertMsg = "Please upload the Quote PDF file.";
                this.alert=true;
                return false;
            }

            if(this.type=='Add New' || this.type=='Edit'){
                this.state.employeeNameErr = this.employeeName? false : true;          
                this.state.refNumErr = this.refNum? false : true;
                this.state.departmentErr = this.department? false : true;
                this.state.recoveryItemsErr = this.recoveryItems.length>0? false : true;

                let itemErr=false
                for(const item of this.recoveryItems){ 
                    item.state.itemCategoryErr = item.itemCatID? false : true;
                    item.state.descriptionErr = item.description? false : true;
                    item.state.quantityErr = item.quantity? false : true;
                    item.state.unitPriceErr = item.unitPrice? false : true;
                    if(item.state.itemCategoryErr || 
                        item.state.descriptionErr ||
                        item.state.unitPriceErr   ||
                        item.state.quantityErr    
                    )itemErr=true
                }
                if(itemErr) return false      

                for (const key of Object.keys(this.state)) {
                    if (this.state[key]) return false;
                }
            }            
            return true;
        },

        saveNewRecovery(status) {
            if (this.checkFields()) {
                this.alert = false;
                this.savingData = true;
                const name = this.employeeName.split('.')
                let body = {}
                if(status == 'Draft' ||  status == 'Routed For Approval'){
                    body = {
                        firstName: name[0],
                        lastName: name[1],
                        department: this.department,
                        branch: '',
                        refNum: this.refNum,
                        recoveryItems: this.recoveryItems,
                        status: status,
                        action: this.getActionType(status)          
                    };
                }else{
                    body = {
                        recoveryItems: this.recoveryItems,
                        status: status,
                        action: this.getActionType(status)          
                    };
                }
                // console.log(body);
                const id = this.recovery?.recoveryID ? this.recovery.recoveryID : 0;
                axios.post(`${RECOVERIES_URL}/${id}`, body)
                .then(async (resp) => {
                    if (this.reader.result) await this.saveBackUPFile(resp.data.recoveryID)
                    this.savingData = false;                    
                    this.closeDialog()
                })
                .catch(e => {
                    this.savingData = false;
                    console.log(e);
                    this.alertMsg = e.response.data;
                    this.alert = true;
                });
            }
        },
        
        async saveBackUPFile(recoveryID) {
            this.alert = false;
            const data = {
                docName: this.quoteFileName,            
            };
            const bodyFormData = new FormData();
            bodyFormData.append("file", this.reader.result);
            bodyFormData.append("data", JSON.stringify(data));

            const header = {
                responseType: "application/pdf",
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            };

            return await axios.post(`${RECOVERIES_URL}/backup-documents/${recoveryID}`, bodyFormData, header)
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

        removeItem(item) {
            this.recoveryItems = this.recoveryItems.filter(
                recoveryItem => !(recoveryItem.tmpId == item.tmpId)
            );
            this.calculateTotalPrice()
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

                this.quoteFileType = file.type;
                this.quoteFileName = file.name;

                this.reader.onload = () => {
                    this.update++;
                };
                this.reader.readAsDataURL(file);
            }
        },

        downloadDocument(docName){
            if(!this.recovery.recoveryID) return

            this.savingData = true;
            const header = {
                responseType: "application/pdf",
                headers: {
                "Content-Type": "application/text"
                }
            };

            axios.get(`${RECOVERIES_URL}/backup-documents/${this.recovery.recoveryID}/${docName}`, header)
                .then(res => {
                    this.savingData = false;
                    const link = document.createElement("a");
                    link.href = res.data;
                    document.body.appendChild(link);
                    link.download = this.quoteFileName ? this.quoteFileName : "doc.pdf";
                    link.click();
                    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
                })
                .catch(e => {
                    this.savingData = false;
                    console.log(e);
                });            
        },

        getActionType(status){
            if(status=='Routed For Approval') return 'Routed For Approval'
            if(status=='Re-Draft') return 'Revert to Draft'
            if(status=='Purchase Approved') return 'Purchase Approved'
            if(status=='Partially Fullfilled') return 'Partially Filled Items'
            if(status=='Fullfilled') return 'Filled Items'
            if(status=='Complete') return 'Completed Request'
            if(this.type=='Add New' && status=='Draft') return 'Draft'
            if(this.type=='Edit' && status=='Draft') return 'Updated Request'
        },

        closeDialog(){
            this.addNewRecoveryDialog = false;
            this.$emit("updateTable");
        },
    }
  
};
</script>

<style scoped>
.v-text-field--solo.error--text{
    background: red;
    border: 1px solid red;
}
/* 
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
} */
</style>
