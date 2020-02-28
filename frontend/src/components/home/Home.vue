<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout wrap>
      <v-flex xs12>
        <PageTitle main="Home" icon="fa fa-home" />
      </v-flex>

      <v-flex sm6 xs12 md6 lg3>
        <StatsCard
          color="warning"
          icon="fa fa-arrow-up"
          title="Contas a pagar"
          value="R$ 2.328,32"
          sub-icon="fa fa-clock-o"
          sub-text="Agora mesmo"
        />
      </v-flex>
      <v-flex sm6 xs12 md6 lg3>
        <StatsCard
          color="success"
          icon="fa fa-arrow-down"
          title="Contas a receber"
          value="R$ 4.735,25"
          sub-icon="fa fa-clock-o"
          sub-text="Agora mesmo"
        />
      </v-flex>
      <v-flex sm6 xs12 md6 lg3>
        <StatsCard
          color="red"
          icon="fa fa-shopping-cart"
          title="Vendas realizadas"
          value="12"
          sub-icon="fa fa-clock-o"
          sub-text="Agora mesmo"
        />
      </v-flex>
      <v-flex sm6 xs12 md6 lg3>
        <StatsCard
          color="info"
          icon="fa fa-user-o"
          title="Usuários online"
          value="1"
          sub-icon="fa fa-clock-o"
          sub-text="Agora mesmo"
        />
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
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import Chart from "chart.js";

export default {
  name: "home",
  computed: {
    ...mapState("app", ["color"])
  },
  components: {
    PageTitle: () => import("../template/PageTitle"),
    Card: () => import("../material/Card"),
    ChartCard: () => import("../material/ChartCard"),
    StatsCard: () => import("../material/StatsCard")
  },
  data() {
    return {
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
            [5, 10, 2, 10, 15, 12, 24]
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
          series: [[542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895]]
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
          labels: [
            "Clientes",
            "Fornecedores",
            "Funcionários",
            "Vendedores",
            "Transportadoras"
          ],
          series: [[230, 32, 30, 20, 15]]
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
      headers: [
        {
          sortable: false,
          text: "ID",
          value: "id"
        },
        {
          sortable: false,
          text: "Name",
          value: "name"
        },
        {
          sortable: false,
          text: "Salary",
          value: "salary",
          align: "right"
        },
        {
          sortable: false,
          text: "Country",
          value: "country",
          align: "right"
        },
        {
          sortable: false,
          text: "City",
          value: "city",
          align: "right"
        }
      ],
      items: [
        {
          name: "Dakota Rice",
          country: "Niger",
          city: "Oud-Tunrhout",
          salary: "$35,738"
        },
        {
          name: "Minerva Hooper",
          country: "Curaçao",
          city: "Sinaai-Waas",
          salary: "$23,738"
        },
        {
          name: "Sage Rodriguez",
          country: "Netherlands",
          city: "Overland Park",
          salary: "$56,142"
        },
        {
          name: "Philip Chanley",
          country: "Korea, South",
          city: "Gloucester",
          salary: "$38,735"
        },
        {
          name: "Doris Greene",
          country: "Malawi",
          city: "Feldkirchen in Kārnten",
          salary: "$63,542"
        }
      ],
      tabs: 0,
      list: {
        0: false,
        1: false,
        2: false
      }
    };
  },
  methods: {
    complete(index) {
      this.list[index] = !this.list[index];
    }
  }
};
</script>

<style>
.stats {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}
</style>
