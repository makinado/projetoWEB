<template>
  <v-container fill-height fluid grid-list-xl>
    <AddOrcamento />
    <AddTabela />
    <AddPessoa />
    <Email />
    <Impressao />

    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="Orçamentos" icon="fa fa-file-text" sub="Gerenciar orçamentos" />
        <v-card class="p-3">
          <GridOrcamentos />
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
    GridOrcamentos: () => import("./GridOrcamentos"),
    AddOrcamento: () => import("./AddOrcamento"),
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
