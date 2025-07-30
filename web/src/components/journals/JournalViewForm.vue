<template>
  <v-skeleton-loader
    v-if="isNil(journal)"
    type="card"
  />
  <v-form v-else>
    <v-row>
      <v-col cols="8">
        <v-text-field
          v-model="journal.department"
          hide-details
          label="Client department"
          readonly
        />
      </v-col>
      <v-col cols="4">
        <v-text-field
          v-model="journal.fiscalYear"
          hide-details
          label="Fiscal year"
          readonly
        />
      </v-col>
      <v-col cols="4">
        <v-text-field
          v-model="journal.jvNum"
          hide-details
          label="Journal number"
          readonly
        />
      </v-col>
      <v-col cols="4">
        <v-text-field
          :model-value="formatDate(journal.jvDate)"
          hide-details
          label="Journal date"
          readonly
        />
      </v-col>
      <v-col cols="4">
        <v-text-field
          v-model="journal.period"
          hide-details
          label="Fiscal period"
          readonly
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="journal.description"
          hide-details
          label="Description"
          readonly
        />
      </v-col>
      <v-col cols="4">
        <v-text-field
          v-model="journal.orgDepartment"
          hide-details
          label="Originating department"
          readonly
        />
      </v-col>
      <v-col cols="8">
        <v-text-field
          v-model="journal.odCompletedBy"
          hide-details
          label="Completed by"
          readonly
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
          readonly
        />
      </v-col>
    </v-row>

    <v-btn class="mt-5">Save Journal</v-btn>

    <v-divider class="mb-5" />

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
import { computed, toRefs } from "vue"

import formatCurrency from "@/utils/format-currency"

import useJournal from "@/use/use-journal"
import useRecoveries, { type RecoveryWhereOptions } from "@/use/use-recoveries"
import formatDate from "@/utils/format-date"
import CodingSelect from "../coding/CodingSelect.vue"

const props = defineProps<{ journalId: number }>()
const { journalId } = toRefs(props)

const { journal } = useJournal(journalId)

const recoveriesWhereOptions = computed<RecoveryWhereOptions>(() => {
  if (isNil(journal.value)) return {}

  return {
    journalID: journal.value.journalID,
  }
})

const recoveriesQueryOptions = computed(() => ({
  where: recoveriesWhereOptions.value,
}))

const { recoveries, totalCount: totalRecoveries } = useRecoveries(recoveriesQueryOptions, {
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
</script>
