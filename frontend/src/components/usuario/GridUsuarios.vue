<template>
  <div class="grid-usuarios">
    <v-container fluid>
      <v-layout
        justify-center
        v-if="$vuetify.breakpoint.name === 'xs' || $vuetify.breakpoint.name === 'sm' || $vuetify.breakpoint.name === 'md'"
      >
        <v-flex xs12>
          <v-layout justify-center>
            <v-menu
              :close-on-content-click="false"
              bottom
              right
              min-width="300"
              max-width="600"
              offset-x
              transition="slide-y-transition"
              v-model="pesquisa"
            >
              <v-btn slot="activator" :color="color" icon>
                <v-icon>fa fa-lg fa-filter</v-icon>
              </v-btn>
              <v-card flat color="bege">
                <v-card-text>
                  <v-container grid-list-xl>
                    <v-form v-model="valid" ref="form">
                      <v-layout wrap>
                        <v-flex xs12>
                          <v-autocomplete
                            label="Selecione"
                            :items="[{value: 1, text:'Pesquisa rápida'}, {value: 2, text:'Pesquisa avançada'}]"
                            v-model="filter.tipo"
                          ></v-autocomplete>
                        </v-flex>
                      </v-layout>
                      <v-layout wrap>
                        <v-flex xs12 md6>
                          <v-text-field label="Código" v-model="filter.id"></v-text-field>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-text-field label="E-mail" v-model="filter.email"></v-text-field>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-text-field
                            label="Contato"
                            v-model="filter.contato"
                            v-mask="['(##)####-####', '(##)#####-####']"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                    </v-form>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="blue darken-1" flat @click="filter = {}">Limpar pesquisa</v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>

            <v-text-field
              label="Procurar por nome"
              clearable
              :color="color"
              v-model="filter.nome"
              append-icon="fa fa-search"
            />
          </v-layout>

          <v-layout justify-center>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                :color="color"
                @click.prevent="[ usuarioStore.usuario = null,modalStore.usuarios.visible = true,modalStore.usuarios.title = 'Adicionar usuario']"
                v-if="usuarioStore.currentUsuario.usuario_create"
              >Adicionar</v-btn>
              <span>Adicionar usuário</span>
            </v-tooltip>
          </v-layout>
        </v-flex>
      </v-layout>

      <v-layout v-else justify-space-between align-center>
        <v-menu
          :close-on-content-click="false"
          bottom
          right
          min-width="300"
          max-width="600"
          offset-x
          transition="slide-y-transition"
          v-model="pesquisa"
        >
          <v-btn slot="activator" :color="color" icon>
            <v-icon>fa fa-lg fa-filter</v-icon>
          </v-btn>
          <v-card flat color="bege">
            <v-card-text>
              <v-container grid-list-xl>
                <v-form v-model="valid" ref="form">
                  <v-layout wrap>
                    <v-flex xs12>
                      <v-autocomplete
                        label="Selecione"
                        :items="[{value: 1, text:'Pesquisa rápida'}, {value: 2, text:'Pesquisa avançada'}]"
                        v-model="filter.tipo"
                      ></v-autocomplete>
                    </v-flex>
                  </v-layout>
                  <v-layout wrap>
                    <v-flex xs12 md6>
                      <v-text-field label="Código" v-model="filter.id"></v-text-field>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field label="E-mail" v-model="filter.email"></v-text-field>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field
                        label="Contato"
                        v-model="filter.contato"
                        v-mask="['(##)####-####', '(##)#####-####']"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-form>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-btn color="blue darken-1" flat @click="filter = {}">Limpar pesquisa</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
        <v-text-field
          label="Procurar por nome"
          clearable
          :color="color"
          v-model="filter.nome"
          append-icon="fa fa-search"
        />

        <v-spacer></v-spacer>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            class="v-btn-common"
            :color="color"
            @click.prevent="[ usuarioStore.usuario = null,modalStore.usuarios.visible = true,modalStore.usuarios.title = 'Adicionar usuario']"
            v-if="usuarioStore.currentUsuario.usuario_create"
          >Adicionar</v-btn>
          <span>Adicionar usuário</span>
        </v-tooltip>
      </v-layout>
    </v-container>

    <Card :color="color" title="Ações rápidas" :actions="globalActions">
      <v-data-table
        :items="usuarioStore.usuarios"
        :headers="fields"
        rows-per-page-text="Registros por página"
        no-results-text="Nenhum registro encontrado"
        no-data-text="Nenhum usuário cadastrado"
        :rows-per-page-items="[5, 10, 20, 50, 100]"
        :total-items="count"
        :pagination.sync="pagination"
        v-model="itens_selecionados"
        select-all
        :loading="loading"
      >
        <template slot="items" slot-scope="data">
          <td>
            <v-checkbox v-model="data.selected" :color="color" hide-details></v-checkbox>
          </td>
          <td>{{ data.item.id }}</td>
          <td @dblclick="edit(data.item)">{{ data.item.nome }}</td>
          <td>{{ data.item.email }}</td>
          <td>{{ data.item.contato }}</td>
          <td>
            <v-menu offset-y left>
              <v-btn icon slot="activator">
                <v-icon>fa fa-lg fa-ellipsis-v</v-icon>
              </v-btn>
              <v-card :color="color">
                <v-tooltip bottom>
                  <v-btn
                    slot="activator"
                    icon
                    dark
                    @click.prevent="[usuarioStore.meta.id_usuario = data.item.id, modalStore.usuarios.metas.visible = true, modalStore.usuarios.metas.title = `Gerenciar metas do(a) ${data.item.nome}`]"
                    v-if="usuarioStore.currentUsuario.usuario_update"
                  >
                    <i class="fa fa-lg fa-line-chart"></i>
                  </v-btn>
                  <span>Metas</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn
                    slot="activator"
                    icon
                    dark
                    @click.prevent="[usuarioStore.comissao.id_usuario = data.item.id, modalStore.usuarios.comissoes.visible = true, modalStore.usuarios.comissoes.title = `Gerenciar comissões do(a) ${data.item.nome}`]"
                    v-if="usuarioStore.currentUsuario.usuario_update"
                  >
                    <i class="fa fa-lg fa-usd"></i>
                  </v-btn>
                  <span>Comissões</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn
                    slot="activator"
                    icon
                    dark
                    @click.prevent="edit(data.item)"
                    class="mr-1"
                    v-if="usuarioStore.currentUsuario.usuario_update"
                  >
                    <i class="fa fa-lg fa-pencil"></i>
                  </v-btn>
                  <span>Editar usuário</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn
                    slot="activator"
                    icon
                    dark
                    @click.prevent="[confirmaExclusao = true,usuarioStore.usuario = data.item]"
                    class="mr-1"
                    v-if="usuarioStore.currentUsuario.usuario_delete"
                  >
                    <i class="fa fa-lg fa-trash"></i>
                  </v-btn>
                  <span>Excluir usuário</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn
                    slot="activator"
                    icon
                    dark
                    @click.prevent="[modalStore.email.visible = true, modalStore.email.para = data.item.email]"
                  >
                    <i class="fa fa-lg fa-envelope"></i>
                  </v-btn>
                  <span>Enviar e-mail</span>
                </v-tooltip>
              </v-card>
            </v-menu>
          </td>
        </template>
      </v-data-table>
    </Card>

    <v-dialog v-model="confirmaExclusao" persistent max-width="500px" v-if="usuarioStore.usuario">
      <v-card>
        <v-card-title>
          <span class="headline">Excluir usuario</span>
        </v-card-title>
        <v-card-text
          v-if="!Array.isArray(usuarioStore.usuario)"
        >Excluir {{ usuarioStore.usuario.nome }}?</v-card-text>
        <v-card-text v-else>
          <v-flex xs12>Excluir {{ usuarioStore.usuario.length }} usuarios?</v-flex>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="[confirmaExclusao = false]">Fechar</v-btn>
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
  name: "Gridusuarios",
  components: {
    Card: () => import("../material/Card")
  },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["usuarioStore", "modalStore"]),
    params() {
      return {
        ...this.pagination,
        ...this.filter
      };
    }
  },
  watch: {
    params() {
      this.loadUsuarios();
    },
    "$store.state.modalStore.usuarios.visible"() {
      if (
        !this.modalStore.usuarios.visible &&
        this.usuarioStore.usuario != null
      ) {
        this.loadUsuarios();
      }
    }
  },
  data() {
    return {
      itens_selecionados: [],
      valid: true,
      loading: false,
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "nome", text: "Nome", sortable: true },
        { value: "email", text: "E-mail", sortable: true },
        { value: "contato", text: "Contato", sortable: false },
        { value: "actions", text: "Ações", sortable: false }
      ],
      filter: {},
      concluir: false,
      pesquisa: false,
      confirmaExclusao: false,
      count: 0,
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 20, // -1 for All,
        sortBy: "nome",
        totalItems: 0
      },
      globalActions: [
        {
          icon: "fa fa-lg fa-print",
          tooltip: "Imprimir selecionados",
          method: "print"
        },
        {
          icon: "fa fa-lg fa-trash",
          tooltip: "Excluir selecionados",
          method: "remove",
          store: "usuario"
        },
        {
          icon: "fa fa-lg fa-refresh",
          tooltip: "Recarregar itens",
          method: "loadUsuarios",
          required: true
        }
      ]
    };
  },
  methods: {
    edit(item) {
      this.usuarioStore.usuario = item;
      this.modalStore.usuarios.visible = true;
      this.modalStore.usuarios.title = "Alterar usuario";
    },
    loadUsuarios() {
      this.loading = true;

      const url = `${urlBD}/usuarios?page=${this.pagination.page}&limit=${
        this.pagination.rowsPerPage
      }&order=${this.pagination.sortBy || ""}&desc=${
        this.pagination.descending ? "desc" : "asc"
      }&tipo=${this.filter.tipo || 1}&id=${this.filter.id || ""}&nome=${this
        .filter.nome || ""}&email=${this.filter.email || ""}&contato=${this
        .filter.contato || ""}`;

      axios
        .get(url)
        .then(res => {
          this.usuarioStore.usuarios = res.data.data;
          this.count = res.data.count;
          this.pagination.rowsPerPage = res.data.limit;
        })
        .catch(showError)
        .finally(() => (this.loading = false));
    },
    remove() {
      if (!this.confirmaExclusao) {
        this.confirmaExclusao = true;
        return;
      }

      var usuarios = [];

      if (!this.usuarioStore.usuario.id) {
        usuarios = this.usuarioStore.usuario.map(item => {
          return {
            id: item.id,
            nome: item.nome
          };
        });
      } else {
        usuarios.push({
          id: this.usuarioStore.usuario.id,
          nome: this.usuarioStore.usuario.nome
        });
      }

      if (usuarios.find(u => u.id == this.usuarioStore.currentUsuario.id)) {
        this.confirmaExclusao = false;
        return showError("Não é possível excluir a si mesmo");
      }

      usuarios.map(async item => {
        const url = `${urlBD}/usuarios/${item.id}`;

        await axios
          .delete(url)
          .then(() => {
            this.$toasted.global.defaultSuccess();

            this.loadUsuarios();
            this.confirmaExclusao = false;

            saveLog(
              new Date(),
              "EXCLUSÃO",
              "USUÁRIOS",
              `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu o usuário ${this.usuarioStore.usuario.nome}`
            );
          })
          .catch(showError);
      });
    }
  }
};
</script>

<style>
</style>
