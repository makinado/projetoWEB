<template>
  <div class="estoque">
    <v-dialog v-model="modalStore.produtos.estoque.visible" persistent max-width="1300">
      <v-card v-if="modalStore.produtos.estoque.visible">
        <v-card-title>
          <span
            class="headline"
          >{{ modalStore.produtos.estoque.title + ' do(a) ' + produtoStore.produto.descricao || '' }}</span>
        </v-card-title>

        <v-card-text>
          <v-layout row>
            <v-flex xs12>
              <v-tabs
                v-model="tabIndex"
                centered
                color="transparent"
                :slider-color="color"
                icons-and-text
              >
                <v-tab href="#tab-1">
                  ESTOQUE
                  <v-icon>fa fa-lg fa-th</v-icon>
                </v-tab>

                <v-tab href="#tab-2">
                  MOVIM. ESTOQUE
                  <v-icon>fa fa-lg fa-exchange</v-icon>
                </v-tab>

                <v-tab-item value="tab-1">
                  <v-card flat>
                    <v-card-text>
                      <v-container grid-list-xl>
                        <v-form ref="formEstoque" v-model="valid">
                          <v-layout wrap>
                            <v-flex xs12 md3>
                              <v-autocomplete
                                no-data-text="Nenhum resultado"
                                dense
                                :color="color"
                                label="Tipo de movimentação"
                                v-model="movim.tipo_movimentacao"
                                :items="tipoMovimItems"
                                :rules="tipoRules"
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md3>
                              <v-text-field
                                ref="quant"
                                :color="color"
                                label="Quantidade movimentação"
                                required
                                v-money="decimal"
                                v-model="movim.quantidade"
                                :rules="quantidadeRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md3>
                              <v-autocomplete
                                ref="origem"
                                no-data-text="Nenhum resultado"
                                dense
                                :color="color"
                                label="Origem"
                                :items="origens"
                                v-model="movim.origem"
                                :rules="origemRules"
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md3>
                              <v-menu
                                v-model="menu"
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
                                    ref="date"
                                    :color="color"
                                    v-model="computedDateFormatted"
                                    label="Data movimentação"
                                    prepend-icon="event"
                                    readonly
                                    v-on="on"
                                    :rules="dataRules"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  :color="color"
                                  v-model="movim.data_movimentacao"
                                  @input="menu = false"
                                  locale="pt-br"
                                ></v-date-picker>
                              </v-menu>
                            </v-flex>
                            <v-flex xs12>
                              <v-textarea
                                :color="color"
                                label="Alguma observação?"
                                box
                                required
                                v-model="movim.observacao"
                              ></v-textarea>
                            </v-flex>
                          </v-layout>
                        </v-form>
                      </v-container>

                      <span class="mb-4">Saldo do produto por empresa</span>
                      <v-data-table
                        :items="produtoStore.estoque"
                        :headers="fields"
                        rows-per-page-text="Registros por página"
                        no-data-text="Nenhum estoque cadastrado"
                        :rows-per-page-items="[5, 10, 20]"
                        :pagination.sync="pagination"
                      >
                        <template slot="items" slot-scope="data">
                          <td>{{ data.item.empresa }}</td>
                          <td>{{ data.item.produto }}</td>
                          <td>{{ data.item.valor_custo }}</td>
                          <td>{{ data.item.unidade }}</td>
                          <td>{{ data.item.quantidade }}</td>
                        </template>
                      </v-data-table>
                    </v-card-text>
                  </v-card>
                </v-tab-item>

                <v-tab-item value="tab-2">
                  <v-card flat>
                    <v-card-text>
                      <v-container grid-list-xl>
                        <v-layout wrap>
                          <v-flex xs12>
                            <p>* Selecione o período</p>
                          </v-flex>
                          <v-flex xs12 md6>
                            <v-menu
                              ref="date1"
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
                                v-model="date1"
                                @input="menu1 = false"
                                locale="pt-br"
                              ></v-date-picker>
                            </v-menu>
                          </v-flex>

                          <v-flex xs12 md5>
                            <v-menu
                              ref="date2"
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
                                v-model="date2"
                                @input="menu2 = false"
                                locale="pt-br"
                              ></v-date-picker>
                            </v-menu>
                          </v-flex>
                          <v-flex xs12 md1>
                            <v-btn
                              class="v-btn-common"
                              color="secondary"
                              @click="loadMovimEstoque()"
                            >
                              <v-icon>fa fa-lg fa-search</v-icon>
                            </v-btn>
                          </v-flex>
                        </v-layout>
                      </v-container>
                      <v-data-table
                        class="elevation-4"
                        :items="movimEstoqueItens"
                        :headers="fieldsMovimEstoq"
                        :pagination.sync="paginationMovim"
                        :rows-per-page-items="[10,20]"
                        rows-per-page-text="Registros por página"
                        no-results-text="Nenhum registro encontrado"
                        no-data-text="Nenhum registro"
                        :total-items="count"
                        item-key="id"
                        :expand="expand"
                        :loading="loading"
                      >
                        <template slot="items" slot-scope="data">
                          <td>{{ data.item.id }}</td>
                          <td>
                            <v-chip
                              :color="getColor(data.item.tipo_movimentacao)"
                              dark
                            >{{ data.item.tipo_movimentacao }}</v-chip>
                          </td>
                          <td>{{ data.item.data_movimentacao }}</td>
                          <td>{{ data.item.quantidade | decimal }}</td>
                          <td>{{ data.item.saldo | decimal }}</td>
                          <td>{{ data.item.custo_unitario | currency }}</td>
                          <td>{{ data.item.custo_medio | currency }}</td>
                          <td>{{ data.item.total | currency }}</td>
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
                                    @click="data.expanded = !data.expanded"
                                    class="mr-1"
                                  >
                                    <i class="fa fa-lg fa-eye"></i>
                                  </v-btn>
                                  <span>Ver detalhes</span>
                                </v-tooltip>
                                <v-tooltip bottom>
                                  <v-btn
                                    v-if="
                                      data.item.origem != 'COMPRA' &&
                                      data.item.origem != 'VENDA' 
                                    "
                                    slot="activator"
                                    icon
                                    dark
                                    @click.prevent="[confirmaExclusao = true, modalStore.produtos.estoque.movim = { id: data.item.id}]"
                                    class="mr-1"
                                    :disabled="(data.item.tipoStr === 'Entrada' || data.item.tipoStr === 'Saída') || (data.item.origem === 'Implantação de saldo' && movimEstoqueItens.length > 1)"
                                  >
                                    <i class="fa fa-lg fa-trash"></i>
                                  </v-btn>
                                  <span>Excluir movimentação</span>
                                </v-tooltip>
                              </v-card>
                            </v-menu>
                          </td>
                        </template>

                        <template slot="expand" slot-scope="data">
                          <v-card v-if="data.expanded" flat color="bege">
                            <v-card-title>
                              <span class="headline">Visualizar dados adicionais dessa movimentação</span>
                            </v-card-title>
                            <v-card-text>
                              <template v-if="data.item.origem == 'COMPRA'">
                                <h4>Origem - {{ data.item.origem }}</h4>
                                <h4>Empresa - {{ data.item.empresa }}</h4>
                                <h4>Fornecedor - {{ data.item.dados.fornecedor }}</h4>
                                <h4>Nota fiscal - {{ data.item.dados.nota_fiscal }}</h4>
                                <h4>Data da Nota fiscal - {{ formatDate(new Date(data.item.dados.data_notafiscal).toISOString().substr(0, 10)) }}</h4>
                                <h4>Observações - {{ data.item.observacao || "Nenhuma observação" }}</h4>
                              </template>
                              <template v-else-if="data.item.origem == 'VENDA'">
                                <h4>Origem - {{ data.item.origem }}</h4>
                                <h4>Empresa - {{ data.item.empresa }}</h4>
                                <h4>Cliente - {{ data.item.dados.cliente }}</h4>
                                <h4>Vendedor - {{ data.item.dados.vendedor }}</h4>
                                <h4>Nota fiscal - {{ data.item.dados.nota_fiscal }}</h4>
                                <h4>Data de lançamento - {{ formatDate(new Date(data.item.dados.data_criacao).toISOString().substr(0, 10)) }}</h4>
                                <h4>Observações - {{ data.item.observacao || "Nenhuma observação" }}</h4>
                              </template>
                              <template v-else>
                                <h4>
                                  <h4>Origem - {{ data.item.origem }}</h4>
                                  <h4>Empresa - {{ data.item.empresa }}</h4>
                                  <h4>Observações - {{ data.item.observacao || "Nenhuma observação" }}</h4>
                                </h4>
                              </template>
                            </v-card-text>
                          </v-card>
                        </template>
                      </v-data-table>
                    </v-card-text>
                  </v-card>
                </v-tab-item>
              </v-tabs>
            </v-flex>
          </v-layout>
        </v-card-text>

        <v-card-actions>
          <v-btn v-if="tabIndex === 'tab-2'" color="blue darken-1" flat @click="resetMovim">Limpar</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            flat
            @click="modalStore.produtos.estoque.visible = false"
          >Fechar</v-btn>
          <v-btn v-if="tabIndex !== 'tab-2'" color="blue darken-1" flat @click="save()">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="confirmaExclusao"
      persistent
      max-width="500px"
      v-if="modalStore.produtos.estoque.movim"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Excluir movimentação de estoque</span>
        </v-card-title>
        <v-card-text>Excluir movimento {{ modalStore.produtos.estoque.movim.id }} ?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="confirmaExclusao = false">Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="remove()">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
    
