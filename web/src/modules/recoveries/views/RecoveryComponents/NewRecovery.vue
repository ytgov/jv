<template>
  <v-dialog
    v-model="addNewRecoveryDialog"
    persistent
    :max-width="maxWidth"
    scrollable
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        :elevation="type == 'Add New' ? '5' : '0'"
        :color="type == 'Add New' || type == 'Approve' ? 'primary' : 'transparent'"
        v-bind="activatorProps"
        @click="initForm"
      >
        <div v-if="type == 'Add New'">Create New Recovery</div>
        <div v-else-if="type == 'Approve'">Review</div>

        <v-tooltip
          v-else-if="type == 'Complete' && btnTxt && noGlCode"
          right
          color="warning"
        >
          <template #activator="{ props: tooltipProps }">
            <div class="primary--text">{{ btnTxt }}</div>
            <v-icon
              color="warning"
              class="mr-1"
              v-bind="tooltipProps"
              >mdi-alert</v-icon
            >
          </template>
          <span>No GlCode</span>
        </v-tooltip>
        <div
          v-else-if="type == 'Complete' && btnTxt"
          class="primary--text"
        >
          {{ btnTxt }}
        </div>

        <v-tooltip
          v-else-if="type == 'Complete' && !btnTxt && noGlCode"
          left
          color="warning"
        >
          <template #activator="{ props: tooltipProps }">
            <v-icon
              color="warning"
              class="mr-1"
              v-bind="tooltipProps"
              >mdi-alert</v-icon
            >
          </template>
          <span>No GlCode</span>
        </v-tooltip>
        <v-icon
          v-else-if="type == 'Complete' && !btnTxt"
          dense
          color="primary"
          >mdi-magnify</v-icon
        >

        <v-icon
          v-else
          dense
          color="primary"
          >mdi-pencil</v-icon
        >
      </v-btn>
    </template>

    <v-card
      :loading="loadingData"
      :disabled="loadingData"
    >
      <v-card-title
        class="primary"
        style="border-bottom: 1px solid black"
      >
        <div
          class="text-h5"
          style="color: white"
        >
          {{ title }} Recovery
        </div>
        <v-spacer />
        <v-btn
          fab
          small
          elevation="0"
          color="primary"
          class="my-0"
          @click="closeDialog"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row class="mt-5">
          <v-col cols="4">
            <v-autocomplete
              v-model="employeeName"
              :readonly="readonly"
              :error="state.employeeNameErr"
              :items="employees"
              item-title="fullName"
              item-value="fullName"
              label="Requestor Name"
              outlined
              dense
              @change="handleEmployeeChanged"
            />
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="employeeMailCd"
              :readonly="readonly"
              :error="state.employeeMailCdErr"
              label="Requestor Mail Code"
              outlined
              dense
              :clearable="!readonly"
              @input="state.employeeMailCdErr = false"
            />
          </v-col>
          <v-col cols="5">
            <v-text-field
              v-model="requastorEmail"
              :readonly="readonly"
              :error="state.requastorEmailErr"
              label="Requestor EMail"
              outlined
              dense
              :clearable="!readonly"
              @input="state.requastorEmailErr = false"
            />
          </v-col>
        </v-row>

        <v-row class="mt-0">
          <v-col cols="4">
            <v-select
              v-model="department"
              :readonly="readonly"
              :error="state.departmentErr"
              :items="departments"
              item-title="name"
              label="Requestor Department"
              outlined
              dense
              @change="departmentChanged"
            />
          </v-col>
          <v-col cols="4">
            <v-select
              v-model="employeeBranch"
              :readonly="readonly"
              :error="state.employeeBranchErr"
              :items="branchList"
              item-text="name"
              label="Requestor Branch"
              outlined
              dense
              @change="branchChanged"
            />
          </v-col>
          <v-col cols="4">
            <v-select
              v-model="employeeUnit"
              :readonly="readonly"
              :items="unitList"
              item-text="name"
              label="Requestor Unit"
              outlined
              dense
            />
          </v-col>
        </v-row>

        <v-row class="mt-0">
          <v-col cols="3">
            <v-text-field
              v-model="recoveryID"
              readonly
              label="Recovery ID"
              outlined
              dense
            />
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="refNum"
              :readonly="readonly"
              :error="state.refNumErr"
              label="Reference"
              persistent-hint
              hint="Incident #, Project #"
              outlined
              dense
              :clearable="!readonly"
              @input="state.refNumErr = false"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="requestDescription"
              :readonly="readonly && !userView"
              label="Request Description"
              outlined
              dense
            />
          </v-col>
        </v-row>aaaaaa

        <v-row class="mt-2">
          <v-col cols="12">
            <v-card outlined>
              <v-data-table
                :headers="itemHeaders"
                :items="recoveryItems"
                hide-default-footer
              >
                <template #item.itemCategory="{ item }">
                  <v-autocomplete
                    v-model="item.itemCatID"
                    dense
                    hide-details
                    :error="item.state.itemCategoryErr"
                    :readonly="readonly"
                    :items="itemCategories"
                    solo
                    @change="itemCategoryChanged(item)"
                  />
                </template>
                <template #item.description="{ item }">
                  <v-text-field
                    v-model="item.description"
                    dense
                    :error="item.state.descriptionErr"
                    hide-details
                    :readonly="readonly"
                    solo
                    @input="item.state.descriptionErr = false"
                  />
                </template>
                <template #item.changeQuantity="{ item }">
                  <div class="mx-auto d-flex justify-center">
                    <v-checkbox
                      v-model="item.changeQuantity"
                      :readonly="readonly"
                      class="mt-n1"
                      hide-details
                      solo
                    />
                  </div>
                </template>
                <template #item.quantity="{ item }">
                  <v-text-field
                    v-model="item.quantity"
                    :background-color="item.changeQuantity && userView ? '#E8F5E9' : '#FFF'"
                    dense
                    hide-details
                    :readonly="
                      type == 'Fill' || type == 'Complete' || (!item.changeQuantity && userView)
                    "
                    :error="item.state.quantityErr"
                    solo
                    @input="calculateTotalPrice"
                  />
                </template>
                <template #item.unitPrice="{ item }">
                  <v-text-field
                    v-model="item.unitPrice"
                    :background-color="type == 'Fill' ? '#E8F5E9' : '#FFF'"
                    dense
                    hide-details
                    :error="item.state.unitPriceErr"
                    :readonly="readonly && type != 'Fill'"
                    prefix="$"
                    solo
                    @input="calculateTotalPrice(true)"
                    @change="calculateTotalPrice"
                  />
                </template>
                <template #item.totalPrice="{ item }">
                  <v-text-field
                    v-model="item.totalPrice"
                    dense
                    solo
                    hide-details
                    readonly
                    prefix="$"
                  />
                </template>

                <template #item.revisedCost="{ item }">
                  <v-text-field
                    v-model="item.revisedCost"
                    dense
                    solo
                    hide-details
                    readonly
                    prefix="$"
                  />
                </template>

                <template #item.approvedCost="{ item }">
                  <v-text-field
                    v-model="item.approvedCost"
                    dense
                    solo
                    hide-details
                    :error="item.state.approvedCostErr"
                    readonly
                    prefix="$"
                  />
                </template>

                <template #item.clientChange="{ item }">
                  <v-text-field
                    v-model="item.clientChange"
                    dense
                    hide-details
                    :error="item.state.clientChangeErr"
                    :readonly="type != 'Approve'"
                    solo
                    @input="item.state.clientChangeErr = false"
                  />
                </template>

                <template #item.orderFilled="{ item }">
                  <div class="d-flex justify-center">
                    <v-checkbox
                      v-model="item.orderFilled"
                      :class="type == 'Fill' ? 'mt-n1 mr-n2 bg-success' : 'mt-n1 mr-n2'"
                      :readonly="type == 'Complete'"
                      hide-details
                      solo
                      @change="fillOrderChanged(item)"
                    />
                  </div>
                </template>

                <template #item.filledBy="{ item }">
                  <v-text-field
                    v-model="item.filledBy"
                    dense
                    readonly
                    hide-details
                    solo
                  />
                </template>

                <template #item.remove="{ item }">
                  <v-btn
                    v-if="!readonly"
                    style="min-width: 0"
                    color="transparent"
                    class="px-0 mt-0"
                    small
                    @click="removeItem(item)"
                  >
                    <v-icon
                      class=""
                      color="red"
                      >mdi-delete</v-icon
                    >
                  </v-btn>
                </template>

                <!-- <template #no-data>
                  <div :class="state.recoveryItemsErr ? 'red white--text' : ''">
                    No data available
                  </div>
                </template> -->
              </v-data-table>
               <!--  <template #footer.prepend> -->asdf
                  <v-row
                    class="my-2 pb-2 mx-0"
                    style="font-weight: 600; font-size: 13pt"
                  >
                    <v-btn
                      v-if="!readonly"
                      class="ml-2"
                      color="primary"
                      :loading="savingData"
                      size="small"
                      @click="addRecoveryItem()"
                      >Add Item
                    </v-btn>

                    <div class="ml-auto mr-12">TOTAL</div>
                    <div style="width: 160px">{{ formatMoney(total) }}</div>
                  </v-row>
                <!-- </template> -->
            </v-card>
          </v-col>
        </v-row>

        <div v-if="props.recovery.status == 'Re-Draft'">
          <v-row class="mt-2 text-h6 mx-3 brown--text text--darken-2">
            The Request declined by the Approver because:
          </v-row>
          <v-row class="mt-n5 mx-3">
            <v-textarea
              v-model="reasonForDecline"
              background-color="#FFE9C3"
              readonly
              class="mt-5 text-warning"
              outlined
              :rules="rules"
              rows="3"
            />
          </v-row>
        </div>

        <v-row class="my-3">
          <v-col cols="6">
            <title-card title-width="5rem">
              <template #title>
                <div>Back-up</div>
              </template>
              <template #body>
                <div
                  style="overflow-y: scroll"
                  :style="{ height: uploadBtn || admin ? '140px' : '200px' }"
                >
                  <div :key="update">
                    <v-list dense>
                      <v-list-item
                        v-for="(doc, inx) in recovery.docName"
                        :key="'recovery-' + inx"
                        @click="downloadDocument(doc)"
                      >
                        <v-list-item-title>{{ doc.docName }}</v-list-item-title>
                        <v-list-item-subtitle>{{
                          doc.itemCatName ?? "Manual upload"
                        }}</v-list-item-subtitle>
                        <v-list-item-media
                          v-if="(doc.documentID && uploadBtn) || admin"
                          @click.stop="deleteDocument(doc)"
                        >
                          <v-icon color="red">mdi-delete</v-icon>
                        </v-list-item-media>
                      </v-list-item>
                    </v-list>
                  </div>
                </div>

                <v-btn
                  v-if="uploadBtn || admin"
                  :loading="savingData"
                  class="ml-4 my-4"
                  color="primary"
                  elevation="5"
                  small
                  @click="uploadDocument"
                >
                  Upload Back-up
                  <input
                    id="inputfile"
                    type="file"
                    style="display: none"
                    accept="application/pdf"
                    @change.stop="handleSelectedFile"
                  />
                </v-btn>
              </template>
            </title-card>
          </v-col>
          <v-col
            cols="6"
            class="mx-0"
          >
            <title-card
              class="mr-6"
              title-width="7rem"
            >
              <template #title>
                <div>Audit history</div>
              </template>
              <template #body>
                <div style="height: 200px; overflow-y: scroll">
                  <v-list dense>
                    <v-list-item
                      v-for="item of recoveryAudits"
                      :key="item.auditID"
                    >
                      <v-list-item-title>{{ item.action }}</v-list-item-title>
                      <v-list-item-subtitle
                        >{{ formatDate(item.date) }} by {{ item.user }}</v-list-item-subtitle
                      >
                    </v-list-item>
                  </v-list>
                </div>
              </template>
            </title-card>
          </v-col>
        </v-row>

        <v-divider class="mb-3" />

        <v-row>
          <v-col cols="12">
            <div v-if="routeForApprovalBtn">
              <v-btn
                :loading="savingData"
                class="ml-auto mr-5 my-0"
                color="primary"
                elevation="5"
                @click="saveNewRecovery('Routed For Approval')"
              >
                Route For Approval
              </v-btn>
            </div>
            <div
              v-else-if="revertBtn || approveBtn"
              class="d-flex"
            >
              <v-btn
                v-if="revertBtn"
                :loading="savingData"
                color="warning"
                @click="declineDialog = true"
              >
                Decline Request
              </v-btn>

              <v-spacer />

              <div
                v-if="approveBtn"
                style="max-width: 50%; text-align: right"
              >
                <v-btn
                  color="primary"
                  :loading="savingData"
                  @click="saveNewRecovery('Purchase Approved')"
                >
                  Approve Purchase
                </v-btn>
                <div class="mt-1 mb-n15">
                  By selecting Approve you have been provided approval by those individuals with
                  Section 29 (commitment authority)
                </div>
              </div>
            </div>

            <v-btn
              v-if="saveBtn"
              class="ml-auto mr-5 my-auto"
              color="primary"
              elevation="5"
              @click="saveNewRecovery(completeBtn ? 'Fullfilled' : 'Partially Fullfilled')"
            >
              Save Changes
            </v-btn>
          </v-col>
        </v-row>

        <v-row v-if="glCodeEnable">
          <v-col cols="6" />
          <v-col cols="6">
            <div class="mb-5">
              <b class="text-h6">GL Code: </b>
              <span
                v-if="recovery.glCode"
                class="text-h6"
                >{{ recovery.glCode }}</span
              >
              <span
                v-else
                class="red--text text-h6"
                >No GLcode Saved!</span
              >
            </div>
            <v-select
              v-model="glCode"
              :items="glCodes"
              item-value="glcode"
              label="GL Coding"
              outlined
            >
              <template #item="{ item }">
                <v-row>
                  <v-col>
                    <div style="font-size: 14pt">
                      <b class="primary--text">
                        {{
                          item.raw.glcode
                            ?.replace("-", " ")
                            .replace("-", " ")
                            .replace("-", " ")
                            .replace("-", " ")
                        }}
                      </b>
                    </div>
                    <div
                      v-if="item.raw.recvDepartment"
                      style="font-size: 11pt"
                    >
                      Receiving: {{ item.raw.recvDepartment }}
                    </div>
                    <div
                      v-if="item.raw.department"
                      class="red--text"
                    >
                      {{ item.raw.department }}
                    </div>
                    <div style="font-size: 11pt">{{ item.raw.ictBranch }}</div>
                    <div style="font-size: 10pt">{{ item.raw.ictUnit }}</div>
                    <hr />
                  </v-col>
                </v-row>
              </template>
            </v-select>
            <v-btn
              class="float-right"
              :disabled="!Boolean(glCode)"
              color="primary"
              :loading="savingData"
              @click="saveGlCode"
              >Save GlCode
            </v-btn>
          </v-col>
        </v-row>

        <v-row
          v-if="alert"
          class="mt-15 mx-3"
        >
          <v-alert
            v-model="alert"
            dense
            color="red darken-4"
            dark
            dismissible
          >
            {{ alertMsg }}
          </v-alert>
        </v-row>
      </v-card-text>

      <v-card-actions class="mt-0 mb-3">
        <v-btn
          color="white"
          class="ml-5 cyan--text text--darken-4"
          @click="closeDialog"
        >
          <div
            v-if="readonly"
            class="px-3"
          >
            Close
          </div>
          <div v-else>Cancel</div>
        </v-btn>
        <v-btn
          v-if="!readonly"
          class="ml-auto mr-5 px-5 white--text"
          color="#005a65"
          :loading="savingData"
          @click="saveNewRecovery('Draft')"
          >Save
        </v-btn>
        <v-btn
          v-if="saveBtn && completeBtn && supervisor"
          class="ml-auto mr-5 px-5 white--text"
          color="#005a65"
          @click="saveNewRecovery('Complete')"
        >
          Complete Recoverable
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog
      v-model="declineDialog"
      persistent
      max-width="30%"
    >
      <v-card>
        <v-card-title class="warning white--text">
          <b class="text-h5">Decline Request</b>
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="reasonForDecline"
            class="mt-5"
            label="Reason For Decline "
            outlined
            :rules="rules"
            rows="5"
          />
        </v-card-text>
        <v-card-actions class="mt-n5 mb-3">
          <v-btn
            color="white"
            class="ml-5 cyan--text text--darken-4"
            @click="declineDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            :disabled="!isEmpty(reasonForDecline)"
            class="ml-auto mr-5 px-5 white--text"
            color="#005a65"
            :loading="savingData"
            @click="saveNewRecovery('Re-Draft')"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { RECOVERIES_URL, ADMIN_URL } from "@/urls"
