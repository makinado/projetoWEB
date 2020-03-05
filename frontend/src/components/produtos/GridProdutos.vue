<template>
  <div class="grid-produtos">
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
              @keyup.enter
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
                          <v-autocomplete
                            label="Categoria"
                            dense
                            v-model="filter.categoria"
                            no-data-text="Nenhuma categoria cadastrada"
                            :items="categoriaStore.categorias"
                            clearable
                          ></v-autocomplete>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-autocomplete
                            label="Marca"
                            dense
                            v-model="filter.marca"
                            no-data-text="Nenhuma marca cadastrada"
                            :items="produtoStore.marcas"
                            clearable
                          ></v-autocomplete>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-autocomplete
                            label="Unidade"
                            dense
                            v-model="filter.unidade"
                            no-data-text="Nenhuma unidade cadastrada"
                            :items="produtoStore.unidades"
                            clearable
                          ></v-autocomplete>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-switch
                            label="Estoque mínimo"
                            :color="color"
                            v-model="filter.estoque_min"
                          ></v-switch>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-switch
                            label="Estoque máximo"
                            :color="color"
                            v-model="filter.estoque_max"
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
              label="Procurar por descrição"
              clearable
              :color="color"
              v-model="filter.descricao"
              append-icon="fa fa-search"
            />
          </v-layout>

          <v-layout justify-center wrap>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                @click.prevent="[ modalStore.grupo_trib.visible = true, modalStore.grupo_trib.title = 'Gerenciar grupos de tributação']"
                color="info"
              >Grupos tributação</v-btn>
              <span>Grupos de tributação</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                @click.prevent="[modalStore.categorias.visible = true, modalStore.categorias.title = 'Adicionar categoria de produto']"
                color="danger"
              >Categorias</v-btn>
              <span>Categorias de produtos</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                @click.prevent="[modalStore.marcas.visible = true, modalStore.marcas.title = 'Adicionar marca']"
                color="warning"
              >Marcas</v-btn>
              <span>Marcas de produtos</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                @click.prevent="[produtoStore.unidade = null, modalStore.unidades.visible = true, modalStore.unidades.title = 'Adicionar unidade']"
                color="secondary"
              >Unidades</v-btn>
              <span>Unidades de produtos</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                :color="color"
                @click.prevent="[produtoStore.produto = null,modalStore.produtos.visible = true,modalStore.produtos.title = 'Adicionar produto', categoriaStore.loadCategorias = 'Produto']"
              >Adicionar</v-btn>
              <span>Adicionar produto</span>
            </v-tooltip>
          </v-layout>
        </v-flex>
      </v-layout>

      <!-- layout desktop -->
      <v-layout v-else justify-space-between align-center>
        <v-menu
          :close-on-content-click="false"
          bottom
          right
          min-width="300"
          max-width="600"
          offset-x
          transition="slide-y-transition"
          @keyup.enter
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
                      <v-autocomplete
                        label="Categoria"
                        dense
                        v-model="filter.categoria"
                        no-data-text="Nenhuma categoria cadastrada"
                        :items="categoriaStore.categorias"
                        clearable
                      ></v-autocomplete>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-autocomplete
                        label="Marca"
                        dense
                        v-model="filter.marca"
                        no-data-text="Nenhuma marca cadastrada"
                        :items="produtoStore.marcas"
                        clearable
                      ></v-autocomplete>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-autocomplete
                        label="Unidade"
                        dense
                        v-model="filter.unidade"
                        no-data-text="Nenhuma unidade cadastrada"
                        :items="produtoStore.unidades"
                        clearable
                      ></v-autocomplete>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-switch label="Estoque mínimo" :color="color" v-model="filter.estoque_min"></v-switch>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-switch label="Estoque máximo" :color="color" v-model="filter.estoque_max"></v-switch>
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
          label="Procurar por descrição"
          clearable
          :color="color"
          v-model="filter.descricao"
          append-icon="fa fa-search"
        />

        <v-spacer></v-spacer>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            class="v-btn-common"
            @click.prevent="[ modalStore.grupo_trib.visible = true]"
            color="info"
          >Grupos tributação</v-btn>
          <span>Grupos de tributação</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn
            slot="activator"
            class="v-btn-common"
            @click.prevent="[modalStore.categorias.visible = true, modalStore.categorias.title = 'Adicionar categoria de produto']"
            color="danger"
          >Categorias</v-btn>
          <span>Categorias de produtos</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn
            slot="activator"
            class="v-btn-common"
            @click.prevent="[modalStore.marcas.visible = true, modalStore.marcas.title = 'Adicionar marca']"
            color="warning"
          >Marcas</v-btn>
          <span>Marcas de produtos</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn
            slot="activator"
            class="v-btn-common"
            @click.prevent="[produtoStore.unidade = null, modalStore.unidades.visible = true, modalStore.unidades.title = 'Adicionar unidade']"
            color="secondary"
          >Unidades</v-btn>
          <span>Unidades de produtos</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn
            slot="activator"
            class="v-btn-common"
            :color="color"
            @click.prevent="[produtoStore.produto = null,modalStore.produtos.visible = true,modalStore.produtos.title = 'Adicionar produto', categoriaStore.loadCategorias = 'Produto']"
          >Adicionar</v-btn>
          <span>Adicionar produto</span>
        </v-tooltip>
      </v-layout>
    </v-container>

    <Card :color="color" title="Ações rápidas" :actions="globalActions">
      <v-data-table
        v-model="itens_selecionados"
        :items="produtoStore.produtos"
        :headers="fields"
        rows-per-page-text="Registros por página"
        no-results-text="Nenhum registro encontrado"
        no-data-text="Nenhum produto cadastrado"
        :rows-per-page-items="[5, 10, 20, 50, 100]"
        :total-items="count"
        :pagination.sync="pagination"
        select-all
      >
        <v-progress-linear slot="progress" color="blue" height="3" indeterminate></v-progress-linear>
        <template slot="items" slot-scope="data">
          <td>
            <v-checkbox v-model="data.selected" :color="color" hide-details></v-checkbox>
          </td>
          <td>{{ data.item.id }}</td>
          <td>{{ data.item.descricao }}</td>
          <td>{{ data.item.categoria }}</td>
          <td>{{ data.item.marca }}</td>
          <td>{{ data.item.valor_venda | currency }}</td>
          <td>{{ data.item.qtdEstoque | decimal }}</td>
          <td>
            <v-tooltip bottom>
              <b-button
                slot="activator"
                variant="secundary"
                @click.prevent="[produtoStore.produto = data.item, modalStore.produtos.visible = true, modalStore.produtos.title = 'Alterar produto']"
                class="mr-1"
              >
                <i class="fa fa-lg fa-pencil"></i>
              </b-button>
              <span>Editar produto</span>
            </v-tooltip>
            <v-tooltip bottom>
              <b-button
                slot="activator"
                variant="secundary"
                @click.prevent="[confirmaExclusao = true,produtoStore.produto = data.item]"
                class="mr-1"
              >
                <i class="fa fa-lg fa-trash"></i>
              </b-button>
              <span>Excluir produto</span>
            </v-tooltip>
            <v-tooltip bottom>
              <b-button
                slot="activator"
                variant="secundary"
                class="mr-1"
                @click.prevent="[modalStore.produtos.estoque.visible = true, produtoStore.produto = data.item]"
              >
                <i class="fa fa-lg fa-th"></i>
              </b-button>
              <span>Estoque do produto</span>
            </v-tooltip>
          </td>
        </template>
      </v-data-table>
    </Card>

    <v-dialog
      v-model="confirmaExclusao"
      persistent
      max-width="500px"
      v-if="produtoStore.produto"
      lazy
    >
      <v-card>
        <v-card-title>
          <span class="headline">Excluir parcela</span>
        </v-card-title>
        <v-card-text
          v-if="!Array.isArray(produtoStore.produto)"
        >Excluir {{ produtoStore.produto.descricao }} ?</v-card-text>
        <v-card-text v-else>
          <v-flex xs12>Excluir {{ produtoStore.produto.length }} produtos?</v-flex>
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
import { VMoney } from "v-money";
import axios from "axios";
import { urlBD, showError, moneyToNumber, formatDate, saveLog } from "@/global";
import { mapState } from "vuex";

