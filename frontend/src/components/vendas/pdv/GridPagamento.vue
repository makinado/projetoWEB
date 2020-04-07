<template>
  <div class="produtos-container" ref="produtosContainer">
    <v-data-table
      :headers="fields"
      :items="financeiro"
      hide-actions
      no-data-text="Nenhuma forma de pagamento adicionada"
    >
      <template slot="items" slot-scope="data">
        <td>{{ data.item.sequencia}}</td>
        <td>
          <v-chip :color="color" dark>{{ data.item.forma_pagamento }}</v-chip>
        </td>
        <td>{{ data.item.valor_pago || "R$ 0,00" }}</td>
        <td>{{ data.item.data_baixa | date }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "grid-financeiro",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "pessoaStore",
      "usuarioStore",
      "financeiroStore",
      "vendaStore",
      "modalStore"
    ]),
    financeiro: {
      get() {
        return this.vendaStore.pdv.financeiro;
      },
      set(value) {
        this.vendaStore.pdv.financeiro = value;
      }
    }
  },
  data() {
    return {
      fields: [
        { value: "sequencia", text: "Item" },
        { value: "forma_pagamento", text: "Forma de pagamento" },
        { value: "valor_pago", text: "Valor pago" },
        { value: "data_baixa", text: "Data pagamento" }
      ]
    };
  },
  methods: {
    async scrollToEnd() {
      this.$nextTick(() => {
        var container = this.$refs.pagamentoContainer;
        if (container) container.scrollTop = container.scrollHeight;
      });
    }
  }
};
</script>

<style>
</style>