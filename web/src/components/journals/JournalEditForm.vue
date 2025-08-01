<template>
  <v-skeleton-loader
    v-if="isNil(journal)"
    type="card"
  />
  <v-form
    v-else
    ref="formRef"
  >
    <v-row>
      <v-col cols="8">
        <v-text-field
          v-model="journal.department"
          hide-details
          label="Client department"
          readonly
          append-icon="mdi-lock"
        />
      </v-col>
      <v-col cols="4">
        <v-text-field
          v-model="journal.fiscalYear"
          hide-details
          label="Fiscal year"
          readonly
          append-icon="mdi-lock"
        />
      </v-col>
      <v-col cols="4">
        <v-text-field
          v-model="journal.jvNum"
          hide-details
          label="Journal number"
        />
      </v-col>
      <v-col cols="4">
        <v-text-field
          :model-value="formatDate(journal.jvDate)"
          hide-details
          label="Journal date"
        />
      </v-col>
      <v-col cols="4">
        <v-text-field
          v-model="journal.period"
          hide-details
          label="Fiscal period"
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="journal.description"
          hide-details
          label="Description"
        />
      </v-col>
      <v-col cols="4">
        <v-text-field
          v-model="journal.orgDepartment"
          hide-details
          label="Originating department"
        />
      </v-col>
      <v-col cols="8">
        <v-text-field
          v-model="journal.odCompletedBy"
          hide-details
          label="Completed by"
        />
      </v-col>
      <!-- <v-col cols="4">
        <v-text-field
          :model-value="formatCurrency(journal.jvAmount)"
          control-variant="hidden"
          label="Journal amount"
          readonly
          append-inner-icon="mdi-calculator"
          bg-color="#dedede"
          hide-details
        />
      </v-col> -->
      <v-col cols="12">
        <v-text-field
          v-model="journal.explanation"
          hide-details
          label="Journal explanation"
        />
      </v-col>
    </v-row>

    <v-btn
      class="my-5"
      text="Save Journal"
      :loading="isLoading"
      :disabled="isLoading"
      @click="validateAndSave"
    />

    <v-divider class="mb-5" />

    <h3 class="mb-3">Add Recoveries</h3>

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
      class="mb-5"
      text="Add Recoveries"
      :loading="isLoading"
      :disabled="isLoading"
      @click="addRecoveries"
    />

    <h3 class="mb-3">Recoveries</h3>
    <div v-if="totalRecoveries > 0">
      <v-list>
        <v-list-item>
          <v-row no-gutters>
            <v-col
              cols="7"
              class="pl-11 text-no-wrap"
            >
              Reference / Branch / Items
            </v-col>
            <v-col cols="3"> Coding </v-col>
            <v-col
              cols="2"
              class="text-right"
            >
              Total Price
            </v-col>
          </v-row>
        </v-list-item>
        <div
          v-for="(recovery, index) of recoveries"
          :key="index"
        >
          <v-list-item>
            <v-row no-gutters>
              <v-col
                cols="7"
                class="pt-1"
              >
                <v-btn
                  icon="mdi-delete"
                  size="x-small"
                  color="warning"
                  class="mr-2"
                  :loading="isLoading"
                  :disabled="isLoading"
                  @click="removeRecovery(recovery.recoveryID)"
                />
                {{ recovery.refNum }} / {{ recovery.supplier }} /
                {{ recovery.recoveryItems.map((r) => r.category).join(", ") }}
              </v-col>
              <v-col cols="3">
                <CodingSelect
                  v-model="recovery.glCode"
                  label=""
                  hide-details
                  density="compact"
                  :where="{ department: recovery.department, ictBranch: recovery.supplier }"
                />
              </v-col>
              <v-col
                cols="2"
                class="text-right pt-3"
              >
                {{ formatCurrency(recovery.totalPrice) }}
              </v-col>
            </v-row>
          </v-list-item>
        </div>
        <v-list-item style="background-color: #ddd">
          <v-row no-gutters>
            <v-col
              cols="10"
              style="font-weight: bold; font-size: 1.1rem"
            >
              Total
            </v-col>
            <v-col
              cols="2"
              class="text-right"
              style="font-weight: bold; font-size: 1.1rem"
              >{{ formatCurrency(itemTotalCost) }}
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>
    </div>
    <div v-else>No recoveries found</div>

    <v-divider class="my-5" />
  </v-form>
</template>

<script lang="ts" setup>
import { isNil, isNumber } from "lodash"
import { ref, computed, toRefs } from "vue"
import { VForm } from "vuetify/components"

import formatCurrency from "@/utils/format-currency"
import formatDate from "@/utils/format-date"

import recoveriesApi from "@/api/recoveries-api"

import useSnack from "@/use/use-snack"
import useJournal from "@/use/use-journal"
import useRecoveries, { type RecoveryWhereOptions } from "@/use/use-recoveries"

import RecoveriesSearchableAutocomplete from "@/components/recoveries/RecoveriesSearchableAutocomplete.vue"
import CodingSelect from "@/components/coding/CodingSelect.vue"

const emit = defineEmits<{ saved: [journalId: number] }>()

const props = defineProps<{ journalId: number }>()
const { journalId } = toRefs(props)

const { journal, save } = useJournal(journalId)

const recoveryIds = ref<number[]>([])

const recoveriesWhereOptions = computed<RecoveryWhereOptions>(() => {
  if (isNil(journal.value)) return {}

  return {
    journalID: journal.value.journalID,
  }
})

const recoveriesQueryOptions = computed(() => ({
  where: recoveriesWhereOptions.value,
}))

const {
  recoveries,
  totalCount: totalRecoveries,
  refresh: refreshRecoveries,
} = useRecoveries(recoveriesQueryOptions, {
  skipWatchIf: () => isNil(journal.value),
})

const itemTotalCost = computed(() => {
  if (recoveries.value?.length > 0) {
    return recoveries.value.reduce(
      (acc, item) => acc + (isNumber(item.totalPrice) ? item.totalPrice : 0),
      0
    )
  }

  return 0
})

const isLoading = ref(false)

function refresh() {
  refreshRecoveries()
  recoveryIds.value = []
}

const formRef = ref<InstanceType<typeof VForm> | null>(null)

const snack = useSnack()

async function validateAndSave() {
  if (isNil(formRef.value)) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    isLoading.value = true

    if (isNil(journal.value)) return
    await save()
    snack.success("Journal saved!")
    emit("saved", journal.value.journalID)
  } catch (error) {
    console.error(error)
    snack.error("Failed to save journal")
  } finally {
    isLoading.value = false
  }
}

async function addRecoveries() {
  if (isNil(formRef.value)) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    isLoading.value = true

    if (isNil(journal.value)) return

    for (const recoveryId of recoveryIds.value) {
      await recoveriesApi.update(recoveryId, { journalID: journal.value.journalID })
    }

    await refresh()

    snack.success("Recoveries added!")
    emit("saved", journal.value.journalID)
  } catch (error) {
    console.error(error)
    snack.error("Failed to add recoveries")
  } finally {
    isLoading.value = false
  }
}

async function removeRecovery(recoveryId: number) {
  try {
    isLoading.value = true

    if (isNil(journal.value)) return

    await recoveriesApi.update(recoveryId, { journalID: null })
    await refresh()
    snack.success("Recovery removed!")
  } catch (error) {
    console.error(error)
    snack.error("Failed to remove recovery")
  } finally {
    isLoading.value = false
  }
}
</script>
