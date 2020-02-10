<template>
  <div class="add-tabela">
    <v-dialog v-model="modalStore.tabelas.visible" persistent max-width="1200px">
      <v-card v-if="modalStore.tabelas.visible">
        <v-card-title>{{ modalStore.tabelas.title }}</v-card-title>
        <v-card-text>
          <v-container grid-list-xl>
            <v-form v-model="valid" ref="form">
              <v-text-field v-model="tabela.id" v-show="false"></v-text-field>
              <v-layout wrap>
                <v-flex xs12 md4>
                  <v-autocomplete
                    no-data-text="Nenhum resultado"
                    dense
                    :color="color"
                    label="Empresa"
                    v-model="tabela.id_empresa"
                    :items="empresaStore.empresas"
                    :rules="empresaRules"
                  ></v-autocomplete>
                </v-flex>
                <v-flex xs12 md4>
                  <v-autocomplete
                    no-data-text="Nenhum resultado"
                    dense
                    :color="color"
                    label="Tipo*"
                    v-model="tabela.tipo"
                    :items="['ACRÉSCIMO', 'DESCONTO']"
                    :rules="tipoRules"
                  ></v-autocomplete>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field
                    ref="percentual"
                    :color="color"
                    label="Percentual"
                    v-model="tabela.percentual"
                    v-money="percent"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    :color="color"
                    label="Descricao*"
                    v-model="tabela.descricao"
                    v-uppercase
                    :rules="nameRules"
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
          <v-flex xs12>
            <v-data-table
              :items="vendaStore.tabelas"
              :headers="fields"
              rows-per-page-text="Registros por página"
              :rows-per-page-items="[5,10,15,20]"
              no-results-text="Nenhum registro encontrado"
              no-data-text="Nenhuma tabela encontrada"
              :pagination.sync="pagination"
            >
              <template slot="items" slot-scope="data">
                <td>{{ data.item.id }}</td>
                <td>
                  <v-chip :color="getColor(data.item.tipo)" dark>{{ data.item.tipo }}</v-chip>
                </td>
                <td>{{ data.item.descricao }}</td>
                <td>{{ data.item.percentual }}</td>
                <td>
                  <b-button variant="secundary" @click.prevent="loadTabela(data.item)" class="mr-1">
                    <i class="fa fa-lg fa-pencil"></i>
                  </b-button>
                  <b-button
                    variant="secundary"
                    @click.prevent="[modalStore.tabelas.deleteDoc = true, vendaStore.tabela = data.item]"
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
            @click="modalStore.tabelas.title.includes('Alterar') ? reset() : modalStore.tabelas.visible = false"
          >{{ modalStore.tabelas.title.includes('Alterar') ? 'Cancelar': 'Fechar' }}</v-btn>
          <v-btn color="blue darken-1" flat @click="save()">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="modalStore.tabelas.deleteDoc"
      persistent
      max-width="500px"
      v-if="vendaStore.tabela"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Excluir tabela</span>
        </v-card-title>
        <v-card-text>Excluir {{ vendaStore.tabela.descricao }} ?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="modalStore.tabelas.deleteDoc = false">Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="remove()">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { VMoney } from "v-money";

import axios from "axios";
import { urlBD, showError, formatDate } from "@/global";
import { mapState } from "vuex";

export default {
  directives: { money: VMoney },
  name: "Add-tabela",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["vendaStore", "usuarioStore", "modalStore", "empresaStore"])
  },
  data: function() {
    return {
      tabela: {},
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "tipo", text: "Tipo", sortable: true },
        { value: "descricao", text: "Descrição", sortable: true },
        { value: "percentual", text: "Percentual", sortable: true },
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
      empresaRules: [v => !!v || "Empresa é obrigatória"],
      tipoRules: [v => !!v || "Tipo é obrigatório"],
      nameRules: [
        v => !!v || "Descrição é obrigatória",
        v =>
          (!!v && v.length >= 3) || "descricao deve ter no mínimo 3 caracteres"
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
    "$store.state.modalStore.tabelas.visible": function() {
      if (this.modalStore.tabelas.visible) {
        this.reset();
      }
    },
    "$store.state.modalStore.tabelas.deleteDoc": function() {
      this.reset();
    }
  },
  methods: {
    getColor(tipo) {
      if (tipo === "ACRÉSCIMO") return "red";
      else return "green";
    },
    reset() {
      this.tabela = {};
      this.$refs.form ? this.$refs.form.reset() : "";

      this.$refs.percentual
        ? (this.$refs.percentual.$el.getElementsByTagName("input")[0].value = 0)
        : "";

      this.modalStore.tabelas.title = this.modalStore.tabelas.title.replace(
        "Alterar",
        "Adicionar"
      );
      this.loadEmpresas();
      this.loadTabelas();
    },
    async loadEmpresas() {
      const url = `${urlBD}/usuarioEmpresas/${this.usuarioStore.currentUsuario.id}`;
      await axios.get(url).then(res => {
        this.empresaStore.empresas = res.data;
        if (this.empresaStore.empresas.length === 1) {
          this.tabela.id_empresa = this.empresaStore.empresas[0].value;
        }
      });
    },
    loadTabela(tabela) {
      if (tabela) {
        this.modalStore.tabelas.title = this.modalStore.tabelas.title.replace(
          "Adicionar",
          "Alterar"
        );
        this.tabela = tabela;
        this.$refs.percentual.$el.getElementsByTagName("input")[0].value =
          tabela.percentual;
      }
    },
    loadTabelas() {
      const url = `${urlBD}/tabelas`;
      axios
        .get(url)
        .then(res => {
          this.vendaStore.tabelas = res.data.map(tabela => {
            tabela.value = tabela.id;
            tabela.text = tabela.descricao;

            return tabela;
          });
        })
        .catch(showError);
    },
    save() {
      if (!this.$refs.form.validate()) return;

      const method = this.tabela.id ? "put" : "post";
      const id = this.tabela.id ? this.tabela.id : "";
      const urldocumentos = `${urlBD}/tabelas/${id}`;

      let data = new Date();
      const hora = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`;
      const log = {
        id_usuario: this.usuarioStore.currentUsuario.id,
        data: formatDate(data.toISOString().substr(0, 10)),
        hora,
        tipo: method === "post" ? "GRAVAÇÂO" : "ALTERAÇÃO",
        tela: "tabelas",
        detalhe:
          method === "post"
            ? `tabela adicionado: ${this.tabela.descricao}`
            : `tabela alterado: ${this.tabela.id}-${this.tabela.descricao}`
      };

      axios[method](urldocumentos, this.tabela)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          axios.post(`${urlBD}/log`, log).catch(showError);

          this.reset();
        })
        .catch(showError);
    },
    remove() {
      const id = this.vendaStore.tabela.id;
      const urldocumentos = `${urlBD}/tabelas/${id}`;

      let data = new Date();
      const hora = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`;
      const log = {
        id_usuario: this.usuarioStore.currentUsuario.id,
        data: formatDate(data.toISOString().substr(0, 10)),
        hora,
        tipo: "EXCLUSÃO",
        tela: "tabelas",
        detalhe: `tabela excluído: ${this.tabela.id}-${this.tabela.descricao}`
      };

      axios
        .delete(urldocumentos, this.tabela)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          axios.post(`${urlBD}/log`, log).catch(showError);

          this.modalStore.tabelas.deleteDoc = false;
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>
