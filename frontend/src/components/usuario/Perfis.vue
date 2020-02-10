<template>
  <div class="Perfis">
    <v-dialog v-model="modalStore.perfis.visible" persistent max-width="600px">
      <v-card v-if="modalStore.perfis.visible">
        <AddPerfil />
        <v-card-title class="headline">Gerenciar perfis</v-card-title>
        <v-card-text>
          <v-flex xs12>
            <v-data-table
              :items="usuarioStore.perfis"
              :headers="fields"
              :search="perfilFilter"
              data-app
              rows-per-page-text="Registros por página"
              :rows-per-page-items="[5,10,15,20]"
              no-results-text="Nenhum registro encontrado"
              no-data-text="Nenhum perfil cadastrado"
              :pagination.sync="pagination"
            >
              <v-progress-linear slot="progress" color="blue" height="3" indeterminate></v-progress-linear>
              <template slot="items" slot-scope="data">
                <td>{{ data.item.id }}</td>
                <td>{{ data.item.descricao }}</td>
                <td>
                  <b-button
                    variant="secundary"
                    @click.prevent="[usuarioStore.perfil = data.item, modalStore.perfis.addPerfil = true, modalStore.perfis.title = 'Alterar perfil']"
                    class="mr-1"
                  >
                    <i class="fa fa-lg fa-pencil"></i>
                  </b-button>
                  <b-button
                    variant="secundary"
                    @click.prevent="[dialogDelete = true, usuarioStore.perfil = data.item]"
                  >
                    <i class="fa fa-lg fa-trash"></i>
                  </b-button>
                </td>
              </template>
            </v-data-table>
          </v-flex>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="blue darken-1"
            flat
            @click="[modalStore.perfis.addPerfil = true, usuarioStore.perfil = null]"
          >Adicionar Perfil</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="modalStore.perfis.visible = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogDelete" persistent max-width="500px" v-if="usuarioStore.perfil">
      <v-card>
        <v-card-title>
          <span class="headline">Excluir perfil</span>
        </v-card-title>
        <v-card-text>Excluir {{ usuarioStore.perfil.descricao }} ?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="dialogDelete = false">Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="remove()">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from "vuex";

import { loadPerfis } from "./GridUsuarios";

import axios from "axios";
import { urlBD, showError, formatDate, saveLog } from "@/global";
export default {
  name: "Perfis",
  components: {
    AddPerfil: () => import("./AddPerfil")
  },
  data: function() {
    return {
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
      perfilFilter: "",
      dialogDelete: false
    };
  },
  computed: {
    ...mapState(["modalStore", "usuarioStore"])
  },
  watch: {
    "$store.state.modalStore.perfis.addPerfil": function() {
      if (!this.modalStore.perfis.addPerfil) {
        this.loadPerfis();
      }
    }
  },
  methods: {
    async loadPerfis() {
      const url = `${urlBD}/perfis`;
      await axios.get(url).then(res => {
        this.usuarioStore.perfis = res.data.map(perfil => {
          perfil.text = perfil.descricao;
          perfil.value = perfil.id;

          return perfil;
        });
      });
    },
    async remove() {
      const url = `${urlBD}/perfis/${this.usuarioStore.perfil.id}`;

      await axios
        .delete(url)
        .then(() => {
          this.$toasted.global.defaultSuccess();

          this.loadPerfis();
          this.dialogDelete = false;

          saveLog(
            new Date(),
            "EXCLUSÃO",
            "PERFIS DE USUÁRIOS",
            `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu o perfil ${this.usuarioStore.perfil.descricao}`
          );
        })
        .catch(showError);
    }
  },
  mounted() {
    this.loadPerfis();
  }
};
</script>

<style>
</style>
