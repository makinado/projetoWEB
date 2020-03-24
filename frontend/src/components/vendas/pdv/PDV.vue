<template>
  <v-container fill-height fluid grid-list-lg class="py-0" v-resize="onResize">
    <AddDocumentos />
    <AddPessoa />
    <AddUsuario />

    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="PDV" icon="fa fa-tv" />

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
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "PDV",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["modalStore"])
  },
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    Card: () => import("@/components/material/Card"),
    PDVPesquisa: () => import("./PDVPesquisa"),
    PDVCliente: () => import("./PDVCliente"),
    PDVOpcoes: () => import("./PDVOpcoes"),
    PDVMenu: () => import("./PDVMenu"),
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
        this.modalStore.vendas.pdv.finalizar = true;
      }
    });
  }
};
</script>