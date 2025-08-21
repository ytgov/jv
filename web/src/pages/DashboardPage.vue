<template>
  <SimpleCard>
    <div class="d-flex mb-4">
      <v-btn
        v-if="isSystemAdmin || isAgent"
        :to="{ name: 'RecoveryAddPage' }"
        style="height: 44px"
        class="mr-4"
      >
        Add Recovery
      </v-btn>

      <v-text-field
        v-model="search"
        class="mr-4"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        style="width: 300px"
      />
      <GroupSelect
        v-model="branch"
        class="mr-4"
        label="Supplier"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        style="width: 300px"
        clearable
      />
      <FiscalYearSelect
        v-model="fiscalYear"
        class="mr-4"
        label="Fiscal year"
        density="compact"
        style="width: 150px"
        clearable
      />
      <v-spacer />
      <div class="text-right">
        <v-menu
          width="400"
          offset-y
          location="bottom end"
          :close-on-content-click="false"
          :scrim="true"
        >
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              prepend-icon="mdi-filter"
              append-icon="mdi-chevron-down"
              size="small"
              >Filters ({{ filterCount }})</v-btn
            >
          </template>
          <v-card>
            <v-card-text>
              <v-label class="mb-2">Status:</v-label>
              <v-btn-toggle
                v-model="statusFilter"
                color="primary"
                class="border mb-1"
                density="compact"
                multiple
                style="width: 100%; height: 34px"
              >
                <v-btn
                  value="Draft"
                  size="small"
                  style="width: 25%"
                  >Draft</v-btn
                >
                <v-btn
                  value="Routed For Approval"
                  size="small"
                  style="width: 25%"
                  >Routed</v-btn
                >
                <v-btn
                  value="Fulfilled"
                  size="small"
                  style="width: 25%"
                  >Fulfilled</v-btn
                >
                <v-btn
                  value="Complete"
                  size="small"
                  style="width: 25%"
                  >Complete</v-btn
                >
              </v-btn-toggle>
              <v-btn-toggle
                v-model="statusFilter"
                color="primary"
                class="border mb-6"
                density="compact"
                multiple
                style="width: 100%; height: 34px"
              >
                <v-btn
                  value="On Journal"
                  size="small"
                  style="width: 50%"
                  >On Journal</v-btn
                >
                <v-btn
                  value="Recovered"
                  size="small"
                  style="width: 50%"
                  >Recovered</v-btn
                >
              </v-btn-toggle>

              <v-label class="mb-2">Assignments:</v-label>

              <v-btn-toggle
                v-model="assignFilter"
                color="primary"
                class="border mb-6"
                density="compact"
                multiple
                style="width: 100%; height: 34px"
              >
                <v-btn
                  value="Created by me"
                  size="small"
                  style="width: 50%"
                  >Created by me</v-btn
                >
                <v-btn
                  value="Waiting on me"
                  size="small"
                  style="width: 50%"
                  >Waiting on me</v-btn
                >
              </v-btn-toggle>

              <v-label class="mb-2">Client department:</v-label>
              <v-autocomplete
                v-model="departmentFilter"
                :items="departments"
                density="compact"
                multiple
                item-title="name"
                item-value="name"
              ></v-autocomplete>
            </v-card-text>
          </v-card>
        </v-menu>

        <v-menu
          width="400"
          offset-y
          location="bottom end"
          :close-on-content-click="false"
          :scrim="true"
        >
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              icon="mdi-wrench-cog-outline"
              class="ml-2 border"
              size="30"
              variant="tonal"
            ></v-btn>
          </template>
          <v-card>
            <v-card-text>
              <v-label class="mb-2">Table columns:</v-label>
              <v-list class="ma-0 pa-0 ml-n1">
                <v-list-item
                  v-for="header of allHeaders"
                  :key="header.value"
                  class="ma-0 pa-0"
                >
                  <template #prepend>
                    <v-checkbox
                      v-model="selectedHeaders"
                      :value="header.value"
                      color="primary"
                      density="compact"
                      hide-details
                      :label="`&nbsp;${header.title}`"
                    />
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-menu>

        <v-btn
          icon="mdi-table-arrow-down"
          class="ml-2 border"
          size="30"
          title="Export to CSV"
          variant="tonal"
          @click="csvExportClick"
        ></v-btn>

        <div class="text-right mt-3">
          <v-chip
            v-for="value of statusFilter"
            :key="value"
            color="primary"
            closable
            :border="true"
            size="small"
            class="ml-3"
            :text="`Status: ${value}`"
            @click:close="statusFilter = statusFilter?.filter((s) => s !== value) ?? null"
          />
          <v-chip
            v-for="value of departmentFilter"
            :key="value"
            color="primary"
            closable
            :border="true"
            size="small"
            class="ml-3"
            :text="`${value}`"
            @click:close="departmentFilter = departmentFilter?.filter((s) => s !== value) ?? null"
          />
          <v-chip
            v-for="value of assignFilter"
            :key="value"
            color="primary"
            closable
            :border="true"
            size="small"
            class="ml-3"
            :text="`${value}`"
            @click:close="assignFilter = assignFilter?.filter((s) => s !== value) ?? null"
          />
        </div>
      </div>
    </div>
    <AssignedRecoveryTable
      :recoveries="filteredRecoveries"
      :headers="tableHeaders"
    />
  </SimpleCard>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref, watch } from "vue"

