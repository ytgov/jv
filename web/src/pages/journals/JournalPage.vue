<template>
  <v-skeleton-loader
    v-if="isNil(journal)"
    type="card"
  />
  <div v-else>
    <div class="mb-4 d-flex">
      <div class="pt-2">
        <v-chip
          color="warning"
          class="mr-3"
          variant="flat"
          ><strong>Status:</strong>&nbsp;{{ journal.status }}</v-chip
        >
      </div>
    </div>

    <TabCard
      :tabs="[
        { value: 0, title: 'Journal Details', icon: 'mdi-file-document' },
        { value: 1, title: 'Audit History', icon: 'mdi-history' },
        { value: 2, title: 'Backup', icon: 'mdi-file-document' },
      ]"
      :default-tab="0"
    >
      <v-tabs-window-item value="0">
        <JournalViewForm
          class="mt-5"
          :journal-id="journalIdNumber"
        />
      </v-tabs-window-item>
    </TabCard>
  </div>
</template>

<script lang="ts" setup>
import { isNil } from "lodash"
import { computed } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useJournal from "@/use/use-journal"

import TabCard from "@/components/common/TabCard.vue"
import JournalViewForm from "@/components/journals/JournalViewForm.vue"

const journalId = defineProps<{ journalId: string }>()
const journalIdNumber = computed(() => parseInt(journalId.journalId))

const { journal } = useJournal(journalIdNumber)

useBreadcrumbs("Journals", [
  { title: "Journals", to: { name: "JournalsPage" } },
  {
    title: "Journal",
    to: { name: "JournalPage", params: { journalId: journalIdNumber.value } },
    disabled: true,
  },
])
</script>
