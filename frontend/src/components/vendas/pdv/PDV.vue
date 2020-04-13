<template>
  <v-container fluid grid-list-xl v-resize="onResize" class="py-0">
    <AddDocumentos />
    <AddPessoa />
    <AddUsuario />

    <v-stepper v-model="stepper" class="transparent elevation-0 mt-2">
      <v-stepper-header>
        <v-stepper-step :color="color" :complete="stepper > 1" step="1">Venda</v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step :color="color" :complete="stepper > 2" step="2">Formas de pagamento</v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step :color="color" :complete="stepper > 3" step="3">Finalizar venda</v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content class="m-0 p-0" step="1">
          <v-layout row wrap>
            <v-flex xs12 md1>
              <Card title="Opções" :color="color">
                <PDVOpcoes :isMobile="isMobile" />
              </Card>
            </v-flex>

            <v-flex xs12 md5>
              <Card class="mb-5" title="Cliente e Vendedor" :color="color">
                <PDVCliente ref="PDVCliente" />
              </Card>
              <Card title="Pesquisar" :color="color">
                <PDVPesquisa ref="PDVPesquisa" />
              </Card>
            </v-flex>

            <v-flex xs12 md6>
              <Card title="Menu" :color="color">
                <PDVMenu ref="PDVMenu" />
              </Card>
            </v-flex>
          </v-layout>
        </v-stepper-content>

        <v-stepper-content step="2">
          <PDVPagamento />
        </v-stepper-content>

        <v-stepper-content step="3">
          <PDVFechamento />
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "PDV",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["modalStore"]),
    stepper: {
      get() {
        return this.modalStore.vendas.pdv.stepper;
      },
      set(value) {
        this.modalStore.vendas.pdv.stepper = value;
      }
    }
  },
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    Card: () => import("@/components/material/Card"),
    PDVPesquisa: () => import("./PDVPesquisa"),
    PDVCliente: () => import("./PDVCliente"),
    PDVOpcoes: () => import("./PDVOpcoes"),
    PDVMenu: () => import("./PDVMenu"),
    PDVPagamento: () => import("./PDVPagamento"),
    PDVFechamento: () => import("./PDVFechamento"),
    AddDocumentos: () => import("../../financeiro/AddDocumentos"),
    AddPessoa: () => import("../../pessoas/AddPessoa"),
    AddUsuario: () => import("../../usuario/AddUsuario")
  },
  data() {
    return { isMobile: false };
  },
  methods: {
    onResize() {
      if (window.innerWidth < 769) this.isMobile = true;
      else this.isMobile = false;
    }
  },
  mounted() {
    this.$store.state.drawerLeft = false;
    this.onResize();
  },
  created() {
    document.addEventListener("keydown", event => {
      if (event.key == "F2") {
        this.modalStore.vendas.pdv.pendentes = true;
      } else if (event.key == "F7") {
        this.modalStore.vendas.pdv.sangria = true;
      } else if (event.key == "F8") {
      } else if (event.key == "F9") {
        this.stepper = 2;
      }
    });
  }
};
</script>

<style>
</style>