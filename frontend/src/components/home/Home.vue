<template>
  <v-container fluid grid-list-lg>
    <v-layout row wrap>
      <v-flex xs12>
        <PageTitle main="Home" icon="fa fa-home" />
      </v-flex>

      <!-- painel -->
      <v-flex xs12>
        <Card title="Selecione as opções do painel" icon="fa fa-lg fa-calendar" :color="color">
          <v-layout row align-center wrap>
            <v-flex xs12 md3>
              <v-autocomplete
                class="tag-input"
                dense
                chips
                deletable-chips
                :color="color"
                label="Selecione um modo de visualização"
                v-model="painel.mode"
                :items="[{ value: 'year', text: 'Ano' }, { value: 'month', text: 'Mês' }]"
              ></v-autocomplete>
            </v-flex>
            <v-flex xs12 md3>
              <v-autocomplete
                class="tag-input"
                dense
                chips
                deletable-chips
                :color="color"
                label="Selecione uma empresa"
                placeholder="Todas as empresas selecionadas"
                v-model="painel.empresa"
                :items="empresaStore.currentEmpresas"
              ></v-autocomplete>
            </v-flex>
            <v-flex xs12 md3>
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
                    :value="computedDateFormatted"
                    label="Data inicial"
                    prepend-icon="event"
                    readonly
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  @input="menu = false"
                  scrollable
                  :color="color"
                  v-model="painel.data_inicial"
                  locale="pt-br"
                ></v-date-picker>
              </v-menu>
            </v-flex>
            <v-flex xs12 md3>
              <v-menu
                lazy
                v-model="menu1"
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
                    :value="computedDateFormatted1"
                    label="Data final"
                    prepend-icon="event"
                    readonly
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  @input="menu1 = false"
                  scrollable
                  :color="color"
                  v-model="painel.data_final"
                  locale="pt-br"
                ></v-date-picker>
              </v-menu>
            </v-flex>
          </v-layout>
        </Card>
      </v-flex>

      <!-- status -->
      <v-flex sm6 xs12 md6 lg3>
        <router-link to="/financeiro">
          <StatsCard
            @click="$store.commit('setFilter', { pendentes: true, data_inicial: painel.data_inicial, data_final: painel.data_final, pagar: true })"
            color="warning"
            icon="fa fa-arrow-up"
            title="Contas a pagar"
            :value="stats.contasPagar | currency"
          />
        </router-link>
      </v-flex>
      <v-flex sm6 xs12 md6 lg3>
        <router-link to="/financeiro">
          <StatsCard
            @click="$store.commit('setFilter', { pendentes: true, data_inicial: painel.data_inicial, data_final: painel.data_final, receber: true })"
            color="success"
            icon="fa fa-arrow-down"
            title="Contas a receber"
            :value="stats.contasReceber | currency"
          />
        </router-link>
      </v-flex>
      <v-flex sm6 xs12 md6 lg3>
        <router-link to="/vendas">
          <StatsCard
            @click="$store.commit('setFilter', { data_inicial: painel.data_inicial, data_final: painel.data_final })"
            color="red"
            icon="fa fa-shopping-cart"
            title="Vendas realizadas"
            :value="stats.vendas || 0"
          />
        </router-link>
      </v-flex>
      <v-flex sm6 xs12 md6 lg3>
        <router-link to="/usuarios">
          <StatsCard
            color="info"
            icon="fa fa-user-o"
            title="Usuários online"
            :value="usuariosOnline || 1"
          />
        </router-link>
      </v-flex>

      <!-- grafico fluxo de caixa -->
      <v-flex
        v-if="usuarioStore.currentUsuario['financeiro_read']"
        :xs12="sizeFluxoCaixa"
        :md9="!sizeFluxoCaixa"
      >
        <Card
          title="Fluxo de caixa"
          icon="fa fa-lg fa-line-chart"
          color="warning"
          :actions="actions.fluxoCaixa"
        >
          <line-chart
            style="height: 100%"
            ref="graficoFluxoCaixa"
            :chart-data="graficoFluxoCaixa.chartData"
            :gradient-colors="graficoFluxoCaixa.gradientColors"
            :gradient-stops="graficoFluxoCaixa.gradientStops"
            :extra-options="graficoFluxoCaixa.extraOptions"
          />
        </Card>
      </v-flex>

      <!-- calendario -->
      <v-flex xs12 md3>
        <v-date-picker
          class="mt-4"
          v-model="datePicker"
          :color="color"
          :events="arrayEvents"
          event-color="red lighten-1"
          locale="pt-br"
          width="370"
          @click:date="[$router.push('/agenda'), $route.params.data = datePicker]"
        >
          <v-layout row wrap justify-end>
            <v-btn class="mb-3" :color="color" @click="navigate('/agenda')">ver tudo</v-btn>
          </v-layout>
        </v-date-picker>
      </v-flex>

      <!-- grafico performance -->
      <v-flex
        v-if="usuarioStore.currentUsuario['vendas_read']"
        :xs12="sizePerformance"
        :md7="!sizePerformance"
      >
        <Card
          title="Performance de vendas e compras"
          icon="fa fa-lg fa-line-chart"
          color="info"
          :actions="actions.performance"
        >
          <line-chart
            style="height: 100%"
            ref="graficoPerformance"
            :chart-data="graficoPerformance.chartData"
            :gradient-colors="graficoPerformance.gradientColors"
            :gradient-stops="graficoPerformance.gradientStops"
            :extra-options="graficoPerformance.extraOptions"
          />
        </Card>
      </v-flex>

      <!-- Campeoes -->
      <v-flex xs12 md5>
        <Card class="card-tabs" color="secondary">
          <v-flex slot="header">
            <v-tabs v-model="campIndex" color="transparent" slider-color="white">
              <span class="subheading font-weight-light mr-3" style="align-self: center">Campeões:</span>

              <v-tab class="mr-3">
                <v-icon class="mr-2">fa fa-lg fa-archive</v-icon>Produtos
              </v-tab>
              <v-tab class="mr-3">
                <v-icon class="mr-2">fa fa-lg fa-user-o</v-icon>Usuários
              </v-tab>
              <v-tab class="mr-3">
                <v-icon class="mr-2">fa fa-lg fa-user</v-icon>Clientes
              </v-tab>
            </v-tabs>
          </v-flex>

          <v-tabs-items v-model="campIndex">
            <v-tab-item :value="0">
              <v-list three-line>
                <span
                  v-if="!campeoes.produtos || campeoes.produtos.length == 0"
                >Nenhum produto campeão esse mês</span>
                <v-list-tile v-for="(item, index) in campeoes.produtos" :key="item.descricao">
                  <v-layout class="my-2" row wrap>
                    <v-flex xs12>
                      <v-list-tile-title>
                        <v-avatar
                          size="30"
                          :color="index == 0 ? '#FDD835' : index == 1 ? '#546E7A' : index == 2 ? '#FF8F00' : '#43A047'"
                        >
                          <span class="white--text">{{ index + 1 }}</span>
                        </v-avatar>
                        - {{ item.descricao }} - {{ item.total | currency }}
                      </v-list-tile-title>
                    </v-flex>
                  </v-layout>
                </v-list-tile>
              </v-list>
            </v-tab-item>

            <v-tab-item :value="1">
              <v-list three-line>
                <span
                  v-if="!campeoes.usuarios || campeoes.usuarios.length == 0"
                >Nenhum usuário campeão esse mês</span>
                <v-list-tile v-for="(item, index) in campeoes.usuarios" :key="item.nome">
                  <v-layout class="my-2" row wrap>
                    <v-flex xs12>
                      <v-list-tile-title>
                        <v-avatar
                          size="30"
                          :color="index == 0 ? '#FDD835' : index == 1 ? '#546E7A' : index == 2 ? '#FF8F00' : '#43A047'"
                        >
                          <span class="white--text">{{ index + 1 }}</span>
                        </v-avatar>
                        - {{ item.nome }} - {{ item.total | currency }}
                      </v-list-tile-title>
                    </v-flex>
                  </v-layout>
                </v-list-tile>
              </v-list>
            </v-tab-item>

            <v-tab-item :value="2">
              <v-list three-line>
                <span
                  v-if="!campeoes.clientes || campeoes.clientes.length == 0"
                >Nenhum cliente campeão esse mês</span>
                <v-list-tile v-for="(item, index) in campeoes.clientes" :key="item.nome">
                  <v-layout class="my-2" row wrap>
                    <v-flex xs12>
                      <v-list-tile-title>
                        <v-avatar
                          size="30"
                          :color="index == 0 ? '#FDD835' : index == 1 ? '#546E7A' : index == 2 ? '#FF8F00' : '#43A047'"
                        >
                          <span class="white--text">{{ index + 1 }}</span>
                        </v-avatar>
                        - {{ item.nome }} - {{ item.total | currency }}
                      </v-list-tile-title>
                    </v-flex>
                  </v-layout>
                </v-list-tile>
              </v-list>
            </v-tab-item>
          </v-tabs-items>
        </Card>
      </v-flex>

      <!-- grafico financeiro -->
      <v-flex
        v-if="usuarioStore.currentUsuario['financeiro_read']"
        :xs12="sizeFinanceiro"
        :md6="!sizeFinanceiro"
      >
        <Card
          title="Financeiro"
          icon="fa fa-lg fa-usd"
          color="success"
          :actions="actions.financeiro"
        >
          <bar-chart
            style="height: 100%"
            ref="graficoFinanceiro"
            :chart-data="graficoFinanceiro.chartData"
            :gradient-colors="graficoFinanceiro.gradientColors"
            :gradient-stops="graficoFinanceiro.gradientStops"
            :extra-options="graficoFinanceiro.extraOptions"
          />
        </Card>
      </v-flex>

      <!-- grafico cadastros -->
      <v-flex :xs12="sizeCadastros" :md6="!sizeCadastros">
        <Card
          title="Cadastros"
          icon="fa fa-lg fa-archive"
          color="warning"
          :actions="actions.cadastros"
        >
          <bar-chart
            style="height: 100%"
            ref="graficoCadastros"
            :chart-data="graficoCadastros.chartData"
            :gradient-colors="graficoCadastros.gradientColors"
            :gradient-stops="graficoCadastros.gradientStops"
            :extra-options="graficoCadastros.extraOptions"
          />
        </Card>
      </v-flex>

      <!-- metas de usuario/empresa -->
      <v-flex xs12 md6>
        <Card class="card-tabs" color="danger">
          <v-flex slot="header">
            <v-tabs v-model="metaIndex" color="transparent" slider-color="white">
              <span class="subheading font-weight-light mr-3" style="align-self: center">Metas:</span>

              <v-tab class="mr-3">
                <v-icon class="mr-2">fa fa-lg fa-user</v-icon>Usuário
              </v-tab>
              <v-tab class="mr-3">
                <v-icon class="mr-2">fa fa-lg fa-building-o</v-icon>Empresa
              </v-tab>
            </v-tabs>
          </v-flex>

          <v-tabs-items v-model="metaIndex">
            <v-tab-item :value="0">
              <v-list three-line>
                <span v-if="metasUsuario.length == 0">Nenhuma meta cadastrada</span>
                <v-list-tile v-for="m in metasUsuario" :key="m.id">
                  <v-layout class="my-2" row wrap>
                    <v-flex xs12>
                      <v-list-tile-title>{{ m.concluido_valor | currency }} de {{ m.valor }}</v-list-tile-title>
                    </v-flex>
                    <v-flex xs12>
                      <v-progress-linear :value="m.concluido_porc"></v-progress-linear>
                    </v-flex>
                  </v-layout>
                </v-list-tile>
              </v-list>
            </v-tab-item>

            <v-tab-item :value="1">
              <v-list three-line>
                <span v-if="metasEmpresa.length == 0">Nenhuma meta cadastrada</span>
                <v-list-tile v-for="m in metasEmpresa" :key="m.id">
                  <v-layout class="my-2" row wrap>
                    <v-flex xs12>
                      <v-list-tile-title>
                        <v-chip
                          dark
                          :color="m.tipo_receita_despesa == 'RECEITA'? color : 'danger'"
                        >{{ m.tipo_receita_despesa }}</v-chip>
                        - {{ m.nome }}
                      </v-list-tile-title>
                      <v-list-tile-title>{{ m.concluido_valor | currency }} de {{ m.valor | currency }}</v-list-tile-title>
                    </v-flex>
                    <v-flex xs12>
                      <v-progress-linear :value="m.concluido_porc"></v-progress-linear>
                    </v-flex>
                  </v-layout>
                </v-list-tile>
              </v-list>
            </v-tab-item>
          </v-tabs-items>
        </Card>
      </v-flex>

      <!-- grafico classificacoes -->
      <v-flex :xs12="sizeClassificacoes" :md6="!sizeClassificacoes"></v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { urlBD, showError, formatDate } from "@/global";
