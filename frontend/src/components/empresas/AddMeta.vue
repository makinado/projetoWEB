<template>
  <div>
    <v-dialog v-model="modalStore.empresas.metas.visible" lazy persistent max-width="1200px">
      <v-card v-if="modalStore.empresas.metas.visible">
        <v-card-title>
          <span class="headline">{{ modalStore.empresas.metas.title }}</span>
        </v-card-title>
        <v-card-text>
          <v-container fluid>
            <v-text-field label="id" v-model="meta.id" v-show="false"></v-text-field>
            <v-layout wrap>
              <v-flex xs12>
                <v-tabs v-model="tabIndex" centered color="#FFFFFF" light icons-and-text>
                  <v-tabs-slider color="color"></v-tabs-slider>
                  <v-tab href="#tab-1">
                    BÁSICO
                    <v-icon>fa fa-lg fa-file</v-icon>
                  </v-tab>

                  <!-- <v-tab href="#tab-2">
                    VENDEDORES
                    <v-icon>fa fa-lg fa-user</v-icon>
                  </v-tab>-->

                  <v-tab-item value="tab-1">
                    <v-card flat>
                      <v-card-text>
                        <v-container grid-list-xl>
                          <v-form ref="form" v-model="valid">
                            <v-layout wrap>
                              <v-flex xs12 md4>
                                <v-autocomplete
                                  class="tag-input"
                                  chips
                                  dense
                                  :color="color"
                                  label="Tipo de meta"
                                  :items="['RECEITA', 'DESPESA']"
                                  v-model="meta.tipo_receita_despesa"
                                  :rules="tipoRules"
                                  deletable-chips
                                ></v-autocomplete>
                              </v-flex>
                              <v-flex xs12 md4 class="mt-2">
                                <v-menu
                                  v-model="menu1"
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
                                      v-model="computedDateFormatted1"
                                      label="Data"
                                      prepend-icon="event"
                                      readonly
                                      v-on="on"
                                      :rules="dataRules"
                                    ></v-text-field>
                                  </template>
                                  <v-date-picker
                                    ref="picker"
                                    type="date"
                                    :color="color"
                                    v-model="meta.data"
                                    @input="menu1 = false"
                                    locale="pt-br"
                                  ></v-date-picker>
                                </v-menu>
                              </v-flex>
                              <v-flex xs12 md4 class="mt-2">
                                <v-text-field
                                  ref="valor"
                                  :color="color"
                                  label="VALOR DA META"
                                  v-money="money"
                                  v-model="meta.valor"
                                  :rules="valorRules"
                                  @blur="calcular"
                                  @keyup.enter="calcular"
                                ></v-text-field>
                              </v-flex>
                              <v-flex xs12>
                                <v-text-field
                                  label="Nome"
                                  :placeholder="`Ex: Meta principal de ${new Date().getFullYear()}`"
                                  v-model="meta.nome"
                                ></v-text-field>
                              </v-flex>
                            </v-layout>

                            <v-layout row wrap class="mt-3">
                              <v-flex xs12 md2>
                                <v-text-field
                                  ref="janeiro"
                                  label="JANEIRO"
                                  v-model="meta.janeiro"
                                  v-money="money"
                                  @change="alteraMes('janeiro')"
                                ></v-text-field>
                              </v-flex>
                              <v-flex xs12 md2>
                                <v-text-field
                                  ref="fevereiro"
                                  label="FEVEREIRO"
                                  v-model="meta.fevereiro"
                                  v-money="money"
                                  @change="alteraMes('fevereiro')"
                                ></v-text-field>
                              </v-flex>
                              <v-flex xs12 md2>
                                <v-text-field
                                  ref="marco"
                                  label="MARÇO"
                                  v-model="meta.marco"
                                  v-money="money"
                                  @change="alteraMes('marco')"
                                ></v-text-field>
                              </v-flex>
                              <v-flex xs12 md2>
                                <v-text-field
                                  ref="abril"
                                  label="ABRIL"
                                  v-model="meta.abril"
                                  v-money="money"
                                  @change="alteraMes('abril')"
                                ></v-text-field>
                              </v-flex>
                              <v-flex xs12 md2>
                                <v-text-field
                                  ref="maio"
                                  label="MAIO"
                                  v-model="meta.maio"
                                  v-money="money"
                                  @change="alteraMes('maio')"
                                ></v-text-field>
                              </v-flex>
                              <v-flex xs12 md2>
                                <v-text-field
                                  ref="junho"
                                  label="JUNHO"
                                  v-model="meta.junho"
                                  v-money="money"
                                  @change="alteraMes('junho')"
                                ></v-text-field>
                              </v-flex>
                              <v-flex xs12 md2>
                                <v-text-field
                                  ref="julho"
                                  label="JULHO"
                                  v-model="meta.julho"
                                  v-money="money"
                                  @change="alteraMes('julho')"
                                ></v-text-field>
                              </v-flex>
                              <v-flex xs12 md2>
                                <v-text-field
                                  ref="agosto"
                                  label="AGOSTO"
                                  v-model="meta.agosto"
                                  v-money="money"
                                  @change="alteraMes('agosto')"
                                ></v-text-field>
                              </v-flex>
                              <v-flex xs12 md2>
                                <v-text-field
                                  ref="setembro"
                                  label="SETEMBRO"
                                  v-model="meta.setembro"
                                  v-money="money"
                                  @change="alteraMes('setembro')"
                                ></v-text-field>
                              </v-flex>
                              <v-flex xs12 md2>
                                <v-text-field
                                  ref="outubro"
                                  label="OUTUBRO"
                                  v-model="meta.outubro"
                                  v-money="money"
                                  @change="alteraMes('outubro')"
                                ></v-text-field>
                              </v-flex>
                              <v-flex xs12 md2>
                                <v-text-field
                                  ref="novembro"
                                  label="NOVEMBRO"
                                  v-model="meta.novembro"
                                  v-money="money"
                                  @change="alteraMes('novembro')"
                                ></v-text-field>
                              </v-flex>
                              <v-flex xs12 md2>
                                <v-text-field
                                  ref="dezembro"
                                  label="DEZEMBRO"
                                  v-model="meta.dezembro"
                                  v-money="money"
                                  @change="alteraMes('dezembro')"
                                ></v-text-field>
                              </v-flex>
                            </v-layout>
                          </v-form>
                        </v-container>
                      </v-card-text>
                    </v-card>
                  </v-tab-item>
                </v-tabs>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" flat @click="reset">Limpar</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            flat
            @click="modalStore.empresas.metas.visible = false"
          >Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="save">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { VMoney } from "v-money";

