<template>
  <v-card :color="color" dark hover>
    <v-card-title class="headline">
      <v-icon class="mr-2">{{ icon }}</v-icon>
      {{ main }}
    </v-card-title>
    <v-card-text class="headline">{{ data }}</v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "Painel",
  data() {
    return {};
  },
  props: ["icon", "main", "sub", "color", "data"]
};
</script>

<style>
</style>