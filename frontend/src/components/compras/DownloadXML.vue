<template>
  <v-dialog v-model="modalStore.compras.download" lazy persistent max-width="600px">
    <v-card v-if="modalStore.compras.download">
      <v-card-title>
        <span class="headline">Download do XML da NF-e de compra</span>
      </v-card-title>
      <v-card-text>
        <v-container grid-list-xl>
          <v-layout justify-space-between align-center wrap>
            <v-text-field
              color="primary"
              label="Chave da NF-e"
              prepend-icon="fa fa-lg fa-key"
              v-mask="['#### #### #### #### #### #### #### #### #### #### ####']"
            ></v-text-field>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click="modalStore.compras.download = false">Fechar</v-btn>
        <v-btn color="blue darken-1" flat>Continuar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "DownloadXML",
  computed: {
    ...mapState(["modalStore"])
  }
};
</script>

<style>
</style>
