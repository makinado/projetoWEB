<template>
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

                <v-tab
                  href="#tab-2"
                  :disabled="!showTabela || meta.tipo_receita_despesa !== 'RECEITA'"
                >
                  VENDEDORES
                  <v-icon>fa fa-lg fa-user</v-icon>
                </v-tab>

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
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md4>
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
                                    label="Data de início da meta"
                                    prepend-icon="event"
                                    readonly
                                    v-on="on"
                                    :rules="dataRules"
                                    @blur="flagData = true"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  ref="picker"
                                  type="month"
                                  :color="color"
                                  v-model="meta.data"
                                  @input="menu1 = false"
                                  locale="pt-br"
                                ></v-date-picker>
                              </v-menu>
                            </v-flex>
                            <v-flex xs12 md3>
                              <v-text-field
                                ref="valor_total"
                                :color="color"
                                label="Valor total da meta"
                                v-money="money"
                                v-model="meta.valor_total"
                                :rules="valorRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md1>
                              <v-btn
                                class="v-btn-common"
                                :color="color"
                                @click="[geraTabela()]"
                              >Gerar</v-btn>
                            </v-flex>
                          </v-layout>
                        </v-form>
                      </v-container>
                      <small
                        v-show="showTabela"
                      >É possível alterar os valores e percentuais diretamente da tabela.</small>
                      <v-data-table
                        v-show="showTabela"
                        :items="metaAnual"
                        :headers="fields"
                        no-results-text="Nenhum registro encontrado"
                        no-data-text="Nenhuma meta calculada"
                        hide-actions
                        :expand="expand"
                        item-key="mes"
                      >
                        <v-progress-linear slot="progress" color="blue" height="3" indeterminate></v-progress-linear>
                        <template slot="items" slot-scope="data">
                          <td>{{ data.item.mes}}</td>
                          <td>{{ data.item.valor}}</td>
                          <td>{{ data.item.percentual}}</td>
                          <td>
                            <v-btn
                              flat
                              small
                              @click="data.item.valor !== '-' ? (data.expanded = !data.expanded) : null"
                            >
                              <i class="fa fa-lg fa-pencil"></i>
                            </v-btn>
                          </td>
                        </template>
                        <template slot="expand" slot-scope="data">
                          <v-card flat>
                            <v-card-title>
                              <span class="headline">Alterar valores do mês de {{ data.item.mes }}</span>
                            </v-card-title>
                            <v-card-text>
                              <v-container grid-list-xl>
                                <v-layout row>
                                  <v-flex xs12 md6>
                                    <v-text-field
                                      ref="meta_valor"
                                      :color="color"
                                      label="Valor"
                                      v-money="money"
                                      v-model="data.item.valor"
                                      @blur="calcPercent(data.item)"
                                    ></v-text-field>
                                  </v-flex>
                                  <v-flex xs12 md6>
                                    <v-text-field
                                      ref="meta_percentual"
                                      :color="color"
                                      label="Percentual"
                                      v-money="percent"
                                      v-model="data.item.percentual"
                                      @blur="calcValor(data.item)"
                                    ></v-text-field>
                                  </v-flex>
                                </v-layout>
                              </v-container>
                            </v-card-text>
                          </v-card>
                        </template>
                      </v-data-table>
                    </v-card-text>
                  </v-card>
                </v-tab-item>

                <v-tab-item value="tab-2">
                  <v-card flat>
                    <v-card-text>
                      <v-container grid-list-xl>
                        <v-layout wrap justify-end>
                          <v-btn
                            class="v-btn-common"
                            :color="color"
                            @click="[!showTabela ? tabIndex = 'tab-1' : geraTabelaVend() ]"
                          >Gerar</v-btn>
                        </v-layout>
                      </v-container>
                      <small
                        v-if="metaVend.length > 0"
                      >*Altere os valores de cada vendedor clicando sobre ele</small>
                      <v-data-table
                        v-model="metaVendAtt"
                        :items="metaVend"
                        :headers="fieldsFunc"
                        no-data-text="Meta não gerada ou nenhum vendedor cadastrado"
                        hide-actions
                        select-all
                        item-key="id"
                        :expand="expand2"
                      >
                        <v-progress-linear slot="progress" color="blue" height="3" indeterminate></v-progress-linear>
                        <template slot="items" slot-scope="data">
                          <td>
                            <v-tooltip bottom>
                              <v-checkbox
                                slot="activator"
                                v-model="data.selected"
                                :color="color"
                                hide-details
                              ></v-checkbox>
                              <span>Selecione os vendedores</span>
                            </v-tooltip>
                          </td>
                          <td>{{ data.item.id }}</td>
                          <td>{{ data.item.nome }}</td>
                          <td>{{ data.item.total }}</td>
                          <td>
                            <v-btn flat small @click="[data.expanded = !data.expanded]">
                              <i class="fa fa-lg fa-pencil"></i>
                            </v-btn>
                          </td>
                        </template>
                        <template slot="expand" slot-scope="data">
                          <v-card flat>
                            <v-card-title>
                              <span class="headline">Alterar meta do {{ data.item.nome }}</span>
                            </v-card-title>
                            <v-card-text>
                              <v-container grid-list-xl>
                                <v-layout row>
                                  <v-flex xs12 md3>
                                    <v-text-field
                                      ref="total_vendedor"
                                      :color="color"
                                      label="Total"
                                      v-money="money"
                                      v-model="data.item.total"
                                      @blur="atualizaVend(data.item, false)"
                                    ></v-text-field>
                                  </v-flex>
                                </v-layout>
                                <v-layout row>
                                  <v-flex xs12 md3>
                                    <v-text-field
                                      ref="janeiro"
                                      :color="color"
                                      label="Janeiro"
                                      v-money="money"
                                      v-model="data.item.janeiro"
                                      :disabled="metaAnual[0].valor === '-'"
                                      @blur="atualizaVend(data.item, true)"
                                    ></v-text-field>
                                  </v-flex>
                                  <v-flex xs12 md3>
                                    <v-text-field
                                      ref="fevereiro"
                                      :color="color"
                                      label="Fevereiro"
                                      v-money="money"
                                      v-model="data.item.fevereiro"
                                      :disabled="metaAnual[1].valor === '-'"
                                      @blur="atualizaVend(data.item, true)"
                                    ></v-text-field>
                                  </v-flex>
                                  <v-flex xs12 md3>
                                    <v-text-field
                                      ref="marco"
                                      :color="color"
                                      label="Março"
                                      v-money="money"
                                      v-model="data.item.marco"
                                      :disabled="metaAnual[2].valor === '-'"
                                      @blur="atualizaVend(data.item, true)"
                                    ></v-text-field>
                                  </v-flex>
                                  <v-flex xs12 md3>
                                    <v-text-field
                                      ref="abril"
                                      :color="color"
                                      label="Abril"
                                      v-money="money"
                                      v-model="data.item.abril"
                                      :disabled="metaAnual[3].valor === '-'"
                                      @blur="atualizaVend(data.item, true)"
                                    ></v-text-field>
                                  </v-flex>
                                  <v-flex xs12 md3>
                                    <v-text-field
                                      ref="maio"
                                      :color="color"
                                      label="Maio"
                                      v-money="money"
                                      v-model="data.item.maio"
                                      :disabled="metaAnual[4].valor === '-'"
                                      @blur="atualizaVend(data.item, true)"
                                    ></v-text-field>
                                  </v-flex>
                                  <v-flex xs12 md3>
                                    <v-text-field
                                      ref="junho"
                                      :color="color"
                                      label="Junho"
                                      v-money="money"
                                      v-model="data.item.junho"
                                      :disabled="metaAnual[5].valor === '-'"
                                      @blur="atualizaVend(data.item, true)"
                                    ></v-text-field>
                                  </v-flex>
                                  <v-flex xs12 md3>
                                    <v-text-field
                                      ref="julho"
                                      :color="color"
                                      label="Julho"
                                      v-money="money"
                                      v-model="data.item.julho"
                                      :disabled="metaAnual[6].valor === '-'"
                                      @blur="atualizaVend(data.item, true)"
                                    ></v-text-field>
                                  </v-flex>
                                  <v-flex xs12 md3>
                                    <v-text-field
                                      ref="agosto"
                                      :color="color"
                                      label="Agosto"
                                      v-money="money"
                                      v-model="data.item.agosto"
                                      :disabled="metaAnual[7].valor === '-'"
                                      @blur="atualizaVend(data.item, true)"
                                    ></v-text-field>
                                  </v-flex>
                                  <v-flex xs12 md3>
                                    <v-text-field
                                      ref="setembro"
                                      :color="color"
                                      label="Setembro"
                                      v-money="money"
                                      v-model="data.item.setembro"
                                      :disabled="metaAnual[8].valor === '-'"
                                      @blur="atualizaVend(data.item, true)"
                                    ></v-text-field>
                                  </v-flex>
                                  <v-flex xs12 md3>
                                    <v-text-field
                                      ref="outubro"
                                      :color="color"
                                      label="Outubro"
                                      v-money="money"
                                      v-model="data.item.outubro"
                                      :disabled="metaAnual[9].valor === '-'"
                                      @blur="atualizaVend(data.item, true)"
                                    ></v-text-field>
                                  </v-flex>
                                  <v-flex xs12 md3>
                                    <v-text-field
                                      ref="novembro"
                                      :color="color"
                                      label="Novembro"
                                      v-money="money"
                                      v-model="data.item.novembro"
                                      :disabled="metaAnual[10].valor === '-'"
                                      @blur="atualizaVend(data.item, true)"
                                    ></v-text-field>
                                  </v-flex>
                                  <v-flex xs12 md3>
                                    <v-text-field
                                      ref="dezembro"
                                      :color="color"
                                      label="Dezembro"
                                      v-money="money"
                                      v-model="data.item.dezembro"
                                      :disabled="metaAnual[11].valor === '-'"
                                      @blur="atualizaVend(data.item, true)"
                                    ></v-text-field>
                                  </v-flex>
                                </v-layout>
                              </v-container>
                            </v-card-text>
                          </v-card>
                        </template>
                      </v-data-table>
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
        <v-btn color="blue darken-1" flat @click="modalStore.empresas.metas.visible = false">Fechar</v-btn>
        <v-btn color="blue darken-1" flat @click="save">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { VMoney } from "v-money";

