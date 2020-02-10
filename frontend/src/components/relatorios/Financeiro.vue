<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle
          main="Relatório financeiro"
          icon="fa fa-usd"
          sub="Emita relatórios do financeiro"
        />
        <v-card class="p-3"><v-card-title class="headline">Selecione as opções para emissão do relatório</v-card-title></v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "financeiro",
  components: {
    PageTitle: () => import("@/components/template/PageTitle")
  }
};
</script>