<template>
  <v-container fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex xs12>
        <PageTitle
          main="Relatório de compras"
          icon="fa fa-cart-arrow-down"
          sub="Emita relatórios das compras"
        />
      </v-flex>
      <v-flex xs12>
        <Card :color="color" title="Selecione as opções para a emissão do relatório">
          <v-form ref="form" v-model="valid"></v-form>
        </Card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: "compras",
  computed: {
    ...mapState('app', ['color']) 
  },
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    Card: () => import("../material/Card")
  },
  data() {
    return {
      valid: true
    };
  }
};
</script>