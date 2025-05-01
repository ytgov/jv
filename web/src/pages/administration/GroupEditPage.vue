<template>
  <SimpleCard title="Group Details">
    <v-row v-if="item">
      <v-col cols="3">
        <v-text-field
          v-model="item.branch"
          label="Branch"
          hide-details
        />
      </v-col>
      <v-col cols="3">
        <v-text-field
          v-model="item.unit"
          label="Unit"
          hide-details
        />
      </v-col>
      <v-col cols="3">
        <v-text-field
          v-model="item.short_name"
          label="Short name"
          hide-details
        />
      </v-col>
    </v-row>

    <v-btn
      class="mt-5"
      :disabled="!isValid"
      @click="saveClick"
      >Save Group</v-btn
    >
  </SimpleCard>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { isEmpty, isNil } from "lodash"

import SimpleCard from "@/components/common/SimpleCard.vue"

import useSnack from "@/use/use-snack"
import useGroup from "@/use/use-group"
import useBreadcrumbs from "@/use/use-breadcrumbs"

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const snack = useSnack()
const router = useRouter()
const { group: item, save, create } = useGroup(ref(parseInt(props.id)))

const isValid = computed(() => {
  if (isNil(item) || isNil(item.value)) {
    return false
  }

  if (isEmpty(item.value.branch) || isEmpty(item.value.short_name)) return false

  return true
})

useBreadcrumbs("Group Details", [
  {
    title: "Administration",
    to: {
      name: "AdministrationPage",
    },
  },
  {
    title: "Groups",
    to: {
      name: "administration/GroupListPage",
    },
  },
  {
    title: "Group Details",
    to: {
      name: "administration/GroupEditPage",
      params: { id: props.id },
    },
  },
])

async function saveClick() {
  if (isNil(item.value?.id)) await create()
  else await save()

  snack.success("Group saved successfully")
  router.push({ name: "administration/GroupListPage" })
}
</script>
