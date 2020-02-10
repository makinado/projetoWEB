<template>
  <div class="add-classificacao">
    <v-dialog v-model="modalStore.classificacoes.visible" persistent max-width="1000px">
      <v-card v-if="modalStore.classificacoes.visible">
        <v-card-title>Gerenciar classificações</v-card-title>
        <v-card-text>
          <v-container fluid grid-list-xl>
            <v-layout wrap>
              <v-flex xs12>
                <v-tabs v-model="tabIndex" centered color="#FFFFFF" light icons-and-text>
                  <v-tabs-slider :color="color"></v-tabs-slider>

                  <v-tab :color="color" href="#tab-1">
                    RECEITAS
                    <v-icon>fa fa-lg fa-arrow-down</v-icon>
                  </v-tab>

                  <v-tab :color="color" href="#tab-2">
                    DESPESAS
                    <v-icon>fa fa-lg fa-arrow-up</v-icon>
                  </v-tab>

                  <v-tab-item value="tab-1">
                    <v-card flat>
                      <v-card-text>
                        <v-container grid-list-xl>
                          <v-data-iterator
                            :items="classificacaoStore.classificacoes_receitas"
                            :pagination.sync="pagination"
                            content-tag="v-layout"
                            hide-actions
                            row
                            wrap
                            no-data-text="Nenhuma classificação de receita adicionada"
                          >
                            <template v-slot:item="data">
                              <v-flex xs12 md6>
                                <v-card>
                                  <v-card-title class="subheading font-weight-bold">
                                    <span>{{ data.item.descricao }}</span>
                                    <v-spacer></v-spacer>
                                    <v-icon
                                      :color="color"
                                      @click="[classificacaoStore.classificacao_pai = {}, classificacaoStore.classificacao = data.item, modalStore.classificacoes.add = true]"
                                    >fa fa-pencil</v-icon>
                                  </v-card-title>

                                  <v-divider></v-divider>

                                  <v-list dense>
                                    <v-list-tile
                                      v-for="children in data.item.children"
                                      :key="children.id"
                                    >
                                      <v-list-tile-content
                                        class="align-start"
                                      >{{ children.descricao }}</v-list-tile-content>
                                      <v-list-tile-action>
                                        <v-icon
                                          :color="color"
                                          @click="[classificacaoStore.classificacao_pai = data.item, classificacaoStore.classificacao = children, modalStore.classificacoes.deleteClass = true]"
                                        >fa fa-trash</v-icon>
                                      </v-list-tile-action>
                                      <v-list-tile-action>
                                        <v-icon
                                          :color="color"
                                          @click="[classificacaoStore.classificacao_pai = data.item, classificacaoStore.classificacao = children, modalStore.classificacoes.add = true]"
                                        >fa fa-pencil</v-icon>
                                      </v-list-tile-action>
                                    </v-list-tile>
                                  </v-list>
                                  <v-card-actions>
                                    <v-btn
                                      color="blue darken-1"
                                      flat
                                      @click="[classificacaoStore.classificacao_pai = null, classificacaoStore.classificacao = data.item, modalStore.classificacoes.deleteClass = true]"
                                    >Excluir</v-btn>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                      color="blue darken-1"
                                      flat
                                      @click="[classificacaoStore.classificacao_pai = data.item, classificacaoStore.classificacao = {}, modalStore.classificacoes.add = true]"
                                    >Adicionar</v-btn>
                                  </v-card-actions>
                                </v-card>
                              </v-flex>
                            </template>
                          </v-data-iterator>
                        </v-container>
                      </v-card-text>
                    </v-card>
                  </v-tab-item>

                  <v-tab-item value="tab-2">
                    <v-card flat>
                      <v-card-text>
                        <v-container grid-list-xl>
                          <v-data-iterator
                            :items="classificacaoStore.classificacoes_despesas"
                            :pagination.sync="pagination"
                            content-tag="v-layout"
                            hide-actions
                            row
                            wrap
                            no-data-text="Nenhuma classificação de receita adicionada"
                          >
                            <template v-slot:item="data">
                              <v-flex xs12 md6>
                                <v-card>
                                  <v-card-title class="subheading font-weight-bold">
                                    <span>{{ data.item.descricao }}</span>
                                    <v-spacer></v-spacer>
                                    <v-icon
                                      :color="color"
                                      @click="[classificacaoStore.classificacao_pai = {}, classificacaoStore.classificacao = data.item, modalStore.classificacoes.add = true]"
                                    >fa fa-pencil</v-icon>
                                  </v-card-title>

                                  <v-divider></v-divider>

                                  <v-list dense>
                                    <v-list-tile
                                      v-for="children in data.item.children"
                                      :key="children.id"
                                    >
                                      <v-list-tile-content
                                        class="align-start"
                                      >{{ children.descricao }}</v-list-tile-content>
                                      <v-list-tile-action>
                                        <v-icon
                                          :color="color"
                                          @click="[classificacaoStore.classificacao_pai = data.item, classificacaoStore.classificacao = children, modalStore.classificacoes.deleteClass = true]"
                                        >fa fa-trash</v-icon>
                                      </v-list-tile-action>
                                      <v-list-tile-action>
                                        <v-icon
                                          :color="color"
                                          @click="[classificacaoStore.classificacao_pai = data.item, classificacaoStore.classificacao = children, modalStore.classificacoes.add = true]"
                                        >fa fa-pencil</v-icon>
                                      </v-list-tile-action>
                                    </v-list-tile>
                                  </v-list>
                                  <v-card-actions>
                                    <v-btn
                                      color="blue darken-1"
                                      flat
                                      @click="[classificacaoStore.classificacao_pai = null, classificacaoStore.classificacao = data.item, modalStore.classificacoes.deleteClass = true]"
                                    >Excluir</v-btn>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                      color="blue darken-1"
                                      flat
                                      @click="[classificacaoStore.classificacao_pai = data.item, classificacaoStore.classificacao = {}, modalStore.classificacoes.add = true]"
                                    >Adicionar</v-btn>
                                  </v-card-actions>
                                </v-card>
                              </v-flex>
                            </template>
                          </v-data-iterator>
                        </v-container>
                      </v-card-text>
                    </v-card>
                  </v-tab-item>
                </v-tabs>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="blue darken-1"
            flat
            @click="[classificacaoStore.classificacao_pai = {}, classificacaoStore.classificacao = {}, modalStore.classificacoes.add = true]"
          >adicionar classificação</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            flat
            @click="modalStore.classificacoes.visible = false"
          >Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="modalStore.classificacoes.add" max-width="700px" persistent>
      <v-card v-if="modalStore.classificacoes.add">
        <v-card-title>{{ modalStore.classificacoes.title }}</v-card-title>
        <v-card-text>
          <v-container fluid grid-list-xl>
            <v-form v-model="valid" ref="form">
              <v-layout wrap>
                <v-text-field ref="id" v-show="false" v-model="classificacao.id"></v-text-field>
                <v-text-field ref="id_pai" v-show="false" v-model="classificacao.id_pai"></v-text-field>
                <v-text-field ref="tipo" v-show="false" v-model="classificacao.tipo"></v-text-field>
                <v-flex xs12>
                  <v-text-field
                    ref="descricao"
                    autofocus
                    :color="color"
                    label="Descrição"
                    v-model="classificacao.descricao"
                    :rules="descRules"
                    v-uppercase
                    @keyup.enter="save"
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="modalStore.classificacoes.add = false">Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="save">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="modalStore.classificacoes.deleteClass"
      persistent
      max-width="500px"
      v-if="classificacaoStore.classificacao"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Excluir classificacao</span>
        </v-card-title>
        <v-card-text>
          Excluir {{ classificacaoStore.classificacao.descricao }}
          <span
            v-if="classificacaoStore.classificacao_pai"
          >sub-categoria de {{ classificacaoStore.classificacao_pai.descricao }}</span> ?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            flat
            @click="modalStore.classificacoes.deleteClass = false"
          >Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="remove">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import { urlBD, showError, formatDate } from "@/global";
