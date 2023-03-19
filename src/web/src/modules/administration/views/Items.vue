<template>
	<v-container>		

		<h1>Items</h1>

		<Breadcrumbs />
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

						<template v-slot:[`item.cost`]="{ item }">				
							<span v-if="item.cost?.length>0">${{ item.cost }}</span>
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

					<v-text-field label="Item Name" v-model="itemName" class="mt-5" outlined/>

					<v-text-field label="Default Cost" v-model="cost" class="mt-1" outlined prefix="$"/>		
					
					<v-row>
						<v-col v-for="(branchOption, branchInx) in branchOptions" :key="branchInx">							
							<v-checkbox 
								multiple
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
import { ITEMS_URL } from "../../../urls";
import { mapActions } from "vuex";
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
		itemName: '',
		cost: '',		
		totalLength: 0,
		headers: [
			{ text: "Item Name", 			value: "itemName"},			
			{ text: "Branch",				value: "branch"},
			{ text: "Default Cost", 		value: "cost"}
		],
		branchOptions: ['ITCS', 'CIM', 'SIS', 'eServices', 'DAS'],
		page: 1,
		pageCount: 0,
		iteamsPerPage: 10,		
		// departmentList: [],		
		// employeeList: [],		
		// departmentEmployeeList: [],
		itemDialog: false,
		action: 'Add'
	}),
	async mounted() {
		this.loadingData = true;	
        
        await this.getItems();	

        this.loadingData = false;		
	},
	methods: {
		...mapActions("items", ["loadItems"]),//TODO

        async getItems(){
            axios.get(`${ITEMS_URL}`)
            .then(resp => {  
				console.log(resp.data)       
				this.items = [
					{						
						itemName: "Desktop Comupter",
						branch: "ITCS",
						cost: ""
					},
					{						
						itemName: "Laptop Comupter",
						branch: "ITCS",
						cost: ""
					},
					{						
						itemName: "Mouse",
						branch: "ITCS",
						cost: "21.10"
					},
					{						
						itemName: "Functional Analyst (1FTE)",
						branch: "ITCS,SIS",
						cost: "100000"
					}
				]
                // this.items = resp.data;              
            })
            .catch(e => {
                console.log(e);
            });
        },

		clearItemData(){		
			this.branch = [];		
			this.itemName = "";
			this.cost = "";
		},

		addItem() {
			this.clearItemData();
			this.action = 'Add';
			this.itemDialog = true;
		},

		editItem(value) {	
			
			this.branch = value.branch.split(',');		
			this.itemName = value.itemName;
			this.cost = value.cost;	
			this.action = 'Edit';
			this.itemDialog = true;
		},

		saveItem(){		

			//TODO: save the item and load data into table
			console.log(this.branch)
			console.log(this.itemName)
			console.log(this.cost)
			this.itemDialog = false;
			this.getItems();
		}
		

	}
};
</script>