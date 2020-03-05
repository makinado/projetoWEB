<template>
  <v-container fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle
          main="Relatório estatísticos"
          icon="fa fa-line-chart"
          sub="Emita relatórios estatísticos"
        />
      </v-flex>
      <v-flex xs12>
        <Card :color="color" title="Selecione as opções para a emissão do relatório"></Card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import {
  urlBD,
  showError,
  parseNumber,
  formatDate,
  loadCategoriasPessoas,
  loadCategoriasProdutos,
  loadMarcas,
  loadUnidades
} from "@/global";
import axios from "axios";

import { ExportToCsv } from "export-to-csv";

export default {
  name: "financeiro",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "usuarioStore",
      "empresaStore",
      "produtoStore",
      "categoriaStore"
    ]),
    computedDateFormatted: {
      get() {
        return formatDate(this.filter.data_inicial);
      },
      set(value) {
        this.filter.data_inicial = value;
      }
    },
    computedDateFormatted1: {
      get() {
        return formatDate(this.filter.data_final);
      },
      set(value) {
        this.filter.data_final = value;
      }
    }
  },
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    Card: () => import("../material/Card")
  },
  data() {
    return {
      filter: {}
    };
  }
};
</script>