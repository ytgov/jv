<template>
  <SimpleCard
    v-if="recovery"
    title="Recovery Details"
  >
    <v-row>
      <v-col
        cols="12"
        md="4"
      >
        <EmployeeSelect
          v-model="requestor"
          label="Client name"
          hide-details
        />
      </v-col>

      <v-col
        cols="12"
        md="4"
      >
        <v-text-field
          v-model="recovery.requastorEmail"
          label="Client email"
          hide-details
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-text-field
          v-model="recovery.mailcode"
          label="Client mail code"
          hide-details
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <DepartmentSelect
          v-model="recovery.department"
          label="Client department"
          hide-details
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-text-field
          v-model="recovery.branch"
          label="Client branch"
          hide-details
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-text-field
          v-model="recovery.employeeUnit"
          label="Client unit"
          hide-details
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-text-field
          v-model="recovery.refNum"
          label="Reference"
          hide-details
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-text-field
          v-model="recovery.description"
          label="Request description"
          hide-details
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <FiscalYearSelect
          v-model="recovery.fiscal_year"
          label="Fiscal year"
          hide-details
        />
      </v-col>
      <v-col>
        <GroupSelect
          v-model="recovery.supplier"
          label="Supplier"
          hide-details
        />
      </v-col>
    </v-row>

    <v-divider class="my-3" />

    <h3 class="mb-3">Recovery Items</h3>

    <v-list v-if="recovery.recoveryItems && recovery.recoveryItems.length > 0">
      <v-list-item>
        <v-row>
          <v-col
            cols="12"
            md="6"
            >Item: Description
          </v-col>
          <v-col
            cols="2"
            class="pl-5"
            >Quantity (lock?)</v-col
          >
          <v-col
            cols="2"
            class="pl-5"
            >Unit Price</v-col
          >
          <v-col
            cols="2"
            class="pl-5"
            >Cost</v-col
          >
        </v-row>
      </v-list-item>

      <v-list-item
        v-for="(item, idx) of recovery?.recoveryItems"
        :key="idx"
        class="px-1"
      >
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <ItemSelect
              v-model="item.itemCatID"
              :supplier="recovery.supplier"
              density="compact"
              hide-details
              :expanded-selection="true"
              @update:model-value="itemChanged(item)"
            >
            </ItemSelect>
          </v-col>
          <v-col
            cols="4"
            md="2"
            class="d-flex"
          >
            <v-text-field
              v-model="item.quantity"
              density="compact"
              type="number"
              min="1"
              hide-details
              @update:model-value="itemInfoChanged(item)"
            />
            <v-checkbox
              v-model="item.changeQuantity"
              density="compact"
              false-icon="mdi-lock"
              true-icon="mdi-lock-open"
              hide-details
            />
          </v-col>
          <v-col
            cols="4"
            md="2"
          >
            <CurrencyField
              v-model="item.unitPrice"
              density="compact"
              hide-details
              @update:model-value="itemInfoChanged(item)"
            />
          </v-col>
          <v-col
            cols="4"
            md="2"
            class="d-flex"
          >
            <v-text-field
              :model-value="formatCurrency(item.totalPrice)"
              density="compact"
              readonly
              hide-details
            />
            <v-btn
              class="ml-1 mt-1"
              icon="mdi-close"
              size="x-small"
              color="warning"
              @click="removeItemClick(item, idx)"
            ></v-btn>
          </v-col>
        </v-row>
      </v-list-item>

      <v-list-item style="background-color: #ddd">
        <v-row>
          <v-col
            cols="6"
            style="font-weight: bold; font-size: 1.1rem"
          >
            Total
          </v-col>
          <v-col cols="1"></v-col>
          <v-col cols="1"></v-col>
          <v-col cols="2"></v-col>
          <v-col
            cols="2"
            class="pl-9"
            style="font-weight: bold; font-size: 1.1rem"
            >{{ formatCurrency(itemTotalCost) }}
          </v-col>
        </v-row>
      </v-list-item>
    </v-list>
    <div v-else>No items found</div>

    <div class="text-left">
      <v-btn
        class="mt-5"
        color="info"
        @click="addItemClick"
        >Add Item</v-btn
      >
    </div>

    <v-divider class="my-5"></v-divider>

    <v-btn
      :disabled="!isValid"
      @click="saveClick"
      >Save Recovery</v-btn
    >
  </SimpleCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { isNil, isNumber } from "lodash"