import axios from "axios";
import { urlBD, showError, parseNumber, formatDate, saveLog } from "@/global";
import { mapState } from "vuex";
import { formatToBRL } from "brazilian-values";

export default {
  directives: { money: VMoney },
  computed: {
    computedDateFormatted1() {
      return formatDate(this.meta.data);
    },
    ...mapState("app", ["color"]),
    ...mapState(["modalStore", "empresaStore", "pessoaStore", "usuarioStore"])
  },
  watch: {
    "$store.state.modalStore.empresas.metas.visible"() {
      if (this.modalStore.empresas.metas.visible) {
        this.reset();
        this.loadTela(this.empresaStore.meta);
      }
    }
  },
  data() {
    return {
      valid: true,
      expand: false,
      expand2: false,
      flagData: false,
      meta: {},
      mesesAlterados: {},
      metaVendAtt: [],
      menu1: false,
      tabIndex: "tab-1",
      pessoas: [],
      fieldsFunc: [
        { value: "id", text: "Código", sortable: false },
        { value: "nome", text: "Vendedor", sortable: false },
        { value: "total", text: "Total do ano", sortable: false },
        { value: "actions", text: "Ações" }
      ],
      metaVend: [],
      tipoRules: [v => !!v || "Tipo de meta obrigatório"],
      dataRules: [v => !!v || "Data de início de meta obrigatória"],
      valorRules: [
        v => !!v || "Valor é obrigatório",
        v => (!!v && v !== "R$ 0,00") || "Valor não pode ser 0,00"
      ],
      money: {
        decimal: ",",
        thousands: ".",
        precision: 2,
        prefix: "R$ "
      },
      percent: {
        decimal: ",",
        thousands: ".",
        precision: 2,
        suffix: " %"
      }
    };
  },
  methods: {
    reset() {
      this.$refs.form ? this.$refs.form.reset() : null;
      this.meta = {};
      this.mesesAlterados = {};
      this.showTabela = false;
      this.tabIndex = "tab-1";

      this.$refs.valor
        ? (this.$refs.valor.$el.getElementsByTagName("input")[0].value = 0)
        : null;

      this.$refs.janeiro
        ? (this.$refs.janeiro.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.fevereiro
        ? (this.$refs.fevereiro.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.marco
        ? (this.$refs.marco.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.abril
        ? (this.$refs.abril.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.maio
        ? (this.$refs.maio.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.junho
        ? (this.$refs.junho.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.julho
        ? (this.$refs.julho.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.agosto
        ? (this.$refs.agosto.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.setembro
        ? (this.$refs.setembro.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.outubro
        ? (this.$refs.outubro.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.novembro
        ? (this.$refs.novembro.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.dezembro
        ? (this.$refs.dezembro.$el.getElementsByTagName("input")[0].value = 0)
        : null;
    },
    alteraMes(mes) {
      this.mesesAlterados[mes] = { valor: this.meta[mes] };
      this.calcular();
    },
    calcular() {
      if (this.meta.valor == "R$ 0,00") return;

      const mesesAlterados = Object.values(this.mesesAlterados);
      const valorMesesAlterados = mesesAlterados.reduce((total, mes) => {
        return total + parseNumber(mes.valor || "0,00");
      }, 0);
      const valorMes = formatToBRL(
        (parseNumber(this.meta.valor) - valorMesesAlterados) /
          (12 - mesesAlterados.length)
      );

      if (mesesAlterados.length == 0)
        this.meta.janeiro = this.meta.fevereiro = this.meta.marco = this.meta.abril = this.meta.maio = this.meta.junho = this.meta.julho = this.meta.agosto = this.meta.setembro = this.meta.outubro = this.meta.novembro = this.meta.dezembro = valorMes;
      else {
        this.meta.janeiro = this.mesesAlterados.janeiro
          ? this.mesesAlterados.janeiro.valor
          : valorMes;
        this.meta.fevereiro = this.mesesAlterados.fevereiro
          ? this.mesesAlterados.fevereiro.valor
          : valorMes;
        this.meta.marco = this.mesesAlterados.marco
          ? this.mesesAlterados.marco.valor
          : valorMes;
        this.meta.abril = this.mesesAlterados.abril
          ? this.mesesAlterados.abril.valor
          : valorMes;
        this.meta.maio = this.mesesAlterados.maio
          ? this.mesesAlterados.maio.valor
          : valorMes;
        this.meta.junho = this.mesesAlterados.junho
          ? this.mesesAlterados.junho.valor
          : valorMes;
        this.meta.julho = this.mesesAlterados.julho
          ? this.mesesAlterados.julho.valor
          : valorMes;
        this.meta.agosto = this.mesesAlterados.agosto
          ? this.mesesAlterados.agosto.valor
          : valorMes;
        this.meta.setembro = this.mesesAlterados.setembro
          ? this.mesesAlterados.setembro.valor
          : valorMes;
        this.meta.outubro = this.mesesAlterados.outubro
          ? this.mesesAlterados.outubro.valor
          : valorMes;
        this.meta.novembro = this.mesesAlterados.novembro
          ? this.mesesAlterados.novembro.valor
          : valorMes;
        this.meta.dezembro = this.mesesAlterados.dezembro
          ? this.mesesAlterados.dezembro.valor
          : valorMes;
      }

      this.$refs.janeiro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.janeiro;
      this.$refs.fevereiro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.fevereiro;
      this.$refs.marco.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.marco;
      this.$refs.abril.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.abril;
      this.$refs.maio.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.maio;
      this.$refs.junho.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.junho;
      this.$refs.julho.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.julho;
      this.$refs.agosto.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.agosto;
      this.$refs.setembro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.setembro;
      this.$refs.outubro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.outubro;
      this.$refs.novembro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.novembro;
      this.$refs.dezembro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.dezembro;
    },
    loadTela(meta) {
      if (!meta) return;

      const url = `${urlBD}/empresaMetas/${meta.id}`;
      axios.get(url).then(res => {
        console.log(res.data);
        this.meta = res.data;
        this.parseValores();
      });
    },
    parseValores() {
      this.meta.data = new Date(this.meta.data).toISOString().substr(0, 10);

      this.$refs.valor.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.valor;

      this.$refs.janeiro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.janeiro;
      this.$refs.fevereiro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.fevereiro;
      this.$refs.marco.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.marco;
      this.$refs.abril.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.abril;
      this.$refs.maio.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.maio;
      this.$refs.junho.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.junho;
      this.$refs.julho.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.julho;
      this.$refs.agosto.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.agosto;
      this.$refs.setembro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.setembro;
      this.$refs.outubro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.outubro;
      this.$refs.novembro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.novembro;
      this.$refs.dezembro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.dezembro;
    },
    save() {
      if (!this.$refs.form.validate()) return;
      if (this.metaVend.length > 0 && this.metaVendAtt.length == 0)
        return showError("Selecione as metas dos vendedores que deseja salvar");

      const method = this.meta.id ? "put" : "post";
      const id = this.meta.id ? this.meta.id : "";
      const url = `${urlBD}/empresaMetas/${id}`;

      if (!this.meta.id_empresa) {
        this.meta.id_empresa = this.empresaStore.currentEmpresa;
      }

      // this.meta.vendedores = this.metaVendAtt;

      axios[method](url, this.meta)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.modalStore.empresas.metas.visible = false;

          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
            "METAS EMPRESAS",
            `Usuário ${this.usuarioStore.currentUsuario.nome} ${
              method === "post" ? "ADICIONOU" : "ALTEROU"
            } uma meta`
          );
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>