import { isEmpty } from "lodash"
import axios from "axios"
import { DateTime } from "luxon"
import TitleCard from "../Common/TitleCard.vue"

import { RecoverAudit, Recovery, RecoveryDocument, RecoveryItem } from "@/api/recoveries-api"
import { useCurrentUser } from "@/use/use-current-user"
import { useEmployees } from "@/use/use-employees"
import { useDepartments } from "@/use/use-departments"
import { useItemCategories } from "@/use/use-item-categories"
import { useGLCodes } from "@/use/use-gl-codes"

const { currentUser, isSystemAdmin, isBranchAdmin, isICTFinance } = useCurrentUser()

const { employees } = useEmployees(ref({}))
const { departments } = useDepartments(ref({}))
const { itemCategories } = useItemCategories(ref({}))
const { glCodes } = useGLCodes(ref({}))

const emit = defineEmits(["updateTable"])
const props = defineProps<{
  type: string
  title: string
  recovery: Recovery
  maxWidth: number | string
  btnTxt?: string
  noGlCode?: boolean
  editGlCode?: boolean
}>()

const itemHeaders = ref<
  {
    text: string
    value: string
    class: string
    cellClass: string
    sortable: boolean
    width?: string
  }[]
>([])
const itemHeadersWidth = ref<number[]>([])
/* const auditHeaders = ref([
  {
    text: "Date",
    value: "date",
    class: "grey lighten-4",
    cellClass: "px-1 py-1",
    width: "20%",
  },
  {
    text: "Action",
    value: "action",
    class: "grey lighten-4",
    cellClass: "px-1 py-1",
    width: "40%",
  },
  {
    text: "User",
    value: "user",
    class: "grey lighten-4",
    cellClass: "px-1 py-1",
    width: "40%",
  },
]) */

