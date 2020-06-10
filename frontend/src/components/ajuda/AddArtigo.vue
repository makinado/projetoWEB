<template>
  <v-dialog
    v-model="modalStore.artigos.add"
    persistent
    max-width="1000"
    transition="dialog-transition"
  >
    <v-card v-if="modalStore.artigos.add">
      <v-card-title>
        <span class="headline">{{ modalStore.artigos.title }}</span>
      </v-card-title>

      <v-card-text>
        <v-container grid-list-xl>
          <v-form ref="form" v-model="valid">
            <v-layout row wrap>
              <v-text-field v-show="false" v-model="artigo.id"></v-text-field>
              <v-flex xs12 md6>
                <v-text-field label="Nome*" v-model="artigo.nome" :rules="nomeRules"></v-text-field>
              </v-flex>
              <v-flex xs12 md6>
                <v-text-field label="URL da imagem" v-model="artigo.image_url"></v-text-field>
              </v-flex>
              <v-flex xs12 md6>
                <v-autocomplete
                  label="Categoria*"
                  :items="categoriaStore.categoriasArtigos"
                  v-model="artigo.id_categoria"
                  clearable
                  dense
                  @focus="$store.dispatch('loadCategoriasArtigos')"
                  :rules="categoriaRules"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12>
                <v-textarea label="Descrição*" box v-model="artigo.descricao" :rules="descRules"></v-textarea>
              </v-flex>
              <v-flex xs12>
                <VueEditor v-model="artigo.conteudo" placeholder="Conteúdo" :rules="conteudoRules" />
              </v-flex>
            </v-layout>
          </v-form>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click="modalStore.artigos.add = false">Fechar</v-btn>
        <v-btn color="blue darken-1" flat @click="save">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { VueEditor } from "vue2-editor";

import axios from "axios";
import { urlBD, showError } from "@/global";
import { mapState } from "vuex";

export default {
  name: "add-artigo",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["modalStore", "usuarioStore", "categoriaStore", "artigoStore"])
  },
  components: { VueEditor },
  data() {
    return {
      artigo: {},
      valid: true,
      nomeRules: [v => !!v || "Nome é obrigatório"],
      descRules: [v => !!v || "Descrição é obrigatória"],
      categoriaRules: [v => !!v || "Categoria é obrigatória"],
      conteudoRules: [v => !!v || "Conteúdo é obrigatório"]
    };
  },
  watch: {
    "$store.state.modalStore.artigos.add"() {
      if (this.modalStore.artigos.add) {
        this.reset(this.artigoStore.artigo);
      }
    }
  },
  methods: {
    reset(artigo) {
      this.artigo = {};
      this.$refs.form ? this.$refs.form.reset() : null;
      if (!artigo) return;

      axios
        .get(`${urlBD}/artigos/${artigo.id}`)
        .then(res => (this.artigo = res.data));
    },
    save() {
      if (!this.$refs.form.validate()) return;

      this.artigo.id_usuario = this.usuarioStore.currentUsuario.id;

      const method = this.artigo.id ? "put" : "post";
      const id = this.artigo.id ? `/${this.artigo.id}` : "";
      axios[method](`${urlBD}/artigos${id}`, this.artigo)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.modalStore.artigos.add = false;
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>