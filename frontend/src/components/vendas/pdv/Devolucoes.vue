<template>
  <v-dialog
    v-model="modalStore.vendas.pdv.devolucoes"
    scrollable
    :overlay="false"
    max-width="500px"
    transition="dialog-transition"
  ></v-dialog>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "devolucoes",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["modalStore"])
  }
};
</script>

<style>
</style>