const rules = ref([(v: string) => v?.length <= 255 || "Max 255 characters"])

const admin = ref(false)
const addNewRecoveryDialog = ref(false)
const declineDialog = ref(false)
const department = ref("")
const employeeName = ref<string | null | undefined>(null)
const requastorEmail = ref("")
const employeeBranch = ref("")
const employeeUnit = ref("")
const employeeMailCd = ref("")
const requestDescription = ref("")
const reasonForDecline = ref("")
const refNum = ref("")
const glCode = ref("")
const recoveryID = ref<number | null>(null)
const recoveryItems = ref<RecoveryItem[]>([])
const recoveryAudits = ref<RecoverAudit[]>([])
const branchList = ref<string[]>([])
const unitList = ref<string[]>([])
const allUploadingDocuments = ref<File[]>([])
const toUpload = ref<File[]>([])
const loadingData = ref(false)
const savingData = ref(false)
const readonly = ref(false)
const tmpId = ref(0)
const revertBtn = ref(false)
const approveBtn = ref(false)
const saveBtn = ref(false)
const uploadBtn = ref(false)
const completeBtn = ref(false)
const supervisor = ref(false)
const glCodeEnable = ref(false)
const userView = ref(false)
const routeForApprovalBtn = ref(false)
const total = ref(0)
const reader = ref(new FileReader())
const update = ref(0)
const alert = ref(false)
const alertMsg = ref("")
const state = ref({
  employeeNameErr: false,
  requastorEmailErr: false,
  refNumErr: false,
  departmentErr: false,
  recoveryItemsErr: false,
  employeeMailCdErr: false,
  employeeBranchErr: false,
})

