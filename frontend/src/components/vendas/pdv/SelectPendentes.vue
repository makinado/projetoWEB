<template>
  <v-dialog
    v-model="modalStore.vendas.pdv.pendentes"
    scrollable
    width="1200"
    transition="dialog-transition"
  >
    <v-card>
      <v-card-title class="headline">Selecione um item</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="vendaStore.vendas"
          hide-actions
          :pagination.sync="pagination"
          no-data-text="Nenhuma venda pendente"
        >
          <template slot="items" slot-scope="data">
            <tr @click="selectVenda(data.item)">
              <td>{{ data.item.id }}</td>
              <td>
                <v-chip :color="getColor(data.item.tipo)" dark>{{ data.item.tipo }}</v-chip>
              </td>
              <td>{{ data.item.cliente }}</td>
              <td>{{ data.item.vendedor }}</td>
              <td>{{ data.item.data_criacao| date }}</td>
              <td>{{ data.item.valor_total | currency }}</td>
            </tr>
          </template>
        </v-data-table>
        <small>*Clique sobre a venda pendete seleciona-la</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click="modalStore.vendas.pdv.pendentes = false">Fechar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from "vuex";

import axios from "axios";
import { urlBD, showError } from "@/global";

export default {
  name: "select-orcamento",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["modalStore", "vendaStore"])
  },
  watch: {
    "$store.state.modalStore.vendas.pdv.pendentes"() {
      if (this.modalStore.vendas.pdv.pendentes) {
        this.$store.dispatch("loadOrcamentos");
      }
    }
  },
  components: {
    Card: () => import("@/components/material/Card"),
    GridVendas: () => import("@/components/vendas/GridVendas")
  },
  data() {
    return {
      headers: [
        { value: "id", text: "Código", sortable: false },
        { value: "tipo", text: "Tipo", sortable: false },
        { value: "cliente", text: "Cliente", sortable: false },
        { value: "vendedor", text: "Vendedor", sortable: false },
        { value: "data_criacao", text: "Data criado" },
        { value: "valor_total", text: "Valor total" }
      ],
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 20, // -1 for All,
        sortBy: "data_criacao",
        totalItems: 0
      }
    };
  },
  methods: {
    getColor(item) {
      if (item == "CONCLUÍDO") return "green";
      else if (item == "CANCELADO") return "red";
      else if (item == "VENDA") return "green";
      else if (item == "ORÇAMENTO") return "blue";
      else return "blue";
    },
    selectVenda(venda) {
      let url = `${urlBD}/vendas`;
      if (venda.id) {
        axios
          .get(`${url}/${venda.id}`)
          .then(res => {
            this.$store.dispatch("loadPDV", res.data);
          })
          .catch(showError)
          .then(() => (this.modalStore.vendas.pdv.pendentes = false));
      }
    }
  }
};
</script>

<style>
</style>