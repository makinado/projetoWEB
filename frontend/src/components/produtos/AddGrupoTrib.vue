<template>
  <div class="add-grupo_trib">
    <v-dialog v-model="modalStore.grupo_trib.addGrupo" persistent max-width="900px">
      <v-card v-if="modalStore.grupo_trib.addGrupo">
        <v-card-title>{{ modalStore.grupo_trib.title }}</v-card-title>
        <v-card-text>
          <v-container grid-list-xl>
            <v-form v-model="valid" ref="form">
              <v-layout wrap>
                <v-text-field label="id" v-model="grupo.id" v-show="false"></v-text-field>
                <v-flex xs12 md9>
                  <v-text-field
                    color="color"
                    label="Descrição*"
                    v-model="grupo.descricao"
                    :rules="descRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md3>
                  <v-autocomplete
                    color="color"
                    label="UF*"
                    :items="[
                        'AC', 'AL', 'AP', 'AM', 'BA',
                        'CE', 'DF', 'ES', 'GO', 'MA',
                        'MT', 'MS', 'MG', 'PA', 'PB',
                        'PR', 'PE', 'PI', 'RJ', 'RN',
                        'RS', 'RO', 'RR', 'SC', 'SP',
                        'SE', 'TO']"
                    v-model="grupo.uf"
                    dense
                    :rules="ufRules"
                  ></v-autocomplete>
                </v-flex>
              </v-layout>
              <v-layout wrap>
                <v-flex xs12 md6>
                  <v-tooltip bottom>
                    <v-text-field
                      ref="cfop"
                      slot="activator"
                      color="color"
                      label="CFOP*"
                      v-model="grupo.cfop"
                      v-money="question"
                      maxlength="6"
                      @keyup="searchCFOP"
                      :hint="cfop_hint"
                      :error="cfop_error"
                      persistent-hint
                      :rules="cfopRules"
                    ></v-text-field>
                    <span>A interrogação no campo significa que o sistema trocará automaticamente por 5, 6 ou 7</span>
                  </v-tooltip>
                </v-flex>
                <v-flex xs12 md6>
                  <v-autocomplete
                    ref="situacao_tributaria"
                    color="color"
                    label="Situação tributária"
                    :items="situacoes_trib"
                    v-model="grupo.situacao_tributaria"
                    dense
                    :rules="stRules"
                  ></v-autocomplete>
                </v-flex>
                <v-flex xs12 md3>
                  <v-text-field
                    ref="perc_icms"
                    color="color"
                    label="Percentual de ICMS"
                    v-model="grupo.perc_icms"
                    v-money="percent"
                    maxlength="8"
                    :rules="icmsRules"
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="modalStore.grupo_trib.addGrupo = false">Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="save">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { VMoney } from "v-money";
import { formatToBRL } from "brazilian-values";

import axios from "axios";
import { urlBD, showError, formatDate } from "@/global";
import { mapState } from "vuex";

export default {
  directives: { money: VMoney },
  name: "add-grupo_trib",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["produtoStore", "empresaStore", "usuarioStore", "modalStore"])
  },
  data() {
    return {
      grupo: {},
      cfops: [],
      situacoes_trib: [],
      cfop_hint: "Insira um CFOP para verificar se ele existe",
      cfop_error: false,
      percent: {
        decimal: ",",
        thousands: ".",
        precision: 2,
        suffix: " %"
      },
      question: {
        prefix: "?.",
        decimal: "",
        thousands: ""
      },
      valid: true,
      descRules: [
        v => !!v || "Descrição é obrigatória",
        v =>
          (!!v && v.length >= 5) || "Descrição deve ter no mínimo 5 caracteres"
      ],
      ufRules: [v => !!v || "UF é obrigatória"],
      cfopRules: [
        v => !!v || "CFOP é obrigatório",
        v => (!!v && v !== "?.000") || "ICMS não pode ser zero"
      ],
      stRules: [v => !!v || "Situação tributária é obrigatória"],
      icmsRules: [
        v => !!v || "ICMS é obrigatório",
        v => (!!v && v !== "0,00 %") || "ICMS não pode ser zero"
      ]
    };
  },
  watch: {
    "$store.state.modalStore.grupo_trib.addGrupo": function() {
      if (this.modalStore.grupo_trib.addGrupo) {
        this.loadGrupo(this.produtoStore.grupo_trib);
      } else {
        this.reset();
      }
    }
  },
  methods: {
    async reset() {
      this.loadGrupos();
      this.grupo = {};
      this.cfops = [];
      this.cfop_hint = "";
      this.cfop_error = false;

      this.$refs.perc_icms
        ? (this.$refs.perc_icms.$el.getElementsByTagName("input")[0].value = 0)
        : "";
    },
    async loadGrupo(grupo) {
      if (grupo.id) {
        const url = `${urlBD}/telaGrupoTrib`;
        axios
          .get(`${url}/${grupo.id}`)
          .then(res => {
            const tela = res.data;

            this.grupo = tela.grupo;
            this.cfops = tela.cfop;
            this.situacoes_trib = tela.st;

            this.searchCFOP();

            this.$refs.cfop.$el.getElementsByTagName(
              "input"
            )[0].value = this.grupo.cfop;
            this.$refs.perc_icms.$el.getElementsByTagName(
              "input"
            )[0].value = this.grupo.perc_icms;
          })
          .catch(showError);
      }
    },
    async loadGrupos() {
      const url = `${urlBD}/grupoTrib`;
      axios
        .get(url)
        .then(res => {
          this.produtoStore.grupo_tribs = res.data;
          this.totalRows = this.produtoStore.grupo_tribs.length;
          this.produtoStore.grupo_tribs.map(grupo_trib => {
            grupo_trib.value = grupo_trib.id;
            grupo_trib.text = grupo_trib.nome;
          });
        })
        .catch(showError);
    },
    async save() {
      if (!this.$refs.form.validate()) return;

      const method = this.grupo.id ? "put" : "post";
      const id = this.grupo.id ? this.grupo.id : "";
      const urlGrupo = `${urlBD}/grupoTrib/${id}`;

      await axios[method](urlGrupo, this.grupo)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.modalStore.grupo_trib.addGrupo = false;

          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
            "GRUPOS TRIBUTÁRIOS",
            `Usuário ${this.usuarioStore.currentUsuario.nome} ${
              method === "post" ? "ADICIONOU" : "ALTEROU"
            } o grupo ${this.produtoStore.grupo_trib.descricao}`
          );
        })
        .catch(showError);
    },
    async searchCFOP() {
      // console.log(this.grupo.cfop.length)
      if (this.grupo.cfop.length === 5) {
        let cfop = this.grupo.cfop;
        cfop = cfop.replace("?.", "");

        this.cfop_hint = this.cfops.find(element => {
          return element.codigo_cfop.includes("5." + cfop);
        });

        if (!this.cfop_hint) {
          this.cfop_hint =
            "Parece que o CFOP digitado não existe! tente novamente";
          this.cfop_error = true;
        } else {
          this.cfop_hint = this.cfop_hint.desc_cfop;
          this.cfop_error = false;
        }
      } else {
        this.cfop_hint =
          "Parece que o CFOP digitado não existe! tente novamente";
        this.cfop_error = true;
      }
    }
  }
};
</script>

<style>
</style>