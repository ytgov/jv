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
						<template v-slot:[`item.roles`]="{ item }">
                            <div v-for="role,inx in item.roles.split(',')" :key="role+inx">
								{{getRoleName(role)}}
							</div>
                        </template>
						<template v-slot:[`item.edit`]>
                            <v-icon class="primary--text" style="cursor: pointer;">mdi-pencil</v-icon>
                        </template>
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
					
					<v-row class="mt-5">
						<v-col cols="5">
							<v-autocomplete label="Search Name"
								:disabled="action!='Add'" 
								v-model="userName" 
								:items="employeeList"								
								return-object
								item-text="fullName"
								clearable
								outlined/>
						</v-col>
						<v-col cols="7">
							<v-autocomplete label="Department" v-model="userName.department" :items="Object.keys(departmentList)" outlined/>					
						</v-col>
					</v-row>
					<v-row>
						<v-col cols="6">
							<v-text-field v-model="userName.firstName" label="First Name" outlined/>
						</v-col>
						<v-col cols="6">
							<v-text-field v-model="userName.lastName" label="Last Name" outlined/>
						</v-col>
					</v-row>
					<v-row>
						<v-col cols="8">
							<v-text-field v-model="userName.email" label="Email" :error="emailErr" :rules="[rules.email]" outlined/>
						</v-col>
						<v-col cols="4">
							<v-select label="Branch" v-model="userBranch" :items="branchList" outlined/>
						</v-col>
					</v-row>
					<v-row>
						
						<v-col cols="12">
							<v-select 
								label="Roles" 
								v-model="userRoles" 
								:items="roleList"
								item-text="name"
								item-value="role"								
								chips
								multiple
								clearable
								outlined/>
						</v-col>
					</v-row>
					<v-row>
						<v-col cols="4">
							<v-select 
								label="Status" 
								v-model="userStatus" 
								:items="statusList"
								chips												
								outlined/>
						</v-col>
					</v-row>

				</v-card-text>

				<v-card-actions class="mb-3">
					<v-btn color="grey darken-5" @click="userDialog = false"> Cancel </v-btn>
					<v-btn class="ml-auto" color="green darken-1" @click="saveUser"> Save </v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

	</v-container>
</template>

<script>
import Vue from "vue";
import Breadcrumbs from "../../../components/Breadcrumbs.vue";
import { USERS_URL, LOOKUP_URL } from "../../../urls";
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
		currentItem: {},
		userBranch: '',
		userRoles: [],
		userStatus: '',
		emailErr: false,

		rules: {					       
			email: value => {
				const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
				return pattern.test(value) || 'Invalid e-mail.'
			},						
		},

		headers: [						
			{ text: "Name", 	    value: "display_name"},
			{ text: "Email", 		value: "email"},			
			{ text: "Department", 	value: "department"},
			{ text: "Branch", 		value: "branch"},
			{ text: "Roles", 		value: "roles"},
			{ text: "Status", 		value: "status"},
			{ text: "", 			value: "edit", width:'1rem'},
		],
		
		departmentList: [],
		branchList: ['ITCS', 'CIM', 'SIS', 'eServices', 'DAS'],
		statusList: ['Active', 'Inactive'],
		employeeList: [],
		roleList: [],
		userDialog: false,
		action: 'Add'
	}),


	async mounted() {
		this.loadingData = true;	        
        await this.getUsers();
		await this.getRoles();
		this.departmentList = this.$store.state.recoveries.departmentBranch;		
		this.employeeList = this.$store.state.recoveries.employees;
        this.loadingData = false;		
	},

	methods: {	

        async getUsers(){
            return axios.get(`${USERS_URL}/all-users`)
            .then(resp => {  
				// console.log(resp.data)       				
                this.users = resp.data;              
            })
            .catch(e => {
                console.log(e);
            });
        },

		async getRoles(){ 
			return axios.get(`${LOOKUP_URL}/roles`)
            .then(resp => {  
				// console.log(resp.data)       				
                this.roleList = resp.data;              
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
			this.userBranch = "";
			this.userRoles = [];
			this.userStatus = "";
			this.emailErr = false;
			this.currentItem ={}
		},

		addUser() {
			this.clearUserData();
			this.action = 'Add';
			this.userDialog = true;
		},

		editUser(value) {
			this.currentItem = value
			this.userName = {
				firstName: Vue.filter("capitalize")(value.first_name), 
				lastName: Vue.filter("capitalize")(value.last_name), 
				department: value.department, 
				fullName: value.display_name, 
				email: value.email
			};			
			this.userBranch = value.branch;
			this.userRoles = value.roles.split(',');
			this.userStatus = value.status;
			this.emailErr = false;
			this.action = 'Edit';
			this.userDialog = true;
		},

		saveUser(){		
			
			console.log(this.userName)
			console.log(this.userRoles)
			if(this.rules.email(this.userName.email) != true) return
			
			this.userDialog = false;
			const body = {
				email: this.userName.email, 
				first_name: this.userName.firstName,
				last_name: this.userName.lastName, 
				display_name: this.getDisplayName(),
				department: this.userName.department,
				branch: this.userBranch, 
				roles: this.userRoles.join(','), 
				status: this.userStatus? this.userStatus : 'Inactive'				
			};                
			const id = this.currentItem?.id? this.currentItem.id: 0;
			return axios.post(`${USERS_URL}/${id}`, body)
			.then(async () => {
				await this.getUsers();             
			})
			.catch(e => {
				console.log(e);
			});
			
		},

		getDisplayName(){
			if(	this.userName.firstName && 
				this.userName.firstName.length>1 &&
				this.userName.lastName &&
				this.userName.lastName.length>1)
				return Vue.filter("capitalize")(this.userName.firstName)+'.'+Vue.filter("capitalize")(this.userName.lastName)
			else if(this.userName.fullName && this.userName.fullName.length>1)
				return this.userName.fullName
			else 
				return this.userName.email
		},

		getRoleName(roleValue){
			const role = this.roleList.filter(role => role.role==roleValue)
			return (role[0]? role[0].name : '')
		},

	}
};
</script>