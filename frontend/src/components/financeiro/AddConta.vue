<template>
  <v-dialog v-model="modalStore.financeiro.conta.visible" lazy persistent max-width="900px">
    <v-card v-if="modalStore.financeiro.conta.visible">
      <v-card-title>
        <span class="headline">{{ modalStore.financeiro.conta.title }}</span>
      </v-card-title>
      <v-card-text>
        <v-container grid-list-xl>
          <v-form v-model="valid" ref="form">
            <v-text-field label="id" v-model="conta.id" v-show="false"></v-text-field>
            <v-layout wrap>
              <v-flex xs12 md6>
                <v-autocomplete
                  dense
                  :color="color"
                  label="Empresa*"
                  :items="empresaStore.empresas"
                  v-model="conta.id_empresa"
                  no-data-text="Nenhuma empresa cadastrada"
                  :rules="empRules"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12 md6>
                <v-text-field :color="color" label="Nome*" v-model="conta.nome" :rules="nameRules"></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-textarea
                  :color="color"
                  label="Alguma observação?"
                  box
                  v-model="conta.observacao"
                ></v-textarea>
              </v-flex>
              <v-flex xs12>
                <v-switch label="Essa é uma conta de banco?" :color="color" v-model="isBank"></v-switch>
              </v-flex>
            </v-layout>
            <v-layout v-if="isBank" wrap>
              <v-flex xs12 md6>
                <v-autocomplete
                  dense
                  :color="color"
                  label="Selecione o banco*"
                  v-model="banco"
                  :items="financeiroStore.bancos"
                  return-object
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12 md6>
                <v-text-field :color="color" label="Agencia*" v-model="conta.agencia"></v-text-field>
              </v-flex>
              <v-flex xs12 md6>
                <v-text-field
                  :color="color"
                  label="Número da conta com dígito*"
                  v-model="conta.num_conta"
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
          @click="modalStore.financeiro.conta.visible = false"
        >Fechar</v-btn>
        <v-btn color="blue darken-1" flat @click="save()">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
import {
  urlBD,
  showError,
  formatDate,
  saveLog
} from "@/global";
import { mapState } from "vuex";
import { formatToBRL } from "brazilian-values";

export default {
  name: "Addconta",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "financeiroStore",
      "empresaStore",
      "usuarioStore",
      "modalStore"
    ])
  },
  watch: {
    "$store.state.modalStore.financeiro.conta.visible": function() {
      if (this.modalStore.financeiro.conta.visible) {
        this.limpaTela();
      }
    }
  },
  data() {
    return {
      conta: {},
      banco: {},
      banks: [],
      isBank: false,
      valid: true,
      empRules: [v => !!v || "Empresa é obrigatória"],
      nameRules: [
        v => !!v || "Nome é obrigatório",
        v => (!!v && v.length < 20) || "Nome deve ter no máximo 20 caracteres"
      ]
    };
  },
  methods: {
    async limpaTela() {
      this.reset();
      this.loadTela(this.financeiroStore.conta);
    },
    async reset() {
      this.conta = {};
      this.banco = {};
      this.isBank = false;
      this.$refs.form ? this.$refs.form.reset() : "";
    },
    async loadTela(conta) {
      this.$store.dispatch("loadEmpresas");
      this.$store.dispatch("loadBancos");

      if (!conta) return;
      let url = `${urlBD}/conta`;
      if (conta.id) {
        axios
          .get(`${url}/${conta.id}`)
          .then(res => {
            this.conta = res.data;

            if (this.conta.cod_banco) {
              this.isBank = true;
              this.banco = this.conta.cod_banco;
            }
          })
          .catch(showError);
      }
    },
    async save() {
      if (!this.$refs.form.validate()) return;

      const method = this.conta.id ? "put" : "post";
      const id = this.conta.id ? this.conta.id : "";
      const url = `${urlBD}/conta/${id}`;

      if (this.isBank) {
        this.conta.cod_banco = this.banco.value;
        this.conta.nome_banco = this.banco.text.split("-")[1];
      }

      axios[method](url, this.conta)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.modalStore.financeiro.conta.visible = false;

          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
            "CONTAS",
            `Usuário ${this.usuarioStore.currentUsuario.nome} ${
              method === "post" ? "ADICIONOU" : "ALTEROU"
            } a conta ${this.conta.nome}`
          );
        })
        .catch(e => showError(e));
    }
  }
};
</script>

<style>
</style>