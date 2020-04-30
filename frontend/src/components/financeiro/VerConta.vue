<template>
  <v-dialog v-model="modalStore.financeiro.financ.visualizar" lazy persistent max-width="1000px">
    <v-card v-if="modalStore.financeiro.financ.visualizar">
      <v-card-text>
        <v-container grid-list-xl>
          <v-form v-model="valid" ref="form">
            <v-card-title>
              <span class="headline">Visualizar detalhes da conta</span>
            </v-card-title>
            <v-layout row wrap>
              <v-flex xs12 md3>
                <v-text-field readonly label="Código" v-model="conta.id"></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs12 md4>
                <v-text-field readonly label="Empresa" v-model="conta.empresa"></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field readonly label="Pessoa" v-model="conta.pessoa"></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field readonly label="Tipo de conta" v-model="conta.tipo_conta"></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field readonly label="Classificação" v-model="conta.classificacao"></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field readonly label="Documento origem" v-model="conta.documento_origem"></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field
                  readonly
                  label="Número do documento"
                  v-model="conta.num_documento_origem"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field readonly label="Data de criação" v-model="conta.data_criacao"></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field readonly label="Data de emissão" v-model="conta.data_emissao"></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field readonly label="Data de vencimento" v-model="conta.data_vencimento"></v-text-field>
              </v-flex>

              <v-flex xs12 md6>
                <v-text-field readonly label="Valor da parcela" v-model="conta.valor_parcela"></v-text-field>
              </v-flex>
              <v-flex xs12 md6>
                <v-text-field readonly label="Valor total" v-model="conta.valor_total"></v-text-field>
              </v-flex>
            </v-layout>
            <v-card-title>
              <span
                class="headline"
              >Visualizar detalhes do {{ conta.tipo_conta == 'RECEBER'? 'recebimento' : 'pagamento'}}</span>
            </v-card-title>
            <v-layout row wrap>
              <v-flex xs12 md4>
                <v-text-field readonly label="Conta do pagamento" v-model="conta.conta"></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field readonly label="Documento baixa" v-model="conta.documento_baixa"></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field readonly label="Número documento" v-model="conta.num_documento_baixa"></v-text-field>
              </v-flex>
              <v-flex xs12 md3>
                <v-text-field readonly label="Data de pagamento" v-model="conta.data_baixa"></v-text-field>
              </v-flex>
              <v-flex xs12 md3>
                <v-text-field readonly label="Valor de acréscimo" v-model="conta.valor_acrescimo"></v-text-field>
              </v-flex>
              <v-flex xs12 md3>
                <v-text-field readonly label="Valor de desconto" v-model="conta.valor_desconto"></v-text-field>
              </v-flex>
              <v-flex xs12 md3>
                <v-text-field readonly label="Valor" v-model="conta.valor_pago"></v-text-field>
              </v-flex>
            </v-layout>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn color="blue darken-1" flat>Imprimir</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="blue darken-1"
          flat
          @click="modalStore.financeiro.financ.visualizar = false"
        >Fechar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { VMoney } from "v-money";

import axios from "axios";
import { urlBD, showError, formatDate } from "@/global";
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
    ])
  },
  watch: {
    "$store.state.modalStore.financeiro.financ.visualizar": function() {
      if (this.modalStore.financeiro.financ.visualizar) {
        this.limpaTela();
      }
    }
  },
  data() {
    return {
      valid: true,
      menu: false,
      conta: {},
      money: {
        decimal: ",",
        thousands: ".",
        precision: 2,
        prefix: "R$ "
      }
    };
  },
  methods: {
    async limpaTela() {
      this.reset();
      this.loadConta(this.financeiroStore.financ);
    },
    async reset() {
      this.conta = {};
    },
    async loadConta(conta) {
      if (!conta) return;
      const url = `${urlBD}/financeiro/${conta.id}`;
      axios
        .get(url)
        .then(res => {
          this.conta = res.data;

          this.conta.tipo_conta =
            this.conta.tipo_conta == 1 ? "PAGAR" : "RECEBER";

          this.conta.data_vencimento = formatDate(
            new Date(this.conta.data_vencimento).toISOString().substr(0, 10)
          );
          this.conta.data_baixa = formatDate(
            new Date(this.conta.data_baixa).toISOString().substr(0, 10)
          );
          this.conta.data_emissao = formatDate(
            new Date(this.conta.data_emissao).toISOString().substr(0, 10)
          );
          this.conta.data_criacao = formatDate(
            new Date(this.conta.data_criacao).toISOString().substr(0, 10)
          );

          this.conta.valor_acrescimo = formatToBRL(this.conta.valor_acrescimo);
          this.conta.valor_desconto = formatToBRL(this.conta.valor_desconto);
          this.conta.valor_parcela = formatToBRL(this.conta.valor_parcela);
          this.conta.valor_pago = formatToBRL(this.conta.valor_pago);
          this.conta.valor_total = formatToBRL(this.conta.valor_total);
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>