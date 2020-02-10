<template>
  <div class="add-marca">
    <v-dialog v-model="modalStore.marcas.visible" persistent max-width="900px">
      <v-card v-if="modalStore.marcas.visible">
        <v-card-title>{{ modalStore.marcas.title }}</v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-form v-model="valid" ref="form">
              <v-text-field v-model="marca.id" v-show="false"></v-text-field>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field
                    :color="color"
                    label="Nome*"
                    v-model="marca.nome"
                    v-uppercase
                    autofocus
                    :rules="nameRules"
                    @keyup.enter="save"
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
          <v-flex xs12>
            <v-data-table
              :items="produtoStore.marcas"
              :headers="fields"
              rows-per-page-text="Registros por página"
              :rows-per-page-items="[5,10,15,20]"
              no-results-text="Nenhum registro encontrado"
              no-data-text="Nenhuma marca encontrada"
              :pagination.sync="pagination"
            >
              <template slot="items" slot-scope="data">
                <td>{{ data.item.id }}</td>
                <td>{{ data.item.nome }}</td>
                <td>
                  <b-button
                    variant="secundary"
                    @click.prevent="[marca = data.item, modalStore.marcas.visible = true, modalStore.marcas.title = modalStore.marcas.title.replace('Adicionar','Alterar')]"
                    class="mr-1"
                  >
                    <i class="fa fa-lg fa-pencil"></i>
                  </b-button>
                  <b-button
                    variant="secundary"
                    @click.prevent="[modalStore.marcas.deleteMarca = true, produtoStore.marca = data.item]"
                    class="mr-1"
                  >
                    <i class="fa fa-lg fa-trash"></i>
                  </b-button>
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
            @click="modalStore.marcas.title.includes('Alterar') ? reset() : modalStore.marcas.visible = false"
          >{{ modalStore.marcas.title.includes('Alterar') ? 'Cancelar': 'Fechar' }}</v-btn>
          <v-btn color="blue darken-1" flat @click="save()">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="modalStore.marcas.deleteMarca"
      persistent
      max-width="500px"
      v-if="produtoStore.marca"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Excluir marca</span>
        </v-card-title>
        <v-card-text>Excluir {{ produtoStore.marca.nome }} ?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="modalStore.marcas.deleteMarca = false">Fechar</v-btn>
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
  name: "Add-marca",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["produtoStore", "usuarioStore", "modalStore"])
  },
  data: function() {
    return {
      marca: {},
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "nome", text: "Nome", sortable: true },
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
      nameRules: [
        v => !!v || "Nome é obrigatório",
        v => (!!v && v.length >= 3) || "Nome deve ter no mínimo 3 caracteres"
      ]
    };
  },
  watch: {
    "$store.state.modalStore.marcas.visible": function() {
      this.reset();
    },
    "$store.state.modalStore.marcas.deleteMarca": function() {
      this.reset();
    }
  },
  methods: {
    reset() {
      this.marca = {};
      this.$refs.form ? this.$refs.form.reset() : "";

      this.modalStore.marcas.title = this.modalStore.marcas.title.replace(
        "Alterar",
        "Adicionar"
      );
      this.loadMarcas();
    },
    loadMarca(marca) {
      if (marca) {
        const url = `${urlBD}/marcas`;
        axios
          .get(`${url}/${marca.id}`)
          .then(res => {
            this.marca = res.data;
          })
          .catch(showError);
      } else {
        this.marca = {};
      }
    },
    loadMarcas() {
      const url = `${urlBD}/marcas`;
      axios
        .get(url)
        .then(res => {
          this.produtoStore.marcas = res.data.map(marca => {
            marca.value = marca.id;
            marca.text = marca.nome;

            return marca;
          });
        })
        .catch(showError);
    },
    async save() {
      const method = this.marca.id ? "put" : "post";
      const id = this.marca.id ? this.marca.id : "";
      const urlmarcas = `${urlBD}/marcas/${id}`;

      await axios[method](urlmarcas, this.marca)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
            "MARCAS",
            `Usuário ${this.usuarioStore.currentUsuario.nome} ${
              method === "post" ? "ADICIONOU" : "ALTEROU"
            } a marca ${this.marca.nome}`
          );
          this.reset();
        })
        .catch(showError);
    },
    async remove() {
      const id = this.produtoStore.marca.id;
      const urlmarcas = `${urlBD}/marcas/${id}`;

      await axios
        .delete(urlmarcas, this.marca)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.modalStore.marcas.deleteMarca = false;

          saveLog(
            new Date(),
            "EXCLUSÃO",
            "MARCAS",
            `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu a marca ${this.produtoStore.marca.nome}`
          );
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>
