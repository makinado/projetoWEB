<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="Metas" icon="fa fa-line-chart" sub="Gerencie as metas da sua empresa" />
        <v-breadcrumbs
          :items="[{ text: 'Empresas', to: '/empresas' }, { text: 'Metas' }]"
          divider=">"
          large
        ></v-breadcrumbs>
        <v-card class="p-3">
          <GridMetas />
        </v-card>

        <AddMeta />
        <addPessoa />
        <Email />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "Metas",
  computed: {
    ...mapState(["empresaStore", "usuarioStore", "modalStore"])
  },
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    AddPessoa: () => import("@/components/pessoas/AddPessoa"),
    GridMetas: () => import("./GridMetas"),
    AddMeta: () => import("./AddMeta"),
    Email: () => import("@/components/email/Email")
  }
};
</script>

<style>
</style>
