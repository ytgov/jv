<template>
	<v-container>		

		<h1>Departments</h1>

		<Breadcrumbs />
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
					
					<v-select label="Department" v-model="dept" :items="Object.keys(departmentList)" class="mt-5"
						@change="loadDepartmentData"						
						outlined/>						

					<v-select label="Financial Contact" v-model="financialContact" :items="departmentEmployeeList" class="mt-2"
						@change="loadEmailData"
						item-text="fullName"
						outlined/>

					<v-text-field label="Financial Contact Email" v-model="email" class="mt-2" outlined/>

					<v-text-field @keyup="codeFormat" label="Coding" v-model="glCode" class="mt-2" outlined/>					

				</v-card-text>

				<v-card-actions>
					<v-btn color="grey darken-5" @click="departmentDialog = false"> Cancel </v-btn>
					<v-btn class="ml-auto" color="green darken-1" @click="saveDepartment"> Save </v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

	</v-container>
</template>

<script>
import Breadcrumbs from "../../../components/Breadcrumbs.vue";
import { GL_CODE_URL } from "../../../urls";
import { mapActions } from "vuex";
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
		dept: '',
		glCode: '',
		financialContact: {
			firstName: "", 
			lastName: "", 
			department: "", 
			fullName: "", 
			email: ""
		},
		email: '',
		totalLength: 0,
		headers: [
			{ text: "Department", 			value: "dept"},
			{ text: "Coding", 				value: "glCode"},
			{ text: "Financial Contact",	value: "financialContact"},			
			{ text: "Email", 				value: "email"}
		],
		page: 1,
		pageCount: 0,
		iteamsPerPage: 10,		
		departmentList: [],		
		employeeList: [],		
		departmentEmployeeList: [],
		departmentDialog: false,
		action: 'Add'		
	}),
	async mounted() {
		this.loadingData = true;	
        
        await this.getDepartments();
		this.departmentList = this.$store.state.recoveries.departmentBranch;		
		this.employeeList = this.$store.state.recoveries.employees;
		console.log(this.departmentList)
		console.log(this.employeeList)

        this.loadingData = false;		
	},
	methods: {
		...mapActions("departments", ["loadDepartments"]),//TODO

        async getDepartments(){
            return axios.get(`${GL_CODE_URL}`)
            .then(resp => {  
				console.log(resp.data)       
				this.departments = [
					{						
						dept: "Tourism",
						glCode: "534-205612-0206-0523-05468",
						financialContact: "Jane Finance",
						email: "jane@yukon.ca"
					},
					{						
						dept: "Justice",
						glCode: "522-205612-0206-0523-05468",
						financialContact: "Larry Fin",
						email: "larry@yukon.ca"
					},
					{						
						dept: "Community Services",
						glCode: "588-205612-0206-0523-05468",
						financialContact: "Beverly Homes",
						email: "beverly@yukon.ca"
					}

				]
                // this.departments = resp.data;              
            })
            .catch(e => {
                console.log(e);
            });
        },

		clearDepartmentData(){
			this.financialContact = {
				firstName: "", 
				lastName: "", 
				department: "", 
				fullName: "", 
				email: ""
			};
			this.dept = "";
			this.glCode = "";
			this.email = "";
		},

		addDepartment() {
			this.clearDepartmentData();
			this.action = 'Add';
			this.departmentDialog = true;
		},

		editDepartment(value) {		
			this.financialContact = {
				firstName: "", 
				lastName: "", 
				department: "", 
				fullName: value.financialContact, 
				email: ""
			};	
			
			this.department = value.dept;
			this.glCode = value.glCode;
			this.email = value.email;			
			this.action = 'Edit';
			this.departmentDialog = true;
		},

		saveDepartment(){		

			//TODO: save the department and load data into table

			this.departmentDialog = false;
			this.getDepartments();
		},

		loadEmailData($event){
			this.email = this.departmentEmployeeList.filter(emp => emp.fullName == $event)[0].email;
		},

		loadDepartmentData($event){
			this.departmentEmployeeList = this.employeeList.filter(emp => emp.department == $event);
		},

		codeFormat() {
			
			const code = this.glCode;
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
			} else if(code.length>=26){
				this.glCode = code.slice(0,26);
			} 			
			
		}

	}
};
</script>