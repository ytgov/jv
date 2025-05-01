<template>
  <v-list v-if="items.length > 0">
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
          >Quantity</v-col
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
      v-for="(item, idx) of items"
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
            readonly
          >
          </ItemSelect>
        </v-col>
        <v-col
          cols="4"
          md="2"
        >
          <v-text-field
            v-model="item.quantity"
            density="compact"
            type="number"
            min="1"
            hide-details
            readonly
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
            readonly
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
</template>

<script setup lang="ts">
import { computed } from "vue"
import { isNumber } from "lodash"

import ItemSelect from "@/components/items/ItemSelect.vue"
import CurrencyField from "@/components/common/CurrencyField.vue"

import { RecoveryItem } from "@/api/recoveries-api"
import formatCurrency from "@/utils/format-currency"

const props = defineProps({
  items: {
    type: Array<RecoveryItem | Partial<RecoveryItem>>,
    required: true,
  },
})

const itemTotalCost = computed(() => {
  return props.items.reduce(
    (acc, item) => acc + (isNumber(item.totalPrice) ? item.totalPrice : 0),
    0
  )
})
</script>
