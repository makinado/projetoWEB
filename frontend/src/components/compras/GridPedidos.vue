<template>
  <div class="grid-import">
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
                          <v-switch label="Pendentes" :color="color" v-model="filter.pendentes"></v-switch>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-switch label="Concluídos" :color="color" v-model="filter.concluidos"></v-switch>
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
              :items="pessoaStore.fornecedores"
              clearable
            ></v-autocomplete>
          </v-layout>

          <v-layout justify-center>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                :color="color"
                @click.prevent="[comprasStore.pedido = null, modalStore.compras.pedidos.visible = true, modalStore.compras.pedidos.title = 'Adicionar pedido de compra']"
              >Adicionar</v-btn>
              <span>Adicionar pedido</span>
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
                      <v-switch label="Pendentes" :color="color" v-model="filter.pendentes"></v-switch>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-switch label="Concluídos" :color="color" v-model="filter.concluidos"></v-switch>
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
          :items="pessoaStore.fornecedores"
          clearable
        ></v-autocomplete>

        <v-spacer></v-spacer>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            class="v-btn-common"
            :color="color"
            @click.prevent="[comprasStore.pedido = null, modalStore.compras.pedidos.visible = true, modalStore.compras.pedidos.title = 'Adicionar pedido de compra']"
          >Adicionar</v-btn>
          <span>Adicionar pedido</span>
        </v-tooltip>
      </v-layout>
    </v-container>

    <Card :color="color" title="Ações rápidas" :actions="globalActions">
      <v-data-table
        :items="comprasStore.pedidos"
        :headers="fields"
        rows-per-page-text="Registros por página"
        no-results-text="Nenhum registro encontrado"
        no-data-text="Nenhuma compra realizada"
        :rows-per-page-items="[5, 10, 20, 50, 100]"
        :total-items="count"
        :pagination.sync="pagination"
        select-all
        v-model="itens_selecionados"
      >
        <template slot="items" slot-scope="data">
          <td>
            <v-checkbox v-model="data.selected" :color="color" hide-details></v-checkbox>
          </td>
          <td>{{ data.item.id }}</td>
          <td>{{ data.item.pessoa }}</td>
          <td>
            <v-chip :color="getColor(data.item.situacao)" dark>{{ data.item.situacao }}</v-chip>
          </td>
          <td>{{ data.item.nota_fiscal }}</td>
          <td>{{ data.item.data_pedido | date }}</td>
          <td>{{ data.item.valor_total | currency }}</td>
          <td>
            <v-tooltip bottom v-if="data.item.situacao === 'PENDENTE'">
              <v-btn slot="activator" icon class="mr-1" @click="concluirPedido">
                <i class="fa fa-lg fa-check"></i>
              </v-btn>
              <span>Concluir pedido</span>
            </v-tooltip>
            <v-tooltip bottom v-else>
              <v-btn slot="activator" icon class="mr-1">
                <i class="fa fa-lg fa-info"></i>
              </v-btn>
              <span>Informações do pedido</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                icon
                @click.prevent="[comprasStore.pedido = data.item, modalStore.compras.pedidos.visible = true,modalStore.compras.pedidos.title = 'Alterar pedido de compra']"
                class="mr-1"
              >
                <i class="fa fa-lg fa-pencil"></i>
              </v-btn>
              <span>Editar pedido</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                icon
                @click.prevent="[confirmaExclusao = true, comprasStore.pedido = data.item]"
                class="mr-1"
              >
                <i class="fa fa-lg fa-trash"></i>
              </v-btn>
              <span>Excluir pedido</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                icon
                @click.prevent="[modalStore.complementos.impressao = true]"
              >
                <i class="fa fa-lg fa-print"></i>
              </v-btn>
              <span>Exportar pedido</span>
            </v-tooltip>
          </td>
        </template>
      </v-data-table>
    </Card>

    <v-dialog v-model="finalizar" lazy max-width="700px">
      <v-card>
        <v-card-title class="headline">O que você deseja fazer?</v-card-title>
        <v-card-text>
          <v-card>
            <v-layout justify-center>
              <v-flex xs12 md6>
                <v-img
                  src="https://picsum.photos/id/2/300/200"
                  class="white--text mr-2"
                  height="200px"
                  gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                  @click="[finalizar = false, modalStore.compras.nfes.importar = true]"
                >
                  <v-card-title class="fill-height align-end">
                    <span>
                      <v-icon color="white">fa fa-2x fa-arrow-down</v-icon>
                      <v-spacer></v-spacer>
                      <h3>Importar XML</h3>
                    </span>
                  </v-card-title>
                </v-img>
              </v-flex>
              <v-flex xs12 md6>
                <v-img
                  src="https://picsum.photos/id/403/300/200"
                  class="white--text mr-2"
                  height="200px"
                  gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                  @click="[finalizar = false, modalStore.compras.nfes.add = true]"
                >
                  <v-card-title class="fill-height align-end">
                    <span>
                      <v-icon color="white">fa fa-2x fa-keyboard-o</v-icon>
                      <v-spacer></v-spacer>
                      <h3>Digitar o pedido</h3>
                    </span>
                  </v-card-title>
                </v-img>
              </v-flex>
            </v-layout>
          </v-card>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="finalizar = false">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmaExclusao" persistent max-width="500px" v-if="comprasStore.pedido">
      <v-card>
        <v-card-title>
          <span class="headline">Excluir pedido</span>
        </v-card-title>
        <v-card-text
          v-if="!Array.isArray(comprasStore.pedido)"
        >Excluir pedido {{ comprasStore.pedido.id }} no valor de {{ comprasStore.pedido.valor_total }}?</v-card-text>
        <v-card-text v-else>
          <v-flex xs12>Excluir {{ comprasStore.pedido.length }} pedidos?</v-flex>
          <v-flex xs12>
            <font color="red" v-if="confirmacao">
              <small>Você selecionou pedidos já concluidos, confirma exclusão?</small>
            </font>
          </v-flex>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            flat
            @click="[confirmaExclusao = false, confirmacao = false]"
          >Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="remove()">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import { urlBD, showError, formatDate } from "@/global";
