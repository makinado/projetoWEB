<template>
  <div class="grid-importacoes">
    <v-container fluid>
      <v-menu
        :close-on-content-click="false"
        :close-on-click="false"
        width="300"
        nudge-left="12"
        transition="slide-y-transition"
        v-model="funcoes"
        :position-x="getWindowSize()"
        
      >
        <v-card>
          <v-card-title class="headline">
            <v-icon class="mr-2">fa fa-cogs</v-icon>
            <span>Selecione uma opção</span>
          </v-card-title>
          <v-card-text>
            <hr />
            <v-layout wrap justify-center>
              <v-tooltip bottom>
                <v-btn
                  slot="activator"
                  flat
                  icon
                  color="danger"
                  @click="[comprasStore.compra = compras_selecionadas, modalStore.compras.deleteCompra = true]"
                >
                  <v-icon>fa fa-2x fa-trash</v-icon>
                </v-btn>
                <span>Excluir conta</span>
              </v-tooltip>
              <v-tooltip bottom>
                <v-btn
                  slot="activator"
                  flat
                  icon
                  color="primary"
                  @click="[modalStore.complementos.impressao.docs = compras_selecionadas, modalStore.complementos.impressao.visible = true]"
                >
                  <v-icon>fa fa-2x fa-print</v-icon>
                </v-btn>
                <span>Exportar conta</span>
              </v-tooltip>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-menu>
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
                            :items="['Pesquisa rápida', 'Pesquisa avançada']"
                            v-model="filter.tipo"
                          ></v-autocomplete>
                        </v-flex>
                      </v-layout>
                      <v-layout wrap>
                        <v-flex xs12 md6>
                          <v-text-field label="Código" v-model="filter.id"></v-text-field>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-text-field label="Nota fiscal" v-model="filter.documento"></v-text-field>
                        </v-flex>
                        <v-flex xs12>
                          <v-autocomplete
                            label="Pesquisar por data"
                            dense
                            auto-select-first
                            :items="[{ value: 1, text: 'Data do pedido', selected: true }, { value: 2, text: 'Data de lançamento' }]"
                            v-model="filter.tipo_data"
                          ></v-autocomplete>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-menu
                            ref="date"
                            v-model="menu1"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            lazy
                            transition="scale-transition"
                            offset-y
                            full-width
                            max-width="290px"
                            min-width="290px"
                          >
                            <template v-slot:activator="{ on }">
                              <v-text-field
                                :color="color"
                                v-model="computedDateFormatted1"
                                label="Data inicial"
                                prepend-icon="event"
                                readonly
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-date-picker
                              :color="color"
                              v-model="filter.data_inicial"
                              @input="menu1 = false"
                              locale="pt-br"
                            ></v-date-picker>
                          </v-menu>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-menu
                            ref="date"
                            v-model="menu2"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            lazy
                            transition="scale-transition"
                            offset-y
                            full-width
                            max-width="290px"
                            min-width="290px"
                          >
                            <template v-slot:activator="{ on }">
                              <v-text-field
                                :color="color"
                                v-model="computedDateFormatted2"
                                label="Data final"
                                prepend-icon="event"
                                readonly
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-date-picker
                              :color="color"
                              v-model="filter.data_final"
                              @input="menu2 = false"
                              locale="pt-br"
                            ></v-date-picker>
                          </v-menu>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-switch label="concluidas" :color="color" v-model="filter.concluidas"></v-switch>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-switch label="Concluídos" :color="color" v-model="filter.canceladas"></v-switch>
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
            <v-autocomplete
              label="Procurar por fornecedor"
              :color="color"
              v-model="filter.fornecedor"
              dense
              :items="pessoaStore.pessoas"
              clearable
            ></v-autocomplete>
          </v-layout>

          <v-layout justify-center>
            <v-btn
              class="v-btn-common"
              color="secondary"
              @click.prevent="[comprasStore.compra = null, modalStore.compras.compras.importar = true, modalStore.compras.compras.title = 'Importar NF-e de compra']"
            >Importar</v-btn>
            <v-btn
              class="v-btn-common"
              :color="color"
              @click.prevent="[comprasStore.compra = null, modalStore.compras.compras.add = true, modalStore.compras.compras.title = 'Adicionar NF-e de compra']"
            >Adicionar</v-btn>
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
                        :items="['Pesquisa rápida', 'Pesquisa avançada']"
                        v-model="filter.tipo"
                      ></v-autocomplete>
                    </v-flex>
                  </v-layout>
                  <v-layout wrap>
                    <v-flex xs12 md6>
                      <v-text-field label="Código" v-model="filter.id"></v-text-field>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field label="Nota fiscal" v-model="filter.documento"></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-autocomplete
                        label="Pesquisar por data"
                        dense
                        auto-select-first
                        :items="[{ value: 1, text: 'Data do pedido', selected: true }, { value: 2, text: 'Data de lançamento' }]"
                        v-model="filter.tipo_data"
                      ></v-autocomplete>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-menu
                        ref="date"
                        v-model="menu1"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        lazy
                        transition="scale-transition"
                        offset-y
                        full-width
                        max-width="290px"
                        min-width="290px"
                      >
                        <template v-slot:activator="{ on }">
                          <v-text-field
                            :color="color"
                            v-model="computedDateFormatted1"
                            label="Data inicial"
                            prepend-icon="event"
                            readonly
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          :color="color"
                          v-model="filter.data_inicial"
                          @input="menu1 = false"
                          locale="pt-br"
                        ></v-date-picker>
                      </v-menu>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-menu
                        ref="date"
                        v-model="menu2"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        lazy
                        transition="scale-transition"
                        offset-y
                        full-width
                        max-width="290px"
                        min-width="290px"
                      >
                        <template v-slot:activator="{ on }">
                          <v-text-field
                            :color="color"
                            v-model="computedDateFormatted2"
                            label="Data final"
                            prepend-icon="event"
                            readonly
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          :color="color"
                          v-model="filter.data_final"
                          @input="menu2 = false"
                          locale="pt-br"
                        ></v-date-picker>
                      </v-menu>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-switch label="Concluídas" :color="color" v-model="filter.concluidas"></v-switch>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-switch label="Canceladas" :color="color" v-model="filter.canceladas"></v-switch>
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
        <v-autocomplete
          label="Procurar por fornecedor"
          :color="color"
          v-model="filter.fornecedor"
          dense
          :items="pessoaStore.pessoas"
          clearable
        ></v-autocomplete>

        <v-spacer></v-spacer>

        <v-btn
          class="v-btn-common"
          color="secondary"
          @click.prevent="[comprasStore.compra = null, modalStore.compras.compras.importar = true, modalStore.compras.compras.title = 'Importar nota fiscal de compra']"
        >Importar</v-btn>
        <v-btn
          class="v-btn-common"
          :color="color"
          @click.prevent="[comprasStore.compra = null, modalStore.compras.compras.add = true, modalStore.compras.compras.title = 'Adicionar nota fiscal de compra']"
        >Adicionar</v-btn>
      </v-layout>
    </v-container>
    <v-data-table
      class="elevation-5"
      :items="comprasStore.compras"
      :headers="fields"
      rows-per-page-text="Registros por página"
      no-results-text="Nenhum registro encontrado"
      no-data-text="Nenhuma compra realizada"
      :rows-per-page-items="[5, 10, 20, 50, 100]"
      :total-items="count"
      :pagination.sync="pagination"
      :loading="loading"
      select-all
      v-model="compras_selecionadas"
    >
      <v-progress-linear slot="progress" color="blue" height="3" indeterminate></v-progress-linear>
      <template slot="items" slot-scope="data">
        <td>
          <v-checkbox v-model="data.selected" :color="color" hide-details></v-checkbox>
        </td>
        <td>{{ data.item.id }}</td>
        <td>{{ data.item.empresa }}</td>
        <td>{{ data.item.pessoa }}</td>
        <td>
          <v-chip :color="getColor(data.item.situacao)" dark>{{ data.item.situacao }}</v-chip>
        </td>
        <td>{{ data.item.nota_fiscal }}</td>
        <td>{{ data.item.data_notafiscal }}</td>
        <td>{{ data.item.data_lancamento }}</td>
        <td>{{ data.item.valor_total }}</td>
        <td>
          <v-tooltip v-if="!data.item.importado" bottom>
            <b-button
              slot="activator"
              variant="secundary"
              class="mr-1"
              @click.prevent="[comprasStore.compra = data.item, modalStore.compras.compras.add = true, modalStore.produtos.title = 'Alterar nota fiscal de compra']"
            >
              <i class="fa fa-lg fa-pencil"></i>
            </b-button>
            <span>Editar compra</span>
          </v-tooltip>
          <v-tooltip v-else bottom>
            <b-button
              slot="activator"
              variant="secundary"
              class="mr-1"
              @click.prevent="gerarDANFe(data.item)"
            >
              <i class="fa fa-lg fa-eye"></i>
            </b-button>
            <span>Visualizar DANFe</span>
          </v-tooltip>
          <v-tooltip bottom>
            <b-button
              slot="activator"
              variant="secundary"
              class="mr-1"
              @click.prevent="[modalStore.compras.deleteCompra = true, comprasStore.compra = data.item]"
            >
              <i class="fa fa-lg fa-trash"></i>
            </b-button>
            <span>Excluir compra</span>
          </v-tooltip>
        </td>
      </template>
    </v-data-table>

    <v-dialog
      v-model="modalStore.compras.deleteCompra"
      persistent
      max-width="500px"
      v-if="comprasStore.compra"
      lazy
    >
      <v-card>
        <v-card-title>
          <span class="headline">Excluir parcela</span>
        </v-card-title>
        <v-card-text
          v-if="!Array.isArray(comprasStore.compra)"
        >Cancelar conta {{ comprasStore.compra.id }} no valor de {{ comprasStore.compra.valor_total }}?</v-card-text>
        <v-card-text v-else>
          <v-flex xs12>Excluir {{ comprasStore.compra.length }} compras?</v-flex>
          <v-flex xs12>
            <font color="red" v-if="confirmacao">
              <small>Você selecionou compras já concluidas, confirma exclusão?</small>
            </font>
          </v-flex>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            flat
            @click="[modalStore.compras.deleteCompra = false, confirmacao = false]"
          >Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="remove()">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <Impressao />
  </div>
