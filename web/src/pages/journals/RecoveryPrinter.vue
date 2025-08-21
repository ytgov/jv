<template>
  <div
    v-if="recovery"
    style="font-family: Arial, Helvetica, sans-serif; font-size: 0.9rem"
  >
    <h1 style="">Recovery : {{ recovery.refNum }}</h1>
    <h3 style="">{{ recovery.description }}</h3>
    <hr style="margin: 15px 0" />
    <table style="width: 100%">
      <tr>
        <td style="width: 120px">Client:</td>
        <td>
          {{ recovery.firstName }} {{ recovery.lastName }}
          {{ recovery.mailcode ? `(${recovery.mailcode})` : "" }}
        </td>
      </tr>
      <tr>
        <td>Branch / Unit:</td>
        <td>
          {{ recovery.branch }}
          {{ recovery.employeeUnit ? `/ ${recovery.employeeUnit}` : "" }}
        </td>
      </tr>
      <tr
        v-for="item of recovery.recoveryItems"
        :key="item.itemID"
      >
        <td>Description:</td>
        <td>{{ recovery.description }}</td>
      </tr>
    </table>

    <h3 style="margin: 15px 0 8px">Recovery Items</h3>

    <table style="width: 100%; border: 1px black solid; font-size: 0.8rem">
      <tr style="border-bottom: 1px black solid">
        <th style="border-bottom: 1px black solid">Description</th>
        <th style="border-bottom: 1px black solid">Quantity</th>
        <th style="border-bottom: 1px black solid">Unit Price</th>
        <th style="border-bottom: 1px black solid">Cost</th>
      </tr>
      <tr
        v-for="item of recovery.recoveryItems"
        :key="item.itemID"
      >
        <td>{{ item.category }}</td>
        <td>{{ item.quantity }}</td>
        <td>{{ formatCurrency(item.unitPrice) }}</td>
        <td>{{ formatCurrency(item.totalPrice) }}</td>
      </tr>
      <tr>
        <th
          colspan="3"
          style="border-top: 1px black solid"
        >
          Total
        </th>
        <th style="border-top: 1px black solid">{{ formatCurrency(recovery.totalPrice) }}</th>
      </tr>
    </table>

    <h3 style="margin: 15px 0 8px">Audit History</h3>

    <table style="width: 100%; border: 1px black solid; font-size: 0.8rem">
      <tr>
        <th style="border-bottom: 1px black solid">Date</th>
        <th style="border-bottom: 1px black solid">User</th>
        <th style="border-bottom: 1px black solid">Action</th>
      </tr>
      <tr
        v-for="audit in recovery.recoveryAudits"
        :key="audit.auditID"
      >
        <td>{{ formatDateTime(audit.date) }}</td>
        <td>{{ audit.user }}</td>
        <td>{{ audit.action }}</td>
      </tr>
    </table>

    <h3 style="margin: 15px 0 8px">Backup</h3>

    <ul style="margin-left: 15px">
      <li
        v-for="(docName, index) in recovery.docName"
        :key="index"
      >
        {{ docName.docName }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Recovery } from "@/api/recoveries-api"
import formatCurrency from "@/utils/format-currency"
import { formatDateTime } from "@/utils/format-date"

defineProps<{
  recovery: Recovery | null
}>()
</script>
