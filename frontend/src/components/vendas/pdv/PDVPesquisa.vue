<template>
  <v-card flat>
    <v-card-text>
      <v-form v-model="valid" ref="form">
        <v-autocomplete
          ref="produto"
          class="tag-input"
          chips
          dense
          deletable-chips
          no-data-text="Nenhum produto cadastrado"
          label="Escolha o produto ou leia o código de barras"
          prepend-icon="fa fa-search"
          :items="produtoStore.produtos"
          v-model="produto.produto"
          @change="[loadDados(produto.produto)]"
          return-object
          :rules="produtoRules"
          @input="produto.produto ? $refs.quantidade.focus() : null"
          @focus="$store.dispatch('loadProdutos')"
        ></v-autocomplete>

        <v-layout row wrap>
          <v-flex xs12 md4>
            <v-text-field
              ref="quantidade"
              v-model="produto.quantidade"
              v-money="decimal"
              label="QUANTIDADE"
              @input="calcTotal"
              @keyup.enter="add"
              :rules="quantidadeRules"
            ></v-text-field>
          </v-flex>
          <v-flex xs12 md4>
            <v-text-field
              ref="valor_venda"
              v-model="produto.valor_venda"
              v-money="money"
              label="VALOR DE VENDA"
              @change="calcTotal"
              @keyup.enter="add"
              :rules="valorVendaRules"
            ></v-text-field>
          </v-flex>
          <v-flex xs12 md4>
            <v-text-field
              ref="valor_desconto"
              v-model="produto.valor_desconto"
              v-money="money"
              label="DESCONTO"
              @change="calcTotal"
              @keyup.enter="add"
            ></v-text-field>
          </v-flex>
          <v-flex xs12 md6>
            <v-text-field
              readonly
              v-model="produto.qtdEstoque"
              placeholder="R$ 0,00"
              label="ESTOQUE ATUAL DO ITEM"
              outline
            ></v-text-field>
          </v-flex>
          <v-flex xs12 md6>
            <v-text-field
              readonly
              v-model="produto.valor_total"
              placeholder="R$ 0,00"
              label="VALOR TOTAL"
              outline
            ></v-text-field>
          </v-flex>
        </v-layout>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-btn
        :color="mode == 'save' ? 'warning' : 'danger'"
        class="v-btn-common"
        @click="reset"
      >{{mode == 'save' ? 'limpar' : 'canelar'}}</v-btn>
      <v-btn
        :color="color"
        class="v-btn-common"
        @click="add"
      >{{mode == 'save' ? 'adicionar' : 'concluir'}}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState } from "vuex";
import { VMoney } from "v-money";

import { moneyToNumber, parseNumber } from "@/global";
import { formatToBRL } from "brazilian-values";

import Bus from "@/config/eventBus";

export default {
  directives: { money: VMoney },
  name: "pdv-pesquisa",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["produtoStore", "vendaStore"]),
    pdvProduto: {
      get() {
        return this.vendaStore.pdv.pdvProduto;
      },
      set(value) {
        this.vendaStore.pdv.pdvProduto = value;
      }
    }
  },
  data() {
    return {
      valid: true,
      produto: {},
      mode: "save",
      money: {
        decimal: ",",
        thousands: ".",
        prefix: "R$ ",
        precision: 2,
        masked: false
      },
      decimal: {
        decimal: ",",
        thousands: ".",
        prefix: "",
        precision: 2,
        masked: false
      },
      produtoRules: [v => !!v || "Produto não selecionado"],
      quantidadeRules: [
        v => !!v || "Quantidade é obrigatório",
        v => (!!v && v !== "0,00") || "Quantidade não pode ser 0,00"
      ],
      valorVendaRules: [
        v => !!v || "Valor de venda é obrigatório",
        v => (!!v && v !== "R$ 0,00") || "Valor de venda não pode ser 0,00"
      ]
    };
  },
  methods: {
    reset() {
      this.produto = {};
      this.mode = "save";

      this.$refs.form ? this.$refs.form.reset() : null;

      this.$refs.quantidade
        ? (this.$refs.quantidade.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.valor_venda
        ? (this.$refs.valor_venda.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : null;
      this.$refs.valor_desconto
        ? (this.$refs.valor_desconto.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : null;
    },
    add() {
      if (!this.$refs.form.validate()) return;

      if (this.mode == "save") {
        this.$store.commit("pushPDVProduto", this.produto);
      }
      this.$store.dispatch("calcTotalPDV");
      this.reset();
      this.$refs.produto.focus();
    },
    loadDados(produto) {
      if (!produto.value) {
        this.reset();
        return;
      }

      const produtoFilter = this.produtoStore.produtos.find(item => {
        return item.value === produto.value;
      });

      this.$set(this.produto, "valor_venda", produtoFilter.valor_venda);
      this.$set(
        this.produto,
        "qtdEstoque",
        formatToBRL(produtoFilter.qtdEstoque).replace("R$", "")
      );

      this.$refs.valor_venda.$el.getElementsByTagName("input")[0].value =
        produtoFilter.valor_venda;
    },
    calcTotal() {
      if (!this.produto.produto) return;

      this.$set(
        this.produto,
        "valor_total",
        formatToBRL(
          parseNumber(this.produto.quantidade || "0,00") *
            parseNumber(this.produto.valor_venda || "0,00") -
            parseNumber(this.produto.valor_desconto || "0,00")
        )
      );
    },
    loadProduto(produto) {
      this.produto = produto;

      this.$refs.quantidade.$el.getElementsByTagName("input")[0].value =
        produto.quantidade;
      this.$refs.valor_venda.$el.getElementsByTagName("input")[0].value =
        produto.valor_venda;
      this.$refs.valor_desconto.$el.getElementsByTagName("input")[0].value =
        produto.valor_desconto;
    }
  },
  mounted() {
    this.reset();

    Bus.$on("setProduto", produto => {
      this.mode = "edit";
      this.loadProduto(produto);
    });
  }
};
</script>

<style>
</style>