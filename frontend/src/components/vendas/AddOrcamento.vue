<template>
  <v-dialog
    v-model="modalStore.vendas.visible"
    fullscreen
    persistent
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card v-if="modalStore.vendas.visible">
      <v-toolbar dark :color="color" class="m-0 p-0">
        <v-btn icon @click="modalStore.vendas.visible = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title
          class="headline text-white font-weight-light"
        >{{ modalStore.vendas.title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click>
          <v-icon>fa fa-2x fa-cog</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <v-container fluid grid-list-xl>
          <v-form v-model="valid" ref="form">
            <v-text-field label="id" v-model="obj_venda.id" v-show="false"></v-text-field>
            <v-text-field v-model="obj_venda.id_empresa" v-show="false"></v-text-field>
            <v-layout wrap>
              <v-flex xs12 md2>
                <v-autocomplete
                  class="tag-input"
                  chips
                  dense
                  :color="color"
                  label="Tipo*"
                  :items="[{ value: 1, text: 'Orçamento' }, { value: 2, text: 'Venda' }]"
                  v-model="obj_venda.tipo"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12 md2>
                <v-combobox
                  class="tag-input"
                  dense
                  :color="color"
                  chips
                  deletable-chips
                  label="Cliente*"
                  :items="pessoaStore.pessoas"
                  prepend-icon="fa fa-lg fa-plus-circle"
                  @click:prepend="[pessoaStore.pessoa = null, modalStore.pessoas.visible = true, modalStore.pessoas.title = 'Adicionar pessoa']"
                  v-model="obj_venda.pessoa"
                  :search-input.sync="clienteFilter"
                  @change="loadCliente"
                  :rules="pessoaRules"
                >
                  <template v-slot:no-data>
                    <v-list-tile>
                      <v-list-tile-title>
                        Nenhum resultado para "
                        <strong>{{ clienteFilter }}</strong>". Pressione
                        <kbd>Enter</kbd> para continuar.
                      </v-list-tile-title>
                    </v-list-tile>
                  </template>
                </v-combobox>
              </v-flex>
              <v-spacer></v-spacer>
              <v-flex xs12 md4>
                <v-layout wrap justify-end class="mt-1">
                  <v-tooltip bottom>
                    <v-btn
                      slot="activator"
                      class="v-btn-common"
                      color="danger"
                      @click="limpaTela"
                    >Limpar</v-btn>
                    <span>Volta a tela ao seu estado inicial</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <v-btn slot="activator" class="v-btn-common" color="info">Confirmar venda</v-btn>
                    <span>Finaliza o orçamento e gera a venda</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <v-btn
                      slot="activator"
                      class="v-btn-common"
                      :loading="isLoading"
                      :color="color"
                      @click="save"
                    >Salvar</v-btn>
                    <span>Finaliza o orçamento</span>
                  </v-tooltip>
                </v-layout>
              </v-flex>
            </v-layout>
          </v-form>

          <v-container fluid>
            <v-form v-model="valid1" ref="form1">
              <v-layout justify-start wrap class="bege">
                <v-flex xs12 md4>
                  <v-card flat>
                    <v-layout justify-center wrap>
                      <v-card-title>
                        <span class="headline">Dados do orçamento</span>
                      </v-card-title>
                      <v-card-text>
                        <v-container grid-list-xl>
                          <v-layout wrap>
                            <v-flex xs12 md6>
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
                                    label="Data contato"
                                    prepend-icon="event"
                                    readonly
                                    v-on="on"
                                    :rules="dataRules"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  @input="menu = false"
                                  scrollable
                                  :color="color"
                                  v-model="data_contato"
                                  locale="pt-br"
                                ></v-date-picker>
                              </v-menu>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-menu
                                lazy
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
                                    label="Data agendamento"
                                    prepend-icon="event"
                                    readonly
                                    v-on="on"
                                    :rules="dataRules"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  @input="menu1 = false"
                                  scrollable
                                  :color="color"
                                  v-model="obj_venda.data_agendamento"
                                  locale="pt-br"
                                ></v-date-picker>
                              </v-menu>
                            </v-flex>
                            <v-flex xs12>
                              <v-textarea
                                :color="color"
                                label="Observação"
                                box
                                v-model="obj_venda.observacao"
                              ></v-textarea>
                            </v-flex>
                          </v-layout>
                        </v-container>
                      </v-card-text>
                    </v-layout>
                  </v-card>
                </v-flex>
                <v-flex xs12 md4>
                  <v-card flat>
                    <v-layout justify-center wrap>
                      <v-card-title>
                        <span class="headline">Dados do cliente</span>
                      </v-card-title>
                      <v-card-text>
                        <v-container grid-list-xl>
                          <v-layout wrap>
                            <v-flex xs12 md4>
                              <v-text-field
                                v-model="cliente.cpf_cnpj"
                                readonly
                                :color="color"
                                label="CPF/CNPJ"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-text-field
                                v-model="cliente.situacao"
                                readonly
                                :color="color"
                                label="Situação do cliente"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-text-field
                                v-model="cliente.email"
                                readonly
                                :color="color"
                                label="E-mail"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-text-field
                                v-model="cliente.contato"
                                readonly
                                :color="color"
                                label="Contato"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-text-field
                                v-model="cliente.categoria"
                                readonly
                                :color="color"
                                label="Categoria"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-text-field
                                ref="cliente_financeiro"
                                v-model="cliente.financeiro"
                                readonly
                                :color="getColor(cliente.financeiro)"
                                label="Financeiro"
                              ></v-text-field>
                            </v-flex>
                          </v-layout>
                        </v-container>
                      </v-card-text>
                    </v-layout>
                  </v-card>
                </v-flex>
                <v-flex xs12 md4>
                  <v-card flat>
                    <v-layout justify-center wrap>
                      <v-card-title>
                        <span class="headline">Totalizadores</span>
                      </v-card-title>
                      <v-card-text>
                        <v-container grid-list-xl>
                          <v-layout wrap>
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="valor_frete"
                                v-model="obj_venda.valor_frete"
                                :color="color"
                                label="VALOR DO FRETE"
                                v-money="money"
                                @blur="calcTotalizadores"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="valor_seguro"
                                v-model="obj_venda.valor_seguro"
                                :color="color"
                                label="VALOR DO SEGURO"
                                v-money="money"
                                @blur="calcTotalizadores"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="valor_desconto"
                                v-model="obj_venda.valor_desconto"
                                :color="color"
                                label="VALOR DE DESCONTO"
                                v-money="money"
                                @blur="calcTotalizadores"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="outras_despesas"
                                v-model="obj_venda.outras_despesas"
                                :color="color"
                                label="VALOR DE OUTRAS DESPESAS"
                                v-money="money"
                                @blur="calcTotalizadores"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="valor_produtos"
                                v-model="obj_venda.valor_produtos"
                                :color="color"
                                label="VALOR TOTAL DOS PRODUTOS"
                                placeholder="R$ 0,00"
                                readonly
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="valor_total"
                                v-model="obj_venda.valor_total"
                                :color="color"
                                label="VALOR TOTAL DO ORÇAMENTO"
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
            </v-form>

            <v-flex xs12 class="mt-4">
              <v-layout justify-center>
                <v-icon class="mt-2 mr-2">fa fa-2x fa-archive</v-icon>
                <h2>Produtos</h2>
              </v-layout>
              <hr />
            </v-flex>
            <v-layout align-end>
              <span>Edite valores e quantidades do produto diretamente na tabela</span>
              <v-spacer></v-spacer>
              <v-flex xs12 md2 class="p-0">
                <v-tooltip bottom>
                  <v-autocomplete
                    slot="activator"
                    class="tag-input"
                    deletable-chips
                    dense
                    chips
                    v-model="obj_venda.id_tabela_preco"
                    label="Tabela de preços"
                    :items="vendaStore.tabelas"
                    no-data-text="Nenhuma tabela cadastrada ou nenhuma empresa selecionada"
                    prepend-icon="fa fa-lg fa-plus-circle"
                    @click:prepend="modalStore.tabelas.visible = true"
                    @change="aplicarTabela"
                    return-object
                  ></v-autocomplete>
                  <span>Desconto aplicado sobre o valor total de cada produto</span>
                </v-tooltip>
              </v-flex>
              <v-tooltip bottom class="ml-3">
                <v-btn
                  slot="activator"
                  class="v-btn-common"
                  :color="color"
                  @click="addProduto()"
                >Adicionar produto</v-btn>
                <span>Adicionar novo produto à obj_venda</span>
              </v-tooltip>
            </v-layout>
          </v-container>

          <v-data-table
            class="elevation-5 mb-3"
            :items="produtos_obj_venda"
            :headers="fieldsProdutos"
            :pagination.sync="paginationProd"
            :rows-per-page-items="[5, 10, 20, 50]"
            rows-per-page-text="Produtos por página"
            no-data-text="Nenhum produto adicionado"
          >
            <template slot="items" slot-scope="data">
              <td>{{ data.item.sequencia }}</td>
              <td>
                <v-flex xs10>
                  <v-autocomplete
                    class="tag-input"
                    chips
                    v-model="data.item.id"
                    label="Selecione"
                    :items="produtoStore.produtos"
                    prepend-icon="fa fa-lg fa-plus-circle"
                    @click:prepend="modalStore.produtos.visible = true"
                    @change="[loadDados(data.item)]"
                  ></v-autocomplete>
                </v-flex>
              </td>
              <td>{{ data.item.qtdEstoque || "0,00"}}</td>
              <td>
                <v-flex xs12 md6>
                  <v-text-field
                    ref="qtde"
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
                    ref="qtde"
                    class="mt-2"
                    v-model="data.item.valor_venda"
                    v-money="money"
                    @blur="[calcTotal(data.item)]"
                  ></v-text-field>
                </v-flex>
              </td>
              <td>
                <v-flex xs12 md6>
                  <v-text-field
                    ref="qtde"
                    class="mt-2"
                    v-model="data.item.valor_desconto"
                    v-money="money"
                    @blur="[calcTotal(data.item)]"
                  ></v-text-field>
                </v-flex>
              </td>
              <td>{{ data.item.valor_total || 'R$ 0,00'}}</td>
              <td>
                <v-tooltip bottom>
                  <b-button
                    slot="activator"
                    variant="secundary"
                    class="mr-1"
                    @click="deleteItem(data.item)"
                  >
                    <i class="fa fa-lg fa-trash"></i>
                  </b-button>
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
                <v-layout row>{{ totais.valor_venda || 'R$ 0,00' }}</v-layout>
              </td>
              <td>
                <v-layout row>{{ totais.valor_desconto || 'R$ 0,00' }}</v-layout>
              </td>
              <td colspan="2">
                <v-layout row>{{ totais.valor_total || 'R$ 0,00' }}</v-layout>
              </td>
            </template>
          </v-data-table>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { VMoney } from "v-money";
import {
  urlBD,
  urlUsuarios,
  showError,
  parseNumber,
  moneyToNumber,
  formatDate,
  loadProdutos,
  loadClientes,
  loadTabelas
} from "@/global";
import axios from "axios";
import { mapState } from "vuex";
import { formatToBRL } from "brazilian-values";

export default {
  directives: { money: VMoney },
  name: "Addobj_venda",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "vendaStore",
      "usuarioStore",
      "produtoStore",
      "pessoaStore",
      "empresaStore",
      "modalStore"
    ]),
    computedDateFormatted() {
      return formatDate(this.data_contato);
    },
    computedDateFormatted1() {
      return formatDate(this.obj_venda.data_agendamento);
    }
  },
  watch: {
    "$store.state.modalStore.vendas.visible": function() {
      if (this.modalStore.vendas.visible) {
        this.limpaTela();
      }
    },
    "$store.state.modalStore.produtos.visible": function() {
      if (!this.modalStore.produtos.visible) {
        loadProdutos();
      }
    },
    "$store.state.modalStore.pessoas.visible": function() {
      if (!this.modalStore.pessoas.visible) {
        loadClientes();
      }
    },
    "$store.state.modalStore.tabelas.visible": function() {
      if (!this.modalStore.tabelas.visible) {
        loadTabelas();
      }
    }
  },
  data() {
    return {
      data_contato: new Date().toISOString().substr(0, 10),
      obj_venda: {},
      produtos_obj_venda: [],
      cliente: {},
      clienteFilter: null,
      menu: false,
      menu1: false,
      valid: true,
      isLoading: false,
      valid1: true,
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
      fieldsProdutos: [
        { value: "sequencia", text: "Item" },
        { value: "produto", text: "Produto" },
        { value: "qtdEstoque", text: "Estoque disponível" },
        { value: "quantidade", text: "Quantidade" },
        { value: "valor_venda", text: "Valor venda" },
        { value: "valor_desconto", text: "Valor desconto" },
        { value: "valor_total", text: "Valor total" },
        { value: "actions", text: "Ações" }
      ],
      paginationProd: {
        descending: false,
        page: 1,
        rowsPerPage: 10, // -1 for All,
        sortBy: "sequencia",
        totalItems: 0
      },
      totais: [
        { value: "quantidade" },
        { value: "valor_venda" },
        { value: "valor_desconto" },
        { value: "valor_total" }
      ],
      empRules: [v => !!v || "Empresa é obrigatória"],
      pessoaRules: [v => !!v || "Cliente é obrigatório"],
      dataRules: [v => !!v || "Datas são obrigatórias"]
    };
  },
  methods: {
    getColor(financeiro) {
      if (financeiro === "OK") return "green";
      else if (financeiro === "Venda impossibilitada") return "red";
      else return "yellow darken";
    },
    async limpaTela() {
      this.reset();
      this.loadTela(this.vendaStore.obj_venda);
      this.data_contato = new Date().toISOString().substr(0, 10);
    },
    async addProduto(addProd) {
      if (!addProd) {
        const produto = {
          sequencia: this.produtos_obj_venda.length
        };

        this.produtos_obj_venda.push(produto);
      }
    },
    async reset() {
      this.produto = {};
      this.produtos_obj_venda = [];
      this.obj_venda = {};
      this.cliente = {};
      this.totais = {};

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
    },
    async loadTela(obj_venda) {
      let url = `${urlBD}/obj_vendas/tela`;

      if (!obj_venda) {
        axios
          .get(`${url}`)
          .then(res => {
            const tela = res.data;

            this.pessoaStore.pessoas = tela.pessoas;
            this.vendaStore.tabelas = tela.tabelas;

            this.produtoStore.produtos = tela.produtos.map(produto => {
              produto.valor_venda = formatToBRL(produto.valor_venda);
              produto.qtdEstoque = moneyToNumber(
                formatToBRL(produto.qtdEstoque || 0)
              );

              return produto;
            });
          })
          .catch(showError);
      } else if (obj_venda.id) {
        axios
          .get(`${url}/${obj_venda.id}`)
          .then(res => {
            const tela = res.data;

            this.obj_venda = tela.obj_venda;
            this.data_contato = this.obj_venda.data_contato;

            this.pessoaStore.pessoas = tela.pessoas;
            this.vendaStore.tabelas = tela.tabelas;
            this.produtoStore.produtos = tela.produtos.map(produto => {
              produto.valor_venda = formatToBRL(produto.valor_venda);
              produto.qtdEstoque = moneyToNumber(
                formatToBRL(produto.qtdEstoque || 0)
              );
              return produto;
            });
            this.parseValores();
            this.calcTotal();
            this.obj_venda.pessoa.value ? this.loadCliente() : "";
          })
          .catch(showError);
      }
    },
    parseValores() {
      this.obj_venda.valor_frete = formatToBRL(this.obj_venda.valor_frete);
      this.obj_venda.valor_seguro = formatToBRL(this.obj_venda.valor_seguro);
      this.obj_venda.valor_desconto = formatToBRL(
        this.obj_venda.valor_desconto
      );
      this.obj_venda.outras_despesas = formatToBRL(
        this.obj_venda.outras_despesas
      );
      this.obj_venda.valor_produtos = formatToBRL(
        this.obj_venda.valor_produtos
      );
      this.obj_venda.valor_total = formatToBRL(this.obj_venda.valor_total);

      this.$refs.valor_frete.$el.getElementsByTagName(
        "input"
      )[0].value = this.obj_venda.valor_frete;
      this.$refs.valor_seguro.$el.getElementsByTagName(
        "input"
      )[0].value = this.obj_venda.valor_seguro;
      this.$refs.valor_desconto.$el.getElementsByTagName(
        "input"
      )[0].value = this.obj_venda.valor_desconto;
      this.$refs.outras_despesas.$el.getElementsByTagName(
        "input"
      )[0].value = this.obj_venda.outras_despesas;
      this.$refs.valor_produtos.$el.getElementsByTagName(
        "input"
      )[0].value = this.obj_venda.valor_produtos;
      this.$refs.valor_total.$el.getElementsByTagName(
        "input"
      )[0].value = this.obj_venda.valor_total;

      this.produtos_obj_venda = this.obj_venda.produtos;
      this.financeiro = this.obj_venda.financeiro;

      let i = 0;
      this.produtos_obj_venda = this.produtos_obj_venda.map(produto => {
        produto.quantidade = formatToBRL(produto.quantidade).replace("R$", "");
        produto.valor_venda = formatToBRL(produto.valor_venda);
        produto.valor_desconto = formatToBRL(produto.valor_desconto);
        produto.valor_total = formatToBRL(produto.valor_total);
        produto.sequencia = i++;

        return produto;
      });
      delete this.obj_venda.produtos;
    },
    async loadCliente() {
      if (!this.obj_venda) return;

      if (this.obj_venda.pessoa && this.obj_venda.pessoa.value) {
        const url = `${urlBD}/pessoasComFinanceiro/${this.obj_venda.pessoa.value}`;
        axios.get(url).then(res => {
          this.cliente = res.data;
          this.cliente.cpf_cnpj = res.data.cpf ? res.data.cpf : res.data.cnpj;
        });
        this.$refs.cliente_financeiro.focus();
      } else {
        this.cliente = {};
      }
    },
    async loadDados(item) {
      if (!item.id) return;

      const produtoFilter = this.produtoStore.produtos.find(produto => {
        return produto.value === item.id;
      });

      this.produtos_obj_venda = this.produtos_obj_venda.map(produto => {
        if (produto.sequencia === item.sequencia) {
          produto.valor_venda = produtoFilter.valor_venda;
          produto.qtdEstoque = produtoFilter.qtdEstoque;
        }
        return produto;
      });

      this.$refs.qtde.focus();
    },
    async deleteItem(item) {
      this.produtos_obj_venda = this.produtos_obj_venda.filter(produto => {
        return produto.sequencia !== item.sequencia;
      });
      this.calcTotal();
    },
    async calcTotal(item, flag = true) {
      if (item) {
        this.produtos_obj_venda = this.produtos_obj_venda.filter(produto => {
          if (produto.sequencia === item.sequencia) {
            const percentual = this.obj_venda.id_tabela_preco
              ? this.obj_venda.id_tabela_preco.percentual
              : "0,00";

            produto.valor_total =
              parseNumber(produto.quantidade || "0,00") *
                parseNumber(produto.valor_venda || "0,00") -
              parseNumber(produto.valor_desconto || "0,00");

            if (percentual != "0,00") {
              produto.valor_total =
                produto.valor_total -
                (parseNumber(percentual) * produto.valor_total) / 100;
            }
            produto.valor_total = formatToBRL(produto.valor_total);
          }

          return produto;
        });
      }

      if (flag) {
        let quantidade = 0,
          valor_venda = 0,
          valor_desconto = 0,
          valor_total = 0;

        this.produtos_obj_venda.forEach(produto => {
          quantidade += parseNumber(produto.quantidade || "0,00");
          valor_venda += parseNumber(produto.valor_venda || "0,00");
          valor_desconto += parseNumber(produto.valor_desconto || "0,00");
          valor_total += parseNumber(produto.valor_total || "0,00");
        });
        this.totais = {
          quantidade: formatToBRL(quantidade).replace("R$", ""),
          valor_venda: formatToBRL(valor_venda),
          valor_desconto: formatToBRL(valor_desconto),
          valor_total: formatToBRL(valor_total)
        };

        this.calcTotalizadores();
      }
    },
    async aplicarTabela() {
      this.produtos_obj_venda.forEach(item => {
        this.calcTotal(item, false);
      });
      this.calcTotal();
    },
    async calcTotalizadores() {
      const {
        valor_frete,
        valor_seguro,
        valor_desconto,
        outras_despesas
      } = this.obj_venda;

      // valor dos produtos
      this.obj_venda.valor_produtos = this.totais.valor_total;
      const valor_produtos = this.obj_venda.valor_produtos;
      this.$refs.valor_produtos.$el.getElementsByTagName("input")[0].value =
        this.obj_venda.valor_produtos || "";

      // valor total da nota
      this.obj_venda.valor_total = formatToBRL(
        parseNumber(valor_produtos || "0,00") +
          parseNumber(valor_frete) +
          parseNumber(valor_seguro) +
          parseNumber(outras_despesas) -
          parseNumber(valor_desconto)
      );
      this.$refs.valor_total.$el.getElementsByTagName(
        "input"
      )[0].value = this.obj_venda.valor_total;
    },
    save() {
      if (!this.$refs.form.validate() || !this.$refs.form1.validate()) return;

      this.isLoading = true;

      const method = this.obj_venda.id ? "put" : "post";
      const id = this.obj_venda.id ? this.obj_venda.id : "";
      const url = `${urlBD}/obj_vendas/${id}`;

      if (!this.obj_venda.id_empresa) {
        this.obj_venda.id_empresa = this.empresaStore.currentEmpresa.value;
      }

      this.obj_venda.produtos = this.produtos_obj_venda;
      this.obj_venda.data_contato = this.data_contato;

      axios[method](url, this.obj_venda)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.modalStore.vendas.visible = false;

          let data = new Date();
          const hora = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`;
          const log = {
            id_usuario: this.usuarioStore.currentUsuario.id,
            data: formatDate(data.toISOString().substr(0, 10)),
            hora,
            tipo: method === "post" ? "GRAVAÇÂO" : "ALTERAÇÃO",
            tela: "ORÇAMENTOS/ADICIONAR",
            detalhe:
              method === "post"
                ? `Orçamento adicionado: /Data de lançamento: ${this.obj_venda.data_lancamento}`
                : `Orçamento alterado: Código: ${this.obj_venda.id}/de lançamento: ${this.obj_venda.data_lancamento}`
          };

          axios.post(`${urlBD}/log`, log).catch(showError);
        })
        .catch(e => showError(e));

      this.isLoading = false;
    }
  }
};
</script>

<style>
</style>