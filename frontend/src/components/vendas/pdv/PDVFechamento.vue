<template>
  <v-card>
    <v-card-title class="headline">
      <span class="mr-5">Verifique os dados antes de finalizar</span>
    </v-card-title>

    <v-layout row wrap>
      <v-flex xs12>
        <Card title="Totais" :color="color">
          <v-container grid-list-xl>
            <v-layout row wrap>
              <v-flex xs12 md4>
                <v-autocomplete
                  ref="cliente"
                  class="tag-input"
                  chips
                  dense
                  append-icon="fa fa-lg fa-user"
                  label="Cliente"
                  :items="pessoaStore.clientes"
                  v-model="venda.id_pessoa"
                  readonly
                ></v-autocomplete>
              </v-flex>

              <v-flex xs12 md4 class="mt-2">
                <v-text-field
                  label="CPF/CNPJ"
                  v-model="venda.cpf_cnpj"
                  v-mask="['###.###.###-##', '##.###.###/####-##']"
                  clearable
                ></v-text-field>
              </v-flex>

              <v-flex xs12 md4>
                <v-autocomplete
                  class="tag-input"
                  chips
                  dense
                  append-icon="fa fa-lg fa-user-o"
                  label="Vendedor"
                  :items="usuarioStore.currentUsuarios"
                  v-model="venda.id_vendedor"
                  readonly
                ></v-autocomplete>
              </v-flex>

              <v-flex xs12 md4>
                <v-text-field
                  label="VALOR DESCONTOS"
                  readonly
                  v-model="venda.totais.valor_desconto"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field
                  label="VALOR ACRÉSCIMOS"
                  readonly
                  v-model="venda.totais.valor_acrescimo"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field label="VALOR TOTAL" readonly v-model="venda.totais.valor_total"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </Card>
      </v-flex>

      <v-flex xs12 md6>
        <Card title="Formas de pagamento" :color="color">
          <GridPagamento />
        </Card>
      </v-flex>

      <v-flex xs12 md6>
        <Card title="Produtos" :color="color">
          <GridProdutos :showActions="false" />
        </Card>
      </v-flex>
    </v-layout>

    <v-card-actions>
      <v-layout class="my-4" row justify-center>
        <v-btn class="v-btn-common" color="warning" @click="stepper = 2">Voltar</v-btn>
        <v-btn class="v-btn-common" :color="color" @click="save">Finalizar</v-btn>
      </v-layout>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState } from "vuex";
import { VMoney } from "v-money";

import axios from "axios";
import { urlBD, showError, saveLog, parseNumber, formatDate } from "@/global";
import { formatToBRL } from "brazilian-values";

export default {
  directives: { money: VMoney },
  name: "pdv-fechamento",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "pessoaStore",
      "usuarioStore",
      "empresaStore",
      "financeiroStore",
      "vendaStore",
      "modalStore"
    ]),
    stepper: {
      get() {
        return this.modalStore.vendas.pdv.stepper;
      },
      set(value) {
        this.modalStore.vendas.pdv.stepper = value;
      }
    },
    venda: {
      get() {
        return this.vendaStore.pdv;
      }
    },
    financeiro: {
      get() {
        return this.vendaStore.pdv.financeiro;
      },
      set(value) {
        this.vendaStore.pdv.financeiro = value;
      }
    }
  },
  components: {
    Card: () => import("@/components/material/Card"),
    GridProdutos: () => import("./GridProdutos"),
    GridPagamento: () => import("./GridPagamento")
  },
  watch: {
    stepper() {}
  },
  data() {
    return {
      valid: true,
      menu: false,
      pagamento: {},
      expand: true,
      fields: [
        { value: "sequencia", text: "Item" },
        { value: "forma_pagamento", text: "Forma de pagamento" },
        { value: "valor_pago", text: "Valor pago" },
        { value: "data_baixa", text: "Data pagamento" },
        { value: "actions", text: "Ações" }
      ],
      money: {
        decimal: ",",
        thousands: ".",
        prefix: "R$ ",
        precision: 2,
        masked: false
      }
    };
  },
  methods: {
    save() {
      const method = this.venda.id ? "put" : "post";
      const id = this.venda.id ? this.venda.id : "";
      const url = `${urlBD}/vendas/${id}`;

      const venda = { ...this.venda };
      if (!venda.id_empresa) {
        venda.id_empresa = this.empresaStore.currentEmpresa;
      }

      venda.tipo = 2; // venda
      venda.valor_desconto = venda.totais.valor_desconto;
      venda.valor_total = venda.totais.valor_total;
      delete venda.pdvProduto;
      delete venda.totais;

      venda.produtos = venda.produtos.map(p => {
        p.id = p.id ? p.id : p.produto.value;
        delete p.produto;
        return p;
      });

      axios[method](url, venda)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.$store.dispatch("resetPDV");

          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
            "PDV",
            `Usuário ${this.usuarioStore.currentUsuario.nome} ${
              method === "post" ? "ADICIONOU" : "ALTEROU"
            } uma venda ao cliente ${this.venda.id_pessoa}`
          );
        })
        .catch(showError);
    }
  }
};
</script>