<template>
  <v-dialog
    v-model="showUserDialog"
    persistent
    max-width="900px"
    scrollable
  >
    <v-card>
      <v-card-title
        class="primary"
        style="border-bottom: 1px solid black"
      >
        <div class="text-h5">{{ action }} User</div>
      </v-card-title>

      <v-card-text v-if="user">
        <v-row class="mt-5">
          <v-col cols="5">
            <EmployeeSelect
              label="Employee"
              :disabled="action != 'Add'"
              return-object
            />
          </v-col>
          <v-col cols="7">
            <DepartmentSelect v-model="user.department" />
          </v-col>
        </v-row>
        <v-row class="my-n5">
          <v-col cols="4">
            <v-text-field
              v-model="user.first_name"
              label="First Name"
              outlined
            />
          </v-col>
          <v-col cols="5">
            <v-text-field
              v-model="user.last_name"
              label="Last Name"
              outlined
            />
          </v-col>
          <v-col cols="3">
            <!--  <v-select
              v-model="user.branch"
              label="Branch"
              :items="branchList"
              outlined
              @change="branchChanged(true)"
            /> -->
          </v-col>
        </v-row>
        <v-row class="my-n5">
          <v-col cols="6">
            <!--  <v-text-field
              v-model="user.email"
              label="Email"
              :error="emailErr"
              :rules="[rules.email]"
              outlined
            /> -->
          </v-col>
          <v-col cols="6">
            <!-- <v-autocomplete
              v-model="userUnit"
              label="Unit"
              :items="unitList"
              outlined
            /> -->
          </v-col>
        </v-row>
        <v-row class="my-n5">
          <!--  <v-col cols="12">
            <v-select
              v-model="user.roles"
              label="Roles"
              :items="roleList"
              item-text="name"
              item-value="role"
              chips
              multiple
              clearable
              outlined
            />
          </v-col> -->
        </v-row>
        <v-row class="my-n5">
          <v-col cols="4">
            <v-select
              v-model="user.status"
              label="Status"
              :items="statusList"
              chips
              outlined
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-alert
        v-if="errorMessage"
        class="mt-5 mx-10"
        type="info"
        dismissible
        >{{ errorMessage }}</v-alert
      >
      <v-card-actions class="mb-3">
        <v-btn
          class="ml-3"
          color="secondary primary--text"
          @click="showUserDialog = false"
        >
          Cancel
        </v-btn>
        <v-btn
          class="mr-3 ml-auto px-6"
          color="primary"
          @click="saveUser"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"

import EmployeeSelect from "@/components/employees/EmployeeSelect.vue"
import DepartmentSelect from "@/components/departments/DepartmentSelect.vue"

import { User } from "@/api/users-api"

const showUserDialog = ref(false)

const user = ref<User | null>(null)

const errorMessage = ref<string | null>(null)

const statusList = ref(["Active", "Inactive"])

const action = computed(() => (user.value?.id ? "Edit" : "Add"))

/*


const rules = {
  email: (value) => {
    const pattern =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return pattern.test(value) || "Invalid e-mail."
  },
}
*/

function saveUser() {
  /* if (this.rules.email(this.userName.email) != true) return

this.alertMsg = ""
const body = {
  email: this.userName.email,
  first_name: this.userName.firstName,
  last_name: this.userName.lastName,
  display_name: this.getDisplayName(),
  department: this.userName.department,
  unit: this.userUnit,
  branch: this.userBranch,
  roles: this.userRoles.join(","),
  status: this.userStatus ? this.userStatus : "Inactive",
}
const id = this.currentItem?.id ? this.currentItem.id : 0
return axios
  .post(`${USERS_URL}/${id}`, body)
  .then(async () => {
    this.userDialog = false
    await this.getUsers()
  })
  .catch((e) => {
    console.log(e)
    this.alertMsg = e.response.data
  }) */
}
/*


function branchChanged(clearUnit) {
  if (clearUnit) this.userUnit = ""
  this.unitList = []
  if (this.userBranch) {
    const usrbranch = this.branchList.filter((branch) => branch.value == this.userBranch)[0]
    if (usrbranch) this.unitList = usrbranch.units
  }
}*/
</script>
