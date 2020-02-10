<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle
          main="Atividades"
          icon="fa fa-align-left"
          sub="Gerencie as atividades dos usuários"
        />
        <v-card class="p-3">
          <GridAtividades />
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "Atividades",
  components: {
    PageTitle: () => import("../template/PageTitle"),
    GridAtividades: () => import("./GridAtividades")
  }
};
</script>

<style>
</style>
