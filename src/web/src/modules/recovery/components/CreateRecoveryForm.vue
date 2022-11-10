<template>
  <v-form>
    <v-row>
      <v-col cols="12">
        <v-text-field label="Description" v-model="recovery.RequestDesc" dense outlined hide-details></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          label="Requestor first name"
          v-model="recovery.FirstName"
          dense
          outlined
          hide-details
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          label="Requestor last name"
          v-model="recovery.LastName"
          dense
          outlined
          hide-details
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field label="Reference #" v-model="recovery.RefNum" dense outlined hide-details></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field label="Department" v-model="recovery.Department" dense outlined></v-text-field>
        <v-text-field label="Branch" v-model="recovery.Branch" dense outlined hide-details></v-text-field
      ></v-col>
    </v-row>

    <v-btn color="primary" @click="createClick" :disabled="!canCreate">Create</v-btn>
  </v-form>
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "CreateRecoveryForm",
  props: ["saveComplete"],
  data: () => ({
    recovery: { items: [] },
  }),
  computed: {
    canCreate() {
      if (
        this.recovery.RequestDesc &&
        this.recovery.FirstName &&
        this.recovery.LastName &&
        this.recovery.Department &&
        this.recovery.Branch &&
        this.recovery.RefNum
      )
        return true;

      return false;
    },
  },
  methods: {
    ...mapActions("recovery", ["create"]),

    async createClick() {
      if (this.canCreate) {
        await this.create({ body: this.recovery });
      }

      if (this.saveComplete) this.saveComplete();
    },
  },
};
</script>
