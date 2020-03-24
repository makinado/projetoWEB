<template>
  <v-dialog
    v-model="modalStore.vendas.pdv.sangria"
    scrollable
    width="800"
    transition="dialog-transition"
    persistent
  >
    <v-card>
      <v-card-title class="headline">Suprimentos e sangria</v-card-title>
      <v-card-text>
        <v-container grid-list-xl>
          <v-form v-model="valid" ref="form">
            <v-layout row wrap>
              <v-flex xs12 md6>
                <v-autocomplete
                  class="tag-input"
                  chips
                  dense
                  deletable-chips
                  label="Tipo*"
                  :items="[{ value: 'C', text: 'Suprimento' }, { value: 'D', text: 'Sangria' }]"
                  v-model="movim.dc"
                ></v-autocomplete>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs12 md6>
                <v-autocomplete
                  clearable
                  dense
                  :color="color"
                  label="Conta*"
                  v-model="movim.id_conta"
                  :items="financeiroStore.contas"
                  no-data-text="Nenhum caixa encontrado"
                  prepend-icon="fa fa-lg fa-plus-circle"
                  @click:prepend="[financeiroStore.caixa = null, modalStore.financeiro.caixa.visible = true]"
                  @change="loadSaldoConta(movim)"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12 md6>
                <v-text-field ref="valor" label="Valor*" v-money="money" v-model="movim.valor"></v-text-field>
              </v-flex>

              <v-divider></v-divider>

              <v-flex xs12>
                <span>Saldo atual - {{ movim.saldo_atual || "R$ 0,00"}}</span>
              </v-flex>
            </v-layout>
          </v-form>
        </v-container>

        <small>Selecione a conta para carregar o saldo</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click="modalStore.vendas.pdv.sangria = false">Fechar</v-btn>
        <v-btn color="blue darken-1" flat @click="save">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { VMoney } from "v-money";
import { mapState } from "vuex";
import { formatToBRL } from "brazilian-values";

import { urlBD, showError, saveLog } from "@/global";
import axios from "axios";

export default {
  directives: { money: VMoney },
  name: "sangria",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "modalStore",
      "financeiroStore",
      "usuarioStore",
      "empresaStore"
    ])
  },
  watch: {
    "$store.state.modalStore.vendas.pdv.sangria"() {
      if (this.modalStore.vendas.pdv.sangria) {
        this.$store.dispatch("loadContas");
        this.reset();
      }
    }
  },
  data() {
    return {
      movim: {},
      valid: true,
      saldo_atual: "",
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
    loadSaldoConta(item) {
      if (!item.id_conta) {
        item.saldo_atual = "";
        return;
      }

      item.saldo_atual = formatToBRL(
        this.financeiroStore.contas.find(conta => conta.value == item.id_conta)
          .saldo_atual || 0
      );
    },
    reset() {
      this.movim = {};
      this.$refs.form ? this.$refs.form.reset() : null;

      this.$refs.valor
        ? (this.$refs.valor.$el.getElementsByTagName("input")[0].value = 0)
        : null;
    },
    save() {
      let url = `${urlBD}/movimConta/${this.movim.id_conta}`;
      this.movim.origem = "DIGITADO";

      if (!this.movim.id_empresa)
        this.movim.id_empresa = this.empresaStore.currentEmpresa;

      axios
        .post(url, this.movim)
        .then(res => {
          this.$toasted.global.defaultSuccess();
          this.$store.dispatch("loadContas");

          saveLog(
            new Date(),
            "GRAVAÇÃO",
            "MOVIMENTO DE CAIXA",
            `Usuário ${this.usuarioStore.currentUsuario.nome} fez uma movimentação no caixa ${this.movim.id_conta}`
          );

          this.reset();
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>