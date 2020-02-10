<template>
  <v-container fill-height fluid grid-list-xl>
    <AddEmpresa />
    <Email />
    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="Empresas" icon="fa fa-building" sub="Gerencie suas empresas" />
        <v-card class="p-3">
          <GridEmpresas />
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    GridEmpresas: () => import("./GridEmpresas"),
    AddEmpresa: () => import("./AddEmpresa"),
    Email: () => import("@/components/email/Email")
  }
};
</script>