const isReadOnly = computed(() => {
  return props.type != "Add New" && props.type != "Edit"
})

function formatDate(input: string) {
  if (!input) return ""
  return DateTime.fromISO(input).toFormat("YYYY-MM-DD @ h:mma")
}
function formatMoney(input: number) {
  if (!input) return ""
  return input.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
}

function handleEmployeeChanged() {
  state.value.employeeNameErr = false
  employeeChanged()
}

async function initForm() {
  loadingData.value = true
  admin.value = isSystemAdmin.value ?? false
  supervisor.value = isBranchAdmin.value ?? false
  readonly.value = isReadOnly.value
  approveBtn.value = props.type == "Approve"
  revertBtn.value = props.type == "Approve"
  saveBtn.value = props.type == "Fill"
  uploadBtn.value = props.type != "Approve" && props.type != "Complete"
  glCodeEnable.value = (props.type == "Complete" && isICTFinance.value && props.editGlCode) ?? false
  alert.value = false
  userView.value = props.type == "Approve"
  routeForApprovalBtn.value = !readonly.value

  if (props.type == "Complete") await loadRecovery()

  initItemHeader()
  initStates()

  if (props.type == "Add New") {
    department.value = ""
    employeeName.value = ""
    requastorEmail.value = ""
    employeeBranch.value = ""
    employeeUnit.value = ""
    employeeMailCd.value = ""
    reasonForDecline.value = ""
    refNum.value = ""
    glCode.value = ""
    requestDescription.value = ""
    recoveryID.value = null
    recoveryItems.value = []
    recoveryAudits.value = []
  } else {
    department.value = props.recovery.department
    departmentChanged()
    employeeName.value = props.recovery.firstName + "." + props.recovery.lastName
    requastorEmail.value = props.recovery.requastorEmail

    employeeBranch.value = props.recovery.employeeBranch
    employeeUnit.value = props.recovery.employeeUnit
    branchChanged()

    employeeMailCd.value = props.recovery.mailcode
    refNum.value = props.recovery.refNum
    glCode.value = props.recovery.glCode
    requestDescription.value = props.recovery.description
    reasonForDecline.value = props.recovery.reasonForDecline
    recoveryID.value = props.recovery.recoveryID ?? null
    recoveryItems.value = props.recovery.recoveryItems
    /* recoveryAudits.value = props.recovery.recoveryAudits.sort((a, b) => {
      return a.date > b.date ? -1 : 1
    }) */
    calculateTotalPrice()
  }

  savingData.value = false
  if (props.type == "Fill") {
    recoveryItems.value.forEach((item) => {
      if (!item.quantity) item.orderFilled = true
    })
  }
  if (props.type == "Approve") {
    recoveryItems.value.forEach((item) => {
      item.category = itemCategories.value.filter(
        (cat) => cat.itemCatID == item.itemCatID
      )[0].category
      item.originalQuantity = item.quantity
    })
  }
  checkOrderCompleted()
  loadingData.value = false
  allUploadingDocuments.value = []
  update.value++
}

