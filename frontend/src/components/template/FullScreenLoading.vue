<template>
  <v-card flat>
    <v-container fluid>
      <v-layout justify-center wrap>
        <img src="@/assets/loading.gif" alt="Loading" />
      </v-layout>
    </v-container>
  </v-card>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "fullscreen-loading",
  computed: {
    ...mapState(["fullLoading"])
  },
  data() {
    return {
      img: () => import("@/assets/loading.gif")
    };
  }
};
</script>

<style>
</style>