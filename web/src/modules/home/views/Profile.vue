<template>
  <SimpleCard
    v-if="currentUser"
    title="My Profile"
  >
    <p class="mb-4">** This information is all read-only</p>

    <v-row>
      <v-col>
        <v-text-field
          v-model="currentUser.first_name"
          outlined
          label="First name"
          readonly
          hide-details
        ></v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          v-model="currentUser.last_name"
          outlined
          label="Last name"
          readonly
          hide-details
        ></v-text-field>
      </v-col>

      <v-col>
        <v-text-field
          v-model="currentUser.email"
          outlined
          label="Email"
          readonly
          hide-details
        ></v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          v-model="currentUser.roles"
          outlined
          label="Roles"
          readonly
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>
  </SimpleCard>
</template>

<script lang="ts" setup>
import SimpleCard from "@/components/common/SimpleCard.vue"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"

const { currentUser } = useCurrentUser()

useBreadcrumbs("My Profile", [
  {
    title: "My Profile",
    to: { name: "ProfilePage" },
  },
])
</script>
