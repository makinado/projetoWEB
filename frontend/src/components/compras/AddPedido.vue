<template>
  <v-dialog
    v-model="modalStore.compras.pedidos.visible"
    persistent
    max-width="1100px"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card v-if="modalStore.compras.pedidos.visible">
      <v-toolbar dense flat extended fixed extension-height="5" dark :color="color">
        <v-toolbar-side-icon
          @click="[comprasStore.pedido = null, modalStore.compras.pedidos.visible = false]"
        >
          <v-icon>close</v-icon>
        </v-toolbar-side-icon>
        <v-toolbar-title
          class="headline white--text font-weight-light"
        >{{ modalStore.compras.pedidos.title }}</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-tooltip bottom>
          <v-btn slot="activator" class="mr-3" icon @click="limpaTela">
            <v-icon>fa fa-2x fa-eraser</v-icon>
          </v-btn>
          <span>Limpar tela</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn slot="activator" class="mr-3" icon @click="save">
            <v-icon>fa fa-2x fa-check</v-icon>
          </v-btn>
          <span>Salvar pedido</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn slot="activator" class="mr-3" icon>
            <v-icon>fa fa-2x fa-cog</v-icon>
          </v-btn>
          <span>Configurações</span>
        </v-tooltip>
      </v-toolbar>

      <v-card-text>
        <v-container fluid grid-list-xl class="my-5">
          <v-form v-model="valid" ref="form">
            <v-text-field v-model="pedido.id" v-show="false"></v-text-field>
            <v-text-field v-model="pedido.id_empresa" v-show="false"></v-text-field>
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
                  v-model="pedido.id_pessoa"
                  no-data-text="Nenhum fornecedor cadastrado"
                  :rules="fornecRules"
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
            </v-layout>
          </v-form>

          <v-container fluid>
            <v-form v-model="valid1" ref="form1">
              <v-layout justify-start wrap class="bege">
                <v-flex xs12 md6>
                  <v-card flat>
                    <v-layout justify-center wrap>
                      <v-card-title>
                        <span class="headline">Dados do pedido</span>
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
                                    :value="computedDateFormatted"
                                    label="Data do pedido"
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
                                  v-model="pedido.data_pedido"
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
                                    :value="computedDateFormatted1"
                                    label="Data lançamento"
                                    prepend-icon="event"
                                    readonly
                                    v-on="on"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  @input="menu1 = false"
                                  scrollable
                                  :color="color"
                                  v-model="pedido.data_lancamento"
                                  locale="pt-br"
                                ></v-date-picker>
                              </v-menu>
                            </v-flex>
                            <v-flex xs12>
                              <v-textarea
                                :color="color"
                                label="Alguma observação?"
                                box
                                v-model="pedido.observacao"
                              ></v-textarea>
                            </v-flex>
                          </v-layout>
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
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="valor_frete"
                                v-model="pedido.valor_frete"
                                :color="color"
                                label="VALOR DO FRETE"
                                v-money="money"
                                @blur="calcTotal"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="valor_seguro"
                                v-model="pedido.valor_seguro"
                                :color="color"
                                label="VALOR DO SEGURO"
                                v-money="money"
                                @blur="calcTotal"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="valor_desconto"
                                v-model="pedido.valor_desconto"
                                :color="color"
                                label="VALOR DE DESCONTO"
                                v-money="money"
                                @blur="calcTotal"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="outras_despesas"
                                v-model="pedido.outras_despesas"
                                :color="color"
                                label="VALOR DE OUTRAS DESPESAS"
                                v-money="money"
                                @blur="calcTotal"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="valor_produtos"
                                v-model="pedido.valor_produtos"
                                :color="color"
                                label="VALOR TOTAL DOS PRODUTOS"
                                placeholder="R$ 0,00"
                                readonly
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="valor_total"
                                v-model="pedido.valor_total"
                                :color="color"
                                label="VALOR TOTAL DO PEDIDO"
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
                  color="warning"
                  @click="setFreteSeguro"
                >Ratear frete e seguro</v-btn>
                <span>Ratear os valores de frete e seguro nos produtos para somar no custo</span>
              </v-tooltip>
              <v-tooltip bottom class="ml-3">
                <v-btn
                  slot="activator"
                  class="v-btn-common"
                  :color="color"
                  @click="addProduto"
                >Adicionar produto</v-btn>
                <span>Adicionar novo produto ao pedido</span>
              </v-tooltip>
            </v-layout>
          </v-container>

          <v-data-table
            class="elevation-5 mb-3"
            :items="produtos_pedido"
            :headers="fields"
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
              <td>{{ data.item.valor_frete || "0,00"}}</td>
              <td>{{ data.item.valor_seguro || "0,00"}}</td>
              <td>
                <v-flex xs12 md6>
                  <v-text-field
                    v-if="disable"
                    class="mt-2"
                    v-model="data.item.valor_desconto"
                    v-money="money"
                    @blur="[calcDesconto = true, calcTotal(data.item)]"
                  ></v-text-field>
                  <span v-else>{{ data.item.valor_desconto }}</span>
                </v-flex>
              </td>
              <td>{{ data.item.valor_total || "R$ 0,00"}}</td>
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
              <td colspan="2">
                <h5>TOTAIS</h5>
              </td>
              <td colspan="4">
                <v-layout row>{{ totais.quantidade || '0,00' }}</v-layout>
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
import { formatToBRL, formatToNumber } from "brazilian-values";

