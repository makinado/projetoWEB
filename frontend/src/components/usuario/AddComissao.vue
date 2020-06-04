<template>
  <div class="add-comissao">
    <v-dialog v-model="modalStore.usuarios.comissoes.visible" persistent max-width="1200px">
      <v-card v-if="modalStore.usuarios.comissoes.visible">
        <v-card-title>{{ modalStore.usuarios.comissoes.title }}</v-card-title>
        <v-card-text>
          <v-container grid-list-xl>
            <v-form v-model="valid" ref="form">
              <v-text-field v-model="comissao.id" v-show="false"></v-text-field>
              <v-layout wrap>
                <v-flex xs12 md3>
                  <v-autocomplete
                    :color="color"
                    label="Tipo*"
                    :items="[{ value: 1, text: 'Comissão sobre o produto'}, { value: 2, text: 'Comissão sobre a venda'}]"
                    v-model="comissao.tipo"
                    dense
                    @change="$refs.perc_comissao_vista.focus()"
                    clearable
                    :rules="tipoRules"
                  >
                    <v-tooltip slot="append" bottom>
                      <v-icon slot="activator">fa fa-lg fa-question-circle</v-icon>
                      <span>
                        Comissão sobre o produto - Comissão sobre o percentual de comissão do produto
                        <br />
                      </span>
                      <span>
                        Comissão sobre a venda - Comissão sobre o valor total da venda
                        <br />
                      </span>
                    </v-tooltip>
                  </v-autocomplete>
                </v-flex>
                <v-flex xs12 md3>
                  <v-text-field
                    ref="ordem"
                    :color="color"
                    label="Ordem*"
                    v-model.number="comissao.ordem"
                    @keyup.enter="$refs.perc_comissao_vista.focus()"
                    :rules="ordemRules"
                  >
                    <v-tooltip slot="append" bottom>
                      <v-icon slot="activator">fa fa-lg fa-question-circle</v-icon>
                      <span>
                        Representa a posição do vendedor no momento da venda. Ex:
                        <br />1 - Primeiro vendedor
                        <br />2 - Segundo vendedor
                        <br />3 - Terceiro vendedor
                      </span>
                    </v-tooltip>
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md3>
                  <v-text-field
                    ref="perc_comissao_vista"
                    :color="color"
                    label="Percentual a vista*"
                    v-model="comissao.perc_comissao_vista"
                    v-money="percent"
                    :rules="percRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md3>
                  <v-text-field
                    ref="perc_comissao_prazo"
                    :color="color"
                    label="Percentual a prazo"
                    v-model="comissao.perc_comissao_prazo"
                    v-money="percent"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-switch label="Ativa" v-model="comissao.ativa" :color="color"></v-switch>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
          <v-flex xs12>
            <span>
              Dúvidas sobre o cálculo de comissões no sistema? consulte a documentação
              <router-link to="/centralAjuda">aqui</router-link>
            </span>
            <v-data-table
              :items="usuarioStore.comissoes"
              :headers="fields"
              rows-per-page-text="Registros por página"
              :rows-per-page-items="[5,10,15,20]"
              no-data-text="Nenhuma comissão encontrada"
              :pagination.sync="pagination"
            >
              <template slot="items" slot-scope="data">
                <td>
                  <v-chip
                    :color="getColor(data.item.ativa)"
                    dark
                  >{{ data.item.ativa == true ? 'Ativa' : 'Não ativa' }}</v-chip>
                </td>
                <td>
                  <v-chip
                    :color="getColor(data.item.tipo)"
                    dark
                  >{{ data.item.tipo == 1 ? 'Produto' : 'Venda' }}</v-chip>
                </td>
                <td>{{ data.item.ordem }}</td>
                <td>{{ data.item.data | dateTime }}</td>
                <td>{{ data.item.perc_comissao_vista }}</td>
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
              </template>
            </v-data-table>
          </v-flex>

          <small>* indica os campos obrigatórios</small>
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
        <v-card-text>Excluir comissão {{ usuarioStore.comissao.id }} de {{ usuarioStore.comissao.perc_comissao_vista }} ?</v-card-text>
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
    ...mapState(["usuarioStore", "modalStore"])
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
        { value: "ativa", text: "Ativa?", sortable: true },
        { value: "tipo", text: "Tipo", sortable: true },
        { value: "ordem", text: "Ordem", sortable: true },
        { value: "data", text: "Data início", sortable: true },
        { value: "perc_comissão", text: "Percentual", sortable: true },
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
      tipoRules: [v => !!v || "Tipo é obrigatório"],
      ordemRules: [
        v => !!v || "Ordem é obrigatória",
        v =>
          (!!v && v === parseInt(v)) || "Informe um número inteiro neste campo"
      ],
      percRules: [
        v => !!v || "Percentual a vista é obrigatório",
        v => (!!v && v !== "0,00 %") || "Percentual a vista não pode ser 0,00 %"
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
      if (tipo === 1) return "info";
      else if (tipo === 2) return "warning";
      else if (tipo === true) return "success";
      else if (tipo === false) return "danger";
      return "danger";
    },
    reset() {
      this.mode = "save";
      this.$refs.form ? this.$refs.form.resetValidation() : "";

      this.comissao = {
        ordem: 1,
        ativa: true
      };

      this.$refs.perc_comissao_vista
        ? (this.$refs.perc_comissao_vista.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : null;
      this.$refs.perc_comissao_prazo
        ? (this.$refs.perc_comissao_prazo.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : null;

      this.loadComissoes(this.usuarioStore.comissao);
    },
    edit(item) {
      this.mode = "edit";

      this.comissao = item;
      this.$refs.perc_comissao_vista.$el.getElementsByTagName(
        "input"
      )[0].value = this.comissao.perc_comissao_vista;
      this.$refs.perc_comissao_prazo.$el.getElementsByTagName(
        "input"
      )[0].value = this.comissao.perc_comissao_prazo;
    },
    loadComissoes(comissao) {
      if (!comissao.id_usuario) return;

      const url = `${urlBD}/usuarioComissoes/${comissao.id_usuario}?order=${this.pagination.sortBy}&desc=${this.pagination.descending}`;
      axios.get(url).then(res => {
        this.comissao.id_usuario = comissao.id_usuario;
        this.usuarioStore.comissoes = res.data;
      });
    },
    async save() {
      if (!this.$refs.form.validate()) return;

      const method = this.comissao.id ? "put" : "post";
      const id = this.comissao.id ? this.comissao.id : "";
      const urlcomissoes = `${urlBD}/usuarioComissoes/${id}`;

      if (!this.comissao.id_usuario)
        this.comissao.id_usuario = this.usuarioStore.currentUsuario.id;

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
            `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu a comissão ${this.usuarioStore.comissao.id} do tipo ${this.usuarioStore.comissao.tipo} e percentual ${this.usuarioStore.comissao.perc_comissao_vista}`
          );
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>
