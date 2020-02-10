<template>
  <v-container fill-height fluid grid-list-xl>
    <AddConta />
    <MovimentoCaixa />
    <Email />
    <Impressao />

    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="Contas" icon="fa fa-bank" sub="Gerencie suas contas" />
        <v-card class="p-3">
          <GridConta />
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "Caixa",
  components: {
    PageTitle: () => import("../template/PageTitle"),
    GridConta: () => import("./GridConta"),
    AddConta: () => import("./AddConta"),
    MovimentoCaixa: () => import("./MovimentoCaixa"),
    Email: () => import("@/components/email/Email"),
    Impressao: () => import("@/components/complementos/Impressao")
  }
};
</script>

<style>
</style>
