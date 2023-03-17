<template>
	<v-container :loading="loadingData" :disabled="loadingData" en class="px-5 pb-15">
		<h1>Administration</h1>
		<Breadcrumbs />
		<v-row>
			<v-col cols="6">
				<v-card elevation="1">				
					<v-list class="pb-0 pt-0">
						<v-list-item-group>
							<v-list-item @click="goTo('/administration/users')">
								<v-list-item-icon>
									<v-icon v-text="'mdi-account-group'"></v-icon>
								</v-list-item-icon>
								<v-list-item-content>
									<v-list-item-title>User Management</v-list-item-title>
								</v-list-item-content>
							</v-list-item>
						</v-list-item-group>
					</v-list>
				</v-card>
			</v-col>
			<v-col cols="6"/>			
		</v-row>
	</v-container>
</template>

<script>
import Breadcrumbs from "../../components/Breadcrumbs.vue";
import { LOOKUP_URL } from "../../urls";
// import { mapActions } from "vuex";
import axios from "axios";

export default {
	components: {
		Breadcrumbs
	},
	data: () => ({
		loadingData: false,
		
	}),
	async mounted() {
        this.loadingData = true;
        await this.getEmployees();
        await this.getDepartmentBranch();
        this.loadingData = false;
    },
	methods: {
		goTo(url) {
			if (url == "") return;
			this.$router.push(url);
		},
		async getEmployees() {            
            axios.get(`${LOOKUP_URL}/employees`)
            .then(resp => {
                this.$store.commit("recoveries/SET_EMPLOYEES", resp.data);          
            })
            .catch(e => {
                console.log(e);
            });
        },

        async getDepartmentBranch() {
            axios.get(`${LOOKUP_URL}/department-branch`)
            .then(resp => {
                this.$store.commit("recoveries/SET_DEPARTMENT_BRANCH", resp.data);
            })
            .catch(e => {
                console.log(e);
            });
        },
	}
};
</script>
