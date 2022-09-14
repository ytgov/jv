<template>
  <v-form>
    <v-row>
      <v-col cols="6">
        <v-text-field label="Requestor first name" v-model="item.FirstName" dense outlined hide-details></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field label="Requestor last name" v-model="item.LastName" dense outlined hide-details></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field label="Reference #" v-model="item.RefNum" dense outlined hide-details></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field label="Department" v-model="item.Department" dense outlined></v-text-field>
        <v-text-field label="Branch" v-model="item.Branch" dense outlined hide-details></v-text-field
      ></v-col>
    </v-row>

    <v-btn color="primary" @click="saveClick" :disabled="!canSave">Save</v-btn>
  </v-form>
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "CreateRecoveryForm",
  props: ["saveComplete"],
  data: () => ({
    item: {},
  }),
  computed: {
    canSave() {
      if (this.item.FirstName && this.item.LastName && this.item.Department && this.item.RefNum) return true;

      return false;
    },
  },
  methods: {
    ...mapActions("recovery", ["create"]),
    saveClick() {
      if (this.saveComplete) this.saveComplete();
    },
  },
};
</script>
