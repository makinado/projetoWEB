<template>
  <v-container fill-height fluid grid-list-lg>
    <v-layout wrap>
      <v-flex xs12>
        <PageTitle main="Home" icon="fa fa-home" />
      </v-flex>

      <v-flex xs12>
        <Card title="Selecione o período do painel" icon="fa fa-lg fa-calendar" :color="color">
          <v-layout row align-center wrap>
            <v-flex xs12 md3>
              <v-autocomplete
                class="tag-input"
                dense
                chips
                deletable-chips
                :color="color"
                label="Selecione um modo de visualização"
                v-model="mode"
                :items="[{ value: 'year', text: 'Ano' }, { value: 'month', text: 'Mês' }]"
                @change="handleGraficos()"
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

      <v-flex class="mt-3" xs12 md9>
        <ChartCard
          :data="graficoFluxoCaixa.data"
          :options="graficoFluxoCaixa.options"
          color="warning"
          type="Line"
          ratio="ct-double-octave"
        >
          <h4 class="title font-weight-light">Fluxo de caixa</h4>
          <p class="category d-inline-flex font-weight-light">Acompanhe o fluxo de caixa da empresa</p>

          <!-- <template slot="actions">
            <v-icon class="mr-2" small>fa fa-clock-o</v-icon>
            <span class="caption grey--text font-weight-light">Agora mesmo</span>
          </template>-->
        </ChartCard>
      </v-flex>

      <v-flex xs12 md3>
        <v-date-picker
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

      <v-flex v-if="mode == 'month'" xs12>
        <ChartCard
          :data="graficoFinanceiro.data"
          :options="graficoFinanceiro.options"
          ratio="ct-double-octave"
          color="info"
          type="Line"
        >
          <h4 class="title font-weight-light">Financeiro</h4>
          <p
            class="category d-inline-flex font-weight-light"
          >Acompanhe as despesas e receitas da empresa</p>

          <template slot="actions">
            <v-switch
              :label="painel.valorFinanc ? 'Quantidade' : 'Dinheiro'"
              :color="color"
              v-model="painel.valorFinanc"
            ></v-switch>
          </template>
        </ChartCard>
      </v-flex>
      <v-flex v-else sm12 lg4>
        <ChartCard
          ref="chartFinanceiro"
          :data="graficoFinanceiro.data"
          :options="graficoFinanceiro.options"
          color="info"
          type="Line"
        >
          <h4 class="title font-weight-light">Financeiro</h4>
          <p
            class="category d-inline-flex font-weight-light"
          >Acompanhe as despesas e receitas da empresa</p>

          <template slot="actions">
            <v-switch
              :label="painel.valorFinanc ? 'Quantidade' : 'Dinheiro'"
              :color="color"
              v-model="painel.valorFinanc"
            ></v-switch>
          </template>
        </ChartCard>
      </v-flex>

      <v-flex v-if="mode == 'month'" xs12>
        <ChartCard
          :data="graficoVendas.data"
          :options="graficoVendas.options"
          ratio="ct-double-octave"
          color="red"
          type="Bar"
        >
          <h4 class="title font-weight-light">Vendas</h4>
          <p
            class="category d-inline-flex font-weight-light"
          >Acompanhe as vendas realizadas no sistema</p>

          <template slot="actions">
            <v-switch
              :label="painel.valorVenda ? 'Quantidade' : 'Dinheiro'"
              :color="color"
              v-model="painel.valorVenda"
            ></v-switch>
          </template>
        </ChartCard>
      </v-flex>
      <v-flex v-else sm12 lg4>
        <ChartCard
          :data="graficoVendas.data"
          :options="graficoVendas.options"
          color="red"
          type="Bar"
        >
          <h4 class="title font-weight-light">Vendas</h4>
          <p
            class="category d-inline-flex font-weight-light"
          >Acompanhe as vendas realizadas no sistema</p>

          <template slot="actions">
            <v-switch
              :label="painel.valorVenda ? 'Quantidade' : 'Dinheiro'"
              :color="color"
              v-model="painel.valorVenda"
            ></v-switch>
          </template>
        </ChartCard>
      </v-flex>

      <v-flex v-if="mode == 'month'" xs12>
        <ChartCard
          :data="graficoCadastros.data"
          :options="graficoCadastros.options"
          ratio="ct-double-octave"
          color="green"
          type="Bar"
        >
          <h3 class="title font-weight-light">Cadastro de pessoas</h3>
          <p
            class="category d-inline-flex font-weight-light"
          >Acompanhe as pessoas cadastradas no sistema</p>

          <!-- <template slot="actions">
            <v-icon class="mr-2" small>fa fa-clock-o</v-icon>
            <span class="caption grey--text font-weight-light">Agora mesmo</span>
          </template>-->
        </ChartCard>
      </v-flex>
      <v-flex v-else sm12 lg4>
        <ChartCard
          :data="graficoCadastros.data"
          :options="graficoCadastros.options"
          color="green"
          type="Bar"
        >
          <h3 class="title font-weight-light">Cadastro de pessoas</h3>
          <p
            class="category d-inline-flex font-weight-light"
          >Acompanhe as pessoas cadastradas no sistema</p>

          <!-- <template slot="actions">
            <v-icon class="mr-2" small>fa fa-clock-o</v-icon>
            <span class="caption grey--text font-weight-light">Agora mesmo</span>
          </template>-->
        </ChartCard>
      </v-flex>

      <v-flex xs12 md6>
        <Card class="card-tabs" color="green">
          <v-flex slot="header">
            <v-tabs v-model="tabindex" color="transparent" slider-color="white">
              <span class="subheading font-weight-light mr-3" style="align-self: center">Metas:</span>

              <v-tab class="mr-3">
                <v-icon class="mr-2">fa fa-lg fa-user</v-icon>Usuário
              </v-tab>
              <v-tab class="mr-3">
                <v-icon class="mr-2">fa fa-lg fa-building-o</v-icon>Empresa
              </v-tab>
            </v-tabs>
          </v-flex>

          <v-tabs-items v-model="tabindex">
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
    </v-layout>
  </v-container>
