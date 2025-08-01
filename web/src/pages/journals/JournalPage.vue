<template>
  <v-skeleton-loader
    v-if="isNil(journal)"
    type="card"
  />
  <div v-else>
    <div class="mb-4 d-flex pt-2">
      <v-chip
        color="warning"
        class="mr-3"
        variant="flat"
      >
        <strong>Status:</strong>&nbsp;{{ journal.status }}
      </v-chip>
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
        <div v-if="journal.status === JournalStatuses.DRAFT">
          <JournalEditForm
            class="mt-5"
            :journal-id="journalIdNumber"
          />
        </div>
        <div v-else>
          <JournalViewForm
            class="mt-5"
            :journal-id="journalIdNumber"
          />
        </div>

        <v-btn>Generate Journal</v-btn>
        this will create the XLS and combine all backup into a single PDF * put the Recoveries Ref#
        into Ref3
        <br />
        The two files are downloaded
      </v-tabs-window-item>

      <v-tabs-window-item value="1">
        <v-data-table
          :items="journal.journalAudits"
          :headers="[
            { title: 'Date', value: 'date' },
            { title: 'User', value: 'user' },
            { title: 'Action', value: 'action' },
          ]"
          :items-per-page="10"
        >
          <template #item.date="{ item }">
            <span>{{ formatDateTime(item.date) }}</span>
          </template>
        </v-data-table>
      </v-tabs-window-item>

      <v-tabs-window-item value="2">
        <div v-if="journal.recoveries.length == 0">None found</div>

        <div
          v-for="(recovery, recoveryIndex) in journal.recoveries"
          v-else
          :key="recoveryIndex"
        >
          <h3 class="font-medium mb-2">{{ makeRecoveryTitle(recovery) }}</h3>

          <v-list>
            <v-list-item
              v-for="(docName, docNameIndex) in recovery.docName"
              :key="docNameIndex"
              :title="docName.docName"
            >
              <template #prepend>
                <v-btn
                  icon="mdi-download"
                  variant="text"
                  size="small"
                  :loading="isLoading"
                  @click="downloadDocument(recovery, docName)"
                />
              </template>
              <template #append>
                <v-btn
                  icon="mdi-delete"
                  color="warning"
                  variant="text"
                  size="small"
                  :loading="isLoading"
                  @click="deleteDocument(recovery, docName)"
                />
              </template>
            </v-list-item>
          </v-list>
          <v-divider class="my-5" />
        </div>
      </v-tabs-window-item>
    </TabCard>
  </div>
</template>

<script lang="ts" setup>
import { isNil } from "lodash"
import { computed, ref } from "vue"

import { formatDateTime } from "@/utils/format-date"

import recoveriesApi, { Recovery, RecoveryDocument } from "@/api/recoveries-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useJournal, { JournalStatuses } from "@/use/use-journal"

import TabCard from "@/components/common/TabCard.vue"
import JournalEditForm from "@/components/journals/JournalEditForm.vue"
import JournalViewForm from "@/components/journals/JournalViewForm.vue"

const journalId = defineProps<{ journalId: string }>()
const journalIdNumber = computed(() => parseInt(journalId.journalId))

const { journal, isLoading: isJournalLoading, refresh } = useJournal(journalIdNumber)

function makeRecoveryTitle(recovery: Recovery) {
  return `${recovery.refNum} / ${recovery.supplier}`
}

const isDownloadingDocument = ref(false)
const isDeletingDocument = ref(false)
const isLoading = computed(
  () => isJournalLoading.value || isDownloadingDocument.value || isDeletingDocument.value
)

async function downloadDocument(recovery: Recovery, recoveryDocument: RecoveryDocument) {
  try {
    isDownloadingDocument.value = true
    const data = await recoveriesApi.getUpload(recovery.recoveryID, recoveryDocument.documentID)

    if (isNil(data)) return

    const byteArray = new Uint8Array(data)
    const newBlob = new Blob([byteArray])

    const objUrl = window.URL.createObjectURL(newBlob)
    const link = document.createElement("a")
    link.href = objUrl
    link.download = recoveryDocument.docName || "download"
    link.click()
  } catch (error) {
    console.error(error)
  } finally {
    isDownloadingDocument.value = false
  }
}

async function deleteDocument(recovery: Recovery, recoveryDocument: RecoveryDocument) {
  try {
    isDeletingDocument.value = true
    const result = confirm("Are you sure you want to delete this document?")

    if (result) {
      await recoveriesApi.deleteUpload(recovery.recoveryID, recoveryDocument.documentID)
      refresh()
    }
  } catch (error) {
    console.error(error)
  } finally {
    isDeletingDocument.value = false
  }
}

useBreadcrumbs("Journals", [
  { title: "Journals", to: { name: "JournalsPage" } },
  {
    title: "Journal",
    to: { name: "JournalPage", params: { journalId: journalIdNumber.value } },
    disabled: true,
  },
])
</script>