function initItemHeader() {
  const item = {
    text: "Item",
    value: "itemCategory",
    class: "blue-grey lighten-4",
    cellClass: "px-1 py-1",
    sortable: false,
  }
  const desc = {
    text: "Description",
    value: "description",
    class: "blue-grey lighten-4",
    cellClass: "px-1 py-1",
    sortable: false,
  }
  const chxqnt = {
    text: "Can Change Quantity",
    value: "changeQuantity",
    class: "blue-grey lighten-4",
    cellClass: "px-1 py-1",
    sortable: false,
  }
  const qnt = {
    text: "Quantity",
    value: "quantity",
    class: "blue-grey lighten-4",
    cellClass: "px-1 py-1",
    sortable: false,
  }
  const price = {
    text: "Unit Price",
    value: "unitPrice",
    class: "blue-grey lighten-4",
    cellClass: "px-1 py-1",
    sortable: false,
  }
  const cost = {
    text: "Cost",
    value: "totalPrice",
    class: "blue-grey lighten-4",
    cellClass: "px-1 py-1",
    sortable: false,
  }
  const rvCost = {
    text: "Revised Cost",
    value: "revisedCost",
    class: "blue-grey lighten-4",
    cellClass: "px-1 py-1",
    sortable: false,
  }
  const apCost = {
    text: "Approved Cost",
    value: "approvedCost",
    class: "blue-grey lighten-4",
    cellClass: "px-1 py-1",
    sortable: false,
  }
  const fill = {
    text: "Filled",
    value: "orderFilled",
    class: "blue-grey lighten-4",
    cellClass: "px-1 py-1",
    sortable: false,
  }
  const fillBy = {
    text: "Filled By",
    value: "filledBy",
    class: "blue-grey lighten-4",
    cellClass: "px-1 py-1",
    sortable: false,
  }
  const change = {
    text: "Client Change",
    value: "clientChange",
    class: "blue-grey lighten-4",
    cellClass: "px-1 py-1",
    sortable: false,
  }
  const remove = {
    text: "",
    value: "remove",
    class: "blue-grey lighten-4",
    cellClass: "px-1 py-1",
    sortable: false,
  }

  itemHeaders.value = []
  if (props.type == "Add New" || props.type == "Edit") {
    itemHeadersWidth.value = [19, 28, 9, 14, 12, 15, 3]
    itemHeaders.value.push(item, desc, qnt, chxqnt, price, cost, remove)
  }
  if (props.type == "Approve") {
    itemHeadersWidth.value = [13, 25, 8, 10, 12, 12, 20]
    itemHeaders.value.push(item, desc, qnt, price, cost, rvCost, change)
  }
  if (props.type == "Fill" || props.type == "Complete") {
    itemHeadersWidth.value = [11, 15, 7, 9, 9, 9, 9, 4, 14, 13]
    itemHeaders.value.push(item, desc, qnt, price, cost, rvCost, apCost, fill, fillBy, change)
  }

  for (const inx in itemHeaders.value) {
    itemHeaders.value[inx].width = itemHeadersWidth.value[inx] + "%"
  }
}

