<template>
  <div>
    <v-dialog
      v-model="modalStore.compras.compras.add"
      fullscreen
      persistent
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card v-if="modalStore.compras.compras.add">
        <v-toolbar dense flat extended fixed extension-height="5" dark :color="color">
          <v-toolbar-side-icon
            @click="[comprasStore.compra = null, modalStore.compras.compras.add = false]"
          >
            <v-icon>close</v-icon>
          </v-toolbar-side-icon>
          <v-toolbar-title
            class="headline white--text font-weight-light"
          >{{ modalStore.compras.compras.title }}</v-toolbar-title>

          <v-spacer></v-spacer>

          <v-tooltip bottom v-if="!modalStore.compras.compras.title.includes('Visualizar')">
            <v-btn slot="activator" class="mr-3" icon @click="limpaTela">
              <v-icon>fa fa-2x fa-eraser</v-icon>
            </v-btn>
            <span>Limpar tela</span>
          </v-tooltip>
          <v-tooltip bottom v-if="!modalStore.compras.compras.title.includes('Visualizar')">
            <v-btn slot="activator" class="mr-3" :loading="isLoading" icon @click="save">
              <v-icon>fa fa-2x fa-check</v-icon>
            </v-btn>
            <span>Salvar compra</span>
          </v-tooltip>
          <v-tooltip bottom v-if="!modalStore.compras.compras.title.includes('Visualizar')">
            <v-btn slot="activator" class="mr-3" icon>
              <v-icon>fa fa-2x fa-cog</v-icon>
            </v-btn>
            <span>Configurações</span>
          </v-tooltip>
        </v-toolbar>

        <v-card-text>
          <v-container fluid grid-list-xl class="my-5">
            <v-form v-model="valid" ref="form">
              <v-text-field label="id" v-model="compra.id" v-show="false"></v-text-field>
              <v-text-field v-model="compra.id_empresa" v-show="false"></v-text-field>
              <v-layout wrap>
                <v-flex xs12 md3>
                  <v-autocomplete
                    class="tag-input"
                    dense
                    :color="color"
                    label="Fornecedor*"
                    chips
                    :items="pessoaStore.fornecedores"
                    prepend-icon="fa fa-lg fa-plus-circle"
                    @click:prepend="[pessoaStore.pessoa = null, modalStore.pessoas.visible = true, modalStore.pessoas.title = 'Adicionar pessoa']"
                    v-model="compra.id_pessoa"
                    no-data-text="Nenhum fornecedor cadastrado"
                    :rules="pessoaRules"
                    @focus="$store.dispatch('loadFornecs')"
                    deletable-chips
                    :search-input.sync="searchFornec"
                  >
                    <template v-slot:no-data>
                      <v-btn
                        type="submit"
                        color="secondary"
                        flat
                        small
                        v-if="searchFornec"
                        @click="$store.dispatch('addFornecedor', { nome: searchFornec })"
                      >
                        <span>
                          <v-icon>fa fa-lg fa-plus-circle</v-icon>
                          {{ searchFornec }}
                        </span>
                      </v-btn>
                    </template>
                  </v-autocomplete>
                </v-flex>
                <v-flex xs12 md3>
                  <v-autocomplete
                    class="tag-input ml-3"
                    chips
                    dense
                    deletable-chips
                    :color="color"
                    label="Pedido"
                    :items="comprasStore.pedidos"
                    v-model="compra.id_pedido"
                    no-data-text="Parece que não há pedidos pendentes"
                    @focus="$store.dispatch('loadPedidos')"
                    @change="selectPedido"
                  ></v-autocomplete>
                </v-flex>
                <v-spacer></v-spacer>
              </v-layout>
            </v-form>

            <v-container fluid>
              <v-layout justify-start wrap class="bege mb-4">
                <v-flex xs12 md6>
                  <v-card flat>
                    <v-layout justify-center wrap>
                      <v-card-title>
                        <span class="headline">Dados da compra</span>
                      </v-card-title>
                      <v-card-text>
                        <v-container grid-list-xl>
                          <v-form v-model="valid1" ref="form1">
                            <v-layout wrap>
                              <v-flex xs12 md4>
                                <v-text-field
                                  v-model="compra.nota_fiscal"
                                  :color="color"
                                  label="Nota fiscal"
                                  :rules="notaRules"
                                ></v-text-field>
                              </v-flex>
                              <v-flex xs12 md4>
                                <v-menu
                                  v-model="menu"
                                  :close-on-content-click="false"
                                  :nudge-right="40"
                                  transition="scale-transition"
                                  offset-y
                                  full-width
                                  max-width="290px"
                                  min-width="290px"
                                >
                                  <template v-slot:activator="{ on }">
                                    <v-text-field
                                      :color="color"
                                      v-model="computedDateFormatted"
                                      label="Data Nota fiscal"
                                      prepend-icon="event"
                                      readonly
                                      v-on="on"
                                      :rules="dataRules"
                                    ></v-text-field>
                                  </template>
                                  <v-date-picker
                                    :color="color"
                                    v-model="compra.data_notafiscal"
                                    @input="menu = false"
                                    locale="pt-br"
                                  ></v-date-picker>
                                </v-menu>
                              </v-flex>
                              <v-flex xs12 md4>
                                <v-menu
                                  v-model="menu1"
                                  :close-on-content-click="false"
                                  :nudge-right="40"
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
                                      label="Data de lançamento"
                                      prepend-icon="event"
                                      readonly
                                      v-on="on"
                                      :rules="dataRules"
                                    ></v-text-field>
                                  </template>
                                  <v-date-picker
                                    :color="color"
                                    v-model="compra.data_lancamento"
                                    @input="menu1 = false"
                                    locale="pt-br"
                                  ></v-date-picker>
                                </v-menu>
                              </v-flex>
                              <v-flex xs12>
                                <v-textarea
                                  :color="color"
                                  label="Alguma observação?"
                                  box
                                  v-model="compra.observacao"
                                ></v-textarea>
                              </v-flex>
                            </v-layout>
                          </v-form>
                        </v-container>
                      </v-card-text>
                    </v-layout>
                  </v-card>
                </v-flex>
                <v-flex xs12 md6>
                  <v-card flat>
                    <v-layout justify-center wrap>
                      <v-card-title>
                        <span class="headline">Totalizadores</span>
                      </v-card-title>
                      <v-card-text>
                        <v-container grid-list-xl>
                          <v-layout wrap>
                            <v-flex xs12 md3>
                              <v-tooltip bottom>
                                <v-text-field
                                  slot="activator"
                                  prepend-icon="fa fa-question"
                                  ref="valor_frete"
                                  v-model="compra.valor_frete"
                                  :color="color"
                                  label="VALOR DO FRETE"
                                  v-money="money"
                                  @blur="setValores"
                                ></v-text-field>
                                <span>Informe os produtos do pedido e preencha este campo para dividir o frete entre os produtos</span>
                              </v-tooltip>
                            </v-flex>
                            <v-flex xs12 md3>
                              <v-tooltip bottom>
                                <v-text-field
                                  slot="activator"
                                  prepend-icon="fa fa-question"
                                  ref="valor_seguro"
                                  v-model="compra.valor_seguro"
                                  :color="color"
                                  label="VALOR DO SEGURO"
                                  v-money="money"
                                  @blur="setValores"
                                ></v-text-field>
                                <span>Informe os produtos do pedido e preencha este campo para dividir o seguro entre os produtos</span>
                              </v-tooltip>
                            </v-flex>
                            <v-flex xs12 md3>
                              <v-text-field
                                ref="valor_desconto"
                                v-model="compra.valor_desconto"
                                :color="color"
                                label="VALOR DE DESCONTO"
                                v-money="money"
                                @blur="[calcDesconto = false, setDesconto()]"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md3>
                              <v-text-field
                                ref="outras_despesas"
                                v-model="compra.outras_despesas"
                                :color="color"
                                label="VALOR DE OUTRAS DESPESAS"
                                v-money="money"
                                @blur="calcTotal"
                              ></v-text-field>
                            </v-flex>
                          </v-layout>

                          <v-layout wrap class>
                            <v-flex xs12 md3>
                              <v-text-field
                                ref="valor_produtos"
                                v-model="compra.valor_produtos"
                                :color="color"
                                label="VALOR TOTAL DOS PRODUTOS"
                                placeholder="R$ 0,00"
                                readonly
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md3>
                              <v-text-field
                                ref="valor_total"
                                v-model="compra.valor_total"
                                :color="color"
                                label="VALOR TOTAL DA COMPRA"
                                placeholder="R$ 0,00"
                                readonly
                              ></v-text-field>
                            </v-flex>
                          </v-layout>
                        </v-container>
                      </v-card-text>
                    </v-layout>
                  </v-card>
                </v-flex>
              </v-layout>

              <v-flex xs12>
                <v-layout justify-center>
                  <v-icon class="my-4 mr-1">fa fa-2x fa-archive</v-icon>
                  <h2>Produtos</h2>
                </v-layout>
                <v-divider></v-divider>
              </v-flex>
              <v-layout align-end>
                <span>Edite valores e quantidades do produto diretamente na tabela</span>
                <v-spacer></v-spacer>
                <v-tooltip bottom>
                  <v-btn
                    slot="activator"
                    class="v-btn-common"
                    :color="color"
                    @click="addProduto()"
                  >Adicionar produto</v-btn>
                  <span>Adicionar novo produto à compra</span>
                </v-tooltip>
              </v-layout>
            </v-container>

            <v-data-table
              class="elevation-5 mb-3"
              :items="produtos_compra"
              :headers="fieldsProdutos"
              :pagination.sync="paginationProd"
              :rows-per-page-items="[5, 10, 20, 50]"
              rows-per-page-text="Produtos por página"
              no-data-text="Nenhum produto adicionado"
            >
              <template slot="items" slot-scope="data">
                <td>{{ data.item.sequencia }}</td>
                <td>
                  <v-flex xs8>
                    <v-autocomplete
                      class="tag-input"
                      chips
                      deletable-chips
                      v-model="data.item.id"
                      label="Selecione"
                      :items="produtoStore.produtos"
                      prepend-icon="fa fa-lg fa-plus-circle"
                      @click:prepend="modalStore.produtos.visible = true"
                      @change="[loadDados(data.item)]"
                      auto-select-first
                      :search-input.sync="searchProduto"
                      dense
                      no-data-text="Nenhum produto cadastrado"
                      @focus="$store.dispatch('loadProdutos')"
                    >
                      <template v-slot:no-data>
                        <v-btn
                          type="submit"
                          color="secondary"
                          flat
                          small
                          v-if="searchProduto"
                          @click="$store.dispatch('addProduto', { descricao: searchProduto })"
                        >
                          <span>
                            <v-icon>fa fa-lg fa-plus-circle</v-icon>
                            {{ searchProduto }}
                          </span>
                        </v-btn>
                      </template>
                    </v-autocomplete>
                  </v-flex>
                </td>
                <td>
                  <v-flex xs12 md6>
                    <v-text-field
                      class="mt-2"
                      v-model="data.item.cfop"
                      v-money="cfop"
                      @blur="[calcTotal(data.item)]"
                    ></v-text-field>
                  </v-flex>
                </td>
                <td>
                  <v-flex xs12 md6>
                    <v-text-field
                      class="mt-2"
                      v-model="data.item.quantidade"
                      v-money="decimal"
                      @blur="[calcTotal(data.item)]"
                    ></v-text-field>
                  </v-flex>
                </td>
                <td>
                  <v-flex xs12 md6>
                    <v-text-field
                      class="mt-2"
                      v-model="data.item.valor_unitario"
                      v-money="money"
                      @blur="[calcTotal(data.item)]"
                    ></v-text-field>
                  </v-flex>
                </td>
                <td>
                  <v-flex xs12 md6>
                    <v-text-field
                      v-if="disable"
                      class="mt-2"
                      v-model="data.item.valor_seguro"
                      v-money="money"
                      @blur="[calcTotal(data.item)]"
                    ></v-text-field>
                    <span v-else>{{ data.item.valor_seguro }}</span>
                  </v-flex>
                </td>
                <td>
                  <v-flex xs12 md6>
                    <v-text-field
                      v-if="disable"
                      class="mt-2"
                      v-model="data.item.valor_frete"
                      v-money="money"
                      @blur="[calcTotal(data.item)]"
                    ></v-text-field>
                    <span v-else>{{ data.item.valor_frete }}</span>
                  </v-flex>
                </td>
                <td>
                  <v-flex xs12 md6>
                    <v-text-field
                      class="mt-2"
                      v-model="data.item.valor_desconto"
                      v-money="money"
                      @blur="[calcDesconto = true, calcTotal(data.item)]"
                    ></v-text-field>
                  </v-flex>
                </td>
                <td>{{ data.item.valor_total || "0,00" }}</td>
                <td>
                  <v-flex xs12 md6>
                    <v-text-field
                      class="mt-2"
                      v-model="data.item.dif_aliquota"
                      v-money="percent"
                      @blur="[calcTotal(data.item)]"
                    ></v-text-field>
                  </v-flex>
                </td>
                <td>
                  <v-flex xs12 md6>
                    <v-text-field
                      class="mt-2"
                      v-model="data.item.perc_custo_adicional"
                      v-money="percent"
                      @blur="[calcTotal(data.item)]"
                    ></v-text-field>
                  </v-flex>
                </td>
                <td>{{ data.item.valor_custo || "R$ 0,00"}}</td>
                <td>
                  <v-tooltip bottom>
                    <v-btn slot="activator" icon class="mr-1" @click="deleteItem(data.item)">
                      <i class="fa fa-lg fa-trash"></i>
                    </v-btn>
                    <span>Excluir produto</span>
                  </v-tooltip>
                </td>
              </template>
              <template slot="footer">
                <td colspan="3">
                  <h5>TOTAIS</h5>
                </td>
                <td>
                  <v-layout row>{{ totais.quantidade || '0,00' }}</v-layout>
                </td>
                <td>
                  <v-layout row>{{ totais.valor_unitario || 'R$ 0,00' }}</v-layout>
                </td>
                <td>
                  <v-layout row>{{ totais.valor_seguro || 'R$ 0,00' }}</v-layout>
                </td>
                <td>
                  <v-layout row>{{ totais.valor_frete || 'R$ 0,00' }}</v-layout>
                </td>
                <td>
                  <v-layout row>{{ totais.valor_desconto || 'R$ 0,00' }}</v-layout>
                </td>
                <td colspan="5">
                  <v-layout row>{{ totais.valor_total || 'R$ 0,00' }}</v-layout>
                </td>
              </template>
            </v-data-table>

            <FinanceiroVue
              :component="compra"
              :showTotais="!modalStore.compras.compras.title.includes('Visualizar')"
            />
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { VMoney } from "v-money";
import { urlBD, showError, parseNumber, formatDate, saveLog } from "@/global";
import axios from "axios";
import { mapState } from "vuex";
import { formatToBRL } from "brazilian-values";

