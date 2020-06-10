<template>
  <v-container fluid grid-list-xl>
    <AddFeedback />
    <AddArtigo />
    <CategoriaArtigo />

    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle
          main="Central de ajuda"
          icon="fa fa-book"
          sub="Tenha acesso ao material de apoio"
        />

        <v-card class="p-3">
          <v-card-text>
            <v-container grid-list-xl>
              <v-layout row wrap>
                <v-flex xs12 md3>
                  <v-autocomplete
                    label="Categoria"
                    :items="categoriaStore.categoriasArtigos"
                    clearable
                    dense
                    v-model="filter.categoria"
                    @focus="$store.dispatch('loadCategoriasArtigos')"
                  ></v-autocomplete>
                </v-flex>
                <v-flex xs12 md3>
                  <v-text-field
                    label="Qual é sua dúvida?"
                    clearable
                    :color="color"
                    v-model="filter.nome"
                    append-icon="fa fa-search"
                  ></v-text-field>
                </v-flex>

                <v-spacer></v-spacer>

                <v-tooltip v-if="usuarioStore.currentUsuario.id == 104" bottom>
                  <v-btn
                    slot="activator"
                    class="v-btn-common"
                    color="warning"
                    @click="modalStore.artigos.categoria = true"
                  >Categorias de artigo</v-btn>
                  <span>Gerenciar categorias</span>
                </v-tooltip>
                <v-tooltip v-if="usuarioStore.currentUsuario.id == 104" bottom>
                  <v-btn
                    slot="activator"
                    class="v-btn-common"
                    color="danger"
                    @click="[artigoStore.artigo = null, modalStore.artigos.add = true]"
                  >Artigo</v-btn>
                  <span>Criar novo artigo</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn
                    slot="activator"
                    class="v-btn-common"
                    :color="color"
                    @click="modalStore.feedback.add = true"
                  >Feedback</v-btn>
                  <span>Encontrou algum problema ou quer dar uma sugestão? Dê-nos um feedback</span>
                </v-tooltip>
              </v-layout>

              <v-layout column>
                <ListaArtigos />
              </v-layout>
            </v-container>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "CentralAjuda",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "modalStore",
      "usuarioStore",
      "artigoStore",
      "categoriaStore"
    ]),
    filter: {
      get() {
        return this.artigoStore.filter;
      },
      set(value) {
        this.artigoStore.filter = value;
      }
    }
  },
  // watch: {
  //   "$store.state.artigoStore.filter"() {
  //     console.log("filter");
  //   }
  // },
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    AddFeedback: () => import("./AddFeedback"),
    AddArtigo: () => import("./AddArtigo"),
    ListaArtigos: () => import("./ListaArtigos"),
    CategoriaArtigo: () => import("./CategoriaArtigo")
  }
};
</script>