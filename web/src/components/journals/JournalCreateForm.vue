<template>
  <v-form
    ref="formRef"
    @submit.prevent="validateAndCreate"
  >
    <v-row>
      <v-col cols="8">
        <DepartmentSelectString
          v-model="journal.department"
          hide-details
          label="Client department"
          :rules="[required]"
          @update:model-value="recoveryIds = []"
        />
      </v-col>

      <v-col cols="4">
        <FiscalYearSelect
          v-model="journal.fiscalYear"
          hide-details
          label="Fiscal year"
          :rules="[required]"
          @update:model-value="recoveryIds = []"
        />
      </v-col>

      <v-col cols="4">
        <v-text-field
          v-model="journal.jvNum"
          label="Journal number"
          hide-details
          :rules="[required]"
        />
      </v-col>
      <v-col cols="4">
        <StringDateInput
          v-model="journal.jvDate"
          label="Journal date"
          hide-details
        />
      </v-col>
      <v-col cols="4">
        <v-autocomplete
          v-model="journal.period"
          :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14]"
          control-variant="hidden"
          label="Fiscal period"
          hide-details
          :rules="[required]"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="journal.description"
          hide-details
          label="Description"
          :rules="[required]"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="4">
        <v-text-field
          v-model="journal.orgDepartment"
          hide-details
          label="Originating department"
          :rules="[required]"
        />
      </v-col>
      <v-col cols="4">
        <v-text-field
          v-model="journal.odCompletedBy"
          hide-details
          label="Completed by"
          :rules="[required]"
        />
      </v-col>
      <v-col cols="4">
        <v-text-field
          :model-value="formatCurrency(journal.jvAmount)"
          control-variant="hidden"
          label="Journal amount"
          readonly
          append-inner-icon="mdi-calculator"
          bg-color="#dedede"
          hide-details
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="journal.explanation"
          hide-details
          label="Journal explanation"
          :rules="[required]"
        />
      </v-col>
    </v-row>

    <v-divider class="mb-5" />

    <h3 class="mb-3">Recoveries</h3>

    <p
      v-if="isNil(journal.department) || isNil(journal.fiscalYear)"
      class="mb-3"
    >
      Please select a department and fiscal year before picking recoveries
    </p>

    <RecoveriesSearchableAutocomplete
      v-model="recoveryIds"
      :disabled="isNil(journal.department) || isNil(journal.fiscalYear)"
      :where="{
        department: journal.department,
        fiscal_year: journal.fiscalYear,
        journalID: null,
        status: 'Complete',
      }"
      label="Recovery (Branch / Reference (Items) = Value)"
      @items-total="journal.jvAmount = $event"
    />
    <v-btn
      type="submit"
      :loading="isCreating"
      :disabled="isCreating"
      text="Create Journal"
    />
  </v-form>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { isNil } from "lodash"
import { VForm } from "vuetify/components"

import { required } from "@/utils/validators"

import journalApi, { Journal, JournalStatuses } from "@/api/journals-api"

import useSnack from "@/use/use-snack"

import StringDateInput from "@/components/common/StringDateInput.vue"
import FiscalYearSelect from "@/components/common/FiscalYearSelect.vue"
import DepartmentSelectString from "@/components/departments/DepartmentSelectString.vue"
import RecoveriesSearchableAutocomplete from "@/components/recoveries/RecoveriesSearchableAutocomplete.vue"
import formatCurrency from "@/utils/format-currency"
import formatDate from "@/utils/format-date"

const emit = defineEmits<{ created: [journalId: number] }>()

const journal = ref<Partial<Journal>>({
  status: JournalStatuses.DRAFT,
  jvAmount: 0,
  department: null,
  fiscalYear: null,
  jvDate: formatDate(new Date().toISOString()),
  orgDepartment: "HPW-ICT W10",
  odCompletedBy: "HPW-ICT-Invoices@yukon.ca",
})
const recoveryIds = ref<number[]>([])

const isCreating = ref(false)
const formRef = ref<InstanceType<typeof VForm> | null>(null)
const snack = useSnack()

watch(
  [journal.value],
  ([d]) => {
    if (isNil(d) || isNil(d.department) || isNil(d.fiscalYear)) return

    if (isNil(journal.value.description))
      journal.value.description = `${d.fiscalYear}-ICT Recovery to ${d.department}`

    if (isNil(journal.value.explanation))
      journal.value.explanation = `${d.fiscalYear}-ICT Recovery to ${d.department}`
  },
  { immediate: true, deep: true }
)

async function validateAndCreate() {
  if (formRef.value === null) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  if (recoveryIds.value.length === 0) {
    snack.error("Please select at least one Recovery")
    return
  }

  try {
    isCreating.value = true
    const data = await journalApi.create({ ...journal.value }, recoveryIds.value)
    emit("created", data.journal.journalID)
    close()
    snack.success("Journal created")
  } catch (error) {
    console.log(error)
    snack.error("Failed to create journal")
  } finally {
    journal.value = {}
    isCreating.value = false
  }
}
</script>