function initStates() {
  state.value.departmentErr = false
  state.value.employeeNameErr = false
  state.value.requastorEmailErr = false
  state.value.refNumErr = false
  state.value.recoveryItemsErr = false
}

async function saveGlCode() {
  const body = { glCode: glCode.value }
  const id = props.recovery?.recoveryID ? props.recovery.recoveryID : 0
  return await axios
    .post(`${RECOVERIES_URL}/glcode/${id}`, body)
    .then(async (resp) => {
      savingData.value = false
      console.log(resp)
      //props.recovery.recoveryAudits = resp?.data?.recoveryAudits
      //props.recovery.glCode = resp?.data?.glCode
      /* recoveryAudits.value = props.recovery.recoveryAudits.sort((a, b) => {
        return a.date > b.date ? -1 : 1
      }) */
    })
    .catch((e) => {
      savingData.value = false
      console.log(e)
      alertMsg.value = e.response.data
      alert.value = true
    })
}

function addRecoveryItem() {
  const recoveryItem = {
    tmpId: tmpId.value,
    itemCatID: null,
    description: "",
    changeQuantity: false,
    quantity: 0,
    unitPrice: 0,
    totalPrice: "",
    state: {
      itemCategoryErr: false,
      descriptionErr: false,
      quantityErr: false,
      unitPriceErr: false,
      approvedCostErr: false,
      clientChangeErr: false,
    },
  }
  tmpId.value++
  recoveryItems.value.push(recoveryItem)
  state.value.recoveryItemsErr = false
}

function calculateTotalPrice(fixUnitPrice: boolean = false) {
  //item.state.quantityErr = false

  total.value = 0
  for (const item of recoveryItems.value) {
    const itemTotal = Number(item.unitPrice) * item.quantity
    if (!fixUnitPrice) item.unitPrice = Math.round(Number(item.unitPrice) * 100) / 100
    if (props.type == "Add New" || props.type == "Edit") item.totalPrice = itemTotal.toFixed(2)
    else {
      item.revisedCost = itemTotal.toFixed(2)
      item.totalPrice = Number(item.totalPrice).toFixed(2)
      item.approvedCost = Number(item.approvedCost).toFixed(2)
    }

    total.value += itemTotal
  }
  checkTotalApproval()
}

function itemCategoryChanged(item: RecoveryItem) {
  item.state.itemCategoryErr = false

  const category = itemCategories.value.filter((cat) => cat.itemCatID == item.itemCatID)[0]
  item.unitPrice = category?.price ? category.price : 0
  item.description = category?.description ? category.description : ""
  item.changeQuantity = category?.changeQuantity ? category.changeQuantity : false
  calculateTotalPrice()
}