import { mapState } from "vuex";

export default {
  name: "AddClassificacoes",
  data: function() {
    return {
      tabIndex: "",
      classificacao: {},
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "tipo", text: "Tipo", sortable: true },
        { value: "descricao", text: "Descricao", sortable: true },
        { value: "path", text: "Caminho", sortable: true },
        { value: "actions", text: "Ações" }
      ],
      pagination: {
        page: 1,
        rowsPerPage: 20, // -1 for All,
        sortBy: "path",
        totalItems: 0
      },
      valid: true,
      descRules: [
        v => !!v || "Descrição é obrigatória",
        v =>
          (!!v && v.length >= 3) || "Descrição deve ter no mínimo 3 caracteres"
      ],
      tipoRules: [v => !!v || "Tipo é obrigatório"]
    };
  },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["modalStore", "classificacaoStore", "usuarioStore"])
  },
  watch: {
    "$store.state.modalStore.classificacoes.add": function() {
      if (this.modalStore.classificacoes.add) {
        this.reset();
        this.loadClassificacao(this.classificacaoStore.classificacao);
      }
    },
    "$store.state.modalStore.classificacoes.visible": function() {
      if (this.modalStore.classificacoes.visible) {
        this.loadClassificacoesTree();
        this.tabIndex = "tab-1";
      } else {
        this.loadClassificacoes();
      }
    }
  },
  methods: {
    getColor(tipo) {
      if (tipo === 1) return "green";
      else if (tipo === 2) return "red";
      else return "blue";
    },
    async reset() {
      this.classificacao = {};
      this.$refs.form ? this.$refs.form.reset() : "";
    },
    async loadClassificacao(clas) {
      this.classificacao = clas;
    },
    loadClassificacoesTree() {
      const url = `${urlBD}/classificacoes/tree`;
      axios
        .get(url)
        .then(res => {
          this.classificacaoStore.classificacoes = res.data.map(
            classificacao => {
              return {
                ...classificacao,
                value: classificacao.id,
                text: classificacao.descricao
              };
            }
          );

          this.classificacaoStore.classificacoes_receitas = this.classificacaoStore.classificacoes.filter(
            item => item.tipo === 1
          );
          this.classificacaoStore.classificacoes_despesas = this.classificacaoStore.classificacoes.filter(
            item => item.tipo === 2
          );
        })
        .catch(showError);
    },
    loadClassificacoes() {
      const url = `${urlBD}/classificacoes`;
      axios
        .get(url)
        .then(res => {
          this.classificacaoStore.classificacoes = res.data.map(
            classificacao => {
              return {
                ...classificacao,
                value: classificacao.id,
                text: classificacao.descricao
              };
            }
          );
        })
        .catch(showError);
    },
    save() {
      this.classificacao.id_pai = this.classificacaoStore.classificacao_pai
        ? this.classificacaoStore.classificacao_pai.id
        : null;
      this.classificacao.tipo = this.tabIndex === "tab-1" ? 1 : 2;

      if (!this.$refs.form.validate()) return;

      const method = this.classificacao.id ? "put" : "post";
      const id = this.classificacao.id ? this.classificacao.id : "";
      const urlclassificacoes = `${urlBD}/classificacoes/${id}`;

      let data = new Date();
      const hora = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`;
      const log = {
        id_usuario: this.usuarioStore.currentUsuario.id,
        data: formatDate(data.toISOString().substr(0, 10)),
        hora,
        tipo: method === "post" ? "GRAVAÇÂO" : "ALTERAÇÃO",
        tela: "classificacoes",
        detalhe:
          method === "post"
            ? `classificacao de ${
                this.classificacao.tipo === 1 ? "PESSOA" : "PRODUTO"
              } adicionada: ${this.classificacao.descricao}`
            : `classificacao de ${
                this.classificacao.tipo === 1 ? "PESSOA" : "PRODUTO"
              } alterada: ${this.classificacao.id}-${
                this.classificacao.descricao
              }`
      };

      axios[method](urlclassificacoes, this.classificacao)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          axios.post(`${urlBD}/log`, log).catch(showError);

          this.reset();
          this.loadClassificacoesTree();
          this.modalStore.classificacoes.add = false;
        })
        .catch(showError);
    },
    remove() {
      const urlclassificacoes = `${urlBD}/classificacoes/${this.classificacaoStore.classificacao.id}`;

      let data = new Date();
      const hora = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`;
      const log = {
        id_usuario: this.usuarioStore.currentUsuario.id,
        data: formatDate(data.toISOString().substr(0, 10)),
        hora,
        tipo: "EXCLUSÃO",
        tela: "classificacoes",
        detalhe: `classificacao de ${
          this.classificacao.tipo === 1 ? "PESSOA" : "PRODUTO"
        } excluída: ${this.classificacaoStore.classificacao.id}-${
          this.classificacaoStore.classificacao.descricao
        }`
      };

      axios
        .delete(urlclassificacoes)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          axios.post(`${urlBD}/log`, log).catch(showError);

          this.reset();
          this.loadClassificacoesTree();

          this.modalStore.classificacoes.deleteClass = false;
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>
