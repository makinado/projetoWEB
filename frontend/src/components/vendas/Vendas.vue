<template>
  <v-container fill-height fluid grid-list-xl>
    <AddVenda />
    <AddTabela />
    <AddPessoa />
    <Email />
    <Impressao />

    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="Orçamentos / Vendas" icon="fa fa-file-text" sub="Gerenciar orçamentos e vendas" />
        <v-card class="p-3">
          <GridVendas />
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";
import { urlBD, showError } from "@/global";
import { mapState } from "vuex";

export default {
  components: {
    PageTitle: () => import("../template/PageTitle"),
    GridVendas: () => import("./GridVendas"),
    AddVenda: () => import("./AddVenda"),
    AddTabela: () => import("./AddTabela"),
    AddPessoa: () => import("../pessoas/AddPessoa"),
    AddProduto: () => import("../produtos/AddProduto"),
    Email: () => import("@/components/email/Email"),
    Impressao: () => import("@/components/complementos/Impressao"),
  },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["vendaStore", "modalStore"])
  }
};
</script>
