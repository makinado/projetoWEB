<template>
  <Card title="Formas de pagamento" :color="color">
    <v-card-title class="headline">
      <v-layout justify-center>
        <span class="mr-5">Valor {{ pagamento.valor || 'R$ 0,00'}}</span>
        <span>Troco {{ pagamento.troco || 'R$ 0,00'}}</span>
      </v-layout>
    </v-card-title>
    <v-card-text>
      <v-container grid-list-xl>
        <v-form v-model="valid" ref="form">
          <v-layout row wrap>
            <v-flex xs12 md4>
              <v-autocomplete
                class="tag-input"
                chips
                deletable-chips
                dense
                :color="color"
                :items="financeiroStore.documentos"
                v-model="pagamento.documento_baixa"
                placeholder="Forma de pagamento"
                prepend-icon="fa fa-lg fa-plus-circle"
                @click:prepend="[modalStore.documentos.visible = true]"
                no-data-text="Nenhum resultado"
                auto-select-first
                @input="$refs.valor_pago.focus()"
                return-object
                :rules="documentoRules"
                @focus="$store.dispatch('loadDocumentos')"
              ></v-autocomplete>
            </v-flex>
            <v-flex xs12 md2 class="mt-2">
              <v-text-field
                ref="valor_pago"
                label="VALOR PAGO"
                v-model="pagamento.valor_pago"
                v-money="money"
                @input="calcTroco"
                @keyup.enter="addPagamento"
                :rules="valorRules"
              ></v-text-field>
            </v-flex>
            <v-flex xs12 md2 class="mt-2">
              <v-text-field
                ref="parcelas"
                label="Parcelas"
                v-model="pagamento.parcelas"
                @keyup.enter="addPagamento"
                :rules="parcelasRules"
              ></v-text-field>
            </v-flex>
            <v-flex xs12 md2 class="mt-2">
              <v-menu
                ref="date"
                v-model="menu"
                :close-on-content-click="false"
                :nudge-right="40"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                max-width="290px"
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    :color="color"
                    v-model="computedDateFormatted"
                    label="Data do pagamento"
                    prepend-icon="event"
                    readonly
                    v-on="on"
                    :rules="dataRules"
                  ></v-text-field>
                </template>
                <v-date-picker
                  :color="color"
                  v-model="pagamento.data_baixa"
                  @input="menu = false"
                  locale="pt-br"
                ></v-date-picker>
              </v-menu>
            </v-flex>
            <v-flex xs12 md2>
              <v-tooltip bottom class="mt-3">
                <v-btn
                  slot="activator"
                  class="v-btn-common"
                  :color="color"
                  @click="addPagamento"
                >Adicionar</v-btn>
                <span>Adicionar nova forma de pagamento</span>
              </v-tooltip>
              <v-tooltip bottom class="mt-3">
                <v-btn slot="activator" class="v-btn-common" color="warning" @click="reset">Limpar</v-btn>
                <span>Reseta os campos</span>
              </v-tooltip>
            </v-flex>
          </v-layout>
        </v-form>
      </v-container>
    </v-card-text>

    <v-card-text>
      <v-data-table
        class="mt-3"
        :headers="fields"
        :items="financeiro"
        hide-actions
        no-data-text="Nenhuma forma de pagamento adicionada"
        :expand="expand"
        item-key="sequencia"
      >
        <template slot="items" slot-scope="data">
          <td>{{ data.item.sequencia}}</td>
          <td>
            <v-chip :color="color" dark>{{ data.item.forma_pagamento }}</v-chip>
          </td>
          <td>{{ data.item.valor_pago || "R$ 0,00" }}</td>
          <td>{{ data.item.data_baixa | date }}</td>
          <td>
            <v-tooltip bottom>
              <v-btn slot="activator" icon color="warning" dark class="mr-1" @click.prevent>
                <i class="fa fa-lg fa-pencil"></i>
              </v-btn>
              <span>Editar forma de pagamento</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                icon
                color="danger"
                dark
                class="mr-1"
                @click.prevent="deletePagamento(data.item)"
              >
                <i class="fa fa-lg fa-trash"></i>
              </v-btn>
              <span>Excluir forma de pagamento</span>
            </v-tooltip>
          </td>
        </template>
      </v-data-table>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue darken-1" flat @click="stepper = 1">Voltar</v-btn>
      <v-btn color="blue darken-1" flat @click="stepper = 3">Continuar</v-btn>
    </v-card-actions>
  </Card>
