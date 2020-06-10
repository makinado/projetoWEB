<template>
  <v-dialog v-model="modalStore.financeiro.financ.pagamento" lazy persistent max-width="900px">
    <v-card v-if="modalStore.financeiro.financ.pagamento">
      <v-card-title v-if="!Array.isArray(financeiroStore.financ)">
        <span
          class="headline"
        >Realizar {{ financeiroStore.financ.tipo_conta == 'RECEBER' ? 'recebimento' : 'pagamento' }} no valor de {{ financeiroStore.financ.valor_parcela | currency }}</span>
      </v-card-title>
      <v-card-title v-else>
        <v-flex xs12>
          <span
            class="headline"
          >Realizar {{ tipo_conta == 1 ? 'pagamento' : 'recebimento' }} no valor de {{ valor | currency }}</span>
        </v-flex>
      </v-card-title>
      <v-card-text>
        <v-container grid-list-xl>
          <v-form v-model="valid" ref="form">
            <v-text-field label="id" v-model="pagamento.id" v-show="false"></v-text-field>
            <v-text-field label="id" v-model="pagamento.id_empresa" v-show="false"></v-text-field>
            <v-layout row wrap>
              <v-flex xs12 md6>
                <v-autocomplete
                  dense
                  :color="color"
                  label="Conta*"
                  v-model="pagamento.id_conta"
                  :items="financeiroStore.contas"
                  no-data-text="Nenhum caixa encontrado"
                  prepend-icon="fa fa-lg fa-plus-circle"
                  @click:prepend="[financeiroStore.caixa = null, modalStore.financeiro.caixa.visible = true]"
                  @change="loadSaldoConta"
                  @focus="$store.dispatch('loadContas')"
                  :rules="contaRules"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12 md6>
                <v-text-field
                  dense
                  :color="color"
                  label="Saldo da conta"
                  v-model="saldo"
                  placeholder="Selecione a conta para carregar o saldo"
                  readonly
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-menu
                  v-model="menu"
                  :close-on-content-click="false"
                  :nudge-right="40"
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
                      prepend-icon="event"
                      label="Data do pagamento*"
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
              <v-flex xs12 md4>
                <v-autocomplete
                  dense
                  :color="color"
                  label="Forma de pagamento"
                  v-model="pagamento.documento_baixa"
                  :items="financeiroStore.documentos"
                  no-data-text="Nenhum documento encontrado"
                  prepend-icon="fa fa-lg fa-plus-circle"
                  @click:prepend="[financeiroStore.documento = null, modalStore.documentos.visible = true]"
                  :rules="docRules"
                  @focus="$store.dispatch('loadDocumentos')"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field
                  :color="color"
                  v-model="pagamento.num_documento_baixa"
                  label="Número documento"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field
                  ref="valor_acrescimo"
                  v-model="pagamento.valor_acrescimo"
                  :color="color"
                  label="Valor acréscimo"
                  v-money="money"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field
                  ref="valor_desconto"
                  v-model="pagamento.valor_desconto"
                  :color="color"
                  label="Valor desconto"
                  v-money="money"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field
                  ref="valor_pago"
                  :readonly="Array.isArray(financeiroStore.financ)"
                  v-model="pagamento.valor_pago"
                  :color="color"
                  label="Valor pago"
                  v-money="money"
                  :rules="valorRules"
                  disabled
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue darken-1"
          flat
          @click="modalStore.financeiro.financ.pagamento = false"
        >Fechar</v-btn>
        <v-btn color="blue darken-1" flat @click="save()">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { VMoney } from "v-money";

import axios from "axios";
import { urlBD, showError, parseNumber, formatDate, saveLog } from "@/global";
import { mapState } from "vuex";
import { formatToBRL } from "brazilian-values";

export default {
  directives: { money: VMoney },
  name: "Pagamento",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "modalStore",
      "financeiroStore",
      "empresaStore",
      "usuarioStore"
    ]),
    computedDateFormatted() {
      return formatDate(this.pagamento.data_baixa);
    }
  },
  watch: {
    "$store.state.modalStore.financeiro.financ.pagamento": function() {
      if (this.modalStore.financeiro.financ.pagamento) {
        this.limpaTela();
      }
    }
  },
  data() {
    return {
      valid: true,
      menu: false,
      saldo: "",
      valor: 0,
      tipo_conta: "",
      pagamento: {},
      financs: [],
      money: {
        decimal: ",",
        thousands: ".",
        precision: 2,
        prefix: "R$ "
      },
      empRules: [v => !!v || "Empresa é obrigatória"],
      contaRules: [v => !!v || "Conta é obrigatória"],
      dataRules: [v => !!v || "Data do pagamento é obrigatória"],
      docRules: [v => !!v || "Documento é obrigatório"],
      valorRules: [
        v => !!v || "Valor total é obrigatório",
        v => (!!v && v !== "R$ 0,00") || "Valor total não pode ser 0,00"
      ]
    };
  },
  methods: {
    async limpaTela() {
      this.reset();
      this.loadTela(this.financeiroStore.financ);
    },
    async reset() {
      this.pagamento = {};
      this.financs = [];
      this.saldo = "";
      this.valor = 0;
      this.tipo_conta = "";

      this.$refs.valor_acrescimo
        ? (this.$refs.valor_acrescimo.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.valor_desconto
        ? (this.$refs.valor_desconto.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.valor_pago
        ? (this.$refs.valor_pago.$el.getElementsByTagName("input")[0].value = 0)
        : "";
    },
    async loadTela(financ) {
      if (!financ) return;

      if (!Array.isArray(financ)) {
        this.pagamento.id = financ.id;
        this.pagamento.id_movimento_origem = financ.id_movimento_origem;
        this.pagamento.valor_pago = financ.valor_parcela;
        this.pagamento.tipo_conta = financ.tipo_conta == "RECEBER" ? 2 : 1;
      } else {
        this.financs = financ;

        this.financs.map(item => {
          this.valor += parseNumber(item.valor_parcela, ".");
          this.tipo_conta = item.tipo_conta == "RECEBER" ? 2 : 1;
          return item;
        });

        this.pagamento.tipo_conta = this.tipo_conta;
        this.pagamento.valor_pago = formatToBRL(this.valor);
      }
    },
    async loadSaldoConta() {
      const id = this.pagamento.id_conta;

      if (!id) return;

      this.saldo = formatToBRL(
        this.financeiroStore.contas.find(conta => conta.value == id)
          .saldo_atual || 0
      );
    },
    async save() {
      if (!this.$refs.form.validate()) return;
      const url = `${urlBD}/financeiro/pagamento/`;

      if (!this.pagamento.id_empresa) {
        this.pagamento.id_empresa = this.empresaStore.currentEmpresa;
      }

      if (!this.pagamento.id) {
        this.financs = this.financs.map(item => {
          return {
            id: item.id,
            ...this.pagamento,
            valor_pago: formatToBRL(item.valor_parcela)
          };
        });
      } else {
        this.financs = [this.pagamento];
      }

      console.log(this.financs);

      axios
        .post(url, this.financs)
        .then(res => {
          this.$toasted.global.defaultSuccess();
          this.modalStore.financeiro.financ.pagamento = false;

          saveLog(
            new Date(),
            "ALTERAÇÃO",
            "PAGAMENTO",
            `Usuário ${this.usuarioStore.currentUsuario.nome} ADICIONOU um pagamento a conta ${this.pagamento.id}`
          );
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>