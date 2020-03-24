<template>
  <div class="add-documento">
    <v-dialog v-model="modalStore.documentos.visible" persistent max-width="1200px">
      <v-card v-if="modalStore.documentos.visible">
        <v-card-title>{{ modalStore.documentos.title }}</v-card-title>
        <v-card-text>
          <v-container grid-list-xl>
            <v-form v-model="valid" ref="form">
              <v-text-field v-model="documento.id" v-show="false"></v-text-field>
              <v-layout wrap>
                <v-flex xs12 md4>
                  <v-text-field
                    :color="color"
                    label="Nome*"
                    v-model="documento.nome"
                    v-uppercase
                    :rules="nameRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field
                    :color="color"
                    label="Nome NFC-e"
                    v-model="documento.nome_nfce"
                    v-uppercase
                    :rules="nameRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field
                    ref="perc_custo"
                    :color="color"
                    label="Percentual de custo"
                    v-model="documento.perc_custo"
                    v-money="percent"
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
          <v-flex xs12>
            <v-data-table
              :items="financeiroStore.documentos"
              :headers="fields"
              rows-per-page-text="Registros por página"
              :rows-per-page-items="[5,10,15,20]"
              no-results-text="Nenhum registro encontrado"
              no-data-text="Nenhuma documento encontrada"
              :pagination.sync="pagination"
            >
              <template slot="items" slot-scope="data">
                <td>{{ data.item.id }}</td>
                <td>{{ data.item.nome }}</td>
                <td>{{ data.item.nome_nfce }}</td>
                <td>{{ data.item.perc_custo }}</td>
                <td>
                  <v-btn
                    icon
                    @click.prevent="loadDocumento(data.item)"
                    class="mr-1"
                  >
                    <i class="fa fa-lg fa-pencil"></i>
                  </v-btn>
                  <v-btn
                    icon
                    @click.prevent="[confirmaExlusao = true, financeiroStore.documento = data.item]"
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
            @click="modalStore.documentos.title.includes('Alterar') ? reset() : modalStore.documentos.visible = false"
          >{{ modalStore.documentos.title.includes('Alterar') ? 'Cancelar': 'Fechar' }}</v-btn>
          <v-btn color="blue darken-1" flat @click="save()">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="confirmaExlusao"
      persistent
      max-width="500px"
      v-if="financeiroStore.documento"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Excluir documento</span>
        </v-card-title>
        <v-card-text>Excluir {{ financeiroStore.documento.nome }} ?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="confirmaExlusao = false">Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="remove()">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { VMoney } from "v-money";

import axios from "axios";
import { urlBD, showError, formatDate, saveLog } from "@/global";
import { mapState } from "vuex";

import { formatToBRL } from "brazilian-values";

export default {
  directives: { money: VMoney },
  name: "Add-documento",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["financeiroStore", "usuarioStore", "modalStore"])
  },
  data() {
    return {
      documento: {},
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "nome", text: "Nome", sortable: true },
        { value: "nome_nfce", text: "Nome NFC-e", sortable: true },
        { value: "perc_custo", text: "Percentual de custo", sortable: true },
        { value: "actions", text: "Ações" }
      ],
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 20, // -1 for All,
        sortBy: "nome",
        totalItems: 0
      },
      valid: true,
      confirmaExlusao: false,
      nameRules: [
        v => !!v || "Nome é obrigatório",
        v => (!!v && v.length >= 3) || "Nome deve ter no mínimo 3 caracteres"
      ],
      percent: {
        decimal: ",",
        thousands: ".",
        precision: 2,
        suffix: " %"
      }
    };
  },
  watch: {
    "$store.state.modalStore.documentos.visible": function() {
      this.reset();
    },
    "$store.state.confirmaExlusao": function() {
      this.reset();
    }
  },
  methods: {
    reset() {
      this.documento = {};
      this.$refs.form ? this.$refs.form.reset() : "";

      this.$refs.perc_custo
        ? (this.$refs.perc_custo.$el.getElementsByTagName("input")[0].value = 0)
        : "";

      this.modalStore.documentos.title = this.modalStore.documentos.title.replace(
        "Alterar",
        "Adicionar"
      );
      this.loadDocumentos();
    },
    loadDocumento(documento) {
      if (documento) {
        // [documento = data.item, modalStore.documentos.visible = true, modalStore.documentos.title = modalStore.documentos.title.replace('Adicionar','Alterar')]
        this.modalStore.documentos.title = this.modalStore.documentos.title.replace(
          "Adicionar",
          "Alterar"
        );
        this.documento = documento;
        this.$refs.perc_custo.$el.getElementsByTagName("input")[0].value =
          documento.perc_custo;
      }
    },
    loadDocumentos() {
      const url = `${urlBD}/documentos`;
      axios
        .get(url)
        .then(res => {
          this.financeiroStore.documentos = res.data.map(item => {
            item.perc_custo =
              formatToBRL(item.perc_custo).replace("R$ ", "") + " %";

            return item;
          });
        })
        .catch(showError);
    },
    save() {
      if (!this.$refs.form.validate()) return;

      const method = this.documento.id ? "put" : "post";
      const id = this.documento.id ? this.documento.id : "";
      const urldocumentos = `${urlBD}/documentos/${id}`;

      axios[method](urldocumentos, this.documento)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÂO" : "ALTERAÇÃO",
            "DOCUMENTOS",
            method === "post"
              ? `documento adicionado: ${this.documento.nome}`
              : `documento alterado: ${this.documento.id}-${this.documento.nome}`
          );

          this.reset();
        })
        .catch(showError);
    },
    remove() {
      const id = this.financeiroStore.documento.id;
      const urldocumentos = `${urlBD}/documentos/${id}`;

      axios
        .delete(urldocumentos, this.documento)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.confirmaExlusao = false;
          this.reset()

          saveLog(
            new Date(),
            "EXCLUSÃO",
            "DOCUMENTOS",
            `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu o documento ${this.financeiroStore.documento.nome}`
          );
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>
