<template>
  <div class="produtos-container" ref="produtosContainer">
    <v-data-table
      :headers="fields"
      :items="vendaStore.pdv.produtos"
      :pagination.sync="pagination"
      hide-actions
      no-data-text="Nenhum produto adicionado"
      :class="elevate ? 'elevation-5' : ''"
    >
      <template v-slot:items="data">
        <td>{{ data.item.sequencia }}</td>
        <td class="text-truncate-1">{{ data.item.produto.text }}</td>
        <td>{{ data.item.quantidade }}</td>
        <td>{{ data.item.valor_venda }}</td>
        <td>{{ data.item.valor_total }}</td>
        <td v-if="showActions">
          <v-btn color="warning" dark icon @click="edit(data.item)">
            <v-icon>fa fa-lg fa-pencil</v-icon>
          </v-btn>
          <v-btn color="danger" dark icon @click="deleteItem(data.item)">
            <v-icon>fa fa-lg fa-trash</v-icon>
          </v-btn>
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { showSuccess } from "@/global";

import Bus from "@/config/eventBus";

export default {
  name: "grid-produtos",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["vendaStore"])
  },
  watch: {
    "$store.state.vendaStore.pdv.produtos"() {
      this.scrollToEnd();
    }
  },
  props: {
    showActions: { type: Boolean, default: true },
    elevate: { type: Boolean, default: false }
  },
  data() {
    return {
      fields: [
        { value: "sequencia", text: "Item" },
        { value: "produto.text", text: "Produto" },
        { value: "quantidade", text: "Quantidade" },
        { value: "valor_venda", text: "Vlr. venda" },
        { value: "valor_total", text: "Total" },
        {
          value: "actions",
          text: "Ações",
          align: this.showActions ? "" : " d-none"
        }
      ],
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 20, // -1 for All,
        sortBy: "sequencia",
        totalItems: 0
      }
    };
  },
  methods: {
    async scrollToEnd() {
      this.$nextTick(() => {
        var container = this.$refs.produtosContainer;
        if (container) container.scrollTop = container.scrollHeight;
      });
    },
    deleteItem(item) {
      this.vendaStore.pdv.produtos = this.vendaStore.pdv.produtos.filter(
        produto => {
          return produto.sequencia !== item.sequencia;
        }
      );

      this.$store.dispatch("calcTotalPDV");
      showSuccess("Produto excluído com sucesso");
    },
    edit(item) {
      Bus.$emit("setProduto", item);
    }
  }
};
</script>

<style>
</style>