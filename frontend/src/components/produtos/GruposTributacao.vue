<template>
  <div class="grupo-trib">
    <v-layout row justify-center>
      <v-dialog v-model="modalStore.grupo_trib.visible" persistent max-width="900px">
        <v-card>
          <v-card-title>Gerencie os grupos de tributação</v-card-title>
          <v-card-text>
            <v-data-table
              :items="produtoStore.grupo_tribs"
              :headers="fields"
              :search="grupoFilter"
              rows-per-page-text="Registros por página"
              :rows-per-page-items="[5,10,15]"
              no-results-text="Nenhum registro encontrado"
              no-data-text="Nenhum grupo de tributação encontrado"
              :pagination.sync="pagination"
            >
              <template slot="items" slot-scope="data">
                <td>{{ data.item.id }}</td>
                <td>{{ data.item.descricao }}</td>
                <td>{{ data.item.uf }}</td>
                <td>{{ data.item.cfop }}</td>
                <td>
                  <v-btn
                    icon
                    @click.prevent="[produtoStore.grupo_trib = data.item, modalStore.grupo_trib.addGrupo = true]"
                    class="mr-1"
                  >
                    <i class="fa fa-lg fa-pencil"></i>
                  </v-btn>
                  <v-btn
                    icon
                    @click.prevent="[produtoStore.grupo_trib = data.item, modalStore.grupo_trib.deleteGrupo = true]"
                    class="mr-1"
                  >
                    <i class="fa fa-lg fa-trash"></i>
                  </v-btn>
                </td>
              </template>
            </v-data-table>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="blue darken-1"
              flat
              @click.prevent="[produtoStore.grupo_trib = {}, modalStore.grupo_trib.addGrupo = true, modalStore.grupo_trib.title = 'Adicionar grupo de tributação']"
            >Adicionar grupo</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="modalStore.grupo_trib.visible = false">Fechar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="modalStore.grupo_trib.deleteGrupo"
        persistent
        max-width="500px"
        v-if="produtoStore.grupo_trib"
      >
        <v-card>
          <v-card-title>
            <span class="headline">Excluir grupo de tributação?</span>
          </v-card-title>
          <v-card-text>Excluir {{ produtoStore.grupo_trib.descricao }} ?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              flat
              @click="modalStore.grupo_trib.deleteGrupo = false"
            >Fechar</v-btn>
            <v-btn color="blue darken-1" flat @click="remove()">Confirmar</v-btn>
          </v-card-actions>

          <AddGrupoTrib />
        </v-card>
      </v-dialog>
    </v-layout>
  </div>
</template>

<script>
import axios from "axios";
import { urlBD, showError, formatDate } from "@/global";
import { mapState } from "vuex";

export default {
  name: "grupo-trib",
  computed: {
    ...mapState(["produtoStore", "usuarioStore", "modalStore"])
  },
  components: {
    AddGrupoTrib: () => import("./AddGrupoTrib")
  },
  watch: {
    "store.state.modalStore.grupo_trib.visible": function() {
      this.loadGrupos();
    },
    "$store.state.modalStore.grupo_trib.deleteGrupo": function() {
      if (!this.modalStore.grupo_trib.deleteGrupo) this.loadGrupos();
    }
  },
  data: function() {
    return {
      grupoFilter: null,
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "descricao", text: "Descrição", sortable: true },
        { value: "uf", text: "UF", sortable: true },
        { value: "cfop", text: "CFOP", sortable: true },
        { value: "actions", text: "Ações" }
      ],
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 5, // -1 for All,
        sortBy: "descricao",
        totalItems: 0
      },
      nomeRules: [v => !!v || "Nome inválido"]
    };
  },
  methods: {
    async loadGrupos() {
      const url = `${urlBD}/grupoTrib`;
      axios
        .get(url)
        .then(res => {
          this.produtoStore.grupo_tribs = res.data;
        })
        .catch(showError);
    },
    async remove() {
      const id = this.produtoStore.grupo_trib.id;
      const urlGrupo = `${urlBD}/grupoTrib/${id}`;

      await axios
        .delete(urlGrupo, this.produtoStore.grupo_trib)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.modalStore.grupo_trib.deleteGrupo = false;

          saveLog(
            new Date(),
            "EXCLUSÃO",
            "GRUPOS TRIBUTÁRIOS",
            `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu o grupo ${this.produtoStore.grupo_trib.descricao}`
          );
        })
        .catch(showError);
    }
  },
  mounted() {
    this.loadGrupos();
  }
};
</script>

<style>
</style>
