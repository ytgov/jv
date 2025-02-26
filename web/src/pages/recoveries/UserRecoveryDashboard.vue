<template>
  <div
    v-if="loadingData"
    class="mt-10"
    style="text-align: center"
  >
    loading ...
  </div>
  <v-alert
    v-if="alertMsg"
    class="mt-5"
    type="warning"
    >{{ alertMsg }}</v-alert
  >

  <div v-if="!loadingData">
    <div class="my-10 mx-3 text-h4">Recoveries</div>

    <simple-card title="Pending Requests">
      <inprogress-recovery-table
        :recoveries="inprogressRecoveries"
        @update-table="updateTable(0)"
      />
    </simple-card>

    <simple-card title="Pending Approvals">
      <approval-recovery-table
        :recoveries="approvalRecoveries"
        @update-table="updateTable(0)"
      />
    </simple-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"

import { useRecoveries } from "@/use/use-recoveries"

import SimpleCard from "@/components/common/SimpleCard.vue"
import InprogressRecoveryTable from "@/modules/recoveries/views/UserRecovery/InprogressRecoveryTable.vue"
import ApprovalRecoveryTable from "@/modules/recoveries/views/UserRecovery/ApprovalRecoveryTable.vue"

const loadingData = ref(false)
const inprogressRecoveries = ref([])
const approvalRecoveries = ref([])
const alertMsg = ref("")

onMounted(async () => {
  loadingData.value = true
  await getEmployees()
  await getDepartmentBranch()
  await getRecoveries()
  loadingData.value = false
})

function getEmployees() {}

function getDepartmentBranch() {}

//      ...mapActions("recoveries", ["getEmployees", "getDepartmentBranch"]),

async function getRecoveries() {
  loadingData.value = true
  const { recoveries } = useRecoveries(ref({}))

  console.log("recoveries", recoveries.value)

  approvalRecoveries.value = recoveries.value.filter(
    (recovery) => recovery.status == "Routed For Approval"
  )

  inprogressRecoveries.value = recoveries.value.filter(
    (recovery) =>
      recovery.status == "Draft" ||
      recovery.status == "Re-Draft" ||
      recovery.status == "Purchase Approved" ||
      recovery.status == "Partially Fullfilled" ||
      recovery.status == "Fullfilled"
  )
  loadingData.value = false
}

async function updateTable() {
  loadingData.value = true
  await getRecoveries()
  loadingData.value = false
}
</script>
