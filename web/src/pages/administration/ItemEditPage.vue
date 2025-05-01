<template>
  <SimpleCard title="Item Details">
    <v-row v-if="item">
      <v-col cols="4">
        <v-text-field
          v-model="item.category"
          label="Name"
          hide-details
        />
      </v-col>
      <v-col cols="4">
        <CurrencyField
          v-model="item.price"
          label="Default cost"
          hide-details
        />
      </v-col>
      <v-col cols="4">
        <v-text-field
          v-model="item.description"
          label="Description"
          hide-details
        />
      </v-col>
      <v-col cols="8">
        <GroupSelect
          v-model="item.branch"
          label="Group"
          hide-details
        />
      </v-col>
      <v-col cols="4">
        <v-switch
          v-model="item.active"
          class="my-0"
          label="Is Active?"
        />
      </v-col>
    </v-row>

    <v-btn
      :disabled="!isValid"
      @click="saveClick"
      >Save Item</v-btn
    >
  </SimpleCard>
  <v-row v-if="item && item.itemCatID">
    <v-col
      cols="12"
      md="6"
    >
      <SimpleCard
        title="Documents"
        :hide-margin="true"
      >
        <template #rightTitle>
          <v-btn
            color="info"
            size="small"
            @click="uploadClick"
            >Upload</v-btn
          >
          <input
            id="inputfile"
            type="file"
            style="display: none"
            @change="handleSelectedFile"
          />
        </template>

        <div v-if="isNil(item.documents) || item.documents?.length == 0">None found</div>

        <DocumentList
          v-else-if="item.documents"
          :documents="item.documents"
          :can-delete="true"
          @refresh="fetch"
        />
      </SimpleCard>
    </v-col>
    <v-col
      cols="12"
      md="6"
    >
      <SimpleCard title="Audit History">
        <div v-if="isNil(item.audits) || item.audits?.length == 0">None found</div>

        <v-list v-else>
          <v-list-item
            v-for="(doc, index) in item.audits"
            :key="index"
            :title="doc.action"
            :subtitle="`By ${doc.user} on ${formatDate(doc.date)}`"
          >
          </v-list-item>
        </v-list>
      </SimpleCard>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { isEmpty, isNil } from "lodash"

import http from "@/api/http-client"
import SimpleCard from "@/components/common/SimpleCard.vue"
import CurrencyField from "@/components/common/CurrencyField.vue"
import DocumentList from "@/components/documents/DocumentList.vue"
import GroupSelect from "@/components/groups/GroupSelect.vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useItemCategory from "@/use/use-item-category"
import useItemCategories from "@/use/use-item-categories"
import formatDate from "@/utils/format-date"

const props = defineProps({
  itemCatID: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const { itemCategory: item, save, fetch } = useItemCategory(ref(parseInt(props.itemCatID)))

const isValid = computed(() => {
  if (isNil(item) || isNil(item.value)) {
    return false
  }

  if (
    isEmpty(item.value.category) ||
    isNil(item.value.active) ||
    isNil(item.value.branch) ||
    isNil(item.value.price)
  )
    return false

  return true
})

useBreadcrumbs("Item Details", [
  {
    title: "Administration",
    to: {
      name: "AdministrationPage",
    },
  },
  {
    title: "Items",
    to: {
      name: "administration/ItemListPage",
    },
  },
  {
    title: "Item Details",
    disabled: true,
    to: {
      name: "administration/ItemEditPage",
    },
  },
])

async function saveClick() {
  await save()
  const { fetch } = useItemCategories()
  await fetch()

  router.push({ name: "administration/ItemListPage" })
}

function uploadClick() {
  const el = document.getElementById("inputfile")
  if (el) el.click()
}

async function handleSelectedFile(event: Event) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const files = (event.target as any).files as FileList

  if (files.length > 0) {
    await http.post(
      `/api/admin/item-category-documents/${item.value?.itemCatID}`,
      { files: files[0] },
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
    fetch()
  }
}
</script>
<!-- 
    getActionDescription() {
      if (this.action == "Add") return "New item added.";
      else {
        let action = "Item modified.";
        if (this.currentItem.category != this.category)
          action += `\nChanging name from ${this.currentItem.category} to ${this.category};`;
        if (this.currentItem.price != this.price) {
          const price = this.price ? this.price : 0;
          action += `\nChanging cost from ${this.currentItem.price} to ${price};`;
        }
        if (this.currentItem.active != this.active) {
          const status = this.active ? "Active" : "Inactive";
          action += `\nChanging status to ${status};`;
        }

        const branch = this.currentItem.branch;
        if (this.branch != branch) action += `\nChanging branches;`;

        return action;
      }
    },
  },
};
</script>
 -->
