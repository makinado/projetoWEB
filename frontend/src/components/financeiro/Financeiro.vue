<template>
  <v-container fill-height fluid grid-list-xl>
    <AddFinanceiro />
    <Pagamento />
    <VerConta />
    <AddClassificacoes />
    <AddDocumentos />

    <AddPessoas />

    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="Financeiro" icon="fa fa-arrow-circle-up" sub="Gerencie seu financeiro" />
        <v-card class="p-3">
          <GridFinanceiro />
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "Financeiro",
  components: {
    PageTitle: () => import("../template/PageTitle"),
    GridFinanceiro: () => import("./GridFinanceiro"),
    AddFinanceiro: () => import("./AddFinanceiro"),
    Pagamento: () => import("./Pagamento"),
    VerConta: () => import("./VerConta"),
    AddClassificacoes: () => import("./AddClassificacoes"),
    AddDocumentos: () => import("./AddDocumentos"),
    AddPessoas: () => import("../pessoas/AddPessoa")
  }
};
</script>

<style>
</style>
