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

        <v-btn @click="generateJournal">Generate Journal</v-btn>
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

          <div v-if="recovery.docName.length == 0">None found</div>

          <v-list v-else>
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

<script lang="ts">
// Legacy code for generate pdf
export function printPdf(html: string, title: string, footer: string, header: string): string {
  return `
    <div class="pdf-wrapper">
      <header>${header}</header>
      <h1>${title}</h1>
      ${html}
      <footer>${footer}</footer>
    </div>
  `
}
</script>

<script lang="ts" setup>
import { isNil } from "lodash"
import { computed, ref } from "vue"

import { formatDateTime } from "@/utils/format-date"

import recoveriesApi, { Recovery, RecoveryDocument } from "@/api/recoveries-api"
import pdfApi from "@/api/pdf-api"
import itemCategoriesApi from "@/api/item-categories-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"
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

async function downloadExcelFile() {
  const blob = await pdfApi.getExcel(journalIdNumber.value)

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `journal_${journalIdNumber.value}.xlsx`
  link.click()
  window.URL.revokeObjectURL(url)
}

async function downloadPdfFile() {
  if (isNil(journal.value)) return

  /*
  Legacy code to generate the PDF
  */
  const data = []
  const currentTime = new Date().toLocaleString()
  const jvNum = journal.value.jvNum

  //JOURNAL
  const jvEl = document.getElementById("journal-print")
  const footerText = "Journal Voucher " + jvNum + "; Printed on " + currentTime
  const jvHtml = printPdf(jvEl?.innerHTML || "", "Journal Voucher", footerText, "")
  const journalDocNames = []
  for (const doc of journal.value.docName) {
    journalDocNames.push({
      docName: doc.docName,
      id: journal.value.journalID,
      itemCategory: false,
      journal: true,
    })
  }
  data.push({ html: jvHtml, backupDocs: journalDocNames })

  //RECOVERIES
  const { itemCategories } = await itemCategoriesApi.list()

  journal.value.recoveries.forEach((recovery, inx) => {
    const recNum = recovery.refNum
    const recEl = document.getElementById(`recovery-print-${inx}`)
    const footerText = "Recovery " + recNum + "; Printed on " + currentTime
    const recHtml = printPdf(recEl?.innerHTML || "", "Recovery", footerText, "")
    const docNames = []
    for (const doc of recovery.docName) {
      docNames.push({
        docName: doc.docName,
        id: recovery.recoveryID,
        itemCategory: false,
        journal: false,
      })
    }

    const recoveryItems = recovery.recoveryItems
    recoveryItems.forEach((item) => {
      const index = itemCategories.findIndex((category) => category.itemCatID == item.itemCatID)
      if (index > -1) {
        const docs = itemCategories[index].documents

        if (isNil(docs)) return

        for (const doc of docs) {
          docNames.push({
            docName: doc.docName,
            id: item.itemCatID,
            itemCategory: true,
            journal: false,
          })
        }
      }
    })

    data.push({ html: recHtml, backupDocs: docNames })
  })

  const blob = await pdfApi.merge(journalIdNumber.value, data)

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `journal_${journalIdNumber.value}.pdf`
  link.click()
  window.URL.revokeObjectURL(url)
}

const snack = useSnack()

async function generateJournal() {
  try {
    console.log("Generating journal...")

    await downloadExcelFile()
    await downloadPdfFile()

    snack.success("Journal generated successfully")
  } catch (error) {
    console.error(error)
    snack.error("Failed to generate journal")
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
