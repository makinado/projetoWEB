<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="Material de apoio" icon="fa fa-book" sub="Tenha acesso ao material de apoio" />
        <v-card class="p-3"></v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "MaterialApoio",
  components: {
    PageTitle: () => import("@/components/template/PageTitle")
  }
};
</script>