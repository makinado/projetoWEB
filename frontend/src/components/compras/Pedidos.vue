<template>
  <v-container fill-height fluid grid-list-xl>
    <ImportarCompra />
    <AddCompra />
    <AddPedido />
    <AddPessoa />
    <Email />
    <Impressao />

    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="Pedidos" icon="fa fa-file" sub="Gerencie seus pedidos de compras" />
        <v-card class="p-3">
          <GridPedidos />
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "Pedidos",
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    GridPedidos: () => import("./GridPedidos"),
    ImportarCompra: () => import("./ImportarCompra"),
    AddCompra: () => import("./AddCompra"),
    AddPessoa: () => import("../pessoas/AddPessoa"),
    AddPedido: () => import("./AddPedido"),
    Email: () => import("@/components/email/Email"),
    Impressao: () => import("@/components/complementos/Impressao"),
  }
};
</script>
