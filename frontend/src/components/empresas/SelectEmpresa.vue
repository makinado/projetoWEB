<template>
  <v-autocomplete
    class="tag-input"
    dense
    chips
    deletable-chips
    :color="color"
    label="Selecione a empresa"
    v-model="empresaStore.currentEmpresa"
    :items="empresaStore.currentEmpresas"
  ></v-autocomplete>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "select-empresa",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["empresaStore"])
  }
};
</script>

<style>
</style>