<template>
  <v-dialog
    v-model="modalStore.feedback.add"
    persistent
    max-width="800"
    transition="dialog-transition"
  >
    <v-card v-if="modalStore.feedback.add">
      <v-card-title>
        <span class="headline">Enviar feedback</span>
      </v-card-title>

      <v-card-text>
        <v-container grid-list-xl>
          <v-layout row wrap>
            <v-flex xs12 md12>
              <h4>Usuario - {{ usuarioStore.currentUsuario.nome }}</h4>
            </v-flex>
            <v-flex xs12 md6>
              <v-autocomplete
                dense
                :color="color"
                label="Tipo*"
                :items="['Problema', 'Erro', 'Sugestão']"
                v-model="feedback.tipo"
                clearable
              ></v-autocomplete>
            </v-flex>
            <v-flex xs12 md6>
              <v-autocomplete
                dense
                :color="color"
                label="Área do sistema*"
                :items="areas"
                v-model="feedback.tipo"
                clearable
              ></v-autocomplete>
            </v-flex>
            <v-flex xs12>
              <v-textarea box label="Descrição*" v-model="feedback.descricao"></v-textarea>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click="modalStore.feedback.add = false">Fechar</v-btn>
        <v-btn color="blue darken-1" flat @click="save">Enviar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from "vuex";
import { urlBD, showError, showSuccess, saveLog } from "@/global";

export default {
  name: "add-feedback",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["empresaStore", "usuarioStore", "modalStore"])
  },
  data() {
    return {
      feedback: {},
      areas: [
        { header: "Home" },
        {
          group: "Home",
          value: "home",
          text: "Painel"
        },
        { header: "Cadastros" },
        {
          group: "Cadastros",
          value: "empresas",
          text: "Empresas"
        },
        {
          group: "Cadastros",
          value: "pessoas",
          text: "Pessoas"
        },
        {
          group: "Cadastros",
          value: "usuarios",
          text: "Usuários"
        },
        {
          group: "Cadastros",
          value: "produtos",
          text: "Produtos"
        },

        { header: "Compras" },
        {
          group: "Compras",
          value: "pedidos",
          text: "Pedidos"
        },
        {
          group: "Compras",
          value: "compras",
          text: "Compras / Importações"
        },

        { header: "Vendas" },
        {
          group: "Vendas",
          value: "vendas",
          text: "Vendas / Orçamentos"
        },
        {
          group: "Vendas",
          value: "pdv",
          text: "PDV"
        },

        { header: "Financeiro" },
        {
          group: "Financeiro",
          value: "financeiro",
          text: "Financeiro"
        },
        {
          group: "Financeiro",
          value: "contas",
          text: "Contas"
        },

        { header: "Fiscal" },
        {
          group: "Fiscal",
          value: "nfe",
          text: "NF-e"
        },
        {
          group: "Fiscal",
          value: "nfce",
          text: "NFC-e"
        },
        {
          group: "Fiscal",
          value: "mdfe",
          text: "MDF-e"
        },

        { header: "Relatórios" },
        {
          group: "Relatórios",
          value: "rel_cadastros",
          text: "Cadastros"
        },
        {
          group: "Relatórios",
          value: "rel_compras",
          text: "Compras"
        },
        {
          group: "Relatórios",
          value: "rel_vendas",
          text: "Vendas"
        },
        {
          group: "Relatórios",
          value: "rel_estoque",
          text: "Estoque"
        },
        {
          group: "Relatórios",
          value: "rel_financeiro",
          text: "Financeiro"
        },
        {
          group: "Relatórios",
          value: "rel_estatisticas",
          text: "Estatísticas"
        }
      ]
    };
  },
  methods: {
    save() {}
  }
};
</script>

<style>
</style>