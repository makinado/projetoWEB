<template>
  <v-dialog v-model="dialogLoading" hide-overlay persistent width="300">
    <v-card flat dark color="primary">
      <v-card-text>
        <v-layout justify-center>
          <span>aguarde</span>
          <v-spacer></v-spacer>
          <v-progress-circular class="mb-0" color="white" indeterminate></v-progress-circular>
        </v-layout>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import imgLoading from "@/assets/loading.gif";
import { mapState } from "vuex";
export default {
  name: "dialog-loading",
  computed: {
    ...mapState(["dialogLoading"])
  },
  data() {
    return {
      img: imgLoading
    };
  }
};
</script>

<style>
</style>