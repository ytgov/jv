<template>
  <div v-if="documents.length == 0">None found</div>

  <v-list v-else>
    <v-list-item
      v-for="(doc, index) in documents"
      :key="index"
      :title="doc.docName"
      class="px-1"
    >
      <template #prepend>
        <v-btn
          icon="mdi-download"
          variant="text"
          size="small"
          @click="downloadDocument(doc)"
        />
      </template>
      <template #append>
        <v-btn
          v-if="canDelete"
          icon="mdi-delete"
          color="warning"
          variant="text"
          size="small"
          @click="deleteDocument(doc)"
        />
      </template>
    </v-list-item>
  </v-list>

  <v-btn
    v-if="canUpload"
    :loading="savingData"
    class="mt-5"
    color="info"
    size="small"
    @click="uploadDocument"
  >
    Upload Back-up
    <input
      id="inputfile"
      type="file"
      style="display: none"
      accept="application/pdf"
      @change.stop="handleSelectedFile"
    />
  </v-btn>
</template>

<script setup lang="ts">
import recoveriesApi, { RecoveryDocument } from "@/api/recoveries-api"
import { ref } from "vue"

const emit = defineEmits(["refresh"])
const props = defineProps({
  recoveryId: {
    type: Number,
    required: true,
  },
  documents: {
    type: Array<RecoveryDocument>,
    required: true,
  },
  canDelete: {
    type: Boolean,
    default: false,
  },
  canUpload: {
    type: Boolean,
    default: false,
  },
})

const toUpload = ref<File[]>([])
const alert = ref(false)
const savingData = ref(false)

function uploadDocument() {
  alert.value = false
  const el = document.getElementById("inputfile")
  if (el) el.click()
}

function handleSelectedFile(event: Event) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toUpload.value = (event.target as any).files

  saveBackUPFile()
}

function downloadDocument(itemDocument: RecoveryDocument) {
  if (!itemDocument.document) return

  const byteArray = new Uint8Array(itemDocument.document.data)
  const newBlob = new Blob([byteArray])

  const objUrl = window.URL.createObjectURL(newBlob)
  const link = document.createElement("a")
  link.href = objUrl
  link.download = itemDocument.docName || "download"
  link.click()
}

async function deleteDocument(itemDocument: RecoveryDocument) {
  const result = confirm("Are you sure you want to delete this document?")

  if (result) {
    await recoveriesApi.deleteUpload(props.recoveryId, itemDocument.documentID)

    emit("refresh")
  }
}

async function saveBackUPFile() {
  alert.value = false
  const formData = new FormData()

  savingData.value = true

  for (const doc of toUpload.value) {
    formData.append("files", doc)
  }

  await recoveriesApi.upload(props.recoveryId, formData)

  emit("refresh")

  savingData.value = false
}
</script>
