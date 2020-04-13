<template>
  <div class="grid-pessoas">
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
              max-width="500"
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
                            dense
                            :items="[{ value: 1, text: 'Pesquisa rápida'}, { value: 2, text: 'Pesquisa avançada'}]"
                            v-model="filter.tipo"
                          ></v-autocomplete>
                        </v-flex>
                      </v-layout>
                      <v-layout wrap>
                        <v-flex xs12 md6>
                          <v-text-field label="Código" v-model="filter.id"></v-text-field>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-text-field
                            label="CPF/CNPJ"
                            v-model="filter.cpf_cnpj"
                            v-mask="['###.###.###-##', '##.###.###/####-##']"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-text-field label="E-mail" v-model="filter.email"></v-text-field>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-autocomplete
                            label="Categoria"
                            dense
                            v-model="filter.categoria"
                            no-data-text="Nenhuma categoria cadastrada"
                            :items="categoriaStore.categorias"
                            clearable
                          ></v-autocomplete>
                        </v-flex>
                        <v-flex xs12 md4>
                          <v-switch label="Clientes" :color="color" v-model="filter.cliente"></v-switch>
                        </v-flex>
                        <v-flex xs12 md4>
                          <v-switch label="Fornecedores" :color="color" v-model="filter.fornecedor"></v-switch>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-switch
                            label="Transpotadoras"
                            :color="color"
                            v-model="filter.transportadora"
                          ></v-switch>
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
            ></v-text-field>
          </v-layout>

          <v-layout justify-center wrap>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                @click.prevent="[modalStore.categorias.visible = true, modalStore.categorias.title = 'Adicionar categoria de pessoa']"
                color="secondary"
                v-if="usuarioStore.currentUsuario.pessoa_create"
              >Categorias</v-btn>
              <span>Categorias de pessoas</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                :color="color"
                @click.prevent="[pessoaStore.pessoa = null,modalStore.pessoas.visible = true,modalStore.pessoas.title = 'Adicionar pessoa']"
                v-if="usuarioStore.currentUsuario.pessoa_create"
              >Adicionar</v-btn>
              <span>Adicionar pessoa</span>
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
          max-width="500"
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
                        dense
                        :items="[{ value: 1, text: 'Pesquisa rápida'}, { value: 2, text: 'Pesquisa avançada'}]"
                        v-model="filter.tipo"
                      ></v-autocomplete>
                    </v-flex>
                  </v-layout>
                  <v-layout wrap>
                    <v-flex xs12 md6>
                      <v-text-field label="Código" v-model="filter.id"></v-text-field>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field
                        label="CPF/CNPJ"
                        v-model="filter.cpf_cnpj"
                        v-mask="['###.###.###-##', '##.###.###/####-##']"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field label="E-mail" v-model="filter.email"></v-text-field>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-autocomplete
                        label="Categoria"
                        dense
                        v-model="filter.categoria"
                        no-data-text="Nenhuma categoria cadastrada"
                        :items="categoriaStore.categorias"
                        clearable
                      ></v-autocomplete>
                    </v-flex>
                    <v-flex xs12 md4>
                      <v-switch label="Clientes" :color="color" v-model="filter.cliente"></v-switch>
                    </v-flex>
                    <v-flex xs12 md4>
                      <v-switch label="Fornecedores" :color="color" v-model="filter.fornecedor"></v-switch>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-switch
                        label="Transpotadoras"
                        :color="color"
                        v-model="filter.transportadora"
                      ></v-switch>
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
            @click.prevent="[modalStore.categorias.visible = true, modalStore.categorias.title = 'Adicionar categoria de pessoa']"
            color="secondary"
            v-if="usuarioStore.currentUsuario.pessoa_create"
          >Categorias</v-btn>
          <span>Categorias de pessoas</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn
            slot="activator"
            class="v-btn-common"
            :color="color"
            @click.prevent="[pessoaStore.pessoa = null,modalStore.pessoas.visible = true,modalStore.pessoas.title = 'Adicionar pessoa']"
            v-if="usuarioStore.currentUsuario.pessoa_create"
          >Adicionar</v-btn>
          <span>Adicionar pessoa</span>
        </v-tooltip>
      </v-layout>
    </v-container>

    <Card :color="color" title="Ações rápidas" :actions="globalActions">
      <v-data-table
        :items="pessoaStore.pessoas"
        :headers="fields"
        rows-per-page-text="Registros por página"
        no-results-text="Nenhum registro encontrado"
        no-data-text="Nenhuma pessoa encontrada"
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
          <td>{{ data.item.nome }}</td>
          <td>{{ data.item.cpf }}</td>
          <td>{{ data.item.cnpj }}</td>
          <td>{{ data.item.email }}</td>
          <td>{{ data.item.contato }}</td>
          <td>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                icon
                @click.prevent="[pessoaStore.pessoa = data.item, modalStore.pessoas.visible = true,modalStore.pessoas.title = 'Alterar pessoa']"
                class="mr-1"
                v-if="usuarioStore.currentUsuario.pessoa_update"
              >
                <i class="fa fa-lg fa-pencil"></i>
              </v-btn>
              <span>Editar pessoa</span>
            </v-tooltip>

            <v-tooltip bottom>
              <v-btn
                slot="activator"
                icon
                @click.prevent="[confirmaExclusao = true, pessoaStore.pessoa = data.item]"
                class="mr-1"
                v-if="usuarioStore.currentUsuario.pessoa_delete"
              >
                <i class="fa fa-lg fa-trash"></i>
              </v-btn>
              <span>Excluir pessoa</span>
            </v-tooltip>

            <v-tooltip bottom>
              <v-btn
                slot="activator"
                icon
                @click.prevent="[modalStore.email.visible = true, modalStore.email.para = data.item.email]"
              >
                <i class="fa fa-lg fa-envelope"></i>
              </v-btn>
              <span>Enviar e-mail</span>
            </v-tooltip>
          </td>
        </template>
      </v-data-table>
    </Card>

    <v-dialog v-model="confirmaExclusao" persistent max-width="500px" v-if="pessoaStore.pessoa">
      <v-card>
        <v-card-title>
          <span class="headline">Excluir pessoa</span>
        </v-card-title>

        <v-card-text
          v-if="!Array.isArray(pessoaStore.pessoa)"
        >Excluir {{ pessoaStore.pessoa.nome }}?</v-card-text>
        <v-card-text v-else>
          <v-flex xs12>Excluir {{ pessoaStore.pessoa.length }} pessoas?</v-flex>
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
  name: "GridPessoas",
  components: {
    Card: () => import("../material/Card")
  },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "pessoaStore",
      "categoriaStore",
      "modalStore",
      "usuarioStore"
    ]),
    params() {
      return {
        ...this.pagination,
        ...this.filter
      };
    }
  },
  watch: {
    params() {
      this.loadPessoas();
    },
    "$store.state.modalStore.pessoas.visible"() {
      if (!this.modalStore.pessoas.visible) {
        this.loadPessoas();
      }
    },
    pesquisa() {
      if (this.pesquisa) {
        this.$store.dispatch("loadCategoriasPessoas");
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
        { value: "cpf", text: "CPF", sortable: true },
        { value: "cnpj", text: "CNPJ", sortable: true },
        { value: "email", text: "E-mail", sortable: true },
        { value: "contato", text: "Contato", sortable: false },
        { value: "actions", text: "Ações", sortable: false }
      ],
      filter: {},
      concluir: false,
      pesquisa: false,
      confirmaExclusao: false,
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 20, // -1 for All,
        sortBy: "nome",
        totalItems: 0
      },
      count: 0,
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
          store: "pessoa"
        },
        {
          icon: "fa fa-lg fa-refresh",
          tooltip: "Recarregar itens",
          method: "loadPessoas",
          required: true
        }
      ]
    };
  },
  methods: {
    getWindowSize() {
      return window.innerWidth / 2 - 150;
    },
    navigate(path, newTab) {
      if (newTab) {
        const routeData = this.$router.resolve({ path: path });
        window.open(routeData.href, "_blank");
      } else {
        this.$router.push({ path: path });
      }
    },
    async loadPessoas() {
      this.loading = true;

      const url = `${urlBD}/pessoas?page=${this.pagination.page}&limit=${
        this.pagination.rowsPerPage
      }&order=${this.pagination.sortBy || ""}&desc=${
        this.pagination.descending ? "desc" : "asc"
      }&tipo=${this.filter.tipo || 1}&id=${this.filter.id || ""}&nome=${this
        .filter.nome || ""}&email=${this.filter.email || ""}&contato=${this
        .filter.contato || ""}&cpf_cnpj=${this.filter.cpf_cnpj ||
        ""}&categoria=${this.filter.categoria || ""}&cliente=${this.filter
        .cliente || ""}&fornecedor=${this.filter.fornecedor ||
        ""}&vendedor=${this.filter.vendedor || ""}&funcionario=${this.filter
        .funcionario || ""}&transportadora=${this.filter.transportadora || ""}`;

      axios
        .get(url)
        .then(res => {
          this.pessoaStore.pessoas = res.data.data;
          this.count = res.data.count;
          this.pagination.rowsPerPage = res.data.limit;
        })
        .catch(showError)
        .finally(() => (this.loading = false));
    },
    async remove() {
      if (!this.confirmaExclusao) {
        this.confirmaExclusao = true;
        return;
      }

      var pessoas = [];

      if (!this.pessoaStore.pessoa.id) {
        pessoas = this.pessoaStore.pessoa.map(item => {
          return {
            id: item.id,
            nome: item.nome
          };
        });
      } else {
        pessoas.push({
          id: this.pessoaStore.pessoa.id,
          valor_parcela: this.pessoaStore.pessoa.nome
        });
      }

      pessoas.map(async item => {
        const url = `${urlBD}/pessoas/${item.id}`;

        await axios
          .delete(url)
          .then(() => {
            this.$toasted.global.defaultSuccess();

            this.loadPessoas();
            this.confirmaExclusao = false;

            saveLog(
              new Date(),
              "EXCLUSÃO",
              "PESSOAS",
              `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu a pessoa ${this.pessoaStore.pessoa.nome}`
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
