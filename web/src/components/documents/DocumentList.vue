<template>
  <v-list>
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
</template>

<script setup lang="ts">
import http from "@/api/http-client"
import { ItemCategoryDocument } from "@/api/item-categories-api"

const emit = defineEmits(["refresh"])
defineProps({
  documents: {
    type: Array<ItemCategoryDocument>,
    required: true,
  },
  canDelete: {
    type: Boolean,
    default: false,
  },
})

function downloadDocument(itemDocument: ItemCategoryDocument) {
  if (!itemDocument.document) return

  const byteArray = new Uint8Array(itemDocument.document.data)
  const newBlob = new Blob([byteArray])

  const objUrl = window.URL.createObjectURL(newBlob)
  const link = document.createElement("a")
  link.href = objUrl
  link.download = itemDocument.docName || "download"
  link.click()
}

async function deleteDocument(itemDocument: ItemCategoryDocument) {
  const result = confirm("Are you sure you want to delete this document?")

  if (result) {
    await http.delete(
      `/api/admin/item-category-documents/${itemDocument?.itemCatID}/${itemDocument.documentID}`
    )
    emit("refresh")
  }
}
</script>