</template>

<script>
import { urlBD, showError, formatDate } from "@/global";
import axios from "axios";
import { mapState } from "vuex";

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
        ...this.mode,
        ...this.painel
      };
    }
  },
  components: {
    PageTitle: () => import("../template/PageTitle"),
    Card: () => import("../material/Card"),
    ChartCard: () => import("../material/ChartCard"),
    StatsCard: () => import("../material/StatsCard")
  },
  watch: {
    params() {
      this.loadStats();
    }
  },
  data() {
    return {
      arrayEvents: null,
      painel: {},
      menu: false,
      menu1: false,
      tabindex: 0,
      mode: "year",
      datePicker: new Date().toISOString().substr(0, 10),
      stats: {
        contasPagar: 0,
        contasReceber: 0,
        vendas: 0
      },
      graficoFluxoCaixa: {
        data: {
          labels: [],
          series: []
        },
        options: {
          lineSmooth: this.$chartist.Interpolation.cardinal({
            tension: 0
          }),
          low: 0,
          high: 50, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
          chartPadding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          },
          axisY: {
            onlyInteger: true
          }
          // // plugins: [this.$chartist.plugins.tooltip()]
        }
      },
      graficoFinanceiro: {
        data: {
          labels: [],
          series: []
        },
        options: {
          lineSmooth: this.$chartist.Interpolation.cardinal({
            tension: 0
          }),
          low: 0,
          high: 99999, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
          chartPadding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          },
          axisX: {
            labelOffset: {
              x: -8
            }
          },
          axisY: {
            onlyInteger: true,
            scaleMinSpace: 1
          },
          plugins: [
            this.$chartist.plugins.tooltip({
              currency: "R$ ",
              appendToBody: true
            })
          ]
        }
      },
      graficoVendas: {
        data: {
          labels: [],
          series: []
        },
        options: {
          lineSmooth: this.$chartist.Interpolation.cardinal({
            tension: 0
          }),
          low: 0,
          high: 99999, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
          chartPadding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          },
          axisY: {
            onlyInteger: true
          },
          plugins: [
            this.$chartist.plugins.tooltip({
              currency: "R$ ",
              appendToBody: true
            })
          ]
        }
      },
      graficoCadastros: {
        data: {
          labels: [
            "Clientes",
            "Fornecedores",
            "Transportadoras",
            "usuarios",
            "produtos"
          ],
          series: []
        },
        options: {
          lineSmooth: this.$chartist.Interpolation.cardinal({
            tension: 0
          }),
          low: 0,
          high: 99999, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
          chartPadding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          },
          axisY: {
            onlyInteger: true
          },
          plugins: [this.$chartist.plugins.tooltip()]
        }
      },
      metasUsuario: [],
      metasEmpresa: [],
      tabs: 0,
      list: {
        0: false,
        1: false,
        2: false
      }
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
    handleGraficos() {
      this.graficoFinanceiro.data.labels = [];
      this.graficoFluxoCaixa.data.labels = [];
      this.graficoVendas.data.labels = [];
      if (this.mode == "year") {
        this.graficoFinanceiro.data.labels = this.graficoFluxoCaixa.data.labels = this.graficoVendas.data.labels = [
          "Jan",
          "Fev",
          "Mai",
          "Abr",
          "Mai",
          "Jun",
          "Jul",
          "Ago",
          "Set",
          "Out",
          "Nov",
          "Dez"
        ];
      } else if (this.mode == "month") {
        for (let i = 0; i < 32; i++) {
          this.graficoFinanceiro.data.labels.push(i);
          this.graficoFluxoCaixa.data.labels.push(i);
          this.graficoVendas.data.labels.push(i);
        }
      }
    },
    async loadStats() {
      this.$store.state.isLoading = true;

      axios
        .get(
          `${urlBD}/stats?view=${this.mode}&data_inicial=${this.painel
            .data_inicial || ""}&data_final=${this.painel.data_final || ""}`
        )
        .then(res => {
          this.stats = {
            contasPagar: res.data.contasPagar,
            contasReceber: res.data.contasReceber,
            vendas: res.data.vendas
          };

          // var maxFluxo = 0;
          // this.graficoFluxoCaixa.data.series = res.data.graficoFluxoCaixa || [];
          // if (res.data.graficoFluxoCaixa[0].length > 0) {
          //   max = res.data.graficoFluxoCaixa[0].reduce((a, b) =>
          //     Math.max(a, b)
          //   );
          //   this.graficoFluxoCaixa.options.high = max + 5;
          // }

          var maxPagar = 0;
          var maxReceber = 0;
          this.graficoFinanceiro.data.series = res.data.graficoFinanceiro.map(
            series => {
              return series.map(item => item.sum);
            }
          );
          if (
            this.graficoFinanceiro.data.series[0].length > 0 &&
            this.graficoFinanceiro.data.series[1].length > 0
          ) {
            maxPagar = this.graficoFinanceiro.data.series[0].reduce((a, b) =>
              Math.max(a, b)
            );
            maxReceber = this.graficoFinanceiro.data.series[1].reduce((a, b) =>
              Math.max(a, b)
            );

            this.graficoFinanceiro.options.high =
              (maxPagar > maxReceber ? maxPagar : maxReceber) + 300;
          } else if (this.graficoFinanceiro.data.series[0].length > 0) {
            maxPagar = res.data.graficoFinanceiro[0].reduce((a, b) =>
              Math.max(a, b)
            );
            this.graficoFinanceiro.options.high = maxPagar + 300;
          } else {
            maxReceber = res.data.graficoFinanceiro[1].reduce((a, b) =>
              Math.max(a, b)
            );
            this.graficoFinanceiro.options.high = maxReceber + 300;
          }

          var maxVenda = 0;
          this.graficoVendas.data.series = res.data.graficoVendas.map(
            series => {
              return series.map(item => item.sum);
            }
          );
          if (this.graficoVendas.data.series[0].length > 0) {
            maxVenda = this.graficoVendas.data.series[0].reduce((a, b) =>
              Math.max(a, b)
            );
            this.graficoVendas.options.high = maxVenda + 300;
          }

          var maxCad = 0;
          this.graficoCadastros.data.series = res.data.graficoCadastros || [];
          if (this.graficoCadastros.data.series[0].length > 0) {
            maxCad = res.data.graficoCadastros[0].reduce((a, b) =>
              Math.max(a, b)
            );
            this.graficoCadastros.options.high = maxCad + 5;
          }

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
    }
  },
  async mounted() {
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
    this.handleGraficos();
    this.$store.dispatch("loadNotificacoes");
  }
};
</script>

<style>
.chartist-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 0px 10px;
  border-radius: 5px;
  cursor: pointer;

  transition: all 0.2s linear;
}
</style>
