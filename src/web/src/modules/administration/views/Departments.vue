<template>
    <div style="width:92%; margin:0 auto;">		

        <h1>Departmental Coding</h1>

        <breadcrumbs />

        <div class="mt-2">
            <v-row class="mx-1">
                <v-btn		
                    class="my-4 ml-auto"					
                    color="primary"
                    @click="addDepartment()">
                    <div>Add Departmental Coding</div>
                    <v-icon class="mx-0 px-0" color="white">mdi-plus</v-icon>
                </v-btn>
            </v-row>
            <v-card class="default px-3 py-3">
                <v-card-text>
                    <v-data-table
                        :items="departmentsCodingInfo"
                        :headers="headers"
                        :loading="loadingData"						
                        @click:row="editDepartment"
                        :footer-props="{
                            'items-per-page-options': [10, 30, 100]
                        }"
                        class="clickable-row">
                        <template v-slot:[`item.edit`]>
                            <v-icon class="primary--text" style="cursor: pointer;">mdi-pencil</v-icon>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>
        </div>

        <v-dialog v-model="departmentDialog" persistent max-width="800px">
            <v-card>
                <v-card-title class="primary" style="border-bottom: 1px solid black">
                    <div class="text-h5">{{ action }} Departmental Coding</div>
                </v-card-title>

                <v-card-text>
                    
                    <v-autocomplete 
                        label="Department" 
                        v-model="department" 
                        :items="Object.keys(departmentList)" 
                        class="mt-5"
                        :error="departmentErr"
                        @change="loadDepartmentData"						
                        outlined/>

                    <v-select
                        label="ICT Branch"
                        v-model="ictBranch"
                        :items="branchList"                                                
                        @change="branchChanged(true)"
                        outlined/>

                    <v-autocomplete
                        label="ICT Unit"                    
                        v-model="ictUnit"
                        :items="unitList"
                        item-text="name"                        
                        outlined/>    					

                    <v-autocomplete 
                        label="Financial Contact" 
                        v-model="contactName" 
                        :items="departmentEmployeeList" 
                        class="mt-2"
                        :error="contactNameErr"
                        @change="loadEmailData"
                        item-text="fullName"
                        outlined/>

                    <v-text-field 
                        label="Financial Contact Email" 
                        v-model="contactEmail"
                        :error="contactEmailErr"
                        @input="contactEmailErr=false"
                        class="mt-2" 
                        outlined/>
                    
                    <v-text-field                                                 
                        label="Receiving Department" 
                        v-model="recvDepartment"
                        :error="recvDeptErr"
                        class="mt-2"
                        outlined/>
                    <title-card class="mx-0" titleWidth="3.8rem" :smallTitle="true">
                        <template #title>
                            <div>Coding</div>
                        </template>
                        <template #body>
                            <v-row class="mx-0 mt-1" :key="updateGL">
                                <v-col cols="2">
                                    <v-text-field
                                        id="gl1"                            
                                        @input="codeFormat($event,1,3)"                                         
                                        v-model="glCodes[0]"
                                        :error="glCodesErr[0]"                      
                                        :rules="[rules.glcode1]"                                 
                                        outlined/>
                                </v-col>
                                <v-col cols="2">                            
                                    <v-text-field
                                        id="gl2"                         
                                        @input="codeFormat($event,2,6)"                                 
                                        v-model="glCodes[1]"
                                        :error="glCodesErr[1]"                      
                                        :rules="[rules.glcode2]"                                 
                                        outlined/>
                                </v-col>
                                <v-col cols="2">
                                    <v-text-field
                                        id="gl3"                        
                                        @input="codeFormat($event,3,4)"                                 
                                        v-model="glCodes[2]"
                                        :error="glCodesErr[2]"                      
                                        :rules="[rules.glcode3]"                                 
                                        outlined/>
                                </v-col>
                                <v-col cols="2">
                                    <v-text-field
                                        id="gl4"                         
                                        @input="codeFormat($event,4,4)"                                 
                                        v-model="glCodes[3]"
                                        :error="glCodesErr[3]"                      
                                        :rules="[rules.glcode4]"                                 
                                        outlined/>
                                        </v-col>
                                <v-col cols="2">
                                    <v-text-field
                                        id="gl5"                        
                                        @input="codeFormat($event,5,5)"                                 
                                        v-model="glCodes[4]"
                                        :error="glCodesErr[4]"                      
                                        :rules="[rules.glcode5]"                                 
                                        outlined/> 
                                </v-col> 
                            </v-row>
                        </template>
                    </title-card>			
                </v-card-text>
                <v-alert v-if="alertMsg" class="mt-5 mx-10" type="info" dismissible>{{ alertMsg }}</v-alert>
                <v-card-actions>					
                    <v-btn class="ml-3" color="secondary primary--text" @click="clearDepartmentData();departmentDialog = false"> Cancel </v-btn>
                    <v-btn class="mr-3 ml-auto px-6" color="primary" @click="saveDepartment"> Save </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </div>
