<template>
  <div class="add-comissao">
    <v-dialog v-model="modalStore.usuarios.comissoes.visible" persistent max-width="1000px">
      <v-card v-if="modalStore.usuarios.comissoes.visible">
        <v-card-title>{{ modalStore.usuarios.comissoes.title }}</v-card-title>
        <v-card-text>
          <v-container grid-list-xl>
            <v-form v-model="valid" ref="form">
              <v-text-field v-model="comissao.id" v-show="false"></v-text-field>
              <v-layout wrap>
                <v-flex xs12 md4>
                  <v-autocomplete
                    :color="color"
                    label="Tipo*"
                    :items="[{ value: 1, text: 'Comissão sobre o produto'}, { value: 2, text: 'Comissão sobre a venda'}, { value: 3, text: 'Comissão sobre o lucro da empresa'}]"
                    v-model="comissao.tipo"
                    dense
                    @change="$refs.perc_comissao.focus()"
                  >
                    <v-tooltip slot="append" bottom>
                      <v-icon slot="activator">fa fa-lg fa-question-circle</v-icon>
                      <span>
                        1- Comissão sobre o produto* Preencha o percentual no cadastro do produto.
                        <br />
                      </span>
                      <span>
                        2 - Comissão sobre a venda* Preencha os campos a seguir
                        <br />
                      </span>
                      <span>3 - Comissão sobre o lucro* Preencha os campos a seguir</span>
                    </v-tooltip>
                  </v-autocomplete>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field
                    ref="perc_comissao"
                    :color="color"
                    label="Percentual*"
                    v-model="comissao.perc_comissao"
                    v-money="percent"
                    :disabled="comissao.tipo == 1"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field
                    ref="perc_representante"
                    :color="color"
                    label="Percentual de representante"
                    v-model="comissao.perc_representante"
                    v-money="percent"
                    :disabled="comissao.tipo == 1"
                    @keyup.enter="save"
                  >
                    <v-tooltip slot="append" bottom>
                      <v-icon slot="activator">fa fa-lg fa-question-circle</v-icon>
                      <span>Segundo vendedor</span>
                    </v-tooltip>
                  </v-text-field>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
          <v-flex xs12>
            <v-data-table
              :items="usuarioStore.comissoes"
              :headers="fields"
              rows-per-page-text="Registros por página"
              :rows-per-page-items="[5,10,15,20]"
              no-data-text="Nenhuma comissão encontrada"
              :pagination.sync="pagination"
            >
              <template slot="items" slot-scope="data">
                <tr :class="{'success_light': data.index === usuarioStore.comissoes.length -1}">
                  <td>{{ data.item.id }}</td>
                  <td>
                    <v-chip
                      :color="getColor(data.item.tipo)"
                      dark
                    >{{ data.item.tipo == 1 ? 'Produto' : data.item.tipo == 2 ? 'Venda' : 'Lucro da empresa' }}</v-chip>
                  </td>
                  <td>{{ data.item.usuario }}</td>
                  <td>{{ data.item.data | date }}</td>
                  <td>{{ data.item.perc_comissao }}</td>
                  <td>
                    <v-btn icon @click.prevent="edit(data.item)" class="mr-1">
                      <i class="fa fa-lg fa-pencil"></i>
                    </v-btn>
                    <v-btn
                      icon
                      @click.prevent="[confirmaExlusao = true, usuarioStore.comissao = data.item]"
                      class="mr-1"
                    >
                      <i class="fa fa-lg fa-trash"></i>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table>

            <span>A comissão considerada ativa pelo sistema será sempre a ultima*</span>
          </v-flex>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" flat @click="reset">Limpar</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            flat
            @click="mode == 'save' ? modalStore.usuarios.comissoes.visible = false : reset()"
          >{{ mode == 'save' ? 'Fechar': 'Cancelar' }}</v-btn>
          <v-btn color="blue darken-1" flat @click="save">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmaExlusao" persistent max-width="500px" v-if="usuarioStore.comissao">
      <v-card>
        <v-card-title>
          <span class="headline">Excluir comissão</span>
        </v-card-title>
        <v-card-text>Excluir comissão {{ usuarioStore.comissao.id }} de {{ usuarioStore.comissao.perc_comissao }} ?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="confirmaExlusao = false">Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="remove">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import { urlBD, showError, saveLog } from "@/global";
import { mapState } from "vuex";

import { VMoney } from "v-money";

export default {
  name: "Add-comissao",
  directives: { money: VMoney },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["usuarioStore", "usuarioStore", "modalStore"])
  },
  data() {
    return {
      comissao: {},
      mode: "save",
      percent: {
        decimal: ",",
        thousands: ".",
        precision: 2,
        suffix: " %"
      },
      fields: [
        { value: "id", text: "Código", sortable: false },
        { value: "tipo", text: "Tipo", sortable: false },
        { value: "usuario", text: "Usuário", sortable: false },
        { value: "data", text: "Data início", sortable: false },
        { value: "perc_comissão", text: "Percentual", sortable: false },
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
      confirmaExlusao: false,
      nameRules: [
        v => !!v || "Nome é obrigatório",
        v => (!!v && v.length >= 3) || "Nome deve ter no mínimo 3 caracteres"
      ]
    };
  },
  watch: {
    "$store.state.modalStore.usuarios.comissoes.visible"() {
      if (this.modalStore.usuarios.comissoes.visible) this.reset();
    }
  },
  methods: {
    getColor(tipo) {
      if (tipo == 1) return "info";
      else if (tipo == 2) return "success";
      else return "danger";
    },
    reset() {
      this.comissao = {};
      this.mode = "save";
      this.$refs.form ? this.$refs.form.reset() : "";

      this.$refs.perc_comissao
        ? (this.$refs.perc_comissao.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : null;
      this.$refs.perc_representante
        ? (this.$refs.perc_representante.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : null;

      this.loadComissoes(this.usuarioStore.comissao);
    },
    edit(item) {
      this.mode = "edit";

      this.comissao = item;
      this.$refs.perc_comissao.$el.getElementsByTagName(
        "input"
      )[0].value = this.comissao.perc_comissao;
      this.$refs.perc_representante.$el.getElementsByTagName(
        "input"
      )[0].value = this.comissao.perc_representante;
    },
    loadComissoes(comissao) {
      if (!comissao.id_usuario) return;

      const url = `${urlBD}/usuarioComissoes/${comissao.id_usuario}`;
      axios.get(url).then(res => {
        this.comissao.id_usuario = comissao.id_usuario;
        this.usuarioStore.comissoes = res.data;
      });
    },
    async save() {
      const method = this.comissao.id ? "put" : "post";
      const id = this.comissao.id ? this.comissao.id : "";
      const urlcomissoes = `${urlBD}/usuarioComissoes/${id}`;

      await axios[method](urlcomissoes, this.comissao)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
            "COMISSÕES",
            `Usuário ${this.usuarioStore.currentUsuario.nome} ${
              method === "post" ? "ADICIONOU" : "ALTEROU"
            } a comissão ${this.comissao.nome}`
          );
          this.reset();
        })
        .catch(showError);
    },
    async remove() {
      const id = this.usuarioStore.comissao.id;
      const urlcomissoes = `${urlBD}/usuarioComissoes/${id}`;

      await axios
        .delete(urlcomissoes, this.comissao)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.confirmaExlusao = false;

          this.reset();

          saveLog(
            new Date(),
            "EXCLUSÃO",
            "COMISSÕES",
            `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu a comissão ${this.usuarioStore.comissao.nome}`
          );
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>