function employeeChanged() {
  if (employeeName.value) {
    const employee = employees.value.filter(
      (employee) => employee.fullName == employeeName.value
    )[0]
    state.value.departmentErr = false
    department.value = employee ? employee.department : ""
    departmentChanged()

    employeeUnit.value = employee ? employee.unit : ""
    employeeBranch.value = employee ? employee.branch : ""
    employeeMailCd.value = employee ? employee.mailcode : ""
    requastorEmail.value = employee ? employee.email : ""
  }
}

function checkTotalApproval() {
  routeForApprovalBtn.value = !readonly.value
  saveBtn.value = props.type == "Fill"

  if (props.type == "Fill")
    for (const item of recoveryItems.value) {
      const total = Number(item.unitPrice) * Number(item.quantity)
      item.state.approvedCostErr = false
      if (total > Number(item.approvedCost)) {
        item.state.approvedCostErr = true
        routeForApprovalBtn.value = true
        saveBtn.value = false
      }
    }
}

function departmentChanged() {
  state.value.departmentErr = false

  if (department.value) {
    const dept = departments.value.find((dept) => dept.name == department.value)
    const deptBranches = dept?.divisions.flatMap((d) => d.branches)
    branchList.value = deptBranches ? deptBranches.map((b) => b.name) : []
    state.value.employeeBranchErr = false
    employeeBranch.value = ""
    employeeUnit.value = ""
    setTimeout(() => {
      branchChanged()
    }, 1)
  }
}

function branchChanged() {
  state.value.employeeBranchErr = false

  if (department.value && employeeBranch.value) {
    const dept = departments.value.find((dept) => dept.name == department.value)
    const deptBranches = dept?.divisions.flatMap((d) => d.branches)
    unitList.value = deptBranches ? deptBranches.flatMap((d) => d.units) : []
  }
}

function fillOrderChanged(item: RecoveryItem) {
  if (item.orderFilled) {
    item.filledBy = currentUser.value?.display_name
  }
  checkOrderCompleted()
}

function checkOrderCompleted() {
  completeBtn.value = true
  for (const item of recoveryItems.value) {
    if (!item.orderFilled) {
      completeBtn.value = false
      return
    }
  }
}

function checkFields() {
  if (allUploadingDocuments.value?.length > 0) {
    for (const doc of allUploadingDocuments.value) {
      if (doc.type != "application/pdf") {
        alertMsg.value = "Please upload the Quote PDF file."
        alert.value = true
        return false
      }
    }
  }

  if (props.type == "Approve") {
    let itemErr = false
    for (const item of recoveryItems.value) {
      //console.log(item)
      item.state.clientChangeErr =
        item.originalQuantity &&
        !item.clientChange &&
        Number(item.originalQuantity) != Number(item.quantity)
          ? true
          : false
      if (item.state.clientChangeErr) itemErr = true
    }
    return !itemErr
  }

  if (props.type == "Add New" || props.type == "Edit") {
    state.value.employeeNameErr = employeeName.value ? false : true
    state.value.departmentErr = department.value ? false : true
    state.value.requastorEmailErr = requastorEmail.value ? false : true
    state.value.recoveryItemsErr = recoveryItems.value?.length > 0 ? false : true

    let itemErr = false
    for (const item of recoveryItems.value) {
      item.state.itemCategoryErr = item.itemCatID ? false : true
      item.state.quantityErr = item.quantity ? false : true
      item.state.unitPriceErr = item.unitPrice ? false : true
      if (item.state.itemCategoryErr || item.state.unitPriceErr || item.state.quantityErr)
        itemErr = true
    }
    if (itemErr) return false

    if (
      state.value.employeeNameErr ||
      state.value.departmentErr ||
      state.value.requastorEmailErr ||
      state.value.employeeBranchErr ||
      state.value.employeeMailCdErr ||
      state.value.refNumErr ||
      state.value.recoveryItemsErr
    )
      return false
  }
  return true
}

function saveNewRecovery(status: string) {
  if (status == "Re-Draft") declineDialog.value = false

  if (checkFields()) {
    alert.value = false
    savingData.value = true
    readonly.value = true
    const name = (employeeName.value ?? " . ").split(".")
    let body = {
      recoveryItems: recoveryItems.value,
      status: status,
      action: getActionType(status),
      totalPrice: total.value,
    } as Partial<Recovery>
    if (status == "Draft" || status == "Routed For Approval") {
      body = {
        ...body,
        firstName: name[0],
        lastName: name[1],
        department: department.value,
        branch: getItemsBranch(),
        employeeBranch: employeeBranch.value,
        employeeUnit: employeeUnit.value,
        mailcode: employeeMailCd.value,
        requastorEmail: requastorEmail.value,
        refNum: refNum.value,
        description: requestDescription.value,
      }
      for (const item of body.recoveryItems ?? []) {
        item.orderFilled = false
      }
    } else if (status == "Complete") {
      body = {
        ...body,
        completeDate: new Date().toISOString(),
        completeUser: currentUser.value?.display_name,
      }
    } else if (status == "Purchase Approved") {
      body = {
        ...body,
        submissionDate: new Date().toISOString(),
        description: requestDescription.value,
        declineRequest: false,
      }
      for (const item of body.recoveryItems ?? []) {
        item.approvedCost = (Number(item.unitPrice) * Number(item.quantity)).toFixed(2)
      }
    } else if (status == "Re-Draft") {
      body = {
        ...body,
        description: requestDescription.value,
        reasonForDecline: reasonForDecline.value.slice(0, 255),
        declineRequest: true,
      }
      for (const item of body.recoveryItems ?? []) {
        item.approvedCost = undefined
      }
    }
    // console.log(body);
    const id = props.recovery?.recoveryID ? props.recovery.recoveryID : 0
    axios
      .post(`${RECOVERIES_URL}/${id}`, body)
      .then(async (resp) => {
        if (reader.value.result) await saveBackUPFile(resp.data.recoveryID)
        savingData.value = false
        readonly.value = isReadOnly.value
        closeDialog()
      })
      .catch((e) => {
        savingData.value = false
        readonly.value = isReadOnly.value
        console.log(e)
        alertMsg.value = e.response.data
        alert.value = true
      })
  }
}

