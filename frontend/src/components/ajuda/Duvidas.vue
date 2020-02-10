<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="Dúvidas" icon="fa fa-question" sub="Tire todas as suas dúvidas aqui" />
        <v-card class="p-3"></v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "Duvidas",
  components: {
    PageTitle: () => import("@/components/template/PageTitle")
  }
};
</script>