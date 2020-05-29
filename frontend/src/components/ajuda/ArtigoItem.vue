<template>
  <div class="article-item">
    <router-link :to="{ name: 'Artigo', params: { id: article.id } }">
      <v-layout row justify-start>
        <v-flex xs12 md4>
          <v-img v-if="article.image_url" :src="article.image_url" height="150" contain />
          <v-img v-else :src="require('@/assets/article.png')" height="150" contain />
        </v-flex>

        <v-flex xs12>
          <h2>{{ article.nome }}</h2>
          <p>{{ article.descricao }}</p>
          <span class="article-item-author">
            <strong>Autor:</strong>
            {{ article.autor }}
          </span>
        </v-flex>
      </v-layout>
    </router-link>

    <v-flex xs12 v-if="usuarioStore.currentUsuario.id == 104">
      <v-layout justify-end align-end>
        <v-tooltip bottom>
          <v-btn
            slot="activator"
            icon
            @click="[artigoStore.artigo = article, modalStore.artigos.add = true]"
          >
            <i class="fa fa-lg fa-pencil"></i>
          </v-btn>
          <span>Editar artigo</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn
            slot="activator"
            icon
            @click="[artigoStore.artigo = article, confirmaExclusao = true]"
          >
            <i class="fa fa-lg fa-trash"></i>
          </v-btn>
          <span>Excluir artigo</span>
        </v-tooltip>
      </v-layout>
    </v-flex>

    <v-dialog
      v-model="confirmaExclusao"
      persistent
      max-width="500px"
      v-if="artigoStore.artigo"
      lazy
    >
      <v-card>
        <v-card-title>
          <span class="headline">Excluir parcela</span>
        </v-card-title>
        <v-card-text>Excluir o artigo {{ artigoStore.artigo.nome }} ?</v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="confirmaExclusao = false">Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="remove()">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from "vuex";

import axios from "axios";
import { urlBD, showError } from "@/global";
export default {
  name: "ArticleItem",
  props: ["article"],
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["usuarioStore", "artigoStore", "modalStore"])
  },
  data() {
    return {
      confirmaExclusao: false
    };
  },
  methods: {
    remove() {
      const id = this.article.id;
      axios
        .delete(`${urlBD}/artigos/${id}`)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.confirmaExclusao = false;
        })
        .catch(showError);
    }
  }
};
</script>

<style>
.article-item {
  border-radius: 8px;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
}
</style>
