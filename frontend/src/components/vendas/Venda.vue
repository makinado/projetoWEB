<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="Venda (NF-e)" icon="fa fa-th" sub="Gerencie suas vendas" />
        <v-card class="p-3"></v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "Venda",
  components: {
    PageTitle: () => import("@/components/template/PageTitle")
  }
};
</script>