import axios from "axios";
import { urlBD, showError, formatDate, parseNumber, saveLog } from "@/global";
import { mapState } from "vuex";

export default {
  name: "Add-Pedido",
  directives: { money: VMoney },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "modalStore",
      "usuarioStore",
      "comprasStore",
      "empresaStore",
      "produtoStore",
      "pessoaStore"
    ]),
    computedDateFormatted: {
      get() {
        return formatDate(this.pedido.data_pedido);
      },
      set(value) {
        this.pedido.data_pedido = value;
      }
    },
    computedDateFormatted1: {
      get() {
        return formatDate(this.pedido.data_lancamento);
      },
      set(value) {
        this.pedido.data_lancamento = value;
      }
    }
  },
  data() {
    return {
      valid: true,
      valid1: true,
      disable: true,
      isLoading: false,
      calcDesconto: false,
      searchFornec: null,
      searchProduto: null,
      pedido: {},
      produtos_pedido: [],
      menu: false,
      menu1: false,
      produtos: [],
      fields: [
        { value: "sequencia", text: "Item" },
        { value: "id", text: "Produto", fixed: true, sortable: false },
        { value: "quantidade", text: "Quantidade", sortable: true },
        { value: "valor_unitario", text: "Valor unitário", sortable: true },
        { value: "valor_seguro", text: "Valor seguro", sortable: false },
        { value: "valor_frete", text: "Valor frete", sortable: false },
        { value: "valor_desconto", text: "Valor desconto", sortable: true },
        { value: "valor_total", text: "Valor total", sortable: true },
        { value: "actions", text: "Ações" }
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
        sortBy: "sequencia",
        totalItems: 0
      },
      money: {
        decimal: ",",
        thousands: ".",
        prefix: "R$ ",
        precision: 2,
        masked: false
      },
      decimal: {
        decimal: ",",
        thousands: ".",
        prefix: "",
        precision: 2,
        masked: false
      },
      empRules: [v => !!v || "Empresa é obrigatória"],
      fornecRules: [v => !!v || "Fornecedor é obrigatório"],
      dataRules: [v => !!v || "Datas são obrigatórias"]
    };
  },
  watch: {
    "$store.state.modalStore.compras.pedidos.visible"(val) {
      if (this.modalStore.compras.pedidos.visible) {
        this.limpaTela();
      }

      document.querySelector("html").style.overflow = val ? "hidden" : null;
    }
  },
  methods: {
    addProduto() {
      const produto = {
        sequencia: this.produtos_pedido.length
      };
      this.produtos_pedido.push(produto);
    },
    limpaTela() {
      this.reset();
      this.loadTela(this.comprasStore.pedido);
    },
    reset() {
      this.pedido = {};

      this.totais = {};
      this.produtos_pedido = [];
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
    loadTela(pedido) {
      if (!pedido) return;

      this.$store.dispatch("loadProdutos");
      let url = `${urlBD}/pedidos`;
      if (pedido.id) {
        axios
          .get(`${url}/${pedido.id}`)
          .then(res => {
            this.pedido = res.data;
            this.parseValores();
            this.calcTotal();
          })
          .catch(showError);
      }
    },
    parseValores() {
      this.pedido.data_pedido = new Date(this.pedido.data_pedido)
        .toISOString()
        .substr(0, 10);
      this.pedido.data_lancamento = new Date(this.pedido.data_lancamento)
        .toISOString()
        .substr(0, 10);

      this.pedido.valor_frete = formatToBRL(this.pedido.valor_frete);
      this.pedido.valor_seguro = formatToBRL(this.pedido.valor_seguro);
      this.pedido.valor_desconto = formatToBRL(this.pedido.valor_desconto);
      this.pedido.outras_despesas = formatToBRL(this.pedido.outras_despesas);
      this.pedido.valor_produtos = formatToBRL(this.pedido.valor_produtos);
      this.pedido.valor_total = formatToBRL(this.pedido.valor_total);

      this.$refs.valor_frete.$el.getElementsByTagName(
        "input"
      )[0].value = this.pedido.valor_frete;
      this.$refs.valor_seguro.$el.getElementsByTagName(
        "input"
      )[0].value = this.pedido.valor_seguro;
      this.$refs.valor_desconto.$el.getElementsByTagName(
        "input"
      )[0].value = this.pedido.valor_desconto;
      this.$refs.outras_despesas.$el.getElementsByTagName(
        "input"
      )[0].value = this.pedido.outras_despesas;
      this.$refs.valor_produtos.$el.getElementsByTagName(
        "input"
      )[0].value = this.pedido.valor_produtos;
      this.$refs.valor_total.$el.getElementsByTagName(
        "input"
      )[0].value = this.pedido.valor_total;

      this.produtos_pedido = this.pedido.produtos;
      let i = 0;
      this.produtos_pedido = this.produtos_pedido.map(produto => {
        produto.quantidade = formatToBRL(produto.quantidade);
        produto.valor_frete = formatToBRL(produto.valor_frete);
        produto.valor_seguro = formatToBRL(produto.valor_seguro);
        produto.valor_desconto = formatToBRL(produto.valor_desconto);
        produto.valor_unitario = formatToBRL(produto.valor_unitario);
        produto.valor_total = formatToBRL(produto.valor_total);
        produto.sequencia = i++;

        return produto;
      });
      delete this.pedido.produtos;
    },
    loadDados(item) {
      if (!item.id) return;

      const produtoFilter = this.produtoStore.produtos.filter(produto => {
        return produto.value === item.id;
      });

      this.produtos_pedido = this.produtos_pedido.filter(produto => {
        if (produto.sequencia === item.sequencia) {
          produto.valor_unitario = produtoFilter[0].valor_unitario;
        }
        return produto;
      });
    },
    async calcTotal(item) {
      if (item) {
        this.produtos_pedido = this.produtos_pedido.filter(produto => {
          if (produto.sequencia === item.sequencia) {
            produto.valor_total = formatToBRL(
              parseNumber(produto.quantidade || "0,00") *
                parseNumber(produto.valor_unitario || "0,00") +
                parseNumber(produto.valor_desconto || "0,00")
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

      this.produtos_pedido.forEach(produto => {
        quantidade += parseNumber(produto.quantidade || "0,00");
        valor_desconto += parseNumber(produto.valor_desconto || "0,00");
        valor_total += parseNumber(produto.valor_total || "0,00");
      });
      this.totais = {
        quantidade: formatToBRL(quantidade).replace("R$", ""),
        valor_desconto: formatToBRL(valor_desconto),
        valor_total: formatToBRL(valor_total)
      };

      this.pedido.outras_despesas = this.pedido.outras_despesas;
      this.pedido.valor_produtos = this.totais.valor_total;
      this.pedido.valor_total = formatToBRL(
        parseNumber(this.totais.valor_total || "0,00") +
          parseNumber(this.pedido.outras_despesas || "0,00") +
          parseNumber(this.pedido.valor_frete || "0,00") +
          parseNumber(this.pedido.valor_seguro || "0,00") -
          parseNumber(this.pedido.valor_desconto || "0,00")
      );

      this.$refs.valor_frete.$el.getElementsByTagName(
        "input"
      )[0].value = this.pedido.valor_frete;
      this.$refs.valor_seguro.$el.getElementsByTagName(
        "input"
      )[0].value = this.pedido.valor_seguro;
      this.$refs.valor_desconto.$el.getElementsByTagName(
        "input"
      )[0].value = this.pedido.valor_desconto;
      this.$refs.outras_despesas.$el.getElementsByTagName(
        "input"
      )[0].value = this.pedido.outras_despesas;
      this.$refs.valor_produtos.$el.getElementsByTagName(
        "input"
      )[0].value = this.pedido.valor_produtos;
      this.$refs.valor_total.$el.getElementsByTagName(
        "input"
      )[0].value = this.pedido.valor_total;
    },
    setFreteSeguro() {
      this.disable = false;

      this.produtos_pedido.forEach(produto => {
        if (!produto.id || produto.quantidade == "0,00") return;
        produto.valor_frete = formatToBRL(
          (parseNumber(this.pedido.valor_frete || "0,00") /
            parseNumber(this.totais.quantidade || "0,00")) *
            parseNumber(produto.quantidade || "0,00")
        );
        produto.valor_seguro = formatToBRL(
          (parseNumber(this.pedido.valor_seguro || "0,00") /
            parseNumber(this.totais.quantidade || "0,00")) *
            parseNumber(produto.quantidade || "0,00")
        );

        var perc_add = parseNumber(produto.perc_custo_adicional || "0,00");
        var dif_aliquota = parseNumber(produto.dif_aliquota || "0,00");

        perc_add = perc_add ? (perc_add / 100) * soma : 0;
        dif_aliquota = dif_aliquota ? (dif_aliquota / 100) * soma : 0;
        produto.valor_custo = formatToBRL(
          (parseNumber(produto.valor_total) +
            parseNumber(produto.valor_frete || "0,00") +
            parseNumber(produto.valor_seguro || "0,00")) /
            parseNumber(produto.quantidade || "0,00")
        );
      });

      this.calcTotal().then(() => (this.disable = true));
    },
    deleteItem(item) {
      this.produtos_pedido = this.produtos_pedido.filter(produto => {
        return produto.sequencia !== item.sequencia;
      });
      this.calcTotal();
    },
    save() {
      if (!this.$refs.form.validate() || !this.$refs.form1.validate()) {
        return;
      }
      this.isLoading = true;

      const method = this.pedido.id ? "put" : "post";
      const id = this.pedido.id ? this.pedido.id : "";
      const urlpedidos = `${urlBD}/pedidos/${id}`;
      this.comprasStore.pedido = this.pedido;

      if (!this.pedido.id_empresa) {
        this.pedido.id_empresa = this.empresaStore.currentEmpresa;
      }

      this.pedido.produtos = this.produtos_pedido;

      axios[method](urlpedidos, this.pedido)
        .then(() => {
          this.$toasted.global.defaultSuccess();

          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
            "PEDIDOS",
            `Usuário ${this.usuarioStore.currentUsuario.nome} ${
              method === "post" ? "ADICIONOU" : "ALTEROU"
            } um pedido ao fornecedor ${this.pedido.id_pessoa}`
          );

          this.modalStore.compras.pedidos.visible = false;
        })
        .catch(showError)
        .then(() => (this.isLoading = false));
    }
  }
};
</script>

<style>
</style>