async function saveBackUPFile(recoveryID: number) {
  alert.value = false
  const formData = new FormData()

  for (const doc of toUpload.value) {
    formData.append("files", doc)
  }

  return await axios
    .post(`${RECOVERIES_URL}/backup-documents/${recoveryID}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(() => {
      savingData.value = false
      loadRecovery()
    })
    .catch((e) => {
      savingData.value = false
      console.log(e.response.data)
      alertMsg.value = e.response.data
      alert.value = true
    })
}

function removeItem(item: RecoveryItem) {
  recoveryItems.value = recoveryItems.value.filter(
    (recoveryItem) => !(recoveryItem.tmpId == item.tmpId)
  )
  calculateTotalPrice()
}

function uploadDocument() {
  alert.value = false
  const el = document.getElementById("inputfile")
  if (el) el.click()
}

function handleSelectedFile(event: Event) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toUpload.value = (event.target as any).files

  if (props.recovery && props.recovery.recoveryID) saveBackUPFile(props.recovery?.recoveryID)
}

function downloadDocument(document: RecoveryDocument, itemCatID?: number) {
  let url = `${RECOVERIES_URL}/backup-documents/${props.recovery.recoveryID}/${document.docName}`
  if (!itemCatID && !props.recovery.recoveryID) return
  if (itemCatID) {
    url = `${ADMIN_URL}/item-category-documents/${itemCatID}/${document.docName}`
  }

  window.open(url)
}

async function deleteDocument(document: RecoveryDocument) {
  return await axios
    .delete(
      `${RECOVERIES_URL}/${props.recovery.recoveryID}/backup-documents/${document.documentID}`
    )
    .then(() => {
      savingData.value = false
      loadRecovery()
    })
    .catch((e) => {
      alertMsg.value = e.response.data
      alert.value = true
    })
}

async function loadRecovery() {
  return axios
    .get(`${RECOVERIES_URL}/${props.recovery.recoveryID}`)
    .then((res) => {
      const recovery = res.data as Recovery
      //props.recovery.docName = recovery.docName
      //props.recovery.recoveryAudits = recovery.recoveryAudits

      recoveryAudits.value = recovery.recoveryAudits.sort((a, b) => {
        return a.date > b.date ? -1 : 1
      })

      //props.recovery.recoveryItems = recovery.recoveryItems
    })
    .catch((e) => {
      console.log(e)
    })
}

function getItemsBranch() {
  const itemCatIds = recoveryItems.value.map((item) => item.itemCatID)
  const branches = new Array<string>()
  itemCategories.value.forEach((item) => {
    if (itemCatIds.includes(item.itemCatID)) {
      const itembranchs = item.branch.split("/")
      for (const branch of itembranchs) {
        if (!branches.includes(branch)) branches.push(branch)
      }
    }
  })
  // console.log(branches)
  return branches.join("/")
}

function getActionType(status: string) {
  if (status == "Routed For Approval") return "Routed For Approval"
  if (status == "Re-Draft") return `Request Declined (${reasonForDecline.value.slice(0, 25)}...)`
  if (status == "Purchase Approved") return "Purchase Approved"
  if (status == "Partially Fullfilled") return "Partially Filled Items"
  if (status == "Fullfilled") return "Filled Items"
  if (status == "Complete") return "Completed Request"
  if (props.type == "Add New" && status == "Draft") return "Draft"
  if (props.type == "Edit" && status == "Draft") return "Updated Request"
}

function closeDialog() {
  addNewRecoveryDialog.value = false
  emit("updateTable")
}
</script>

<style scoped>
.v-text-field--solo.error--text {
  background: red;
  border: 1px solid red;
}
::v-deep(.text-warning textarea) {
  color: #563b00 !important;
}

::v-deep(.bg-success .v-input--selection-controls__input) {
  background: #e8f5e9 !important;
}
/* 
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
} */
</style>