import SimpleCard from "@/components/common/SimpleCard.vue"
import EmployeeSelect from "@/components/employees/EmployeeSelect.vue"
import DepartmentSelect from "@/components/departments/DepartmentSelect.vue"
import ItemSelect from "@/components/items/ItemSelect.vue"
import CurrencyField from "@/components/common/CurrencyField.vue"
import FiscalYearSelect from "@/components/common/FiscalYearSelect.vue"
import GroupSelect from "@/components/groups/GroupSelect.vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useRecovery from "@/use/use-recovery"
import useEmployees from "@/use/use-employees"
import useItemCategories from "@/use/use-item-categories"
import { RecoveryItem } from "@/api/recoveries-api"
import formatCurrency from "@/utils/format-currency"
import useCurrentUser from "@/use/use-current-user"

const router = useRouter()
const { recovery, create } = useRecovery(ref(0))
const { employees } = useEmployees()
const { itemCategories } = useItemCategories()
const { currentUser } = useCurrentUser()

onMounted(() => {
  if (recovery.value) recovery.value.supplier = currentUser.value?.branch ?? ""
})

useBreadcrumbs("Create New Recovery", [
  { title: "Create New Recovery", to: { name: "RecoveryAddPage" }, disabled: true },
])

const requestor = ref<string | null>(null)

const isValid = computed(() => {
  if (isNil(recovery.value)) {
    return false
  }

  if (
    isNil(recovery.value.firstName) ||
    isNil(recovery.value.lastName) ||
    isNil(recovery.value.requastorEmail) ||
    isNil(recovery.value.department) ||
    isNil(recovery.value.refNum) ||
    isNil(recovery.value.description) ||
    isNil(recovery.value.supplier)
  )
    return false

  if (recovery.value.recoveryItems?.length == 0) return false

  for (const item of recovery.value.recoveryItems ?? []) {
    if (isNil(item.itemCatID) || isNil(item.quantity) || isNil(item.unitPrice)) {
      return false
    }
  }

  return true
})

const itemTotalCost = computed(() => {
  if (recovery.value?.recoveryItems) {
    return recovery.value.recoveryItems.reduce(
      (acc, item) => acc + (isNumber(item.totalPrice) ? item.totalPrice : 0),
      0
    )
  }

  return 0
})

watch(
  () => requestor.value,
  (value) => {
    if (recovery.value && !isNil(value)) {
      const employee = employees.value.find((employee) => employee.fullName == value)

      if (employee) {
        recovery.value.firstName = employee.firstName
        recovery.value.lastName = employee.lastName
        recovery.value.mailcode = employee.mailcode
        recovery.value.requastorEmail = employee.email
        recovery.value.department = employee.department
        recovery.value.branch = employee.branch
        recovery.value.employeeUnit = employee.unit
      }
    }
  }
)

function itemChanged(item: RecoveryItem | Partial<RecoveryItem>) {
  if (item.itemCatID) {
    const category = itemCategories.value.find((e) => e.itemCatID == item.itemCatID)

    if (category) {
      item.unitPrice = category.price
    }
  }

  if (item.quantity && item.unitPrice)
    item.totalPrice = Math.round(item.unitPrice * item.quantity * 100) / 100
  else item.totalPrice = 0
}

function itemInfoChanged(item: RecoveryItem | Partial<RecoveryItem>) {
  if (item.quantity && item.unitPrice)
    item.totalPrice = Math.round(item.unitPrice * item.quantity * 100) / 100
  else item.totalPrice = 0
}

async function saveClick() {
  const newVal = await create()

  if (newVal) {
    router.push({ name: "RecoveryDetailsPage", params: { id: newVal.recoveryID } })
  }
}

function addItemClick() {
  if (recovery.value) {
    recovery.value.recoveryItems ??= []
    recovery.value.recoveryItems.push({ quantity: 1 })
  }
}

function removeItemClick(item: object, idx: number) {
  if (recovery.value) {
    recovery.value.recoveryItems?.splice(idx, 1)
  }
}
</script>
