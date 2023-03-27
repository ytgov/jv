<template>
	<v-card :loading="loadingData" :disabled="loadingData" en class="px-5 pb-15">
		<h1>Administration</h1>
		
		<Breadcrumbs />
		<v-row>
			<v-col cols="6">
				<v-card elevation="1">				
					<v-list class="pb-0 pt-0">
						<v-list-item-group>

							<v-list-item @click="goTo('/administration/users')">
								<v-list-item-icon>
									<v-icon>mdi-account-group</v-icon>
								</v-list-item-icon>
								<v-list-item-content>
									<v-list-item-title>User Management</v-list-item-title>
								</v-list-item-content>
							</v-list-item>

							<v-list-item @click="goTo('/administration/departments')">
								<v-list-item-icon>
									<v-icon>mdi-code-array</v-icon>
								</v-list-item-icon>
								<v-list-item-content>
									<v-list-item-title>Departments</v-list-item-title>
								</v-list-item-content>
							</v-list-item>

							<v-list-item @click="goTo('/administration/items')">
								<v-list-item-icon>
									<v-icon>mdi-package</v-icon>
								</v-list-item-icon>
								<v-list-item-content>
									<v-list-item-title>Items</v-list-item-title>
								</v-list-item-content>
							</v-list-item>
						</v-list-item-group>
					</v-list>
				</v-card>
			</v-col>
			<v-col cols="6"/>			
		</v-row>
	</v-card>
</template>

<script>
import Breadcrumbs from "../../components/Breadcrumbs.vue";
import { mapActions } from "vuex";

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
		...mapActions("recoveries", ["getEmployees", "getDepartmentBranch"]),

		goTo(url) {
			if (url == "") return;
			this.$router.push(url);
		},
		
	}
};
</script>
