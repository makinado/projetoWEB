<template>
  <div class="add-unidade">
    <v-dialog v-model="modalStore.unidades.visible" persistent max-width="900px">
      <v-card v-if="modalStore.unidades.visible">
        <v-card-title>{{ modalStore.unidades.title }}</v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-form v-model="valid" ref="form">
              <v-text-field v-model="unidade.id" v-show="false"></v-text-field>
              <v-layout wrap>
                <v-flex xs4>
                  <v-text-field
                    :color="color"
                    label="Sigla*"
                    placeholder="Exemplo: CX, PCT, FD, etc..."
                    v-model="unidade.sigla"
                    v-uppercase
                    :rules="siglaRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    :color="color"
                    label="Descrição*"
                    v-model="unidade.descricao"
                    v-uppercase
                    :rules="descRules"
                    @keyup.enter="save"
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
          <v-flex xs12>
            <v-data-table
              :items="produtoStore.unidades"
              :headers="fields"
              rows-per-page-text="Registros por página"
              :rows-per-page-items="[5,10,15,20]"
              no-results-text="Nenhum registro encontrado"
              no-data-text="Nenhuma unidade encontrada"
              :pagination.sync="pagination"
            >
              <template slot="items" slot-scope="data">
                <td>{{ data.item.id }}</td>
                <td>{{ data.item.sigla }}</td>
                <td>{{ data.item.descricao }}</td>
                <td>
                  <b-button
                    variant="secundary"
                    @click.prevent="[unidade = data.item, modalStore.unidades.visible = true, modalStore.unidades.title = modalStore.unidades.title.replace('Adicionar','Alterar')]"
                    class="mr-1"
                  >
                    <i class="fa fa-lg fa-pencil"></i>
                  </b-button>
                  <b-button
                    variant="secundary"
                    @click.prevent="[confirmaExlusao = true, produtoStore.unidade = data.item]"
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
            @click="modalStore.unidades.title.includes('Alterar') ? reset() : modalStore.unidades.visible = false"
          >{{ modalStore.unidades.title.includes('Alterar') ? 'Cancelar': 'Fechar' }}</v-btn>
          <v-btn color="blue darken-1" flat @click="save()">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="confirmaExlusao"
      persistent
      max-width="500px"
      v-if="produtoStore.unidade"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Excluir unidade</span>
        </v-card-title>
        <v-card-text>Excluir {{ produtoStore.unidade.descricao }} ?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            flat
            @click="confirmaExlusao = false"
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
  name: "AddUnidade",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["modalStore", "usuarioStore", "produtoStore"])
  },
  data: function() {
    return {
      unidade: {},
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "sigla", text: "Sigla", sortable: true },
        { value: "descricao", text: "Descricao", sortable: true },
        { value: "actions", text: "Ações" }
      ],
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 10, // -1 for All,
        sortBy: "descricao",
        totalItems: 0
      },
      valid: true,
      confirmaExlusao: false,
      siglaRules: [
        v => !!v || "Sigla é obrigatória",
        v => (!!v && v.length <= 3) || "Sigla deve ter no máxio 3 caracteres"
      ],
      descRules: [
        v => !!v || "Descrição é obrigatório",
        v =>
          (!!v && v.length >= 3) || "Descrição deve ter no mínimo 3 caracteres"
      ]
    };
  },
  watch: {
    "$store.state.modalStore.unidades.visible": function() {
      this.reset();
    },
    "$store.state.confirmaExlusao": function() {
      this.reset();
    }
  },
  methods: {
    async reset() {
      this.unidade = {};
      this.modalStore.unidades.title = this.modalStore.unidades.title.replace(
        "Alterar",
        "Adicionar"
      );
      this.$refs.form ? this.$refs.form.reset() : "";
      this.loadUnidades();
    },
    async loadUnidades() {
      const urlunidades = `${urlBD}/unidades`;

      await axios.get(urlunidades).then(res => {
        this.produtoStore.unidades = res.data.map(unidade => {
          unidade.value = unidade.id;
          unidade.text = unidade.descricao;

          return unidade;
        });
      });
    },
    save() {
      const method = this.unidade.id ? "put" : "post";
      const id = this.unidade.id ? this.unidade.id : "";
      const urlunidades = `${urlBD}/unidades/${id}`;

      axios[method](urlunidades, this.unidade)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
            "UNIDADES",
            `Usuário ${this.usuarioStore.currentUsuario.nome} ${
              method === "post" ? "ADICIONOU" : "ALTEROU"
            } a unidade ${this.unidade.descricao}`
          );
          this.reset();
        })
        .catch(showError);
    },
    remove() {
      const urlunidades = `${urlBD}/unidades/${this.produtoStore.unidade.id}`;

      axios
        .delete(urlunidades)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.confirmaExlusao = false;

          saveLog(
            new Date(),
            "EXCLUSÃO",
            "UNIDADES",
            `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu a unidade ${this.produtoStore.unidade.descricao}`
          );
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>
