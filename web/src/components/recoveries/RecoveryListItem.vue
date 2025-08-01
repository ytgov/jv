<template>
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
          @click="emit('click:remove', recovery.recoveryID)"
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
          :loading="isLoading"
          :disabled="isLoading"
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
</template>

<script lang="ts" setup>
import { ref, toRefs, watch } from "vue"

import formatCurrency from "@/utils/format-currency"

import recoveriesApi from "@/api/recoveries-api"
import { type Recovery } from "@/api/recoveries-api"

import useSnack from "@/use/use-snack"

import CodingSelect from "@/components/coding/CodingSelect.vue"

const emit = defineEmits<{ "click:remove": [recoveryId: number] }>()

const props = defineProps<{ recovery: Recovery }>()
const { recovery } = toRefs(props)

watch(
  () => recovery.value.glCode,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      updateRecovery()
    }
  }
)

const isLoading = ref(false)

const snack = useSnack()

async function updateRecovery() {
  if (!recovery.value.recoveryID) return

  try {
    isLoading.value = true
    await recoveriesApi.update(recovery.value.recoveryID, {
      glCode: recovery.value.glCode,
    })
    snack.success("Recovery glCode updated!")
  } catch (error) {
    console.error("Failed to update recovery glCode", error)
    snack.error("Failed to update recovery glCode")
  } finally {
    isLoading.value = false
  }
}
</script>