import axios from "axios";
import { mapState } from "vuex";
import * as chartConfigs from "@/components/charts/config";

import { formatToBRL } from "brazilian-values";

export default {
  name: "home",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["usuarioStore", "empresaStore"]),
    usuariosOnline: {
      get() {
        return (
          "" + Object.values(this.usuarioStore.usuariosOnline || []).length
        );
      },
      set(value) {
        this.usuarioStore.usuariosOnline = value;
      }
    },
    computedDateFormatted: {
      get() {
        return formatDate(this.painel.data_inicial);
      },
      set(value) {
        this.painel.data_inicial = value;
      }
    },
    computedDateFormatted1: {
      get() {
        return formatDate(this.painel.data_final);
      },
      set(value) {
        this.painel.data_final = value;
      }
    },
    params() {
      return {
        ...this.painel
      };
    }
  },
  components: {
    PageTitle: () => import("../template/PageTitle"),
    Card: () => import("../material/Card"),
    StatsCard: () => import("../material/StatsCard"),
    LineChart: () => import("../charts/LineChart"),
    BarChart: () => import("../charts/BarChart")
  },
  watch: {
    params() {
      this.loadStats();

      if (this.usuarioStore.currentUsuario["financeiro_read"]) {
        this.renderGraficoFluxoCaixa();
        this.renderGraficoFinanceiro();
      }
      if (this.usuarioStore.currentUsuario["financeiro_read"])
        this.renderGraficoPerformance();
      this.renderGraficoCadastros();
    }
  },
  data() {
    return {
      sizeCadastros: false,
      sizeFinanceiro: false,
      sizePerformance: false,
      sizeFluxoCaixa: false,
      sizeClassificacoes: false,
      arrayEvents: null,
      painel: {},
      menu: false,
      menu1: false,
      metaIndex: 0,
      campIndex: 0,
      datePicker: new Date().toISOString().substr(0, 10),
      actions: {
        financeiro: [
          {
            icon: "fa fa-lg fa-window-maximize",
            tooltip: "Maximizar visualização",
            required: true,
            graph: "financeiro",
            method: "maximize"
          }
        ],
        performance: [
          {
            icon: "fa fa-lg fa-window-maximize",
            tooltip: "Maximizar visualização",
            required: true,
            graph: "performance",
            method: "maximize"
          }
        ],
        fluxoCaixa: [
          {
            icon: "fa fa-lg fa-window-maximize",
            tooltip: "Maximizar visualização",
            required: true,
            graph: "fluxoCaixa",
            method: "maximize"
          }
        ],
        cadastros: [
          {
            icon: "fa fa-lg fa-window-maximize",
            tooltip: "Maximizar visualização",
            required: true,
            graph: "cadastros",
            method: "maximize"
          }
        ],
        classificacoes: [
          {
            icon: "fa fa-lg fa-window-maximize",
            tooltip: "Maximizar visualização",
            required: true,
            graph: "classificacoes",
            method: "maximize"
          }
        ]
      },
      graficoFinanceiro: {
        activeIndex: 0,
        chartData: null,
        extraOptions: chartConfigs.greenChartOptions,
        gradientColors: [
          "rgba(76, 211, 150, 0.1)",
          "rgba(53, 183, 125, 0)",
          "rgba(119,52,169,0)"
        ],
        gradientStops: [1, 0.4, 0],
        categories: []
      },
      graficoFluxoCaixa: {
        activeIndex: 0,
        chartData: null,
        extraOptions: chartConfigs.orangeChartOptions,
        gradientColors: [
          "rgba(76, 211, 150, 0.1)",
          "rgba(53, 183, 125, 0)",
          "rgba(119,52,169,0)"
        ],
        gradientStops: [1, 0.4, 0],
        categories: []
      },
      graficoPerformance: {
        activeIndex: 0,
        chartData: null,
        extraOptions: chartConfigs.blueChartOptions,
        gradientColors: [
          "rgba(76, 211, 150, 0.1)",
          "rgba(53, 183, 125, 0)",
          "rgba(119,52,169,0)"
        ],
        gradientStops: [1, 0.4, 0],
        categories: []
      },
      graficoCadastros: {
        chartData: null,
        extraOptions: chartConfigs.barChartOptions,
        gradientColors: [
          "rgba(76, 211, 150, 0.1)",
          "rgba(53, 183, 125, 0)",
          "rgba(119,52,169,0)"
        ]
      },
      graficoClassificacoes: {
        chartData: null,
        extraOptions: chartConfigs.doughnutChartOptions,
        gradientColors: [
          "rgba(76, 211, 150, 0.1)",
          "rgba(53, 183, 125, 0)",
          "rgba(119,52,169,0)"
        ]
      },
      stats: {
        contasPagar: 0,
        contasReceber: 0,
        vendas: 0
      },
      campeoes: {},
      metasUsuario: [],
      metasEmpresa: []
    };
  },
  methods: {
    navigate(path, newTab) {
      if (newTab) {
        const routeData = this.$router.resolve({ path: path });
        window.open(routeData.href, "_blank");
      } else {
        this.$router.push({ path: path });
      }
    },
    async maximize(data) {
      if (!data.graph) return;

      switch (data.graph) {
        case "fluxoCaixa":
          this.sizeFluxoCaixa = !this.sizeFluxoCaixa;
          break;
        case "financeiro":
          this.sizeFinanceiro = !this.sizeFinanceiro;
          break;
        case "performance":
          this.sizePerformance = !this.sizePerformance;
          break;
        case "cadastros":
          this.sizeCadastros = !this.sizeCadastros;
          break;
      }
    },
    async loadStats() {
      this.$store.state.isLoading = true;

      axios
        .get(
          `${urlBD}/stats?view=${this.painel.mode}&data_inicial=${this.painel
            .data_inicial || ""}&data_final=${this.painel.data_final || ""}`
        )
        .then(res => {
          this.stats = {
            contasPagar: res.data.contasPagar,
            contasReceber: res.data.contasReceber,
            vendas: res.data.vendas
          };

          axios.get(`${urlBD}/eventos_agenda`).then(res => {
            this.arrayEvents = res.data.map(evento => {
              const date = new Date(evento.data);

              return date.toISOString().substr(0, 10);
            });
          });
          axios
            .get(`${urlBD}/usuarioMetas/${this.usuarioStore.currentUsuario.id}`)
            .then(res => {
              this.metasUsuario = res.data;
            });
          axios.get(`${urlBD}/empresaMetas/`).then(res => {
            this.metasEmpresa = res.data.data;
          });
        })
        .catch(showError)
        .finally(
          setTimeout(() => {
            this.$store.state.isLoading = false;
          }, 2000)
        );
    },
    async renderGraficoFluxoCaixa() {
      axios
        .get(
          `${urlBD}/stats/graficoFluxoCaixa?view=${
            this.painel.mode
          }&empresa=${this.painel.empresa || ""}&data_inicial=${this.painel
            .data_inicial || ""}&data_final=${this.painel.data_final || ""}`
        )
        .then(res => {
          const contas = res.data.map(series => {
            return series.map(item => Number(item.sum));
          });

          let chartData = {
            datasets: [
              {
                label: "Entradas",
                fill: true,
                borderColor: "#47A44B",
                borderWidth: 2,
                borderDash: [],
                borderDashOffset: 0.0,
                pointBackgroundColor: "#47A44B",
                pointBorderColor: "rgba(255,255,255,0)",
                pointHoverBackgroundColor: "#47A44B",
                pointBorderWidth: 20,
                pointHoverRadius: 4,
                pointHoverBorderWidth: 15,
                pointRadius: 4,
                data: contas[0]
              },
              {
                label: "Saídas",
                fill: true,
                borderColor: "#f55a4e",
                borderWidth: 2,
                borderDash: [],
                borderDashOffset: 0.0,
                pointBackgroundColor: "#f55a4e",
                pointBorderColor: "rgba(255,255,255,0)",
                pointHoverBackgroundColor: "#f55a4e",
                pointBorderWidth: 20,
                pointHoverRadius: 4,
                pointHoverBorderWidth: 15,
                pointRadius: 4,
                data: contas[1]
              }
            ],
            labels:
              this.painel.mode == "year"
                ? [
                    "JAN",
                    "FEV",
                    "MAR",
                    "ABR",
                    "MAI",
                    "JUN",
                    "JUL",
                    "AGO",
                    "SET",
                    "OUT",
                    "NOV",
                    "DEZ"
                  ]
                : [
                    "0",
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "10",
                    "11",
                    "12",
                    "13",
                    "14",
                    "15",
                    "16",
                    "17",
                    "18",
                    "19",
                    "20",
                    "21",
                    "22",
                    "23",
                    "24",
                    "25",
                    "26",
                    "27",
                    "28",
                    "29",
                    "30",
                    "31"
                  ]
          };
          this.graficoFluxoCaixa.chartData = chartData;
        })
        .catch(showError);
    },
    async renderGraficoFinanceiro() {
      axios
        .get(
          `${urlBD}/stats/graficoFinanceiro?view=${
            this.painel.mode
          }&empresa=${this.painel.empresa || ""}&data_inicial=${this.painel
            .data_inicial || ""}&data_final=${this.painel.data_final || ""}`
        )
        .then(res => {
          const contas = res.data.map(series => {
            return series.map(item => Number(item.sum));
          });

          let chartData = {
            datasets: [
              {
                label: "Contas a receber",
                fill: true,
                borderColor: "#47A44B",
                borderWidth: 2,
                borderDash: [],
                borderDashOffset: 0.0,
                pointBackgroundColor: "#47A44B",
                pointBorderColor: "rgba(255,255,255,0)",
                pointHoverBackgroundColor: "#47A44B",
                pointBorderWidth: 20,
                pointHoverRadius: 4,
                pointHoverBorderWidth: 15,
                pointRadius: 4,
                data: contas[0]
              },
              {
                label: "Contas a pagar",
                fill: true,
                borderColor: "#f55a4e",
                borderWidth: 2,
                borderDash: [],
                borderDashOffset: 0.0,
                pointBackgroundColor: "#f55a4e",
                pointBorderColor: "rgba(255,255,255,0)",
                pointHoverBackgroundColor: "#f55a4e",
                pointBorderWidth: 20,
                pointHoverRadius: 4,
                pointHoverBorderWidth: 15,
                pointRadius: 4,
                data: contas[1]
              }
            ],
            labels:
              this.painel.mode == "year"
                ? [
                    "JAN",
                    "FEV",
                    "MAR",
                    "ABR",
                    "MAI",
                    "JUN",
                    "JUL",
                    "AGO",
                    "SET",
                    "OUT",
                    "NOV",
                    "DEZ"
                  ]
                : [
                    "0",
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "10",
                    "11",
                    "12",
                    "13",
                    "14",
                    "15",
                    "16",
                    "17",
                    "18",
                    "19",
                    "20",
                    "21",
                    "22",
                    "23",
                    "24",
                    "25",
                    "26",
                    "27",
                    "28",
                    "29",
                    "30",
                    "31"
                  ]
          };
          this.graficoFinanceiro.chartData = chartData;
        })
        .catch(showError);
    },
    async renderGraficoPerformance() {
      axios
        .get(
          `${urlBD}/stats/graficoPerformance?view=${
            this.painel.mode
          }&empresa=${this.painel.empresa || ""}&data_inicial=${this.painel
            .data_inicial || ""}&data_final=${this.painel.data_final || ""}`
        )
        .then(res => {
          const data = res.data.map(series => {
            return series.map(item => Number(item.sum));
          });
          let chartData = {
            datasets: [
              {
                label: "Vendas",
                fill: true,
                borderColor: "#1E88E5",
                borderWidth: 2,
                borderDash: [],
                borderDashOffset: 0.0,
                pointBackgroundColor: "#1E88E5",
                pointBorderColor: "rgba(255,255,255,0)",
                pointHoverBackgroundColor: "#1E88E5",
                pointBorderWidth: 20,
                pointHoverRadius: 4,
                pointHoverBorderWidth: 15,
                pointRadius: 4,
                data: data[0]
              },
              {
                label: "Compras",
                fill: true,
                borderColor: "#ffa21a",
                borderWidth: 2,
                borderDash: [],
                borderDashOffset: 0.0,
                pointBackgroundColor: "#ffa21a",
                pointBorderColor: "rgba(255,255,255,0)",
                pointHoverBackgroundColor: "#ffa21a",
                pointBorderWidth: 20,
                pointHoverRadius: 4,
                pointHoverBorderWidth: 15,
                pointRadius: 4,
                data: data[1]
              }
            ],
            labels:
              this.painel.mode == "year"
                ? [
                    "JAN",
                    "FEV",
                    "MAR",
                    "ABR",
                    "MAI",
                    "JUN",
                    "JUL",
                    "AGO",
                    "SET",
                    "OUT",
                    "NOV",
                    "DEZ"
                  ]
                : [
                    "0",
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "10",
                    "11",
                    "12",
                    "13",
                    "14",
                    "15",
                    "16",
                    "17",
                    "18",
                    "19",
                    "20",
                    "21",
                    "22",
                    "23",
                    "24",
                    "25",
                    "26",
                    "27",
                    "28",
                    "29",
                    "30",
                    "31"
                  ]
          };
          this.graficoPerformance.chartData = chartData;
          this.graficoPerformance.activeIndex = 0;
        })
        .catch(showError);
    },
    async renderGraficoCadastros() {
      axios
        .get(`${urlBD}/stats/graficoCadastros?view=${this.painel.mode}`)
        .then(res => {
          let chartData = {
            datasets: [
              {
                fill: true,
                borderColor: "#ffa21a",
                borderWidth: 2,
                borderDash: [],
                borderDashOffset: 0.0,
                data: res.data
              }
            ],
            labels: [
              "CLIENTES",
              "FORNECEDORES",
              "TRANSPORTADORAS",
              "USUÁRIOS",
              "PRODUTOS"
            ]
          };
          this.graficoCadastros.chartData = chartData;
        })
        .catch(showError);
    },
    async renderGraficoClassificacoes() {
      axios
        .get(`${urlBD}/stats/graficoClassificacoes?view=${this.painel.mode}`)
        .then(res => {
          let chartData = {
            datasets: [
              {
                fill: true,
                borderColor: "#ffa21a",
                borderWidth: 2,
                borderDash: [],
                borderDashOffset: 0.0,
                data: res.data
              }
            ],
            labels: [
              "CLIENTES",
              "FORNECEDORES",
              "TRANSPORTADORAS",
              "USUÁRIOS",
              "PRODUTOS"
            ]
          };
          this.graficoClassificacoes.chartData = chartData;
        })
        .catch(showError);
    },
    async loadCampeoes() {
      axios
        .get(`${urlBD}/stats/campeoes?view=${this.painel.mode}`)
        .then(res => {
          this.campeoes = res.data;
        })
        .catch(showError);
    }
  },
  async mounted() {
    this.$set(this.painel, "mode", "year");
    this.$set(this.painel, "empresa", this.empresaStore.currentEmpresa || 1);
    this.$set(
      this.painel,
      "data_inicial",
      new Date().toISOString().substr(0, 10)
    );
    this.$set(
      this.painel,
      "data_final",
      new Date().toISOString().substr(0, 10)
    );
    this.$store.dispatch("loadNotificacoes");

    this.loadCampeoes();
  }
};
</script>