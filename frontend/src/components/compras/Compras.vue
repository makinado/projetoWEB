<template>
  <v-container fill-height fluid grid-list-xl>
    <ImportarCompra />
    <AddCompra />
    <DownloadXML />
    <AddProduto />
    <AddPessoa />

    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle
          main="Importar Notas fiscais"
          icon="fa fa-cart-arrow-down"
          sub="Gerencie suas compras"
        />
        <v-card class="p-3">
          <GridCompras />
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "Compras",
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    GridCompras: () => import("./GridCompras"),
    ImportarCompra: () => import("./ImportarCompra"),
    AddCompra: () => import("./AddCompra"),
    DownloadXML: () => import("./DownloadXML"),
    AddPessoa: () => import("../pessoas/AddPessoa"),
    AddProduto: () => import("../produtos/AddProduto"),
    AddDocumento: () => import("../financeiro/AddDocumentos")
  }
};
</script>