import { mapState } from "vuex";

import { formatToBRL } from "brazilian-values";

export default {
  name: "GridPedidos",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["comprasStore", "modalStore", "pessoaStore", "empresaStore"]),
    computedDateFormatted1() {
      return formatDate(this.filter.data_inicial);
    },
    computedDateFormatted2() {
      return formatDate(this.filter.data_final);
    },
    params() {
      return {
        ...this.pagination,
        ...this.filter,
        ...this.empresaStore.currentEmpresa
      };
    }
  },
  components: {
    Card: () => import("../material/Card")
  },
  data() {
    return {
      valid: true,
      loading: true,
      itens_selecionados: [],
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "pessoa", text: "Fornecedor", sortable: true },
        { value: "situacao", text: "Situação", sortable: true },
        { value: "nota_fiscal", text: "Nota fiscal", sortable: true },
        { value: "data_pedido", text: "Data", sortable: true },
        { value: "valor_total", text: "Valor", sortable: true },
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
      finalizar: false,
      confirmaExclusao: false,
      confirmacao: false,
      concluir: false,
      cancelar: false,
      menu1: false,
      menu2: false,
      pesquisa: false,
      globalActions: [
        {
          icon: "fa fa-lg fa-check",
          tooltip: "Concluir selecionados",
          method: "concluirPedido"
        },
        {
          icon: "fa fa-lg fa-print",
          tooltip: "Imprimir selecionados",
          method: "print"
        },
        {
          icon: "fa fa-lg fa-trash",
          tooltip: "Excluir selecionados",
          method: "remove",
          store: "pedido"
        },
        {
          icon: "fa fa-lg fa-refresh",
          tooltip: "Recarregar itens",
          method: "loadPedidos",
          required: true
        }
      ]
    };
  },
  watch: {
    finalizar: function() {
      if (!this.finalizar) this.itens_selecionados = [];
    },
    params() {
      this.loadPedidos();
    },
    "$store.state.modalStore.compras.pedidos.visible": function() {
      if (!this.modalStore.compras.pedidos.visible) {
        this.loadPedidos();
      }
    }
  },
  methods: {
    getWindowSize() {
      return window.innerWidth / 2 - 150;
    },
    getColor(situacao) {
      if (situacao === "PENDENTE") return "blue";
      else if (situacao === "CANCELADO") return "red";
      else return "green";
    },
    concluirPedido() {
      this.finalizar = true;
    },
    async loadPedidos() {
      const url = `${urlBD}/pedidos?page=${this.pagination.page}&limit=${
        this.pagination.rowsPerPage
      }&empresa=${this.empresaStore.currentEmpresa || ""}&tipo=${this.filter
        .tipo || 1}&id=${this.filter.id || ""}&fornecedor=${this.filter
        .fornecedor || ""}&documento=${this.filter.documento ||
        ""}&tipo_data=${this.filter.tipo_data || ""}&data_inicial=${this.filter
        .data_inicial || ""}&data_final=${this.filter.data_final ||
        ""}&pendentes=${this.filter.pendentes || ""}&concluidos=${this.filter
        .concluidos || ""}`;

      axios.get(url).then(res => {
        this.comprasStore.pedidos = res.data.data;
        this.count = res.data.count;
        this.pagination.rowsPerPage = res.data.limit;
      });
    },
    async remove() {
      if (!this.confirmaExclusao) {
        this.confirmaExclusao = true;
        return;
      }

      let pedidos = [];

      if (!this.comprasStore.pedido.id) {
        pedidos = this.comprasStore.pedido.map(item => {
          return {
            id: item.id,
            valor_total: item.valor_total
          };
        });
      } else {
        pedidos.push({
          id: this.comprasStore.pedido.id,
          valor_total: this.comprasStore.pedido.valor_total
        });
      }

      const aux = financs.filter(item => item.situacao == "CONCLUÍDO");
      if (aux.length > 0 && !this.confirmacao) {
        this.confirmacao = true;
        return;
      }

      pedidos.map(async item => {
        const url = `${urlBD}/pedidos/${item.id}`;
        await axios
          .delete(url)
          .then(() => {
            this.$toasted.global.defaultSuccess();
            this.confirmaExclusao = false;
            this.compras_selecionadas = [];

            this.loadPedidos();

            saveLog(
              new Date(),
              "EXCLUSÃO",
              "PEDIDOS",
              `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu o pedido ${item.id} no valor de ${item.valor_total}`
            );
          })
          .catch(showError);
      });
    }
  },
  mounted() {
    this.$store.dispatch("loadFornecs");
  }
};
</script>

<style>
</style>