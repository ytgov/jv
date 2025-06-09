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
                class="border mb-6"
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
                  value="Pending"
                  size="small"
                  style="width: 25%"
                  >Pending</v-btn
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

import useDepartments from "@/use/use-departments"
import useCurrentUser from "@/use/use-current-user"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import SimpleCard from "@/components/common/SimpleCard.vue"
import AssignedRecoveryTable from "@/modules/recoveries/views/TechRecovery/AssignedRecoveryTable.vue"
import useRecoveries, { Recovery } from "@/use/use-recoveries"
import useItemCategories from "@/use/use-item-categories"
import GroupSelect from "@/components/groups/GroupSelect.vue"

const { currentUser, isAgent, isSystemAdmin } = useCurrentUser()
const { itemCategories } = useItemCategories(ref({}))

const { recoveries } = useRecoveries(ref({}))

useBreadcrumbs("Dashboard", [])

const { departments } = useDepartments()

const search = ref<string>("")
const branch = ref<string>("")
const statusFilter = ref<string[]>([])
const departmentFilter = ref<string[]>([])
const assignFilter = ref<string[]>(["Waiting on me"])

const selectedHeaders = ref<string[]>([])
const allHeaders = [
  { title: "Fiscal Year", value: "fiscal_year" },
  { title: "Create Date", value: "createDate" },
  { title: "Client Dept", value: "department" },
  { title: "Client", value: "requestor" },
  { title: "Supplier", value: "supplier" },
  { title: "Agent", value: "modUser" },
  { title: "Reference", value: "refNum" },
  { title: "Items", value: "recoveryItems" },
  { title: "Status", value: "status" },
  { title: "Cost", value: "totalPrice" },
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
        recovery.refNum.toLowerCase().includes(search.value.toLowerCase()) ||
        recovery.firstName.toLowerCase().includes(search.value.toLowerCase()) ||
        recovery.lastName.toLowerCase().includes(search.value.toLowerCase()) ||
        getRecoveryItems(recovery).toLowerCase().includes(search.value.toLowerCase())
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
        if (isAgent.value) {
          const relevantStatuses = [
            "Draft",
            "Purchase Approved",
            "Partially Fulfilled",
            "Fulfilled",
          ]
          assignMatch =
            relevantStatuses.includes(recovery.status) &&
            recovery.supplier == currentUser.value?.branch
        } else if (recovery.requastorEmail == currentUser.value?.email) {
          assignMatch = recovery.status == "Routed For Approval"
        }
      }
    }

    let statusMatch = true
    if (statusFilter.value.length > 0) {
      statusMatch = statusFilter.value.length === 0 || statusFilter.value.includes(recovery.status)

      if (!statusMatch && statusFilter.value.includes("Pending")) {
        statusMatch = recovery.status === "Routed For Approval" || recovery.status === "Pending"
      }
    }

    const departmentMatch =
      departmentFilter.value.length === 0 || departmentFilter.value.includes(recovery.department)
    return statusMatch && departmentMatch && searchMatch && assignMatch && supplierMatch
  })
})
</script>
