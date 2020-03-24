<template>
  <div class="add-categoria">
    <v-dialog v-model="modalStore.categorias.visible" persistent max-width="900px">
      <v-card v-if="modalStore.categorias.visible">
        <v-card-title>{{ modalStore.categorias.title }}</v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-form v-model="valid" ref="form">
              <v-text-field v-model="categoria.id" v-show="false"></v-text-field>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field
                    :color="color"
                    label="Descrição*"
                    v-model="categoria.descricao"
                    v-uppercase
                    :rules="descRules"
                    autofocus
                    @keyup.enter="save"
                  ></v-text-field>
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
                <td>{{ data.item.descricao }}</td>
                <td>
                  <v-btn
                    icon
                    @click.prevent="[categoria = data.item, modalStore.categorias.visible = true, modalStore.categorias.title = modalStore.categorias.title.replace('Adicionar','Alterar')]"
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
            @click="modalStore.categorias.title.includes('Alterar') ? reset() : modalStore.categorias.visible = false"
          >{{ modalStore.categorias.title.includes('Alterar') ? 'Cancelar': 'Fechar' }}</v-btn>
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
        <v-card-text>Excluir {{ categoriaStore.categoria.descricao }} ?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            flat
            @click="confirmaExclusao = false"
          >Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="remove()">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import { urlBD, showError, formatDate, saveLog } from "@/global";
import { mapState } from "vuex";

export default {
  name: "AddCategoria",
  data: function() {
    return {
      categoria: {},
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "descricao", text: "Descricao", sortable: true },
        { value: "actions", text: "Ações" }
      ],
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 5, // -1 for All,
        sortBy: "descricao",
        totalItems: 0
      },
      valid: true,
      confirmaExclusao: false,
      descRules: [
        v => !!v || "Descrição é obrigatória",
        v =>
          (!!v && v.length >= 3) || "Descrição deve ter no mínimo 3 caracteres"
      ]
    };
  },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["modalStore", "categoriaStore", "usuarioStore"])
  },
  watch: {
    "$store.state.modalStore.categorias.visible": function() {
      if (this.modalStore.categorias.visible) this.reset();
      this.loadCategorias();
    },
    "$store.state.confirmaExclusao": function() {
      this.reset();
    }
  },
  methods: {
    reset() {
      this.loadCategorias();
      this.categoria = {};
      this.$refs.form ? this.$refs.form.reset() : "";

      this.modalStore.categorias.title = this.modalStore.categorias.title.replace(
        "Alterar",
        "Adicionar"
      );
    },
    loadCategorias() {
      this.categoriaStore.categorias = [];
      if (this.modalStore.categorias.title.includes("produto")) {
        this.loadCategoriasProdutos();
      } else {
        this.loadCategoriasPessoas();
      }
    },
    loadCategoriasProdutos() {
      const url = `${urlBD}/categorias/produtos`;
      axios
        .get(url)
        .then(res => {
          this.categoriaStore.categorias = res.data;
        })
        .catch(showError);
    },
    loadCategoriasPessoas() {
      const url = `${urlBD}/categorias/pessoas`;
      axios
        .get(url)
        .then(res => {
          this.categoriaStore.categorias = res.data;
        })
        .catch(showError);
    },
    save() {
      if (!this.$refs.form.validate()) return;

      if (this.modalStore.categorias.title.includes("produto"))
        this.categoria.tipo = 2;
      else this.categoria.tipo = 1;

      const method = this.categoria.id ? "put" : "post";
      const id = this.categoria.id ? this.categoria.id : "";
      const urlCategorias = `${urlBD}/categorias/${id}`;

      axios[method](urlCategorias, this.categoria)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
            "CATEGORIAS",
            `Usuário ${this.usuarioStore.currentUsuario.nome} ${
              method === "post" ? "ADICIONOU" : "ALTEROU"
            } a categoria ${this.categoria.descricao}`
          );
          this.reset();
        })
        .catch(showError);
    },
    async remove() {
      const urlCategorias = `${urlBD}/categorias/${this.categoriaStore.categoria.id}`;

      await axios
        .delete(urlCategorias)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.confirmaExclusao = false;

          saveLog(
            new Date(),
            "EXCLUSÃO",
            "CATEGORIAS",
            `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu a categoria ${this.categoriaStore.categoria.descricao}`
          );
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>