<script>
import { VMoney } from "v-money";
import { formatToBRL } from "brazilian-values";

import axios from "axios";
import { urlBD, showError, moneyToNumber, formatDate, saveLog } from "@/global";
import { mapState } from "vuex";

export default {
  directives: { money: VMoney },
  name: "Estoque",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["modalStore", "produtoStore", "usuarioStore", "empresaStore"]),
    computedDateFormatted() {
      return formatDate(this.movim.data_movimentacao);
    },
    computedDateFormatted1: {
      get() {
        return formatDate(this.date1);
      },
      set(value) {
        this.date1 = formatDate(value);
      }
    },
    computedDateFormatted2: {
      get() {
        return formatDate(this.date2);
      },
      set(value) {
        this.date2 = formatDate(value);
      }
    }
  },
  data() {
    return {
      estoque: {},
      movim: {},
      tabIndex: "tab-1",
      loading: false,
      expand: false,
      date1: "",
      date2: "",
      confirmaExclusao: false,
      expand: false,
      menu: false,
      menu1: false,
      menu2: false,
      valid: true,
      movimEstoque: {},
      movimEstoqueItens: [],
      fields: [
        { value: "empresa", text: "Empresa" },
        { value: "produto", text: "Produto" },
        { value: "valor_unitario", text: "Custo médio" },
        { value: "unidade", text: "Unidade" },
        { value: "quantidade", text: "Quantidade" }
      ],
      fieldsMovimEstoq: [
        { value: "id", text: "Código" },
        { value: "tipo_movimentacao", text: "Tipo", sortable: true },
        { value: "data_movimentacao", text: "Data", sortable: true },
        { value: "quantidade", text: "Quantidade" },
        { value: "saldo", text: "Saldo" },
        { value: "custo_unitario", text: "Custo unitário" },
        { value: "custo_medio", text: "Custo médio" },
        { value: "total", text: "Total" },
        { value: "actions", text: "Ações" }
      ],
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 5, // -1 for All,
        sortBy: "empresa",
        totalItems: 0
      },
      paginationMovim: {
        descending: false,
        page: 1,
        totalItems: 0,
        rowsPerPage: 20
      },
      count: 0,
      origens: [],
      tipoMovimItems: [
        { value: 0, text: "ENTRADA" },
        { value: 1, text: "SAÍDA" }
      ],
      decimal: {
        decimal: ",",
        thousands: ".",
        precision: 2
      },
      tipoRules: [v => v === 0 || v === 1 || "Tipo é obrigatório"],
      empresaRules: [v => !!v || "Empresa é obrigatória"],
      quantidadeRules: [
        v => (!!v && v !== "0,00") || "Quantidade é obrigatória"
      ],
      origemRules: [v => !!v || "Origem é obrigatória"],
      dataRules: [v => !!v || "Data é obrigatória"]
    };
  },
  watch: {
    "$store.state.modalStore.produtos.estoque.visible": function() {
      if (this.modalStore.produtos.estoque.visible) {
        this.limpaTela();
      }
    },
    paginationMovim() {
      this.loadMovimEstoque();
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    getColor(tipo) {
      if (tipo === "ENTRADA") return "green";
      else return "red";
    },
    limpaTela() {
      this.reset();
      this.loadEstoque(this.produtoStore.produto);
    },
    reset() {
      this.produto = {};
      this.movim = {};
      this.produtoStore.estoque = [];
      this.tabIndex = "tab-1";

      this.$refs.quant
        ? (this.$refs.quant.$el.getElementsByTagName("input")[0].value = 0)
        : "";
      this.$refs.formEstoque ? this.$refs.formEstoque.reset() : "";
      this.resetMovim();
    },
    resetEstoque() {
      this.produto = {};
      this.estoque = {};

      this.$refs.quant
        ? (this.$refs.quant.$el.getElementsByTagName("input")[0].value = 0)
        : "";
    },
    resetMovim() {
      this.date1 = "";
      this.date2 = "";
      this.movimEstoqueItens = [];

      this.loadMovimEstoque();
    },
    loadEstoque(produto) {
      if (produto) {
        const url = `${urlBD}/estoque/${produto.id}`;
        axios
          .get(url)
          .then(res => {
            this.produtoStore.estoque = res.data.map(estoque => {
              estoque.valor_custo = formatToBRL(estoque.valor_custo);
              estoque.quantidade = moneyToNumber(
                formatToBRL(estoque.quantidade)
              );

              return estoque;
            });

            if (this.produtoStore.estoque.length > 0) {
              this.origens = ["ACERTO DE ESTOQUE", "PERDA", "ROUBO"];
            } else {
              this.origens = ["IMPLANTAÇÃO DE SALDO"];
            }
          })
          .catch(showError);
      }
    },
    loadMovimEstoque() {
      if (this.produtoStore.produto) {
        this.movimEstoque.dataIni = this.date1;
        this.movimEstoque.dataFim = this.date2;

        const url = `${urlBD}/movimEstoque/${
          this.produtoStore.produto.id
        }?page=${this.paginationMovim.page}
        &limit=${this.paginationMovim.rowsPerPage}&orderBy=${this
          .paginationMovim.sortBy || ""}&desc=${
          this.paginationMovim.descending ? "desc" : "asc"
        }&data_inicial=${this.movimEstoque.dataIni || ""}&data_final=${this
          .movimEstoque.dataFim || ""}`;

        axios
          .get(url)
          .then(res => {
            this.count = res.data.count;
            this.paginationMovim.rowsPerPage = res.data.limit;
            this.movimEstoqueItens = res.data.data.map(movim => {
              movim.data_movimentacao = formatDate(
                new Date(movim.data_movimentacao).toISOString().substr(0, 10)
              );
              movim.tipo_movimentacao =
                movim.tipo_movimentacao === 0 ? "ENTRADA" : "SAÍDA";

              return movim;
            });
          })
          .catch(showError);
      } else {
        showError("Nenhum produto selecionado");
      }
    },
    save() {
      if (!this.$refs.formEstoque.validate()) return;

      let url = `${urlBD}/movimEstoque/${this.produto.id}`;
      this.movim.id_produto = this.produtoStore.produto.id;

      if (!this.movim.id_empresa)
        this.movim.id_empresa = this.empresaStore.currentEmpresa;

      axios
        .post(url, this.movim)
        .then(res => {
          this.$toasted.global.defaultSuccess();
          this.produto.estoque_total = moneyToNumber(formatToBRL(res.data));

          saveLog(
            new Date(),
            "GRAVAÇÃO",
            "MOVIMENTO DE ESTOQUE",
            `Usuário ${
              this.usuarioStore.currentUsuario.nome
            } ${"ADICIONOU"} uma movimentação ao produto ${
              this.produtoStore.produto.descricao
            }`
          );

          this.limpaTela();
        })
        .catch(showError);
    },
    remove() {
      const url = `${urlBD}/movimEstoque/${this.modalStore.produtos.estoque.movim.id}`;

      axios
        .delete(url)
        .then(res => {
          this.produto.estoque_total = res.data;
          this.limpaTela();

          this.$toasted.global.defaultSuccess();
          this.confirmaExclusao = false;

          saveLog(
            new Date(),
            "EXCLUSÃO",
            "MOVIMENTO DE ESTOQUE",
            `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu o movimento ${this.modalStore.produtos.estoque.movim.id}`
          );
        })
        .catch(showError);
    }
  }
};
</script>>

<style>
</style>