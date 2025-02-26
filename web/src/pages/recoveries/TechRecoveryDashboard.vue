<template>
  <div
    v-if="loadingData"
    class="mt-10"
    style="text-align: center"
  >
    loading ...
  </div>

  <div v-if="!loadingData">
    <simple-card title="Assigned Requests">
      <assigned-recovery-table
        :recoveries="assignedRecoveries"
        @update-table="updateTable"
      />
    </simple-card>

    <simple-card title="Pending Requests">
      <pending-recovery-table
        :recoveries="pendingRecoveries"
        @update-table="updateTable"
      />
    </simple-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"

import PendingRecoveryTable from "@/modules/recoveries/views/TechRecovery/PendingRecoveryTable.vue"
import AssignedRecoveryTable from "@/modules/recoveries/views/TechRecovery/AssignedRecoveryTable.vue"
import SimpleCard from "@/components/common/SimpleCard.vue"

import { useRecoveries } from "@/use/use-recoveries"
import useBreadcrumbs from "@/use/use-breadcrumbs"

const loadingData = ref(false)
const pendingRecoveries = ref([])
const assignedRecoveries = ref([])

useBreadcrumbs("Agent Dashboard", [{ title: "Agent Dashboard", to: "/agent", disabled: true }])

onMounted(async () => {
  loadingData.value = true
  await getEmployees()
  await getDepartmentBranch()
  await getRecoveries()
  loadingData.value = false
})

function getEmployees() {}

function getDepartmentBranch() {}

async function getRecoveries() {
  loadingData.value = true

  const { recoveries } = useRecoveries(ref({}))

  pendingRecoveries.value = recoveries.value.filter(
    (recovery) => recovery.status == "Routed For Approval"
  )

  assignedRecoveries.value = recoveries.value.filter(
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
