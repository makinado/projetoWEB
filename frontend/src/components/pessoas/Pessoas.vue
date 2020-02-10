<template>
  <v-container fill-height fluid grid-list-xl>
    <AddPessoa />
    <AddCategoria />
    <Email />
    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="Pessoas" icon="fa fa-users" sub="Gerencie as pessoas" />
        <v-card class="p-3">
          <GridPessoas />
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "Pessoas",
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    GridPessoas: () => import("./GridPessoas"),
    AddPessoa: () => import("./AddPessoa"),
    AddCategoria: () => import("../produtos/AddCategoria"),
    Email: () => import("@/components/email/Email")
  }
};
</script>

<style>
</style>
