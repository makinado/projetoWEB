<template>
  <v-container fill-height fluid grid-list-xl>
    <Estoque />
    <AddProduto />
    <AddPessoa />
    <AddMarca />
    <AddCategoria />
    <AddUnidade />
    <GruposTributacao />

    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="Produtos" icon="fa fa-archive" sub="Gerencie seus produtos" />
        <v-card class="p-3">
          <GridProdutos />
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "Produtos",
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    GridProdutos: () => import("./GridProdutos"),
    Estoque: () => import("./Estoque"),
    AddProduto: () => import("./AddProduto"),
    AddPessoa: () => import("./../pessoas/AddPessoa"),
    AddMarca: () => import("./AddMarca"),
    AddCategoria: () => import("./AddCategoria"),
    AddUnidade: () => import("./AddUnidade"),
    GruposTributacao: () => import("./GruposTributacao"),
  }
};
</script>