import formatDate from "@/utils/format-date"
import { RecoveryStatuses } from "@/api/recoveries-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"
import useDepartments from "@/use/use-departments"
import useRecoveries, { Recovery } from "@/use/use-recoveries"
import useItemCategories from "@/use/use-item-categories"

import AssignedRecoveryTable from "@/modules/recoveries/views/TechRecovery/AssignedRecoveryTable.vue"

import SimpleCard from "@/components/common/SimpleCard.vue"
import GroupSelect from "@/components/groups/GroupSelect.vue"
import FiscalYearSelect from "@/components/common/FiscalYearSelect.vue"

const { currentUser, isAgent, isSystemAdmin } = useCurrentUser()
const { itemCategories } = useItemCategories(ref({}))

const { recoveries } = useRecoveries(ref({}))

useBreadcrumbs("Dashboard", [])

const { departments } = useDepartments()

const search = ref<string>("")
const branch = ref<string>("")
const fiscalYear = ref<string>("")
const statusFilter = ref<string[]>([])
const departmentFilter = ref<string[]>([])
const assignFilter = ref<string[]>(["Waiting on me"])

const selectedHeaders = ref<string[]>([])
const allHeaders = [
  { title: "Fiscal Year", value: "fiscal_year", sortable: true },
  { title: "JV Num", value: "journal.jvNum", sortable: true },
  { title: "Create Date", value: "createDate", sortable: true },
  { title: "Client Dept", value: "department", sortable: false },
  { title: "Client", value: "requestor", sortable: false },
  { title: "Supplier", value: "supplier", sortable: false },
  { title: "Agent", value: "modUser", sortable: false },
  { title: "Reference", value: "refNum", sortable: false },
  { title: "Items", value: "recoveryItems", sortable: false },
  { title: "Status", value: "status", sortable: false },
  { title: "Cost", value: "totalPrice", sortable: true },
]

onBeforeMount(() => {
  // Ensure the current user is loaded before proceeding
  loadSavedFilters()
})

onMounted(() => {
  const storedHeaders = localStorage.getItem("selectedHeaders")

  if (storedHeaders) {
    selectedHeaders.value = JSON.parse(storedHeaders)
  } else {
    selectedHeaders.value = allHeaders.map((header) => header.value)
  }
})

const filterString = computed(() => {
  return JSON.stringify({
    statusFilter: statusFilter.value,
    departmentFilter: departmentFilter.value,
    assignFilter: assignFilter.value,
  })
})

function saveFilters() {
  localStorage.setItem("filters", filterString.value)
}

function loadSavedFilters() {
  const savedFilters = localStorage.getItem("filters")
  if (savedFilters) {
    const filters = JSON.parse(savedFilters)
    statusFilter.value = filters.statusFilter || []
    departmentFilter.value = filters.departmentFilter || []
    assignFilter.value = filters.assignFilter || []
  } else {
    statusFilter.value = []
    departmentFilter.value = []
    assignFilter.value = ["Waiting on me"]
  }
}

