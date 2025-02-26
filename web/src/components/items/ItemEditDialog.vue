<template>
  <v-dialog
    v-model="dialog"
    max-width="600px"
    >ITEM EDIT

    <!-- <v-card>
      <v-card-title class="primary pr-4">
        <div
          class="text-h5"
          style="color: white"
        >
          {{ action }} Item
        </div>
        <v-spacer />
        <v-btn
          fab
          small
          elevation="0"
          color="primary"
          class="my-0"
          @click="itemDialog = false"
          ><v-icon>mdi-close</v-icon></v-btn
        >
      </v-card-title>

      <v-card-text>
        <v-switch
          v-model="active"
          label="Active"
          color="primary"
        />
        <v-checkbox
          label="Can Change Quantity"
          v-model="changeQuantity"
        />

        <v-text-field
          label="Item Name"
          v-model="category"
          class="mt-5"
          :error="categoryErr"
          @input="categoryErr = false"
          outlined
        />

        <v-text-field
          label="Default Cost"
          v-model="price"
          class="mt-1"
          outlined
          prefix="$"
        />

        <v-text-field
          label="Default Description"
          v-model="description"
          class="mt-1"
          outlined
        />

        <v-row :style="{ border: branchErr ? '1px solid red' : '0px solid' }">
          <v-col
            v-for="(branchOption, branchInx) in branchOptions"
            :key="branchInx"
          >
            <v-checkbox
              :multiple="false"
              @change="branchErr = false"
              dense
              v-model="branch"
              :value="branchOption"
              :label="branchOption"
            />
          </v-col>
        </v-row>

        <v-row class="mt-10 ml-3">
          <title-card
            class="mr-6"
            titleWidth="6.85rem"
          >
            <template #title>
              <div>Documents</div>
            </template>
            <template #body>
              <div
                style="width: 15rem; min-height: 2rem"
                :key="update"
                class="mx-4 blue--text text-h7 text-decoration-underline"
              >
                <div v-if="allUploadingDocuments.length > 0">
                  <div
                    v-for="(doc, inx) in allUploadingDocuments"
                    :key="inx"
                    class="my-1"
                  >
                    {{ doc.name }}
                  </div>
                </div>
                <div v-if="backupFiles">
                  <div
                    v-for="(doc, inx) in backupFiles"
                    :key="inx"
                    class="my-1"
                  >
                    <a
                      color="transparent"
                      class="my-3"
                      @click="downloadDocument(doc.docName)"
                    >
                      <b>{{ doc.docName }}</b>
                    </a>
                  </div>
                </div>
              </div>
            </template>
          </title-card>
          <v-col>
            <div>
              <v-btn
                class="mx-0 my-0"
                color="primary"
                elevation="5"
                @click="uploadDocument"
              >
                Upload File
                <input
                  id="inputfile"
                  type="file"
                  style="display: none"
                  accept="application/pdf"
                  @change="handleSelectedFile"
                  onclick="this.value=null;"
                />
              </v-btn>
            </div>
            <div>
              <v-btn
                v-if="allUploadingDocuments.length > 0"
                class="mx-0 mt-5 cyan--text text--darken-2"
                color="secondary"
                @click="allUploadingDocuments = []"
              >
                Clear Uploaded File(s)
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <v-row class="mt-15 ml-3">
          <v-data-table
            dense
            :page="page"
            :items-per-page="5"
            :headers="auditHeaders"
            :items="itemAudits"
            class="elevation-1"
          >
            <template v-slot:[`item.date`]="{ item }">
              {{ item.date | getDate }}
            </template>
            <template v-slot:[`item.action`]="{ item }">
              <div style="white-space: pre">{{ item.action }}</div>
            </template>
          </v-data-table>
        </v-row>
      </v-card-text>
      <v-alert
        v-if="alertMsg"
        class="mt-5 mx-10"
        type="info"
        dismissible
        >{{ alertMsg }}</v-alert
      >
      <v-card-actions>
        <v-btn
          class="ml-3"
          color="secondary primary--text"
          @click="itemDialog = false"
        >
          Cancel
        </v-btn>
        <v-btn
          class="mr-3 ml-auto px-6"
          color="primary"
          @click="saveItem"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card> -->
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue"

const dialog = ref(false)
</script>
