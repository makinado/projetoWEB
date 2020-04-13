<template>
  <v-container fill-height fluid grid-list-lg>
    <v-layout wrap>
      <v-flex xs12>
        <PageTitle main="Home" icon="fa fa-home" />
      </v-flex>

      <v-flex xs12>
        <Card title="Selecione o período do painel" :color="color">
          <v-layout row wrap>
            <v-flex xs12 md6>
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
            <v-flex xs12 md6>
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
            color="warning"
            icon="fa fa-arrow-up"
            title="Contas a pagar"
            :value="stats.contasPagar | currency"
            sub-icon="fa fa-clock-o"
            sub-text="Agora mesmo"
          />
        </router-link>
      </v-flex>
      <v-flex sm6 xs12 md6 lg3>
        <router-link to="/financeiro">
          <StatsCard
            color="success"
            icon="fa fa-arrow-down"
            title="Contas a receber"
            :value="stats.contasReceber | currency"
            sub-icon="fa fa-clock-o"
            sub-text="Agora mesmo"
          />
        </router-link>
      </v-flex>
      <v-flex sm6 xs12 md6 lg3>
        <router-link to="/vendas">
          <StatsCard
            color="red"
            icon="fa fa-shopping-cart"
            title="Vendas realizadas"
            :value="stats.vendas"
            sub-icon="fa fa-clock-o"
            sub-text="Agora mesmo"
          />
        </router-link>
      </v-flex>
      <v-flex sm6 xs12 md6 lg3>
        <router-link to="/usuarios">
          <StatsCard
            color="info"
            icon="fa fa-user-o"
            title="Usuários online"
            :value="usuariosOnline"
            sub-icon="fa fa-clock-o"
            sub-text="Agora mesmo"
          />
        </router-link>
      </v-flex>

      <v-flex xs12 md9>
        <ChartCard
          :data="graficoFluxoCaixa.data"
          :options="graficoFluxoCaixa.options"
          color="warning"
          type="Line"
          ratio="ct-double-octave"
        >
          <h4 class="title font-weight-light">Fluxo de caixa</h4>
          <p class="category d-inline-flex font-weight-light">Acompanhe o fluxo de caixa da empresa</p>

          <template slot="actions">
            <v-icon class="mr-2" small>fa fa-clock-o</v-icon>
            <span class="caption grey--text font-weight-light">Agora mesmo</span>
          </template>
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
        >
          <v-layout row wrap justify-end>
            <v-btn class="mb-3" :color="color" @click="navigate('/agenda')">ver tudo</v-btn>
          </v-layout>
        </v-date-picker>
      </v-flex>

      <v-flex md12 sm12 lg4>
        <ChartCard
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
            <v-icon class="mr-2" small>fa fa-clock-o</v-icon>
            <span class="caption grey--text font-weight-light">Agora mesmo</span>
          </template>
        </ChartCard>
      </v-flex>
      <v-flex md12 sm12 lg4>
        <ChartCard
          :data="graficoVendas.data"
          :options="graficoVendas.options"
          :responsive-options="graficoVendas.responsiveOptions"
          color="red"
          type="Bar"
        >
          <h4 class="title font-weight-light">Vendas</h4>
          <p
            class="category d-inline-flex font-weight-light"
          >Acompanhe as vendas realizadas no sistema</p>

          <template slot="actions">
            <v-icon class="mr-2" small>fa fa-clock-o</v-icon>
            <span class="caption grey--text font-weight-light">Agora mesmo</span>
          </template>
        </ChartCard>
      </v-flex>
      <v-flex md12 sm12 lg4>
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

          <template slot="actions">
            <v-icon class="mr-2" small>fa fa-clock-o</v-icon>
            <span class="caption grey--text font-weight-light">Atualizado há 20 minutos</span>
          </template>
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
import Chart from "chart.js";

export default {
  name: "home",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["usuarioStore"]),
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
    }
  },
  components: {
    PageTitle: () => import("../template/PageTitle"),
    Card: () => import("../material/Card"),
    ChartCard: () => import("../material/ChartCard"),
    StatsCard: () => import("../material/StatsCard")
  },
  data() {
    return {
      arrayEvents: null,
      painel: {},
      loadingStats: false,
      menu: false,
      menu1: false,
      tabindex: 0,
      datePicker: new Date().toISOString().substr(0, 10),
      stats: {
        contasPagar: 0,
        contasReceber: 0,
        vendas: 0
      },
      graficoFluxoCaixa: {
        data: {
          labels: [
            "Ja",
            "Fe",
            "Ma",
            "Ap",
            "Mai",
            "Ju",
            "Jul",
            "Au",
            "Se",
            "Oc",
            "No",
            "De"
          ],
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
          }
        }
      },
      graficoFinanceiro: {
        data: {
          labels: [
            "Ja",
            "Fe",
            "Ma",
            "Ap",
            "Mai",
            "Ju",
            "Jul",
            "Au",
            "Se",
            "Oc",
            "No",
            "De"
          ],
          series: [
            [12, 17, 7, 17, 23, 18, 38],
            [5, 20, 2, 7, 22, 25, 13]
          ]
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
          }
        }
      },
      graficoVendas: {
        data: {
          labels: [
            "Ja",
            "Fe",
            "Ma",
            "Ap",
            "Mai",
            "Ju",
            "Jul",
            "Au",
            "Se",
            "Oc",
            "No",
            "De"
          ],
          series: [[500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500]]
        },
        options: {
          axisX: {
            showGrid: false
          },
          axisY: {
            onlyInteger: true //seta só números inteiros no Y
          },
          low: 0,
          high: 1000,
          chartPadding: {
            top: 0,
            right: 5,
            bottom: 0,
            left: 0
          }
        }
      },
      graficoCadastros: {
        data: {
          labels: ["Clientes", "Fornecedores", "Transportadoras"],
          series: [[250, 200, 150]]
        },
        options: {
          lineSmooth: this.$chartist.Interpolation.cardinal({
            tension: 0
          }),
          low: 0,
          high: 300, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
          chartPadding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          },
          axisY: {
            onlyInteger: true //seta só números inteiros no Y
          },
          axisY: {
            scaleMinSpace: 40
          }
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
    }
  },
  async mounted() {
    this.loadingStats = true;

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

    axios
      .get(`${urlBD}/stats`)
      .then(res => {
        this.stats = res.data;

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
      .finally(() => {
        this.loadingStats = false;
      });
  }
};
</script>

<style>
</style>
