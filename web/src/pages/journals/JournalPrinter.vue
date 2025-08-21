<template>
  <div
    v-if="journal"
    style="font-family: Arial, Helvetica, sans-serif; font-size: 0.9rem"
  >
    <h1 style="">Journal Voucher : {{ journal.jvNum }}</h1>
    <hr style="margin: 15px 0" />
    <table>
      <tr>
        <td style="width: 220px">Fiscal Year / Period:</td>
        <td>{{ journal.fiscalYear }} / {{ journal.period }}</td>
      </tr>
      <tr>
        <td style="width: 40%">Journal Date:</td>
        <td>{{ formatDate(journal.jvDate) }}</td>
      </tr>
      <tr>
        <td style="width: 40%">Client Department:</td>
        <td>{{ journal.department }}</td>
      </tr>
      <tr>
        <td>Description:</td>
        <td>{{ journal.description }}</td>
      </tr>
      <tr>
        <td>Explanation:</td>
        <td>{{ journal.explanation }}</td>
      </tr>
      <tr>
        <td>Total Amount:</td>
        <td>{{ formatCurrency(journal.jvAmount) }}</td>
      </tr>
    </table>

    <h3 style="margin: 15px 0 8px">Recoveries</h3>

    <table style="width: 100%; border: 1px black solid; font-size: 0.8rem">
      <tr>
        <th style="border-bottom: 1px black solid">Recovery</th>
        <th style="border-bottom: 1px black solid">Items</th>
        <th style="border-bottom: 1px black solid">Coding</th>
        <th style="border-bottom: 1px black solid">Cost</th>
      </tr>
      <tr
        v-for="recovery in journal.recoveries"
        :key="recovery.recoveryID"
      >
        <td>{{ recovery.refNum }}</td>
        <td>
          {{ recovery.recoveryItems.map((r) => r.category).join(", ") }}
        </td>
        <td>{{ recovery.glCode }}</td>
        <td>{{ formatCurrency(recovery.totalPrice) }}</td>
      </tr>
      <tr>
        <th
          colspan="3"
          style="border-top: 1px black solid"
        >
          Total
        </th>
        <th style="border-top: 1px black solid">{{ formatCurrency(journal.jvAmount) }}</th>
      </tr>
    </table>

    <h3
      v-if="journal.docName.length > 0"
      style="margin: 15px 0 8px"
    >
      Backup
    </h3>

    <ul
      v-if="journal.docName.length > 0"
      style="margin-left: 15px"
    >
      <li
        v-for="(docName, index) in journal.docName"
        :key="index"
      >
        {{ docName.docName }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Journal } from "@/api/journals-api"
import formatCurrency from "@/utils/format-currency"
import formatDate from "@/utils/format-date"

defineProps<{
  journal: Journal | null
}>()
</script>
