<template>
  <v-date-input :display-format="makeFormat" />
</template>

<script setup lang="ts">
import { DateTime } from "luxon"
import { isNil } from "lodash"

function makeFormat(input: Date | string | null | undefined) {
  if (typeof input === "string") {
    return DateTime.fromFormat(input, "yyyy-MM-dd").toFormat("yyyy/MM/dd")
  } else if (typeof input == "object") {
    return DateTime.fromJSDate(input as Date).toFormat("yyyy/MM/dd")
  } else if (isNil(input)) {
    return ""
  }
}
</script>
