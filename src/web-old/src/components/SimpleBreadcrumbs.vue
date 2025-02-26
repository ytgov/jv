<template>


<v-breadcrumbs :items="items"></v-breadcrumbs>

<h1>{{ title }}</h1>

</template>

<script>
export default {
  name: "breadcrumbs",
  data: () => ({
    
  }),
  computed: {
    ...mapState("breadcrumbs", ["breadcrumbs", "title"]),
  },
};
</script>
