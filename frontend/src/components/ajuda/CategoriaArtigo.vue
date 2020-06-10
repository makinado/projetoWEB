<template>
  <div class="add-categoria">
    <v-dialog v-model="modalStore.artigos.categoria" persistent max-width="900px">
      <v-card v-if="modalStore.artigos.categoria">
        <v-card-title>{{ modalStore.artigos.categoriaTitle }}</v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-form v-model="valid" ref="form">
              <v-text-field v-model="categoria.id" v-show="false"></v-text-field>
              <v-layout wrap>
                <v-flex xs12 md6>
                  <v-text-field
                    :color="color"
                    label="Nome*"
                    v-model="categoria.nome"
                    v-uppercase
                    :rules="descRules"
                    autofocus
                    @keyup.enter="save"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md6>
                  <v-autocomplete
                    label="Filho de"
                    :items="categoriaStore.categoriasArtigos"
                    v-model="categoria.id_parent"
                    clearable
                    dense
                    @focus="$store.dispatch('loadCategoriasArtigos')"
                  ></v-autocomplete>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
          <v-flex xs12>
            <v-data-table
              :items="categoriaStore.categorias"
              :headers="fields"
              rows-per-page-text="Registros por página"
              :rows-per-page-items="[5,10,15,20]"
              no-results-text="Nenhum registro encontrado"
              no-data-text="Nenhuma categoria encontrada"
              :pagination.sync="pagination"
            >
              <template slot="items" slot-scope="data">
                <td>{{ data.item.id }}</td>
                <td>{{ data.item.nome }}</td>
                <td>{{ data.item.id_parent }}</td>
                <td>
                  <v-btn
                    icon
                    @click.prevent="[categoria = data.item, modalStore.artigos.categoria = true, modalStore.artigos.categoriaTitle = modalStore.artigos.categoriaTitle.replace('Adicionar','Alterar')]"
                    class="mr-1"
                  >
                    <i class="fa fa-lg fa-pencil"></i>
                  </v-btn>
                  <v-btn
                    icon
                    @click.prevent="[confirmaExclusao = true, categoriaStore.categoria = data.item]"
                    class="mr-1"
                  >
                    <i class="fa fa-lg fa-trash"></i>
                  </v-btn>
                </td>
              </template>
            </v-data-table>
          </v-flex>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            flat
            @click="modalStore.artigos.categoriaTitle.includes('Alterar') ? reset() : modalStore.artigos.categoria = false"
          >{{ modalStore.artigos.categoriaTitle.includes('Alterar') ? 'Cancelar': 'Fechar' }}</v-btn>
          <v-btn color="blue darken-1" flat @click="save()">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="confirmaExclusao"
      persistent
      max-width="500px"
      v-if="categoriaStore.categoria"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Excluir categoria</span>
        </v-card-title>
        <v-card-text>Excluir {{ categoriaStore.categoria.nome }} ?</v-card-text>
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
import axios from "axios";
import { urlBD, showError } from "@/global";
import { mapState } from "vuex";

export default {
  name: "AddCategoria",
  data: function() {
    return {
      categoria: {},
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "nome", text: "Nome", sortable: true },
        { value: "id_parent", text: "Filho de", sortable: true },
        { value: "actions", text: "Ações" }
      ],
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 5, // -1 for All,
        sortBy: "nome",
        totalItems: 0
      },
      valid: true,
      confirmaExclusao: false,
      descRules: [
        v => !!v || "Nome é obrigatório",
        v => (!!v && v.length >= 3) || "Nome deve ter no mínimo 3 caracteres"
      ]
    };
  },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["modalStore", "categoriaStore", "usuarioStore"])
  },
  watch: {
    "$store.state.modalStore.artigos.categoria": function() {
      if (this.modalStore.artigos.categoria) this.reset();
    }
  },
  methods: {
    reset() {
      this.loadCategorias();
      this.categoria = {};
      this.$refs.form ? this.$refs.form.reset() : "";

      this.modalStore.artigos.categoriaTitle = this.modalStore.artigos.categoriaTitle.replace(
        "Alterar",
        "Adicionar"
      );
    },
    loadCategorias() {
      const url = `${urlBD}/categoriasArtigos`;
      axios
        .get(url)
        .then(res => {
          this.categoriaStore.categorias = res.data;
        })
        .catch(showError);
    },
    save() {
      if (!this.$refs.form.validate()) return;

      if (this.modalStore.artigos.categoriaTitle.includes("produto"))
        this.categoria.tipo = 2;
      else this.categoria.tipo = 1;

      const method = this.categoria.id ? "put" : "post";
      const id = this.categoria.id ? this.categoria.id : "";
      const urlCategorias = `${urlBD}/categoriasArtigos/${id}`;

      axios[method](urlCategorias, this.categoria)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.reset();
        })
        .catch(showError);
    },
    async remove() {
      const urlCategorias = `${urlBD}/categoriasArtigos/${this.categoriaStore.categoria.id}`;

      await axios
        .delete(urlCategorias)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.confirmaExclusao = false;

          this.reset();
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>
