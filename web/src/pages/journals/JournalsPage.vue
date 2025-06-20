<template>
  <SimpleCard>
    <v-data-table
      :headers="headers"
      :items="journals"
      :items-per-page="10"
      class="striped"
      @click:row="openJournal"
    >
      <template #item.submissionDate="{ item }">
        {{ formatDate(item.submissionDate) }}
      </template>

      <template #item.jvAmount="{ item }">
        {{ formatMoney(item.jvAmount) }}
      </template>
    </v-data-table>
  </SimpleCard>
</template>

<script lang="ts" setup>
import { ref } from "vue"

import useJournals, { Journal } from "@/use/use-journals"

import formatDate from "@/utils/format-date"
import formatMoney from "@/utils/format-currency"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import SimpleCard from "@/components/common/SimpleCard.vue"
import { useRouter } from "vue-router"

const router = useRouter()
const { journals } = useJournals(ref({}))

useBreadcrumbs("Journals", [{ title: "Journals", to: { name: "JournalsPage" }, disabled: true }])

const headers = [
  { title: "Date", value: "submissionDate" },
  { title: "JV Number", value: "jvNum" },
  { title: "Department", value: "department" },
  { title: "Period", value: "period" },
  { title: "Affiliated Recoveries", value: "refRecoveries" },
  { title: "Description", value: "description" },
  { title: "Amount", value: "jvAmount" },
  { title: "Status", value: "status" },
]

function openJournal(_event: MouseEvent, { item }: { item: Journal }) {
  // Navigate to the recovery details pageF
  router.push({ name: "JournalPage", params: { id: item.journalID } })
}
</script>