</template>

<script>
import Vue from 'vue';
import Breadcrumbs from "../../../components/Breadcrumbs.vue";
import { ADMIN_URL } from "../../../urls";
import axios from "axios";
import TitleCard from "../../recoveries/views/Common/TitleCard.vue";
// import { secureGet } from "@/store/jwt";
export default {
    name: "Departments",
    components: {
        Breadcrumbs,
        TitleCard 
    },
    data: () => ({
        loadingData: false,
        departmentsCodingInfo: [],		
        
        department: '',        
        glCodes: [],        
        contactName: '',
        contactEmail: '',

        departmentErr: false,
        glCodesErr: [ false , false , false , false , false ],        
        contactNameErr: false,
        contactEmailErr: false,
        recvDeptErr: false,

        currentItem: {},

        totalLength: 0,
        headers: [
            { text: "Department", 			value: "department",     width:'18%'},
            { text: "ICT Branch",	        value: "ictBranch",      width:'8%'},			
            { text: "ICT Unit", 		    value: "ictUnit",        width:'14%'},
            { text: "Coding", 				value: "glCode",         width:'17%'},
            { text: "Receiving Department", value: "recvDepartment", width:'17%'},
            { text: "Financial Contact",	value: "contactName",    width:'11%'},			
            { text: "Email", 				value: "contactEmail",   width:'10%'},
            { text: "", 			        value: "edit",           width:'5%'},
        ],
        page: 1,
        pageCount: 0,
        iteamsPerPage: 10,		
        departmentList: [],
        branchList: [],
        unitList: [],	
        employeeList: [],		
        departmentEmployeeList: [],
        departmentDialog: false,
        ictBranch: '',
        ictUnit: '',
        recvDepartment: '',
        action: 'Add',
        updateGL: 0 ,
        alertMsg: '',
        rules:{ // const pattern= /^[0-9]{3}-[0-9]{6}-[0-9]{4}-[0-9]{4}-[0-9]{5}$/
            glcode1 : value => {
                    const pattern= /^[0-9]{1,3}$/
                    return pattern.test(value) || 'Invalid code.'
            },
            glcode2 : value => {                                
                const pattern= /^[0-9]{1,6}$/
                return pattern.test(value) || 'Invalid code.'		
            },
            glcode3 : value => {                                
                const pattern= /^[0-9]{1,4}$/
                return pattern.test(value) || 'Invalid code.'		
            },
            glcode4 : value => {                                
                const pattern= /^[0-9]{1,4}$/
                return pattern.test(value) || 'Invalid code.'		
            },
            glcode5 : value => {                                
                const pattern= /^[0-9]{1,5}$/
                return pattern.test(value) || 'Invalid code.'		
            },            
        }
    }),

    async mounted() {
        await this.updateTable()
    },

    methods: {
        async updateTable(){
            this.loadingData = true;
            await this.getDepartmentsCodingInfo();
            this.departmentList = this.$store.state.recoveries.departmentBranch;		
            this.employeeList = this.$store.state.recoveries.employees;
            this.branchList = Vue.filter("ictBranches")();
            this.loadingData = false;
        },

        async getDepartmentsCodingInfo(){
            return axios.get(`${ADMIN_URL}/department-info`)
            .then(resp => {  
                //console.log(resp.data)       
                this.departmentsCodingInfo = resp.data;              
            })
            .catch(e => {
                console.log(e);
            });
        },

        clearDepartmentData(){
            this.alertMsg = "";			
            this.department = "";  
            this.ictBranch = "";
            this.ictUnit = "";          
            this.glCodes = [];
            this.recvDepartment = "";
            this.contactName = "";
            this.contactEmail = "";
            this.departmentErr = false
            this.glCodesErr = [false , false , false , false , false]
            this.contactNameErr = false
            this.contactEmailErr = false
            this.recvDeptErr = false
            this.updateGL++
        },

        addDepartment() {
            this.currentItem = {};
            this.clearDepartmentData();
            this.action = 'Add';
            this.departmentDialog = true;
        },

        editDepartment(value) {		
            this.clearDepartmentData();
            this.currentItem = value			
            this.department = value.department;
            this.loadDepartmentData(value.department);
            this.glCodes = value.glCode.split('-');
            this.recvDepartment = value.recvDepartment;
            this.contactName = value.contactName;
            this.contactEmail = value.contactEmail;
            this.ictBranch = value.ictBranch;
            this.ictUnit = value.ictUnit;
            this.action = 'Edit';
            this.branchChanged();
            Vue.nextTick(() => this.departmentDialog = true);
        },

        checkFields(){            
            this.glCodesErr[0] = this.rules.glcode1(this.glCodes[0])==true ? false : true
            this.glCodesErr[1] = this.rules.glcode2(this.glCodes[1])==true ? false : true
            this.glCodesErr[2] = this.rules.glcode3(this.glCodes[2])==true ? false : true
            this.glCodesErr[3] = this.rules.glcode4(this.glCodes[3])==true ? false : true
            this.glCodesErr[4] = this.rules.glcode5(this.glCodes[4])==true ? false : true
            this.departmentErr = this.department ? false : true
            this.contactNameErr = this.contactName? false: true
            this.contactEmailErr = this.contactEmail? false: true
            this.updateGL++;

            if( this.departmentErr || 
                this.contactNameErr || 
                this.contactEmailErr || 
                this.glCodesErr[0] ||
                this.glCodesErr[1] ||
                this.glCodesErr[2] ||
                this.glCodesErr[3] ||
                this.glCodesErr[4])
                return false
            else
                return true
        },

        saveDepartment(){
            if(this.checkFields()){
                this.alertMsg = ""
                const glCode = this.glCodes.join('-')
                const body = {
                    department: this.department,
                    ictBranch: this.ictBranch,
                    ictUnit: this.ictUnit,
                    glCode: glCode,				
                    contactName: this.contactName,
                    contactEmail: this.contactEmail,
                    recvDepartment: this.recvDepartment,
                };                
                const id = this.currentItem?.departmentID? this.currentItem.departmentID: 0;
                return axios.post(`${ADMIN_URL}/department-info/${id}`, body)
                .then(async () => {
                    this.departmentDialog = false
                    await this.updateTable()              
                })
                .catch(e => {
                    console.log(e);
                    this.alertMsg = e.response.data;
                });
            }
        },

        loadEmailData(event){
            this.contactNameErr=false;
            this.contactEmail = this.departmentEmployeeList.filter(emp => emp.fullName == event)[0].email;
            this.contactEmailErr=false;
        },

        loadDepartmentData(selectedDept){
            this.departmentErr=false;
            this.departmentEmployeeList = this.employeeList.filter(emp => emp.department == selectedDept);
        },

        branchChanged(clearUnit){  
            if(clearUnit) this.ictUnit = ''
            this.unitList = []     
            if(this.ictBranch) {                
                const usrbranch = this.branchList.filter(branch => branch.value==this.ictBranch)[0]
				if(usrbranch)
					this.unitList = usrbranch.units                    
            }
        },

        codeFormat(code, id, len) { 
            //console.log(code)
            const noErr = this.rules[`glcode${id}`](code)            
            this.glCodesErr[id-1]=false;
            if(noErr==true && code.length==len && id<5)
                document.getElementById(`gl${id+1}`).focus();            
        }

    }
};
</script>