</template>

<script>
import { mapState } from "vuex";
import { VMoney } from "v-money";

import axios from "axios";
import { urlBD, showError, saveLog, parseNumber, formatDate } from "@/global";
import { formatToBRL } from "brazilian-values";

export default {
  directives: { money: VMoney },
  name: "pdv-pagamento",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "pessoaStore",
      "usuarioStore",
      "financeiroStore",
      "vendaStore",
      "modalStore"
    ]),
    computedDateFormatted: {
      get() {
        return formatDate(this.pagamento.data_baixa);
      },
      set(value) {
        this.pagamento.data_baixa = formatDate(value);
      }
    },
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
    Card: () => import("@/components/material/Card")
  },
  watch: {
    stepper() {
      if (this.stepper == 2) {
        this.reset();
      }
    }
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
      },
      documentoRules: [v => !!v || "Forma de pagamento é obrigatória"],
      valorRules: [
        v => !!v || "Valor pago é obrigatório",
        v => (!!v && v !== "R$ 0,00") || "Valor pago não pode ser 0,00"
      ],
      dataRules: [v => !!v || "Data é obrigatória"],
      parcelasRules: [
        v => !!v || "Parcela é obrigatória",
        v => (!!v && parseInt(v)) || "Informe um número inteiro neste campo"
      ]
    };
  },
  methods: {
    reset() {
      this.$refs.form ? this.$refs.form.resetValidation() : null;
      this.pagamento = {
        valor: formatToBRL(
          parseNumber(this.venda.totais.valor_total) -
            parseNumber(this.pagamento.valor_pago || "R$ 0,00")
        ),
        troco: 0,
        parcelas: 1,
        data_baixa: new Date().toISOString().substr(0, 10)
      };

      this.$refs.valor_pago
        ? (this.$refs.valor_pago.$el.getElementsByTagName("input")[0].value = 0)
        : null;
    },
    calcTroco() {
      if (this.pagamento.valor_pago == "R$ 0,00") return;

      const troco = formatToBRL(
        parseNumber(this.pagamento.valor_pago || "0,00") -
          parseNumber(this.pagamento.valor || "0,00")
      );

      this.$set(this.pagamento, "troco", troco);
      this.$refs.troco
        ? (this.$refs.troco.$el.getElementsByTagName("input")[0].value = troco)
        : null;
    },
    addPagamento() {
      let pagamento = {
        sequencia: this.financeiro.length + 1,
        ...this.pagamento,
        forma_pagamento: this.pagamento.documento_baixa.text,
        documento_baixa: this.pagamento.documento_baixa.value
      };

      if (this.pagamento.parcelas > 1) {
        for (let i = 1; i <= this.pagamento.parcelas; i++) {
          this.financeiro.push({
            ...pagamento,
            sequencia: this.financeiro.length + 1,
            valor_pago: formatToBRL(
              parseNumber(this.pagamento.valor_pago) / this.pagamento.parcelas
            ),
            data_baixa: pagamento.data_baixa
          });

          let data_baixa = new Date(pagamento.data_baixa);
          data_baixa.setMonth(data_baixa.getMonth() + 1);
          pagamento.data_baixa = data_baixa.toISOString().substr(0, 10);
        }
      } else this.financeiro.push(pagamento);
      this.reset();
    },
    deletePagamento(pag) {
      if (!pag) return;

      this.$set(
        this.pagamento,
        "valor",
        formatToBRL(
          parseNumber(this.pagamento.valor) + parseNumber(pag.valor_pago)
        )
      );

      this.financeiro = this.financeiro.filter(item => {
        return item.sequencia !== pag.sequencia;
      });
    }
  },
  created() {
    this.financeiro = [];
  }
};
</script>

<style>
</style>