import { formatToBRL } from "brazilian-values";

export default {
  directives: { money: VMoney },
  name: "GridProdutos",
  components: {
    Card: () => import("../material/Card")
  },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "produtoStore",
      "modalStore",
      "categoriaStore",
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
      this.loadProdutos();
    },
    "$store.state.modalStore.produtos.visible": function() {
      if (!this.modalStore.produtos.visible) {
        this.loadProdutos();
      }
    },
    "$store.state.modalStore.produtos.estoque.visible": function() {
      if (!this.modalStore.produtos.estoque.visible) {
        this.loadProdutos();
      }
    },
    pesquisa: function() {
      if (this.pesquisa) {
        this.$store.dispatch("loadCategoriasProdutos");
        this.$store.dispatch("loadMarcas");
        this.$store.dispatch("loadUnidades");
      }
    }
  },
  data: function() {
    return {
      itens_selecionados: [],
      valid: true,
      true: true,
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "descricao", text: "Descricao", sortable: true },
        { value: "categoria", text: "Categoria", sortable: true },
        { value: "marca", text: "Marca", sortable: true },
        { value: "valor_venda", text: "Valor venda", sortable: true },
        { value: "qtdEstoque", text: "Estoque total", sortable: true },
        { value: "actions", text: "Ações" }
      ],
      filter: {},
      concluir: false,
      pesquisa: false,
      confirmaExclusao: false,
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 20, // -1 for All,
        sortBy: "descricao",
        totalItems: 0
      },
      count: 0,
      money: {
        decimal: ",",
        thousands: ".",
        prefix: "R$ ",
        precision: 2
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
          store: "produto"
        },
        {
          icon: "fa fa-lg fa-refresh",
          tooltip: "Recarregar itens",
          method: "loadProdutos",
          required: true
        }
      ]
    };
  },
  methods: {
    getWindowSize() {
      return window.innerWidth / 2 - 150;
    },
    async loadProdutos() {
      const url = `${urlBD}/produtos?page=${
        this.pagination.page
      }&limit=${this.pagination.rowsPerPage}&tipo=${this.filter.tipo ||
        1}&id=${this.filter.id || ""}&descricao=${this.filter.descricao ||
        ""}&categoria=${this.filter.categoria || ""}&marca=${this.filter
        .marca || ""}&unidade=${this.filter.unidade || ""}&estoque_min=${this
        .filter.estoque_min || ""}&estoque_max=${this.filter.estoque_max ||
        ""}`;

      axios.get(url).then(res => {
        this.produtoStore.produtos = res.data.data;
        this.count = res.data.count;
        this.pagination.rowsPerPage = res.data.limit;
      });
    },
    async remove() {
      if (!this.confirmaExclusao) {
        this.confirmaExclusao = true;
        return;
      }

      var produtos = [];

      if (!this.produtoStore.produto.id) {
        produtos = this.produtoStore.produto.map(item => {
          return {
            id: item.id,
            descricao: item.descricao
          };
        });
      } else {
        produtos.push({
          id: this.produtoStore.produto.id,
          descricao: this.produtoStore.produto.descricao
        });
      }

      pessoas.map(async item => {
        const url = `${urlBD}/produtos/${item.id}`;

        await axios
          .delete(url)
          .then(() => {
            this.$toasted.global.defaultSuccess();

            this.loadProdutos();
            this.confirmaExclusao = false;

            saveLog(
              new Date(),
              "EXCLUSÃO",
              "PRODUTOS",
              `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu o produto ${this.produtoStore.produto.descricao}`
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