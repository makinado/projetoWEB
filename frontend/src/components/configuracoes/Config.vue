<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="Configurações" icon="fa fa-cog" sub="Gerencie as configurações do sistema" />
        <v-card class="p-3"></v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "Caixa",
  components: {
    PageTitle: () => import("../template/PageTitle")
  }
};
</script>

<style>
</style>
