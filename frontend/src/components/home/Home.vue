<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex xs12>
        <PageTitle icon="fa fa-home" main="Painel" sub="Início" />
        <v-layout row wrap>
          <v-flex xs12 md3>
            <Painel
              icon="fa fa-arrow-circle-up"
              main="Contas à pagar"
              sub="Início"
              color="warning"
              data="0"
            />
          </v-flex>
          <v-flex xs12 md3>
            <Painel
              icon="fa fa-arrow-circle-down"
              main="Contas à receber"
              sub="Início"
              color="success"
              data="0"
            />
          </v-flex>
          <v-flex xs12 md3>
            <Painel
              icon="fa fa-cart-arrow-down"
              main="Vendas realizadas"
              sub="Início"
              color="danger"
              data="0"
            />
          </v-flex>
          <v-flex xs12 md3>
            <Painel icon="fa fa-users" main="Usuários ativos" sub="Início" color="info" data="0" />
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import Chart from "chart.js";

export default {
  name: "Home",
  components: {
    PageTitle: () => import("../template/PageTitle"),
    Painel: () => import("./Painel")
  },
  computed: mapState(["empresaStore"]),
  data: function() {
    return {};
  },
  methods: {},
  mounted() {}
};
</script>

<style>
.stats {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}
</style>
