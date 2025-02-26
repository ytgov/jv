<template>
  <SimpleCard title="Item Details">
    <v-row v-if="item">
      <v-col cols="6">
        <v-text-field
          v-model="item.category"
          label="Name"
          hide-details
        />
      </v-col>
      <v-col cols="6">
        <CurrencyField
          v-model="item.price"
          label="Default cost"
          hide-details
        />
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="item.description"
          label="Description"
          hide-details
        />
      </v-col>
      <v-col cols="6">
        <ICTBranchSelect
          v-model="item.branch"
          label="ICT branch"
          hide-details
        />
      </v-col>
      <v-col
        cols="6"
        class="py-0"
      >
        <v-switch
          v-model="item.active"
          class="pl-2"
          label="Is active?"
        />
      </v-col>
      <v-col
        cols="6"
        class="py-0"
      >
        <v-switch
          v-model="item.changeQuantity"
          class="pl-2"
          label="Can change quantity"
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
import { isNil } from "lodash"

import http from "@/api/http-client"
import SimpleCard from "@/components/common/SimpleCard.vue"
import CurrencyField from "@/components/common/CurrencyField.vue"
import ICTBranchSelect from "@/components/departments/ICTBranchSelect.vue"
import DocumentList from "@/components/documents/DocumentList.vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useItemCategory from "@/use/use-item-category"
import formatDate from "@/utils/format-date"
import useItemCategories from "@/use/use-item-categories"

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

  if (isNil(item.value.category) || isNil(item.value.active)) return false

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