watch(
  () => selectedHeaders.value,
  (newValue) => {
    if (newValue.length > 0) {
      localStorage.setItem("selectedHeaders", JSON.stringify(newValue))
    }
  },
  { immediate: true }
)

const tableHeaders = computed(() => {
  return allHeaders.filter((header) => {
    return selectedHeaders.value.length === 0 || selectedHeaders.value.includes(header.value)
  })
})

const filterCount = computed(() => {
  let count = 0
  if (statusFilter.value.length > 0) count++
  if (departmentFilter.value.length > 0) count++
  if (assignFilter.value.length > 0) count++
  return count
})

function getRecoveryItems(recovery: Recovery) {
  const items = recovery.recoveryItems.map((rec) =>
    itemCategories.value.find((item) => item.itemCatID == rec.itemCatID)
  )
  return items.map((i) => i?.category).join(", ")
}

const filteredRecoveries = computed(() => {
  if (filterString.value != localStorage.getItem("filters")) {
    saveFilters()
  }

  return recoveries.value.filter((recovery) => {
    let searchMatch = true
    if (search.value.length > 0) {
      searchMatch =
        (recovery.refNum ?? "").toLowerCase().includes(search.value.toLowerCase()) ||
        recovery.firstName.toLowerCase().includes(search.value.toLowerCase()) ||
        recovery.lastName.toLowerCase().includes(search.value.toLowerCase()) ||
        getRecoveryItems(recovery).toLowerCase().includes(search.value.toLowerCase())
    }

    let fiscalMatch = true
    if (fiscalYear.value) {
      fiscalMatch = recovery.fiscal_year == fiscalYear.value
    }

    let supplierMatch = true
    if (branch.value) {
      supplierMatch = (recovery.supplier ?? "").startsWith(branch.value)
    }

    let assignMatch = true
    if (assignFilter.value.length > 0) {
      if (assignFilter.value.includes("Created by me")) {
        assignMatch = recovery.createUser == currentUser.value?.email
      }

      if (assignFilter.value.includes("Waiting on me")) {
        if (isAgent.value && recovery.status) {
          const relevantStatuses = [
            RecoveryStatuses.DRAFT,
            RecoveryStatuses.PURCHASE_APPROVED,
            RecoveryStatuses.PARTIALLY_FULFILLED,
            RecoveryStatuses.FULFILLED,
          ]

          let statusMatch = false
          if (recovery.status) {
            statusMatch = relevantStatuses.includes(recovery.status)
          }

          assignMatch = statusMatch && recovery.supplier == currentUser.value?.branch
        } else if (recovery.requastorEmail == currentUser.value?.email) {
          assignMatch = recovery.status == RecoveryStatuses.ROUTED_FOR_APPROVAL
        }
      }
    }

    let statusMatch = true
    if (statusFilter.value.length > 0 && recovery.status) {
      statusMatch = statusFilter.value.length === 0 || statusFilter.value.includes(recovery.status)
    }

    const departmentMatch =
      departmentFilter.value.length === 0 || departmentFilter.value.includes(recovery.department)
    return (
      statusMatch && departmentMatch && searchMatch && assignMatch && supplierMatch && fiscalMatch
    )
  })
})

function csvExportClick() {
  const headers = tableHeaders.value.map((header) => header.title)
  const rows = filteredRecoveries.value.map((recovery) => {
    return tableHeaders.value.map((header) => {
      switch (header.value) {
        case "fiscal_year":
          return recovery.fiscal_year
        case "createDate":
          return formatDate(recovery.createDate)
        case "department":
          return recovery.department
        case "requestor":
          return `${recovery.firstName} ${recovery.lastName}`
        case "supplier":
          return recovery.supplier
        case "modUser":
          return recovery.modUser
        case "refNum":
          return recovery.refNum
        case "recoveryItems":
          return getRecoveryItems(recovery)
        case "status":
          return recovery.status
        case "totalPrice":
          return `$${(recovery.totalPrice ?? 0).toFixed(2)}`
        default:
          return ""
      }
    })
  })

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.setAttribute("download", `recoveries_${new Date().toISOString()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
