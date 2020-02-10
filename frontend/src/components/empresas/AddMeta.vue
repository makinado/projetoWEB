<template>
  <v-layout row justify-center>
    <v-dialog v-model="modalStore.empresas.metas.visible" lazy persistent max-width="900px">
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
                  <v-tabs-slider color="primary"></v-tabs-slider>
                  <v-tab href="#tab-1">
                    BÁSICO
                    <v-icon>fa fa-lg fa-file</v-icon>
                  </v-tab>

                  <v-tab href="#tab-2" :disabled="meta.tipo_receita_despesa !== 'RECEITA'">
                    VENDEDORES
                    <v-icon>fa fa-lg fa-user</v-icon>
                  </v-tab>

                  <v-tab-item value="tab-1">
                    <v-card flat>
                      <v-card-text>
                        <v-container grid-list-xl>
                          <v-layout wrap>
                            <v-flex xs12 md4>
                              <v-autocomplete
                                no-data-text="Nenhum resultado"
                                dense
                                color="primary"
                                label="Empresa"
                                v-model="meta.id_empresa"
                                :items="empresaStore.empresas"
                                :error-messages="empresaErrors"
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-autocomplete
                                dense
                                color="primary"
                                label="Tipo de meta"
                                :items="['RECEITA', 'DESPESA']"
                                v-model="meta.tipo_receita_despesa"
                                :error-messages="tipoErrors"
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
                                    color="primary"
                                    v-model="computedDateFormatted1"
                                    label="Data da meta"
                                    prepend-icon="event"
                                    readonly
                                    v-on="on"
                                    @blur="flagData = true"
                                    :error-messages="dataErrors"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  ref="picker"
                                  type="month"
                                  color="primary"
                                  v-model="meta.data"
                                  @input="menu1 = false"
                                  locale="pt-br"
                                ></v-date-picker>
                              </v-menu>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-text-field
                                ref="valor"
                                color="primary"
                                label="Valor total da meta"
                                v-money="money"
                                v-model="meta.valor_total"
                                :error-messages="valorErrors"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md1>
                              <v-btn
                                class="v-btn-common"
                                color="primary"
                                @click="[geraTabela(), showTabela = true]"
                                :disabled="!meta.data || meta.valor_total === '0,00'"
                              >Gerar</v-btn>
                            </v-flex>
                            <v-flex xs12>
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
                                <v-progress-linear
                                  slot="progress"
                                  color="blue"
                                  height="3"
                                  indeterminate
                                ></v-progress-linear>
                                <template slot="items" slot-scope="data">
                                  <tr
                                    @click="data.item.valor !== '-' ? (data.expanded = !data.expanded) : ('')"
                                  >
                                    <td>{{ data.item.mes}}</td>
                                    <td>{{ data.item.valor}}</td>
                                    <td>{{ data.item.percentual}}</td>
                                  </tr>
                                </template>
                                <template slot="expand" slot-scope="data">
                                  <v-card flat>
                                    <v-card-title>
                                      <span
                                        class="headline"
                                      >Alterar valores do mês de {{ data.item.mes }}</span>
                                    </v-card-title>
                                    <v-card-text>
                                      <v-container grid-list-xl>
                                        <v-layout row>
                                          <v-flex xs12 md6>
                                            <v-text-field
                                              ref="valor_tab"
                                              color="primary"
                                              label="Valor"
                                              v-money="money"
                                              v-model.lazy="metaAux.valor"
                                              @blur="calcPercent"
                                            ></v-text-field>
                                          </v-flex>
                                          <v-flex xs12 md6>
                                            <v-text-field
                                              ref="percent"
                                              color="primary"
                                              label="Percentual"
                                              v-money="percent"
                                              v-model.lazy="metaAux.percentual"
                                              @blur="calcValor"
                                            ></v-text-field>
                                          </v-flex>
                                        </v-layout>
                                      </v-container>
                                    </v-card-text>
                                    <v-card-actions>
                                      <v-spacer></v-spacer>
                                      <v-btn
                                        color="blue darken-1"
                                        flat
                                        @click="atualizaTabela(data.item.mes)"
                                      >Atualizar</v-btn>
                                    </v-card-actions>
                                  </v-card>
                                </template>
                              </v-data-table>
                            </v-flex>
                            <small
                              v-show="showTabela"
                            >É possível alterar os valores e percentuais diretamente da tabela.</small>
                          </v-layout>
                        </v-container>
                      </v-card-text>
                    </v-card>
                  </v-tab-item>

                  <v-tab-item value="tab-2">
                    <v-card flat>
                      <v-card-text>
                        <v-container fluid>
                          <v-layout wrap>
                            <v-flex xs12>
                              <v-data-table
                                v-model="metaVendAtt"
                                :items="metaVend"
                                :headers="fieldsFunc"
                                no-data-text="Nenhuma meta anual gerada"
                                hide-actions
                                select-all
                                item-key="id"
                                expand
                              >
                                <v-progress-linear
                                  slot="progress"
                                  color="blue"
                                  height="3"
                                  indeterminate
                                ></v-progress-linear>
                                <template slot="items" slot-scope="data">
                                  <td>
                                    <v-tooltip bottom>
                                      <v-checkbox
                                        slot="activator"
                                        v-model="data.selected"
                                        color="primary"
                                        hide-details
                                      ></v-checkbox>
                                      <span>Selecione os vendedores</span>
                                    </v-tooltip>
                                  </td>
                                  <td
                                    @click="[data.expanded = !data.expanded, loadValoresVend(data.item)]"
                                  >{{ data.item.id }}</td>
                                  <td
                                    @click="[data.expanded = !data.expanded, loadValoresVend(data.item)]"
                                  >{{ data.item.nome }}</td>
                                  <td
                                    @click="[data.expanded = !data.expanded, loadValoresVend(data.item)]"
                                  >{{ data.item.total }}</td>
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
                                              ref="total"
                                              color="primary"
                                              label="Total"
                                              v-money="money"
                                              v-model.lazy="metaVendAux.total"
                                              @blur="atualizaVend(metaVendAux, false)"
                                            ></v-text-field>
                                          </v-flex>
                                        </v-layout>
                                        <v-layout row>
                                          <v-flex xs12 md3>
                                            <v-text-field
                                              ref="janeiro"
                                              color="primary"
                                              label="Janeiro"
                                              v-money="money"
                                              v-model.lazy="metaVendAux.janeiro"
                                              :disabled="metaAnual[0].valor === '-'"
                                            ></v-text-field>
                                          </v-flex>
                                          <v-flex xs12 md3>
                                            <v-text-field
                                              ref="fevereiro"
                                              color="primary"
                                              label="Fevereiro"
                                              v-money="money"
                                              v-model.lazy="metaVendAux.fevereiro"
                                              :disabled="metaAnual[1].valor === '-'"
                                            ></v-text-field>
                                          </v-flex>
                                          <v-flex xs12 md3>
                                            <v-text-field
                                              ref="marco"
                                              color="primary"
                                              label="Março"
                                              v-money="money"
                                              v-model.lazy="metaVendAux.marco"
                                              :disabled="metaAnual[2].valor === '-'"
                                            ></v-text-field>
                                          </v-flex>
                                          <v-flex xs12 md3>
                                            <v-text-field
                                              ref="abril"
                                              color="primary"
                                              label="Abril"
                                              v-money="money"
                                              v-model.lazy="metaVendAux.abril"
                                              :disabled="metaAnual[3].valor === '-'"
                                            ></v-text-field>
                                          </v-flex>
                                          <v-flex xs12 md3>
                                            <v-text-field
                                              ref="maio"
                                              color="primary"
                                              label="Maio"
                                              v-money="money"
                                              v-model.lazy="metaVendAux.maio"
                                              :disabled="metaAnual[4].valor === '-'"
                                            ></v-text-field>
                                          </v-flex>
                                          <v-flex xs12 md3>
                                            <v-text-field
                                              ref="junho"
                                              color="primary"
                                              label="Junho"
                                              v-money="money"
                                              v-model.lazy="metaVendAux.junho"
                                              :disabled="metaAnual[5].valor === '-'"
                                            ></v-text-field>
                                          </v-flex>
                                          <v-flex xs12 md3>
                                            <v-text-field
                                              ref="julho"
                                              color="primary"
                                              label="Julho"
                                              v-money="money"
                                              v-model.lazy="metaVendAux.julho"
                                              :disabled="metaAnual[6].valor === '-'"
                                            ></v-text-field>
                                          </v-flex>
                                          <v-flex xs12 md3>
                                            <v-text-field
                                              ref="agosto"
                                              color="primary"
                                              label="Agosto"
                                              v-money="money"
                                              v-model.lazy="metaVendAux.agosto"
                                              :disabled="metaAnual[7].valor === '-'"
                                            ></v-text-field>
                                          </v-flex>
                                          <v-flex xs12 md3>
                                            <v-text-field
                                              ref="setembro"
                                              color="primary"
                                              label="Setembro"
                                              v-money="money"
                                              v-model.lazy="metaVendAux.setembro"
                                              :disabled="metaAnual[8].valor === '-'"
                                            ></v-text-field>
                                          </v-flex>
                                          <v-flex xs12 md3>
                                            <v-text-field
                                              ref="outubro"
                                              color="primary"
                                              label="Outubro"
                                              v-money="money"
                                              v-model.lazy="metaVendAux.outubro"
                                              :disabled="metaAnual[9].valor === '-'"
                                            ></v-text-field>
                                          </v-flex>
                                          <v-flex xs12 md3>
                                            <v-text-field
                                              ref="novembro"
                                              color="primary"
                                              label="Novembro"
                                              v-money="money"
                                              v-model.lazy="metaVendAux.novembro"
                                              :disabled="metaAnual[10].valor === '-'"
                                            ></v-text-field>
                                          </v-flex>
                                          <v-flex xs12 md3>
                                            <v-text-field
                                              ref="dezembro"
                                              color="primary"
                                              label="Dezembro"
                                              v-money="money"
                                              v-model.lazy="metaVendAux.dezembro"
                                              :disabled="metaAnual[11].valor === '-'"
                                            ></v-text-field>
                                          </v-flex>
                                        </v-layout>
                                      </v-container>
                                    </v-card-text>
                                    <v-card-actions>
                                      <v-spacer></v-spacer>
                                      <v-btn
                                        color="blue darken-1"
                                        flat
                                        @click="atualizaVend(metaVendAux, true)"
                                      >Atualizar</v-btn>
                                    </v-card-actions>
                                  </v-card>
                                </template>
                              </v-data-table>
                            </v-flex>
                            <small
                              v-if="metaVend.length > 0"
                            >*Altere os valores de cada vendedor clicando sobre ele</small>
                          </v-layout>
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
          <v-btn color="blue darken-1" flat @click="confirmacao = true">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmacao" lazy max-width="350px">
      <v-card>
        <v-card-title>
          <span class="headline">O que você deseja fazer?</span>
        </v-card-title>
        <v-card-text>
          <v-container fluid>
            <v-flex xs12>
              <v-layout justify-center wrap>
                <v-tooltip bottom>
                  <v-btn
                    slot="activator"
                    class="v-btn-common"
                    color="primary"
                    @click="save(1)"
                  >Salvar meta</v-btn>
                  <span>Salva as alterações da meta</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn
                    slot="activator"
                    class="v-btn-common"
                    color="warning"
                    @click="save(2)"
                  >Salvar vendedores</v-btn>
                  <span>Salva as alterações dos vendedores</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn
                    slot="activator"
                    class="v-btn-common"
                    color="danger"
                    @click="save(3)"
                  >Salvar tudo</v-btn>
                  <span>Salva todas as alterações</span>
                </v-tooltip>
              </v-layout>
            </v-flex>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="confirmacao = false">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
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
    ...mapState([
      "modalStore",
      "empresaStore",
      "pessoaStore",
      "usuarioStore",
    ])
  },
  watch: {
    "$store.state.modalStore.empresas.metas.visible": function() {
      this.reset();
      if (this.modalStore.empresas.metas.visible) {
        this.loadTela(this.empresaStore.meta);
        this.loadEmpresas();
      } else {
        this.loadMetas();
      }
    }
  },
  data() {
    return {
      expand: false,
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
        { value: "percentual", text: "Percentual", sortable: false }
      ],
      fieldsFunc: [
        { value: "id_pessoa", text: "Código", sortable: false },
        { value: "nome", text: "Vendedor", sortable: false },
        { value: "total", text: "Total do ano", sortable: false }
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
      categoriaErrors: [],
      tipoErrors: [],
      empresaErrors: [],
      dataErrors: [],
      valorErrors: [],
      vendErros: [],
      money: {
        decimal: ",",
        thousands: ".",
        precision: 2
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
      this.categoriaErrors = this.tipoErrors = this.empresaErrors = this.dataErrors = this.valorErrors = [];

      this.$refs.valor
        ? (this.$refs.valor.$el.getElementsByTagName("input")[0].value = 0)
        : "";
      this.$refs.valor_tab
        ? (this.$refs.valor_tab.$el.getElementsByTagName("input")[0].value = 0)
        : "";
      this.$refs.percent
        ? (this.$refs.percent.$el.getElementsByTagName("input")[0].value = 0)
        : "";

      this.$refs.janeiro
        ? (this.$refs.janeiro.$el.getElementsByTagName("input")[0].value = 0)
        : "";
      this.$refs.fevereiro
        ? (this.$refs.fevereiro.$el.getElementsByTagName("input")[0].value = 0)
        : "";
      this.$refs.marco
        ? (this.$refs.marco.$el.getElementsByTagName("input")[0].value = 0)
        : "";
      this.$refs.abril
        ? (this.$refs.abril.$el.getElementsByTagName("input")[0].value = 0)
        : "";
      this.$refs.maio
        ? (this.$refs.maio.$el.getElementsByTagName("input")[0].value = 0)
        : "";
      this.$refs.junho
        ? (this.$refs.junho.$el.getElementsByTagName("input")[0].value = 0)
        : "";
      this.$refs.julho
        ? (this.$refs.julho.$el.getElementsByTagName("input")[0].value = 0)
        : "";
      this.$refs.agosto
        ? (this.$refs.agosto.$el.getElementsByTagName("input")[0].value = 0)
        : "";
      this.$refs.setembro
        ? (this.$refs.setembro.$el.getElementsByTagName("input")[0].value = 0)
        : "";
      this.$refs.outubro
        ? (this.$refs.outubro.$el.getElementsByTagName("input")[0].value = 0)
        : "";
      this.$refs.novembro
        ? (this.$refs.novembro.$el.getElementsByTagName("input")[0].value = 0)
        : "";
      this.$refs.dezembro
        ? (this.$refs.dezembro.$el.getElementsByTagName("input")[0].value = 0)
        : "";

      this.meta = {};
      this.flagData = false;
      this.showTabela = false;
      this.metaAux = {};
      this.metaVendAux = {};
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
      const [year, month, day] = this.meta.data.split("-");
      const meses = 12 - (month - 1);

      let valorMes = parseNumber(this.meta.valor_total, ",");
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
      this.getMetaVend();
    },
    atualizaTabela(mes) {
      if (this.metaAux.valor) {
        let valorMes = parseNumber(this.metaAux.valor, ",");
        valorMes = parseFloat(valorMes);
        let percentMes = parseNumber(this.metaAux.percentual, ",");
        percentMes = parseFloat(percentMes);

        let meses = 0;
        let somaAtualizados = 0;

        this.metaAnual = this.metaAnual.map(meta => {
          if (meta.mes == mes) {
            meta.valor = formatToBRL(valorMes);
            meta.percentual = moneyToNumber(formatToBRL(percentMes)) + "%";
            meta.calcular = false;
          }
          return meta;
        });

        for (let i = 0; i < this.metaAnual.length; i++) {
          meses += this.metaAnual[i].calcular === true ? 1 : 0;
          somaAtualizados +=
            this.metaAnual[i].calcular === false
              ? parseFloat(parseNumber(this.metaAnual[i].valor, ","))
              : 0;
        }

        let valorBalanceio = parseNumber(this.meta.valor_total, ",");
        valorBalanceio = parseFloat((valorBalanceio - somaAtualizados) / meses);
        let percentBalanceio = parseFloat(
          (valorBalanceio /
            parseFloat(parseNumber(this.meta.valor_total, ","))) *
            100
        );

        this.metaAnual = this.metaAnual.map(meta => {
          if (meta.calcular) {
            meta.valor = formatToBRL(valorBalanceio);
            meta.percentual =
              moneyToNumber(formatToBRL(percentBalanceio)) + "%";
          }
          return meta;
        });

        this.metaAux = {};
        this.$refs.valor_tab
          ? (this.$refs.valor_tab.$el.getElementsByTagName(
              "input"
            )[0].value = 0)
          : "";
        this.$refs.percent
          ? (this.$refs.percent.$el.getElementsByTagName("input")[0].value = 0)
          : "";
      }
      this.getMetaVend();
    },
    getMetaVend() {
      this.metaVend = [];
      this.pessoaStore.pessoas.forEach(pessoa => {
        let totalVend = 0;
        let metaPessoa = {
          id_pessoa: pessoa.id,
          nome: pessoa.nome,
          id_empresa: this.meta.id_empresa,
          janeiro: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[0].valor, ",")) /
              this.pessoaStore.pessoas.length
          ),
          fevereiro: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[1].valor, ",")) /
              this.pessoaStore.pessoas.length
          ),
          marco: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[2].valor, ",")) /
              this.pessoaStore.pessoas.length
          ),
          abril: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[3].valor, ",")) /
              this.pessoaStore.pessoas.length
          ),
          maio: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[4].valor, ",")) /
              this.pessoaStore.pessoas.length
          ),
          junho: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[5].valor, ",")) /
              this.pessoaStore.pessoas.length
          ),
          julho: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[6].valor, ",")) /
              this.pessoaStore.pessoas.length
          ),
          agosto: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[7].valor, ",")) /
              this.pessoaStore.pessoas.length
          ),
          setembro: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[8].valor, ",")) /
              this.pessoaStore.pessoas.length
          ),
          outubro: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[9].valor, ",")) /
              this.pessoaStore.pessoas.length
          ),
          novembro: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[10].valor, ",")) /
              this.pessoaStore.pessoas.length
          ),
          dezembro: formatToBRL(
            parseFloat(parseNumber(this.metaAnual[11].valor, ",")) /
              this.pessoaStore.pessoas.length
          ),
          total: formatToBRL(
            parseFloat(parseNumber(this.meta.valor_total, ",")) /
              this.pessoaStore.pessoas.length
          ),
          calcular: true
        };

        this.metaVend.push(metaPessoa);
      });
    },
    atualizaVend(metaAtt, calcTotal) {
      const id = metaAtt.id;

      if (calcTotal) {
        this.metaVend = this.metaVend.map(meta => {
          if (meta.id === id) {
            meta = { ...metaAtt };

            meta.total = formatToBRL(
              parseFloat(parseNumber(meta.janeiro, ",")) +
                parseFloat(parseNumber(meta.fevereiro, ",")) +
                parseFloat(parseNumber(meta.marco, ",")) +
                parseFloat(parseNumber(meta.abril, ",")) +
                parseFloat(parseNumber(meta.maio, ",")) +
                parseFloat(parseNumber(meta.junho, ",")) +
                parseFloat(parseNumber(meta.julho, ",")) +
                parseFloat(parseNumber(meta.agosto, ",")) +
                parseFloat(parseNumber(meta.setembro, ",")) +
                parseFloat(parseNumber(meta.outubro, ",")) +
                parseFloat(parseNumber(meta.novembro, ",")) +
                parseFloat(parseNumber(meta.dezembro, ","))
            );
          }
          return meta;
        });
      } else {
        const metaTotal = parseFloat(parseNumber(this.meta.valor_total, ","));

        this.metaVend = this.metaVend.filter(meta => {
          if (meta.id === id) {
            // altera os valores do vendedor que foi alterado
            // calculo = total do vendedor * porcentagem do mes / 100
            // porcentagem do mes = 100 * valorMes / total da meta

            meta.janeiro = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[0].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.fevereiro = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[1].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.marco = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[2].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.abril = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[3].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.maio = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[4].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.junho = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[5].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.julho = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[6].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.agosto = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[7].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.setembro = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[8].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.outubro = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[9].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.novembro = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 *
                  parseFloat(parseNumber(this.metaAnual[10].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.dezembro = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 *
                  parseFloat(parseNumber(this.metaAnual[11].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.calcular = false;

            this.loadValoresVend(meta);
          }
          return meta;
        });

        const vendAtt = this.metaVend.filter(vend => {
          return vend.id === id;
        });

        this.metaVend = this.metaVend.filter(meta => {
          if (meta.id !== id && meta.calcular === true) {
            // balanceia os outros vendedores em relação ao atualizado
            // calculo = total do vendedor * porcentagem do mes / 100
            // porcentagem do mes = 100 * valorMes / total da meta

            meta.total =
              (metaTotal - parseFloat(parseNumber(vendAtt[0].total, ","))) /
              this.pessoaStore.pessoas.length;

            meta.total = formatToBRL(
              parseFloat(parseNumber(vendAtt[0].total, ",")) - meta.total
            );

            meta.janeiro = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[0].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.fevereiro = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[1].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.marco = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[2].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.abril = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[3].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.maio = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[4].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.junho = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[5].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.julho = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[6].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.agosto = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[7].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.setembro = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[8].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.outubro = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 * parseFloat(parseNumber(this.metaAnual[9].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.novembro = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 *
                  parseFloat(parseNumber(this.metaAnual[10].valor, ","))) /
                  metaTotal)) /
                100
            );
            meta.dezembro = formatToBRL(
              (parseFloat(parseNumber(meta.total, ",")) *
                ((100 *
                  parseFloat(parseNumber(this.metaAnual[11].valor, ","))) /
                  metaTotal)) /
                100
            );
          }
          return meta;
        });
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
    calcPercent() {
      let valorMes = parseNumber(this.metaAux.valor, ",");
      valorMes = parseFloat(valorMes);
      let valorTotal = parseNumber(this.meta.valor_total, ",");
      valorTotal = parseFloat(valorTotal);

      let result = valorMes * 100;
      result = result / valorTotal;

      const meta = {
        percentual: formatToBRL(result),
        valor: formatToBRL(valorMes)
      };
      this.$refs.valor_tab
        ? (this.$refs.valor_tab.$el.getElementsByTagName("input")[0].value =
            meta.valor)
        : "";
      this.$refs.percent
        ? (this.$refs.percent.$el.getElementsByTagName("input")[0].value =
            meta.percentual)
        : "";

      this.metaAux = meta;
    },
    calcValor() {
      let percentMes = parseNumber(this.metaAux.percentual, ",");
      percentMes = parseFloat(percentMes);
      let valorTotal = parseNumber(this.meta.valor_total, ",");
      valorTotal = parseFloat(valorTotal);

      let result = percentMes * valorTotal;
      result = result / 100;

      const meta = {
        percentual: formatToBRL(percentMes),
        valor: formatToBRL(result)
      };
      this.$refs.valor_tab
        ? (this.$refs.valor_tab.$el.getElementsByTagName("input")[0].value =
            meta.valor)
        : "";
      this.$refs.percent
        ? (this.$refs.percent.$el.getElementsByTagName("input")[0].value =
            meta.percentual)
        : "";

      this.metaAux = meta;
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
    loadEmpresas() {
      const url = `${urlBD}/usuarioEmpresas/${this.usuarioStore.currentUsuario.id}`;
      axios.get(url).then(res => {
        this.empresaStore.empresas = res.data;
        if (this.empresaStore.empresas.length === 1) {
          this.meta.id_empresa = this.empresaStore.empresas[0].value;
        }
      });
    },
    save(param) {
      this.meta.metaAnual = this.metaAnual;

      if (param === 1) {
        this.saveMeta();
      } else if (param === 2) {
        this.saveVend();
      } else {
      }
    },
    saveMeta() {
      if (!this.validateMeta()) return;

      const method = this.meta.id ? "put" : "post";
      const id = this.meta.id ? this.meta.id : "";
      const url = `${urlBD}/empresaMetas/${id}`;

      axios[method](url, this.meta)
        .then(() => {
          this.$toasted.global.defaultSuccess();

          let data = new Date();
          const hora = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`;
          const log = {
            id_usuario: this.usuarioStore.currentUsuario.id,
            data: formatDate(data.toISOString().substr(0, 10)),
            hora,
            tipo: method === "post" ? "GRAVAÇÂO" : "ALTERAÇÃO",
            tela: "META",
            detalhe:
              method === "post"
                ? `Meta adicionada: ${this.meta.empresa}-${this.meta.data}`
                : `Meta alterada: ${this.meta.id}-${this.meta.nome}`
          };
          axios.post(`${urlBD}/log`, log).catch(showError);

          this.loadMetas();
          this.confirmacao = false;
          this.modalStore.empresas.metas.visible = false;
        })
        .catch(e => {
          this.confirmacao = false;
          showError(e);
          this.Errors(e);
        });
    },
    saveVend() {
      if (!this.validateVend()) return;

      const method = this.meta.id ? "put" : "post";
      const url = `${urlBD}/vendMetas/`;

      axios[method](url, this.metaVendAtt)
        .then(() => {
          this.$toasted.global.defaultSuccess();

          let data = new Date();
          const hora = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`;
          const log = {
            id_usuario: this.usuarioStore.currentUsuario.id,
            data: formatDate(data.toISOString().substr(0, 10)),
            hora,
            tipo: method === "post" ? "GRAVAÇÂO" : "ALTERAÇÃO",
            tela: "META DE VENDEDOR",
            detalhe:
              method === "post"
                ? `Meta de vendedor adicionada: ${this.meta.empresa}-${this.meta.data}`
                : `Meta de vendedor alterada: ${this.meta.id}-${this.meta.nome}`
          };
          axios.post(`${urlBD}/log`, log).catch(showError);

          this.loadMetas();

          this.modalStore.empresas.metas.visible = false;
        })
        .catch(e => {
          this.confirmacao = false;
          showError(e);
          this.Errors(e);
        });
    },
    validateMeta() {
      if (!this.meta.id_empresa) {
        const e = "Empresa inválida";
        showError(e);
        this.empresaErrors = e;
        this.tabIndex = "tab-1";
        this.confirmacao = false;
        return false;
      } else {
        this.empresaErrors = "";
      }
      if (!this.meta.tipo_receita_despesa) {
        const e = "Tipo inválido";
        showError(e);
        this.tipoErrors = e;
        this.tabIndex = "tab-1";
        this.confirmacao = false;
        return false;
      } else {
        this.tipoErrors = "";
      }
      if (!this.meta.data) {
        const e = "Data inválida";
        showError(e);
        this.dataErrors = e;
        this.tabIndex = "tab-1";
        this.confirmacao = false;
        return false;
      } else {
        this.dataErrors = "";
      }
      if (!this.meta.valor_total || this.meta.valor_total === '0,00') {
        const e = "Valor inválido";
        showError(e);
        this.valorErrors = e;
        this.tabIndex = "tab-1";
        this.confirmacao = false;
        return false;
      } else {
        this.valorErrors = "";
      }

      return true;
    },
    validateVend() {}
  }
};
</script>

<style>
</style>
