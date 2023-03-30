<template>
    <v-container>		

        <h1>Departments</h1>

        <breadcrumbs />

        <div class="mt-2">
            <v-row class="mx-1">
                <v-btn		
                    class="my-4 ml-auto"					
                    color="primary"
                    @click="addDepartment()">
                    <div>Add Department</div>
                    <v-icon class="mx-0 px-0" color="white">mdi-plus</v-icon>
                </v-btn>
            </v-row>
            <v-card class="default px-3 py-3">
                <v-card-text>
                    <v-data-table
                        :items="departments"
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
                    <div class="text-h5">{{ action }} Department</div>
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
                        :key="updateGL" 
                        @input="codeFormat"
                        label="Coding" 
                        v-model="glCode"
                        :error="glCodeErr"                      
                        :rules="[rules.glcode]"
                        class="mt-2" 
                        outlined/>					

                </v-card-text>

                <v-card-actions>
                    <v-btn color="grey darken-5" @click="clearDepartmentData();departmentDialog = false"> Cancel </v-btn>
                    <v-btn class="ml-auto" color="green darken-1" @click="saveDepartment"> Save </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-container>
</template>

<script>
import Vue from 'vue';
import Breadcrumbs from "../../../components/Breadcrumbs.vue";
import { ADMIN_URL } from "../../../urls";
import axios from "axios";
// import { secureGet } from "@/store/jwt";
export default {
    name: "Departments",
    components: {
        Breadcrumbs
    },
    data: () => ({
        loadingData: false,
        departments: [],		
        
        department: '',
        glCode: '',
        contactName: '',
        contactEmail: '',

        departmentErr: false,
        glCodeErr: false,
        contactNameErr: false,
        contactEmailErr: false,

        currentItem: {},

        totalLength: 0,
        headers: [
            { text: "Department", 			value: "department"},
            { text: "Coding", 				value: "glCode"},
            { text: "Financial Contact",	value: "contactName"},			
            { text: "Email", 				value: "contactEmail"},
            { text: "", 			 value: "edit", width:'1rem'},
        ],
        page: 1,
        pageCount: 0,
        iteamsPerPage: 10,		
        departmentList: [],		
        employeeList: [],		
        departmentEmployeeList: [],
        departmentDialog: false,
        action: 'Add',
        updateGL: 0 ,
        rules:{ glcode : value => {                
                const pattern= /^[0-9]{3}-[0-9]{6}-[0-9]{4}-[0-9]{4}-[0-9]{5}$/
                return pattern.test(value) || 'Invalid Gl code.'		
            }
        }
    }),

    async mounted() {
        await this.updateTable()
    },

    methods: {
        async updateTable(){
            this.loadingData = true;
            await this.getDepartments();
            this.departmentList = this.$store.state.recoveries.departmentBranch;		
            this.employeeList = this.$store.state.recoveries.employees;
            this.loadingData = false;
        },

        async getDepartments(){
            return axios.get(`${ADMIN_URL}/department-info`)
            .then(resp => {  
                //console.log(resp.data)       
                this.departments = resp.data;              
            })
            .catch(e => {
                console.log(e);
            });
        },

        clearDepartmentData(){			
            this.department = "";
            this.glCode = null;
            this.contactName = "";
            this.contactEmail = "";
            this.departmentErr = false
            this.glCodeErr = false
            this.contactNameErr = false
            this.contactEmailErr = false
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
            this.glCode = value.glCode;
            this.contactName = value.contactName;
            this.contactEmail = value.contactEmail;
            this.action = 'Edit';
            Vue.nextTick(() => this.departmentDialog = true);
        },

        checkFields(){            
            this.glCodeErr = this.rules.glcode(this.glCode)==true ? false : true
            this.departmentErr = this.department ? false : true
            this.contactNameErr = this.contactName? false: true
            this.contactEmailErr = this.contactEmail? false: true
            
            if(this.departmentErr || this.contactNameErr || this.contactEmailErr || this.glCodeErr)
                return false
            else
                return true
        },

        saveDepartment(){
            if(this.checkFields()){
                this.departmentDialog = false
                const body = {
                    department: this.department,
                    glCode: this.glCode,				
                    contactName: this.contactName,
                    contactEmail: this.contactEmail,
                };                
                const id = this.currentItem?.departmentID? this.currentItem.departmentID: 0;
                return axios.post(`${ADMIN_URL}/department-info/${id}`, body)
                .then(async () => {
                    await this.updateTable()              
                })
                .catch(e => {
                    console.log(e);
                });
            }
        },

        loadEmailData(event){
            this.contactNameErr=false;
            this.contactEmail = this.departmentEmployeeList.filter(emp => emp.fullName == event)[0].email;
            this.contactEmailErr=false;
        },

        loadDepartmentData(event){
            this.departmentErr=false;
            this.departmentEmployeeList = this.employeeList.filter(emp => emp.department == event);
        },

        codeFormat(code) { //console.log(e)
            this.glCodeErr=false;
            // const code = this.glCode;
            // if(isNaN(Number(code.slice(-1))) && code.slice(-1) != '-'){
            // 	this.glCode = code.slice(0,-1)

            // } 
            if(code.length==4 && code.slice(-1)!='-' ){
                this.glCode = code.slice(0,3)+'-'+code.slice(-1);
            } else if(code.length==11 && code.slice(-1)!='-' ){
                this.glCode = code.slice(0,10)+'-'+code.slice(-1);
            } else if(code.length==16 && code.slice(-1)!='-' ){
                this.glCode = code.slice(0,15)+'-'+code.slice(-1);
            } else if(code.length==21 && code.slice(-1)!='-' ){
                this.glCode = code.slice(0,20)+'-'+code.slice(-1);
            }			
            
        }

    }
};
</script>