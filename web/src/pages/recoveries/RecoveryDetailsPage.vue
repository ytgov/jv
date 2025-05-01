<template>
  <div class="mb-4 d-flex">
    <div class="pt-2">
      <v-chip
        color="warning"
        class="mr-3"
        variant="flat"
        ><strong>Status:</strong>&nbsp;{{ recovery?.status }}</v-chip
      >
      <v-chip
        color="success"
        class="mr-3"
        variant="flat"
        dark
        ><strong>Agent:</strong>&nbsp;{{ recovery?.createUser }}</v-chip
      >
    </div>

    <v-spacer />

    <RecoveryActionMenu
      v-if="recovery && recovery.recoveryID"
      :recovery-id="recovery.recoveryID"
      @reload="fetch()"
    />
  </div>
  <TabCard
    :tabs="[
      { value: 0, title: 'Recovery Details', icon: 'mdi-file-document' },
      { value: 1, title: 'Audit History', icon: 'mdi-history' },
      { value: 2, title: 'Backup', icon: 'mdi-file-document' },
    ]"
    :default-tab="0"
  >
    <v-tabs-window-item value="0">
      <div
        v-if="recovery"
        class="pt-3"
      >
        <v-row>
          <!--  <v-col
        cols="12"
        md="4"
      >
        <EmployeeSelect
          v-model="requestor"
          label="Requestor name"
          hide-details
        />
      </v-col>
 -->
          <v-col
            cols="12"
            md="8"
          >
            <v-text-field
              v-model="recovery.requastorEmail"
              label="Requestor email"
              hide-details
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-text-field
              v-model="recovery.mailcode"
              label="Requestor mail code"
              hide-details
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <DepartmentSelect
              v-model="recovery.department"
              label="Requestor department"
              hide-details
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-text-field
              v-model="recovery.branch"
              label="Requestor branch"
              hide-details
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-text-field
              v-model="recovery.employeeUnit"
              label="Requestor unit"
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
            md="8"
          >
            <v-text-field
              v-model="recovery.description"
              label="Request description"
            />
          </v-col>
        </v-row>

        <v-btn
          :disabled="!isValid"
          @click="saveClick"
          >Update Recovery</v-btn
        >

        <v-divider class="my-5" />
        <v-card-subtitle class="mb-3 px-0">Recovery Items</v-card-subtitle>

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
            size="small"
            @click="addItemClick"
            >Add Item</v-btn
          >
        </div>
      </div>
    </v-tabs-window-item>

    <v-tabs-window-item value="1">
      <div v-if="recovery">
        <v-data-table
          :items="recovery.recoveryAudits"
          :headers="[
            { title: 'Date', value: 'date' },
            { title: 'User', value: 'user' },
            { title: 'Action', value: 'action' },
          ]"
          :items-per-page="5"
        >
          <template #item.date="{ item }">
            <span>{{ formatDateTime(item.date) }}</span>
          </template>
        </v-data-table>
      </div>
    </v-tabs-window-item>

    <v-tabs-window-item value="2">
      <div v-if="recovery && recovery.recoveryID">
        <RecoveryDocumentList
          :recovery-id="recovery.recoveryID"
          :documents="recovery.docName ?? []"
          :can-delete="true"
          :can-upload="true"
          @refresh="fetch()"
        />
      </div>
    </v-tabs-window-item>
  </TabCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { isNil, isNumber } from "lodash"

//import EmployeeSelect from "@/components/employees/EmployeeSelect.vue"
import DepartmentSelect from "@/components/departments/DepartmentSelect.vue"
import ItemSelect from "@/components/items/ItemSelect.vue"
import CurrencyField from "@/components/common/CurrencyField.vue"
import RecoveryDocumentList from "@/components/documents/RecoveryDocumentList.vue"
import TabCard from "@/components/common/TabCard.vue"
import RecoveryActionMenu from "@/components/RecoveryActionMenu.vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useRecovery from "@/use/use-recovery"
import useEmployees from "@/use/use-employees"
import useItemCategories from "@/use/use-item-categories"
import useSnack from "@/use/use-snack"
import { RecoveryItem } from "@/api/recoveries-api"
import formatCurrency from "@/utils/format-currency"
import { formatDateTime } from "@/utils/format-date"

const snack = useSnack()

const props = defineProps<{ id: string }>()
const recoverId = computed(() => {
  return parseInt(props.id)
})

const { recovery, save, fetch } = useRecovery(recoverId)
const { employees } = useEmployees()
const { itemCategories } = useItemCategories()

useBreadcrumbs("Recovery", [{ title: "Recovery", to: { name: "RecoveryAddPage" }, disabled: true }])

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
    isNil(recovery.value.description)
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
  if (!recovery.value) return
  recovery.value.action = getActionType(recovery.value.status ?? "")
  await save()
  snack.success("Recovery updated")
}

function getActionType(status: string) {
  const reasonForDecline = ref("")

  if (status == "Routed For Approval") return "Routed For Approval"
  if (status == "Re-Draft") return `Request Declined (${reasonForDecline.value.slice(0, 25)}...)`
  if (status == "Purchase Approved") return "Purchase Approved"
  if (status == "Partially Fullfilled") return "Partially Filled Items"
  if (status == "Fullfilled") return "Filled Items"
  if (status == "Complete") return "Completed Request"
  return "Updated Request"
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
