<template>
	<v-container>		

		<h1>User Management</h1>

		<Breadcrumbs />
		<div class="mt-2">
			<v-row class="mx-1">
				<v-btn		
					class="my-4 ml-auto"					
					color="primary"
					@click="addUser()">
					<div>Add User</div>
					<v-icon class="mx-0 px-0" color="white">mdi-account-plus</v-icon>
				</v-btn>
			</v-row>
			<v-card class="default px-3 py-3">
				<v-card-text>
					<v-data-table
						:items="users"
						:headers="headers"
						:loading="loadingData"						
						@click:row="editUser"
						:footer-props="{
							'items-per-page-options': [10, 30, 100]
						}"
						class="clickable-row">
					</v-data-table>
				</v-card-text>
			</v-card>
		</div>

		<v-dialog v-model="userDialog" persistent max-width="800px">
			<v-card>
				<v-card-title class="primary" style="border-bottom: 1px solid black">
					<div class="text-h5">{{ action }} User</div>
				</v-card-title>

				<v-card-text>
					<v-select label="Name" v-model="userName" :items="employeeList" class="mt-5"
						@change="loadUserData"
						item-text="fullName"
						outlined/>
					<v-select label="Department" v-model="userDept" :items="Object.keys(departmentList)"
						@change="loadBranches"						
						outlined/>					
					<v-select label="Branch" v-model="userBranch" :items="branchList" outlined/>				
					<v-select label="Role" v-model="userRole" :items="roleList" outlined/>					
					<v-checkbox v-model="userStatus" label="Active?" dense/>

				</v-card-text>

				<v-card-actions>
					<v-btn color="grey darken-5" @click="userDialog = false"> Cancel </v-btn>
					<v-btn class="ml-auto" color="green darken-1" @click="saveUser"> Save </v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

	</v-container>
</template>

<script>
import Breadcrumbs from "../../../components/Breadcrumbs.vue";
import { USERS_URL } from "../../../urls";
import { mapActions } from "vuex";
import axios from "axios";
// import { secureGet } from "@/store/jwt";
export default {
	name: "UserManagement",
	components: {
		Breadcrumbs
	},
	data: () => ({
		loadingData: false,
		users: [],
		userName: {
			firstName: "", 
			lastName: "", 
			department: "", 
			fullName: "", 
			email: ""
		},
		userDept: '',
		userBranch: '',
		userRole: '',
		userStatus: '',
		totalLength: 0,
		headers: [
			{ text: "YNET ID", 		value: "ynetId"},
			{ text: "Name", 		value: "name"},
			{ text: "Department", 	value: "dept"},
			{ text: "Branch", 		value: "branch"},
			{ text: "Role", 		value: "role"},
			{ text: "Status", 		value: "status"}
		],
		page: 1,
		pageCount: 0,
		iteamsPerPage: 10,		
		departmentList: [],
		branchList: [],
		employeeList: [],
		roleList: [
			{ text: "Branch User", 			value: "BranchUser"},
			{ text: "Branch Technician", 	value: "BranchTechnician"},
			{ text: "ICT Finance", 			value: "IctFinance"},
			{ text: "Departmental Finance",	value: "DepartmentalFinance"},
			{ text: "System Admin", 		value: "SystemAdmin"}			
		],
		userDialog: false,
		action: 'Add'
	}),
	async mounted() {
		this.loadingData = true;	
        
        await this.getUsers();
		this.departmentList = this.$store.state.recoveries.departmentBranch;		
		this.employeeList = this.$store.state.recoveries.employees;
		console.log(this.departmentList)
		console.log(this.employeeList)

        this.loadingData = false;		
	},
	methods: {
		...mapActions("users", ["loadUsers"]),//TODO		

        async getUsers(){
            axios.get(`${USERS_URL}`)
            .then(resp => {  
				console.log(resp.data)       
				this.users = [
					{
						name: "Renee.Francoeur",
						dept: "Cabinet Office",
						branch: "",
						role: "Branch Technician",
						status: "Active"
					},
					{
						name: "Moira.Lassen",
						dept: "Environment",
						branch: "Client, Business and Technology Solutions",
						role: "Branch User",
						status: "Active"
					},
					{
						name: "Aurora.Bicudo",
						dept: "Education",
						branch: "Finance ",
						role: "Departmental Finance",
						status: "Active"
					}

				]
                // this.users = resp.data;              
            })
            .catch(e => {
                console.log(e);
            });
        },

		clearUserData(){
			this.userName = {
				firstName: "", 
				lastName: "", 
				department: "", 
				fullName: "", 
				email: ""
			};
			this.userDept = "";
			this.userBranch = "";
			this.userRole = "";
			this.userStatus = "";
		},

		addUser() {
			this.clearUserData();
			this.action = 'Add';
			this.userDialog = true;
		},

		editUser(value) {			
			this.userName = {
				firstName: "", 
				lastName: "", 
				department: "", 
				fullName: value.name, 
				email: ""
			};
			this.userDept = value.dept;
			this.userBranch = value.branch;
			this.userRole = value.role;
			this.userStatus = value.status;
			this.action = 'Edit';
			this.userDialog = true;
		},

		saveUser(){		

			//TODO: save the user

			this.userDialog = false;
			this.getUsers();
		},
		loadBranches(){
			this.branchList = this.departmentList[this.userDept].branches;
		},

		loadUserData($event){			
			const userInfo = this.employeeList.filter(emp => emp.fullName == $event)[0];
			this.userDept = userInfo.department;
		}
	}
};
</script>