</template>

<script>
import axios from "axios";
import { urlBD, showError, formatDate, loadFornecs, saveLog } from "@/global";
import { mapState } from "vuex";

import { formatToBRL } from "brazilian-values";

export default {
  name: "GridImportacoes",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["comprasStore", "modalStore", "pessoaStore", "usuarioStore"]),
    computedDateFormatted1() {
      return formatDate(this.filter.data_inicial);
    },
    computedDateFormatted2() {
      return formatDate(this.filter.data_final);
    },
    params() {
      return {
        ...this.pagination,
        ...this.filter
      };
    }
  },
  components: {
    Impressao: () => import("@/components/complementos/Impressao")
  },
  watch: {
    compras_selecionadas: function() {
      if (this.compras_selecionadas.length > 1) {
        this.funcoes = true;
      } else {
        this.funcoes = false;
      }
    },
    params() {
      this.loadCompras();
    },
    "$store.state.modalStore.compras.compras.importar": function() {
      if (!this.modalStore.compras.compras.importar) {
        this.loadCompras();
      }
    },
    "$store.state.modalStore.compras.compras.add": function() {
      if (!this.modalStore.compras.compras.add) {
        this.loadCompras();
      }
    }
  },
  data: function() {
    return {
      compras_selecionadas: [],
      valid: true,
      loading: true,
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "empresa", text: "Empresa", sortable: true },
        { value: "pessoa", text: "Pessoa", sortable: true },
        { value: "situacao", text: "Situação", sortable: true },
        { value: "nota_fiscal", text: "Nota fiscal", sortable: true },
        { value: "data_notafiscal", text: "Data NF-e", sortable: true },
        { value: "data_lancamento", text: "Data lançamento", sortable: true },
        { value: "valor_total", text: "Valor total", sortable: true },
        { value: "actions", text: "Ações" }
      ],
      filter: {},
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 20, // -1 for All,
        sortBy: "situacao",
        totalItems: 0
      },
      count: 0,
      concluir: false,
      menu1: false,
      menu2: false,
      pesquisa: false,
      funcoes: false,
      confirmacao: false
    };
  },
  methods: {
    getWindowSize() {
      return window.innerWidth / 2 - 150;
    },
    getColor(situacao) {
      if (situacao === "CONCLUÍDA") return "green";
      else if (situacao === "CANCELADA") return "red";
      else return "blue";
    },
    async gerarDANFe(compra) {
      if (!compra.xml) return showError("Erro, arquivo xml não encontrado!");

      const url = `${urlBD}/compras/gerarDANFe`;
      axios
        .post(url, compra)
        .then(res => this.$toasted.global.defaultSuccess())
        .catch(showError);
    },
    async loadCompras() {
      const url = `${urlBD}/compras?page=${this.pagination.page}&limit=${
        this.pagination.rowsPerPage
      }&tipo=${this.filter.tipo || 1}&id=${this.filter.id ||
        ""}&fornecedor=${this.filter.fornecedor || ""}&documento=${this.filter
        .documento || ""}&tipo_data=${this.filter.tipo_data ||
        ""}&data_inicial=${this.filter.data_inicial || ""}&data_final=${this
        .filter.data_final || ""}&concluidas=${this.filter.concluidas ||
        ""}&canceladas=${this.filter.canceladas || ""}`;

      axios.get(url).then(res => {
        this.comprasStore.compras = res.data.data.map(compra => {
          compra.data_notafiscal = formatDate(
            new Date(compra.data_notafiscal).toISOString().substr(0, 10)
          );
          compra.data_lancamento = formatDate(
            new Date(compra.data_lancamento).toISOString().substr(0, 10)
          );
          compra.valor_total = formatToBRL(compra.valor_total);

          return compra;
        });
        this.count = res.data.count;
        this.pagination.rowsPerPage = res.data.limit;
      });
    },
    async remove() {
      let itens = [];

      if (!this.comprasStore.compra.id) {
        itens = this.comprasStore.compra.map(item => {
          return {
            id: item.id,
            valor_total: item.valor_total
          };
        });
      } else {
        itens.push({
          id: this.comprasStore.compra.id,
          valor_total: this.comprasStore.compra.valor_total
        });
      }

      itens.map(async item => {
        const url = `${urlBD}/compras/${item.id}`;
        await axios
          .delete(url)
          .then(() => {
            this.$toasted.global.defaultSuccess();
            this.modalStore.compras.deleteCompra = false;
            this.compras_selecionadas = [];

            this.loadCompras();

            saveLog(
              new Date(),
              "EXCLUSÃO",
              "COMPRAS",
              `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu a compra ${item.id} no valor de ${item.valor_total}`
            );
          })
          .catch(showError);
      });
    }
  },
  mounted() {
    loadFornecs();
  }
};
</script>

<style>
</style>