export default {
  directives: { money: VMoney },
  name: "AddCompra",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "modalStore",
      "comprasStore",
      "pessoaStore",
      "produtoStore",
      "financeiroStore",
      "empresaStore",
      "usuarioStore"
    ]),
    computedDateFormatted: {
      get() {
        return formatDate(this.compra.data_notafiscal);
      },
      set(value) {
        this.compra.data_notafiscal = formatDate(value);
      }
    },
    computedDateFormatted1: {
      get() {
        return formatDate(this.compra.data_lancamento);
      },
      set(value) {
        this.compra.data_lancamento = formatDate(value);
      }
    }
  },
  components: {
    FinanceiroVue: () => import("../material/Financeiro"),
    SelectEmpresa: () => import("../empresas/SelectEmpresa")
  },
  data() {
    return {
      menu: false,
      menu1: false,
      expand: false,
      isLoading: false,
      valid: true,
      valid1: true,
      disable: true,
      searchFornec: null,
      searchProduto: null,
      compra: {},
      situacoes_trib: [],
      produto: {},
      produtos_compra: [],
      pedidos: [],
      money: {
        decimal: ",",
        thousands: ".",
        precision: 2,
        prefix: "R$ "
      },
      percent: {
        decimal: ",",
        thousands: ".",
        precision: 2,
        suffix: " %"
      },
      decimal: {
        decimal: ",",
        thousands: ".",
        precision: 2
      },
      cfop: {
        prefix: "?.",
        decimal: "",
        thousands: ""
      },
      fieldsProdutos: [
        { value: "sequencia", text: "Item", sortable: true },
        { value: "produto", text: "Produto", sortable: true },
        { value: "cfop", text: "CFOP", sortable: false },
        { value: "quantidade", text: "Quantidade", sortable: true },
        { value: "valor_unitario", text: "Valor unitário", sortable: true },
        { value: "valor_seguro", text: "Valor seguro", sortable: false },
        { value: "valor_frete", text: "Valor frete", sortable: false },
        { value: "valor_desconto", text: "Valor desconto", sortable: false },
        { value: "valor_total", text: "Valor total", sortable: true },
        { value: "dif_aliquota", text: "Dif. aliquota", sortable: false },
        {
          value: "perc_custo_adicional",
          text: "Percentual adicional",
          sortable: false
        },
        {
          value: "valor_custo",
          text: `Custo un.`,
          sortable: false
        },
        { value: "actions", text: "Ações", sortable: false }
      ],
      totais: [
        { value: "quantidade" },
        { value: "valor_unitario" },
        { value: "valor_desconto" },
        { value: "valor_total" }
      ],
      paginationProd: {
        descending: false,
        page: 1,
        rowsPerPage: 10, // -1 for All,
        sortBy: "item",
        totalItems: 0
      },
      empRules: [v => !!v || "Empresa é obrigatória"],
      pessoaRules: [v => !!v || "Fornecedor é obrigatório"],
      dataRules: [v => !!v || "Datas são obrigatórias"],
      notaRules: [v => !!v || "Nota fiscal é obrigatória"],
      cfopRules: [
        v => !!v || "CFOP é obrigatório",
        v => (!!v && v !== "?.000") || "CFOP é obrigatório"
      ]
    };
  },
  watch: {
    "$store.state.modalStore.compras.compras.add"() {
      if (this.modalStore.compras.compras.add) {
        this.limpaTela();
      }
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    limpaTela() {
      this.reset();
      this.loadTela(this.comprasStore.compra);
    },
    addProduto(addProd) {
      if (!addProd) {
        const produto = {
          sequencia: this.produtos_compra.length
        };

        this.produtos_compra.push(produto);
      }
    },
    reset() {
      this.compra = {};
      this.produto = {};
      this.produtos_compra = [];
      this.totais = {};
      this.financeiroStore.financ = [];

      this.$refs.form ? this.$refs.form.reset() : "";
      this.$refs.form1 ? this.$refs.form1.reset() : "";

      this.$refs.valor_frete
        ? (this.$refs.valor_frete.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.valor_seguro
        ? (this.$refs.valor_seguro.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.valor_desconto
        ? (this.$refs.valor_desconto.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.outras_despesas
        ? (this.$refs.outras_despesas.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";

      this.addProduto();
    },
    selectPedido() {
      let url = `${urlBD}/pedidos`;
      if (this.compra.id_pedido) {
        axios
          .get(`${url}/${this.compra.id_pedido}`)
          .then(res => {
            const pedido = res.data;
            this.produtoStore.produtos.length == 0
              ? this.$store.dispatch("loadProdutos")
              : null;

            this.compra.id_pessoa = pedido.id_pessoa;
            this.compra.valor_frete = formatToBRL(pedido.valor_frete);
            this.compra.valor_seguro = formatToBRL(pedido.valor_seguro);
            this.compra.valor_desconto = formatToBRL(pedido.valor_desconto);
            this.compra.outras_despesas = formatToBRL(pedido.outras_despesas);

            this.$refs.valor_frete.$el.getElementsByTagName("input")[0].value =
              pedido.valor_frete;
            this.$refs.valor_seguro.$el.getElementsByTagName("input")[0].value =
              pedido.valor_seguro;
            this.$refs.valor_desconto.$el.getElementsByTagName(
              "input"
            )[0].value = pedido.valor_desconto;
            this.$refs.outras_despesas.$el.getElementsByTagName(
              "input"
            )[0].value = pedido.outras_despesas;

            this.produtos_compra = pedido.produtos.map((p, i) => {
              p.sequencia = i;
              p.quantidade = formatToBRL(p.quantidade);
              p.valor_unitario = formatToBRL(p.valor_unitario);
              p.valor_frete = formatToBRL(p.valor_frete || 0);
              p.valor_seguro = formatToBRL(p.valor_seguro || 0);
              p.valor_desconto = formatToBRL(p.valor_desconto || 0);
              p.valor_total = formatToBRL(p.valor_total);
              p.valor_custo = formatToBRL(
                parseNumber(p.valor_total) / parseNumber(p.quantidade)
              );

              return p;
            });

            this.calcTotal();
          })
          .catch(showError);
      } else {
        this.limpaTela();
      }
    },
    loadTela(compra) {
      if (!compra) return;
      if (!compra.id && compra.id_pedido) {
        this.$store.dispatch("loadPedidos");
        this.compra.id_pedido = compra.id_pedido;
        this.selectPedido();
        return;
      }

      this.$store.dispatch("loadFornecs");
      this.$store.dispatch("loadProdutos");
      this.$store.dispatch("loadDocumentos");
      this.$store.dispatch("loadContas");
      this.$store.dispatch("loadPedidos");

      let url = `${urlBD}/compras`;
      if (compra.id) {
        axios
          .get(`${url}/${compra.id}`)
          .then(res => {
            this.compra = res.data;
            this.parseValores();
            this.calcTotal();
          })
          .catch(showError);
      }
    },
    loadDados(item) {
      if (!item.id) {
        this.$set(item, "quantidade", 0);
        this.$set(item, "valor_unitario", 0);
        this.$set(item, "valor_total", 0);
        this.calcTotal();
        return;
      }
      const produtoFilter = this.produtoStore.produtos.find(produto => {
        return produto.value === item.id;
      });

      if (!produtoFilter) return;
      this.produtos_compra = this.produtos_compra.map(produto => {
        if (produto.sequencia === item.sequencia) {
          this.$set(produto, "ncm", produtoFilter.ncm);
          this.$set(produto, "valor_unitario", produtoFilter.valor_unitario);
        }
        return produto;
      });
    },
    deleteItem(item) {
      this.produtos_compra = this.produtos_compra.filter(produto => {
        return produto.sequencia !== item.sequencia;
      });
      this.calcTotal();
    },
    async calcTotal(item) {
      if (item) {
        this.produtos_compra = this.produtos_compra.filter(produto => {
          if (produto.sequencia === item.sequencia) {
            var perc_add = parseNumber(produto.perc_custo_adicional || "0,00");
            var dif_aliquota = parseNumber(produto.dif_aliquota || "0,00");

            var soma =
              parseNumber(produto.quantidade || "0,00") *
                parseNumber(produto.valor_unitario || "0,00") +
              parseNumber(produto.valor_seguro || "0,00") +
              parseNumber(produto.valor_frete || "0,00") -
              parseNumber(produto.valor_desconto || "0,00");

            perc_add = perc_add ? (perc_add / 100) * soma : 0;
            dif_aliquota = dif_aliquota ? (dif_aliquota / 100) * soma : 0;
            produto.valor_total = formatToBRL(soma);
            produto.valor_custo = formatToBRL(
              (soma + perc_add + dif_aliquota) /
                parseNumber(produto.quantidade || "0,00")
            );
          }
          return produto;
        });
      }

      let quantidade = 0,
        valor_unitario = 0,
        valor_seguro = 0,
        valor_frete = 0,
        valor_desconto = 0,
        valor_total = 0;

      this.produtos_compra.forEach(produto => {
        quantidade += parseNumber(produto.quantidade || "0,00");
        valor_unitario += parseNumber(produto.valor_unitario || "0,00");
        valor_seguro += parseNumber(produto.valor_seguro || "0,00");
        valor_frete += parseNumber(produto.valor_frete || "0,00");
        valor_desconto += parseNumber(produto.valor_desconto || "0,00");
        valor_total += parseNumber(produto.valor_total || "0,00");
      });
      this.totais = {
        quantidade: formatToBRL(quantidade).replace("R$", ""),
        valor_unitario: formatToBRL(valor_unitario),
        valor_seguro: formatToBRL(valor_seguro),
        valor_frete: formatToBRL(valor_frete),
        valor_desconto: formatToBRL(valor_desconto),
        valor_total: formatToBRL(valor_total)
      };

      this.compra.valor_frete = this.totais.valor_frete;
      this.compra.valor_seguro = this.totais.valor_seguro;
      this.compra.valor_desconto = formatToBRL(
        parseNumber(this.compra.valor_desconto) +
          parseNumber(this.totais.valor_desconto)
      );
      // this.compra.outras_despesas = formatToBRL(this.compra.outras_despesas || 0);
      this.compra.valor_produtos = this.totais.valor_total;
      this.compra.valor_total = formatToBRL(
        parseNumber(this.totais.valor_total || "0,00") +
          parseNumber(this.compra.outras_despesas || "0,00")
      );

      this.$refs.valor_frete.$el.getElementsByTagName(
        "input"
      )[0].value = this.compra.valor_frete;
      this.$refs.valor_seguro.$el.getElementsByTagName(
        "input"
      )[0].value = this.compra.valor_seguro;
      this.$refs.valor_desconto.$el.getElementsByTagName(
        "input"
      )[0].value = this.compra.valor_desconto;
      this.$refs.outras_despesas.$el.getElementsByTagName(
        "input"
      )[0].value = this.compra.outras_despesas;
      this.$refs.valor_produtos.$el.getElementsByTagName(
        "input"
      )[0].value = this.compra.valor_produtos;
      this.$refs.valor_total.$el.getElementsByTagName(
        "input"
      )[0].value = this.compra.valor_total;
    },
    setDesconto() {
      this.compra.valor_total = formatToBRL(
        parseNumber(this.totais.valor_total || "0,00") +
          parseNumber(this.compra.outras_despesas || "0,00") -
          parseNumber(this.compra.valor_desconto || "0,00")
      );
      this.compra.valor_desconto = formatToBRL(
        parseNumber(this.compra.valor_desconto) +
          parseNumber(this.totais.valor_desconto)
      );
      this.$refs.valor_desconto.$el.getElementsByTagName(
        "input"
      )[0].value = this.compra.valor_desconto;
      this.$refs.valor_total.$el.getElementsByTagName(
        "input"
      )[0].value = this.compra.valor_total;
    },
    setValores() {
      if (
        this.produtos_compra.length == 0 ||
        !this.totais.quantidade ||
        this.totais.quantidade == "0,00"
      )
        return;
      this.disable = false;

      this.produtos_compra.forEach(produto => {
        produto.valor_frete = formatToBRL(
          (parseNumber(this.compra.valor_frete || "0,00") /
            parseNumber(this.totais.quantidade || "0,00")) *
            parseNumber(produto.quantidade || "0,00")
        );
        produto.valor_seguro = formatToBRL(
          (parseNumber(this.compra.valor_seguro || "0,00") /
            parseNumber(this.totais.quantidade || "0,00")) *
            parseNumber(produto.quantidade || "0,00")
        );
        produto.valor_total = formatToBRL(
          parseNumber(produto.quantidade || "0,00") *
            parseNumber(produto.valor_unitario || "0,00") +
            parseNumber(produto.valor_seguro || "0,00") +
            parseNumber(produto.valor_frete || "0,00") -
            parseNumber(produto.valor_desconto || "0,00")
        );
      });

      this.calcTotal().then(() => (this.disable = true));
    },
    parseValores() {
      this.compra.data_notafiscal = new Date(this.compra.data_notafiscal)
        .toISOString()
        .substr(0, 10);
      this.compra.data_lancamento = new Date(this.compra.data_lancamento)
        .toISOString()
        .substr(0, 10);

      this.compra.valor_frete = formatToBRL(this.compra.valor_frete);
      this.compra.valor_seguro = formatToBRL(this.compra.valor_seguro);
      this.compra.valor_desconto = formatToBRL(this.compra.valor_desconto);
      this.compra.outras_despesas = formatToBRL(this.compra.outras_despesas);
      this.compra.valor_produtos = formatToBRL(this.compra.valor_produtos);
      this.compra.valor_total = formatToBRL(this.compra.valor_total);

      this.$refs.valor_frete.$el.getElementsByTagName(
        "input"
      )[0].value = this.compra.valor_frete;
      this.$refs.valor_seguro.$el.getElementsByTagName(
        "input"
      )[0].value = this.compra.valor_seguro;
      this.$refs.valor_desconto.$el.getElementsByTagName(
        "input"
      )[0].value = this.compra.valor_desconto;
      this.$refs.outras_despesas.$el.getElementsByTagName(
        "input"
      )[0].value = this.compra.outras_despesas;
      this.$refs.valor_produtos.$el.getElementsByTagName(
        "input"
      )[0].value = this.compra.valor_produtos;
      this.$refs.valor_total.$el.getElementsByTagName(
        "input"
      )[0].value = this.compra.valor_total;

      let i = 0;
      this.produtos_compra = this.compra.produtos.map(produto => {
        produto.valor_unitario = formatToBRL(produto.valor_unitario);
        produto.valor_frete = formatToBRL(produto.valor_frete);
        produto.valor_desconto = formatToBRL(produto.valor_desconto);
        produto.valor_desconto = formatToBRL(produto.valor_desconto);
        produto.quantidade = formatToBRL(produto.quantidade).replace("R$", "");
        produto.perc_custo_adicional =
          formatToBRL(produto.perc_custo_adicional).replace("R$", "") + " %";
        produto.valor_total = formatToBRL(produto.valor_total);
        produto.seq = i++;

        return produto;
      });
      delete this.compra.produtos;

      this.financeiroStore.financ = this.compra.financeiro.map(parcela => {
        parcela.parcelas = parcela.parcelas;
        parcela.valor = formatToBRL(parcela.valor_parcela);
        parcela.data_vencimento = formatDate(
          new Date(parcela.data_vencimento).toISOString().substr(0, 10)
        );
        parcela.pago = parcela.pago;
        parcela.data_baixa = parcela.data_baixa
          ? formatDate(new Date(parcela.data_baixa).toISOString().substr(0, 10))
          : "";
        parcela.documento_baixa = parcela.documento_baixa || "";
        parcela.num_documento_baixa = parcela.num_documento_baixa || "";
        parcela.valor_acrescimo = parcela.valor_acrescimo || "R$ 0,00";
        parcela.valor_desconto = parcela.valor_desconto || "R$ 0,00";
        parcela.valor_pago = parcela.valor_pago || "R$ 0,00";

        return parcela;
      });
      delete this.compra.financeiro;
    },
    save(verificar) {
      if (!this.$refs.form.validate() || !this.$refs.form1.validate()) return;

      this.isLoading = true;

      const method = this.compra.id ? "put" : "post";
      const id = this.compra.id ? this.compra.id : "";
      const url = `${urlBD}/compras/${id}?verificar=${verificar}`;
      this.comprasStore.compra = this.compra;

      if (!this.compra.id_empresa) {
        this.compra.id_empresa = this.empresaStore.currentEmpresa;
      }

      this.compra.produtos = this.produtos_compra;
      this.compra.financeiro = this.financeiroStore.financ;
      this.compra.importado = false;

      axios[method](url, this.compra)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.modalStore.compras.compras.add = false;

          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
            "COMPRAS",
            `Usuário ${this.usuarioStore.currentUsuario.nome} ${
              method === "post" ? "ADICIONOU" : "ALTEROU"
            } uma compra do fornecedor ${this.compra.id_pessoa}`
          );
        })
        .catch(showError)
        .then(() => (this.isLoading = false));
    }
  }
};
</script>