<template>
  <v-form>
    <v-row>
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

    <v-btn color="primary" @click="saveClick" :disabled="!canSave" class="mr-5">Save</v-btn>
    <v-btn color="secondary" @click="cancelClick">Cancel</v-btn>
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
    canSave() {
      if (
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
  async mounted() {

    console.log(this.$route.params.id)

    let id = this.$route.params.id;
    this.recovery = await this.getById({id:id});
  },
  methods: {
    ...mapActions("recovery", ["getById", "update"]),

    cancelClick() {
      this.$router.push("/recovery");
    },
    async saveClick() {
      if (this.canCreate) {
        await this.create({ body: this.recovery });
      }

      if (this.saveComplete) this.saveComplete();
    },
  },
};
</script>