import axios from "axios";
import {
  urlBD,
  showError,
  parseNumber,
  formatDate,
  moneyToNumber
} from "@/global";
import { mapState } from "vuex";
import { formatToBRL } from "brazilian-values";

export default {
  directives: { money: VMoney },
  computed: {
    computedDateFormatted1() {
      return this.formatDate(this.meta.data);
    },
    ...mapState("app", ["color"]),
    ...mapState(["modalStore", "empresaStore", "pessoaStore", "usuarioStore"])
  },
  watch: {
    "$store.state.modalStore.empresas.metas.visible": function() {
      if (this.modalStore.empresas.metas.visible) {
        this.reset();
        this.loadTela(this.empresaStore.meta);
      } else {
        this.loadMetas();
      }
    }
  },
  data() {
    return {
      valid: true,
      expand: false,
      expand2: false,
      flagData: false,
      confirmacao: false,
      showTabela: false,
      meta: {},
      metaAux: {},
      metaVendAux: {},
      metaVendAtt: [],
      menu1: false,
      tabIndex: "tab-1",
      pessoas: [],
      fields: [
        { value: "mes", text: "Mês", sortable: false },
        { value: "valor", text: "Valor", sortable: false },
        { value: "percentual", text: "Percentual", sortable: false },
        { value: "actions", text: "Ações", sortable: false }
      ],
      fieldsFunc: [
        { value: "id", text: "Código", sortable: false },
        { value: "nome", text: "Vendedor", sortable: false },
        { value: "total", text: "Total do ano", sortable: false },
        { value: "actions", text: "Ações" }
      ],
      metaAnual: [
        {
          mes: "Janeiro",
          valor: "",
          percentual: "",
          expanded: false
        },
        {
          mes: "Fevereiro",
          valor: "",
          percentual: "",
          expanded: false
        },
        {
          mes: "Março",
          valor: "",
          percentual: "",
          expanded: false
        },
        {
          mes: "Abril",
          valor: "",
          percentual: "",
          expanded: false
        },
        {
          mes: "Maio",
          valor: "",
          percentual: "",
          expanded: false
        },
        {
          mes: "Junho",
          valor: "",
          percentual: "",
          expanded: false
        },
        {
          mes: "Julho",
          valor: "",
          percentual: "",
          expanded: false
        },
        {
          mes: "Agosto",
          valor: "",
          percentual: "",
          expanded: false
        },
        {
          mes: "Setembro",
          valor: "",
          percentual: "",
          expanded: false
        },
        {
          mes: "Outubro",
          valor: "",
          percentual: "",
          expanded: false
        },
        {
          mes: "Novembro",
          valor: "",
          percentual: "",
          expanded: false
        },
        {
          mes: "Dezembro",
          valor: "",
          percentual: "",
          expanded: false
        }
      ],
      metaVend: [],
      tipoRules: [v => !!v || "Tipo de meta obrigatório"],
      dataRules: [v => !!v || "Data de início de meta obrigatória"],
      valorRules: [v => !!v || v == "R$ 0,00" || "Valor da meta obrigatório"],
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
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${month}/${year}`;
    },
    reset() {
      this.$refs.form ? this.$refs.form.reset() : null;

      this.$refs.valor_total
        ? (this.$refs.valor_total.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : null;

      this.meta = {};
      this.flagData = false;
      this.showTabela = false;
      this.tabIndex = "tab-1";
      this.metaAnual = [
        { mes: "Janeiro", valor: "", percentual: "" },
        { mes: "Fevereiro", valor: "", percentual: "" },
        { mes: "Março", valor: "", percentual: "" },
        { mes: "Abril", valor: "", percentual: "" },
        { mes: "Maio", valor: "", percentual: "" },
        { mes: "Junho", valor: "", percentual: "" },
        { mes: "Julho", valor: "", percentual: "" },
        { mes: "Agosto", valor: "", percentual: "" },
        { mes: "Setembro", valor: "", percentual: "" },
        { mes: "Outubro", valor: "", percentual: "" },
        { mes: "Novembro", valor: "", percentual: "" },
        { mes: "Dezembro", valor: "", percentual: "" }
      ];
      this.metaVend = [];
    },
    geraTabela() {
      if (!this.$refs.form.validate()) return;

      const [year, month, day] = this.meta.data.split("-");
      const meses = 12 - (month - 1);

      let valorMes = parseNumber(this.meta.valor_total);
      valorMes = parseFloat(valorMes / meses);
      let percentMes = parseFloat(100 / meses);
      percentMes = moneyToNumber(formatToBRL(percentMes)) + "%";

      let i = 0;

      this.metaAnual = this.metaAnual.map(metaMes => {
        if (i >= month - 1) {
          metaMes.valor = formatToBRL(valorMes);
          metaMes.percentual = percentMes;
          metaMes.calcular = true;
        } else {
          metaMes.valor = "-";
          metaMes.percentual = "-";
        }
        i++;
        return metaMes;
      });

      this.showTabela = true;
    },
    geraTabelaVend() {
      this.metaVend = [];
      this.expand2 = false;
      this.pessoaStore.pessoas.forEach(pessoa => {
        let totalVend = 0;
        let metaPessoa = {
          id: pessoa.id,
          nome: pessoa.nome,
          id_empresa: this.empresaStore.currentEmpresa.value,
          janeiro: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[0].valor)) /
              this.pessoaStore.pessoas.length
          ),
          fevereiro: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[1].valor)) /
              this.pessoaStore.pessoas.length
          ),
          marco: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[2].valor)) /
              this.pessoaStore.pessoas.length
          ),
          abril: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[3].valor)) /
              this.pessoaStore.pessoas.length
          ),
          maio: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[4].valor)) /
              this.pessoaStore.pessoas.length
          ),
          junho: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[5].valor)) /
              this.pessoaStore.pessoas.length
          ),
          julho: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[6].valor)) /
              this.pessoaStore.pessoas.length
          ),
          agosto: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[7].valor)) /
              this.pessoaStore.pessoas.length
          ),
          setembro: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[8].valor)) /
              this.pessoaStore.pessoas.length
          ),
          outubro: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[9].valor)) /
              this.pessoaStore.pessoas.length
          ),
          novembro: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[10].valor)) /
              this.pessoaStore.pessoas.length
          ),
          dezembro: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[11].valor)) /
              this.pessoaStore.pessoas.length
          ),
          total: formatToBRL(
            parseFloat(parseNumber(this.meta.valor_total)) /
              this.pessoaStore.pessoas.length
          ),
          calcular: true
        };

        this.metaVend.push(metaPessoa);
      });
    },
    atualizaVend(item, calcTotal) {
      const data = Object.values(item);
      if (calcTotal) {
        const soma = data.reduce((total, item, index) => {
          if (index > 2 && index < 15) return (total += parseNumber(item));
          else return (total += 0);
        }, 0);

        item.total = formatToBRL(soma);
        this.$refs.total_vendedor.$el.getElementsByTagName("input")[0].value =
          item.total;
      }
    },
    loadValoresVend(meta) {
      this.metaVendAux = meta;
      this.$refs.janeiro
        ? (this.$refs.janeiro.$el.getElementsByTagName("input")[0].value =
            meta.janeiro)
        : 0;
      this.$refs.fevereiro
        ? (this.$refs.fevereiro.$el.getElementsByTagName("input")[0].value =
            meta.fevereiro)
        : 0;
      this.$refs.marco
        ? (this.$refs.marco.$el.getElementsByTagName("input")[0].value =
            meta.marco)
        : 0;
      this.$refs.abril
        ? (this.$refs.abril.$el.getElementsByTagName("input")[0].value =
            meta.abril)
        : 0;
      this.$refs.maio
        ? (this.$refs.maio.$el.getElementsByTagName("input")[0].value =
            meta.maio)
        : 0;
      this.$refs.junho
        ? (this.$refs.junho.$el.getElementsByTagName("input")[0].value =
            meta.junho)
        : 0;
      this.$refs.julho
        ? (this.$refs.julho.$el.getElementsByTagName("input")[0].value =
            meta.julho)
        : 0;
      this.$refs.agosto
        ? (this.$refs.agosto.$el.getElementsByTagName("input")[0].value =
            meta.agosto)
        : 0;
      this.$refs.setembro
        ? (this.$refs.setembro.$el.getElementsByTagName("input")[0].value =
            meta.setembro)
        : 0;
      this.$refs.outubro
        ? (this.$refs.outubro.$el.getElementsByTagName("input")[0].value =
            meta.outubro)
        : 0;
      this.$refs.novembro
        ? (this.$refs.novembro.$el.getElementsByTagName("input")[0].value =
            meta.novembro)
        : 0;
      this.$refs.dezembro
        ? (this.$refs.dezembro.$el.getElementsByTagName("input")[0].value =
            meta.dezembro)
        : 0;
      this.$refs.total
        ? (this.$refs.total.$el.getElementsByTagName("input")[0].value =
            meta.total)
        : 0;
    },
    calcPercent(item) {
      const valor = parseNumber(item.valor);

      const percentual =
        (valor / parseNumber(this.meta.valor_total, ",")) * 100;
      item.percentual = moneyToNumber(formatToBRL(percentual)) + "%";
      this.$refs.meta_percentual.$el.getElementsByTagName("input")[0].value =
        item.percentual;

      this.calcTotal();
    },
    calcValor(item) {
      const percentual = parseNumber(item.percentual);

      const valor =
        (parseNumber(this.meta.valor_total, ",") / 100) * percentual;
      item.valor = formatToBRL(valor);
      this.$refs.meta_valor.$el.getElementsByTagName("input")[0].value =
        item.valor;

      this.calcTotal();
    },
    calcTotal() {
      const soma = this.metaAnual.reduce((total, item) => {
        return (total += parseNumber(item.valor));
      }, 0);

      this.meta.valor_total = formatToBRL(soma);
      this.$refs.valor_total
        ? (this.$refs.valor_total.$el.getElementsByTagName(
            "input"
          )[0].value = this.meta.valor_total)
        : "";
    },
    loadTela(meta) {
      let urlTela = `${urlBD}/empresaMetas/TelaMetas/`;
      if (!meta) {
        axios.get(urlTela).then(res => {
          const tela = res.data;

          this.pessoaStore.pessoas = tela.pessoas;
        });
      } else if (meta.id) {
        urlTela += meta.id;
        axios.get(urlTela).then(res => {
          const tela = res.data;

          this.meta = tela.meta;
          this.metaAnual = this.meta.metaAnual;
          this.metaAnual = this.metaAnual.map(mes => {
            mes.valor = formatToBRL(mes.valor);
            mes.percentual = moneyToNumber(formatToBRL(mes.percentual)) + "%";

            return mes;
          });

          this.meta.data = new Date(this.meta.data).toISOString().substr(0, 10);

          this.pessoaStore.pessoas = tela.pessoas;
          this.showTabela = true;

          this.$refs.valor
            ? (this.$refs.valor.$el.getElementsByTagName(
                "input"
              )[0].value = this.meta.valor_total)
            : "";
        });
      }
    },
    loadMetas() {
      const url = `${urlBD}/empresaMetas/`;

      axios
        .get(url)
        .then(res => {
          this.empresaStore.metas = res.data;
          this.empresaStore.metas = this.empresaStore.metas.map(meta => {
            meta.valor_total = formatToBRL(meta.valor_total);
            return meta;
          });
        })
        .catch(showError);
    },
    save() {
      if (!this.$refs.form.validate()) return;
      if (this.metaVend.length > 0 && this.metaVendAtt.length == 0)
        return showError("Selecione as metas dos vendedores que deseja salvar");

      const method = this.meta.id ? "put" : "post";
      const id = this.meta.id ? this.meta.id : "";
      const url = `${urlBD}/empresaMetas/${id}`;

      if (!this.meta.id_empresa) {
        this.meta.id_empresa = this.empresaStore.currentEmpresa.value;
      }

      this.meta.vendedores = this.metaVendAtt;

      axios[method](url, this.meta)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.modalStore.empresas.metas.visible;

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
