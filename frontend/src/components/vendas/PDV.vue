<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="PDV" icon="fa fa-tv" sub="Módulo de PDV" />
        <v-card class="p-3"></v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "PDV",
  components: {
    PageTitle: () => import("@/components/template/PageTitle")
  }
};
</script>