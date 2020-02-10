<template>
  <v-dialog
    v-model="modalStore.compras.compras.importar"
    fullscreen
    persistent
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card v-if="modalStore.compras.compras.importar">
      <v-toolbar dark :color="color" class="m-0 p-0">
        <v-btn icon @click="modalStore.compras.compras.importar = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title
          class="headline text-white font-weight-light"
        >{{ modalStore.compras.compras.title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click>
          <v-icon>fa fa-2x fa-cog</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <v-container fluid grid-list-xl>
          <v-form v-model="valid" ref="form">
            <v-layout wrap justify-end>
              <v-flex xs12 md3>
                <v-layout wrap justify-end class="mt-1 mb-1">
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
                    <v-btn
                      slot="activator"
                      class="v-btn-common"
                      color="info"
                      @click="modalStore.compras.download = true"
                    >Download XML</v-btn>
                    <span>Realize o download do XML diretamente da receita</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <v-btn
                      slot="activator"
                      class="v-btn-common"
                      :color="color"
                      @click="save"
                      :loading="isLoadingSave"
                    >Importar</v-btn>
                    <span>Finalizar importação</span>
                  </v-tooltip>
                </v-layout>
              </v-flex>
            </v-layout>
          </v-form>

          <v-container fluid>
            <v-flex xs12 class="mb-4">
              <v-layout justify-center>
                <v-icon class="mt-2 mr-2">fa fa-2x fa-files-o</v-icon>
                <h2>Arquivos</h2>
              </v-layout>
            </v-flex>
            <v-flex xs12>
              <v-layout justify-center>
                <v-avatar class="danger ml-2 mr-1 mt-1" size="15" />XML já importado
                <v-avatar class="warning ml-2 mr-1 mt-1" size="15" />Fornecedor não cadastrado
                <v-avatar class="success ml-2 mr-1 mt-1" size="15" />XML ok
              </v-layout>
              <hr />
            </v-flex>
            <v-layout align-end>
              <v-spacer></v-spacer>
              <v-tooltip bottom>
                <v-btn
                  slot="activator"
                  class="v-btn-common"
                  :loading="isLoadingImport"
                  :color="color"
                  @click="pickFile"
                >Adicionar arquivos</v-btn>
                <span>Adicionar arquivos à importação</span>
              </v-tooltip>
              <input
                name="file"
                type="file"
                style="display: none"
                ref="xml"
                accept=".xml"
                multiple
                @change="onFilePicked"
              />
              <v-tooltip bottom>
                <v-btn
                  v-if="xmls.length > 0"
                  slot="activator"
                  class="v-btn-common"
                  :color="color"
                  @click="cadFornecs"
                  :loading="isLoadingCad"
                >Cadastrar fornecedores</v-btn>
                <span>Cadastro básico é gerardo para fornecedores não cadastrados</span>
              </v-tooltip>
            </v-layout>
          </v-container>

          <v-data-table
            class="elevation-5 mb-5"
            :items="xmls"
            :headers="fieldsArquivos"
            :pagination.sync="paginationArq"
            :rows-per-page-items="[5, 10, 20, 50, 100]"
            rows-per-page-text="Arquivos XML por página"
            no-data-text="Nenhum XML carregado"
            dense
          >
            <template slot="items" slot-scope="data">
              <td v-if="data.item.situacao === 1">
                <v-avatar class="success ml-2 mr-1 mb-3" size="15" />
              </td>
              <td v-else-if="data.item.situacao === 2">
                <v-avatar class="warning ml-2 mr-1 mb-3" size="15" />
              </td>
              <td v-else>
                <v-avatar class="danger ml-2 mr-1 mb-3" size="15" />
              </td>
              <td>{{ data.item.nfeProc.NFe.infNFe.emit.CNPJ }}</td>
              <td>{{ data.item.nfeProc.NFe.infNFe.emit.xNome }}</td>
              <td>{{ data.item.nfeProc.NFe.infNFe.ide.nNF }}</td>
              <td>{{ data.item.nfeProc.NFe.infNFe.total.ICMSTot.vNF }}</td>
              <td>
                <v-tooltip v-if="data.item.situacao === 2" bottom>
                  <b-button
                    slot="activator"
                    variant="secundary"
                    @click.prevent="addPessoa(data.item.nfeProc.NFe.infNFe.emit)"
                    class="mr-1"
                  >
                    <i class="fa fa-lg fa-plus-circle"></i>
                  </b-button>
                  <span>Adicionar fornecedor</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <b-button
                    slot="activator"
                    variant="secundary"
                    @click.prevent="removeArq(data.item)"
                    class="mr-1"
                  >
                    <i class="fa fa-lg fa-trash"></i>
                  </b-button>
                  <span>Remover arquivo</span>
                </v-tooltip>
              </td>
            </template>
          </v-data-table>

          <v-container fluid>
            <v-flex xs12 class="mb-4">
              <v-layout justify-center>
                <v-icon class="mt-2 mr-2">fa fa-2x fa-archive</v-icon>
                <h2>Produtos</h2>
              </v-layout>
            </v-flex>
            <v-flex xs12>
              <v-layout justify-center>
                <v-avatar class="danger ml-2 mr-1 mt-1" size="15" />Produto não associado/vinculado
                <v-avatar class="success ml-2 mr-1 mt-1" size="15" />Produto ok
              </v-layout>
              <hr />
            </v-flex>
            <v-layout align-end>
              <span>Edite valores diretamente na tabela</span>
              <v-spacer></v-spacer>
              <v-tooltip bottom>
                <v-btn
                  v-if="produtos.length > 0"
                  slot="activator"
                  class="v-btn-common"
                  :loading="isLoadingCad"
                  :color="color"
                  @click="cadProdutos"
                >Cadastrar produtos</v-btn>
                <span>Cadastro básico é gerardo para produtos não cadastrados</span>
              </v-tooltip>
            </v-layout>
          </v-container>

          <v-data-table
            class="elevation-5 mb-5"
            :items="produtos"
            :headers="fieldsProdutos"
            :pagination.sync="paginationProd"
            :rows-per-page-items="[5, 10, 20, 50, 100]"
            rows-per-page-text="Produtos por página"
            no-data-text="Nenhum XML carregado"
          >
            <template slot="items" slot-scope="data">
              <td v-if="data.item.situacao === 1">
                <v-avatar class="success ml-2 mr-1 mb-3" size="15" />
              </td>
              <td v-else>
                <v-avatar class="danger ml-2 mr-1 mb-3" size="15" />
              </td>
              <td>
                <v-flex xs6>
                  <small>{{ data.item.prod.cProd }} - {{ data.item.prod.xProd}}</small>
                  <v-autocomplete
                    class="tag-input"
                    chips
                    deletable-chips
                    v-model="data.item.id"
                    label="Selecione*"
                    :items="produtoStore.produtos"
                    no-data-text="Nenhum resultado"
                    prepend-icon="fa fa-lg fa-plus-circle"
                    @click:prepend="addProduto(data.item)"
                    auto-select-first
                  ></v-autocomplete>
                </v-flex>
              </td>
              <td>{{ data.item.prod.CFOP }}</td>
              <td>
                <v-flex xs6>
                  <v-text-field
                    v-model="data.item.prod.qtde_embalagem"
                    v-money="decimal"
                    @blur="calcEmbalagens(data.item)"
                  ></v-text-field>
                </v-flex>
              </td>
              <td>
                <v-flex xs12>{{ data.item.prod.qCom }}</v-flex>
                <small>{{ data.item.prod.uCom}}</small>
              </td>
              <td>{{ data.item.prod.vUnCom }}</td>
              <td>{{ data.item.prod.vProd }}</td>
              <td>{{ data.item.imposto.valor_st }}</td>
              <td>{{ data.item.imposto.valor_ipi }}</td>
              <td>{{ data.item.prod.valor_seguro }}</td>
              <td>{{ data.item.prod.valor_frete }}</td>
              <td>{{ data.item.prod.valor_desconto }}</td>
              <td>{{ data.item.prod.dif_aliquota }}</td>
              <td>
                <v-flex xs6>
                  <v-text-field
                    v-model="data.item.prod.perc_add"
                    v-money="percent"
                    @blur="addPercentual(data.item)"
                  ></v-text-field>
                </v-flex>
              </td>
              <td>{{ data.item.prod.valor_custo }}</td>
              <!-- <td>
                <v-tooltip bottom>
                  <b-button
                    v-if="data.item.id"
                    slot="activator"
                    variant="secundary"
                    @click.prevent="vincularProduto(data.item)"
                    class="mr-1"
                  >
                    <i class="fa fa-lg fa-check"></i>
                  </b-button>
                  <span>Vincular produto</span>
                </v-tooltip>
              </td>-->
            </template>
          </v-data-table>

          <v-container fluid>
            <v-flex xs12>
              <v-layout justify-center>
                <v-icon class="mt-2 mr-2">fa fa-2x fa-usd</v-icon>
                <h2>Financeiro</h2>
              </v-layout>
              <hr />
            </v-flex>
            <v-layout align-end>
              <span>Edite valores diretamente na tabela</span>
              <v-spacer></v-spacer>
            </v-layout>
          </v-container>

          <v-data-table
            class="elevation-5 mb-3"
            :items="financeiro"
            :headers="fieldsFinanceiro"
            :pagination.sync="paginationFinanc"
            :rows-per-page-items="[5, 10, 20, 50, 100]"
            rows-per-page-text="Parcelas por página"
            no-data-text="Nenhuma parcela adicionada"
            :expand="expand"
            item-key="sequencia"
          >
            <template slot="items" slot-scope="data">
              <td>{{ data.item.parcelas }}</td>
              <td>{{ data.item.nota_fiscal }}</td>
              <td>{{ data.item.vDup }}</td>
              <td>{{ data.item.dVenc }}</td>
              <td>
                <v-switch
                  v-model="data.item.pago"
                  :color="color"
                  hide-details
                  @click.native="[!data.expanded && data.item.pago ? data.expanded = true : limpaPagamento(data, data.item), calcTotalFinanc()]"
                ></v-switch>
              </td>
              <td>
                <v-tooltip bottom>
                  <b-button
                    v-if="data.item.pago"
                    slot="activator"
                    variant="secundary"
                    class="mr-1"
                    @click="data.expanded = !data.expanded"
                  >
                    <i class="fa fa-lg fa-pencil"></i>
                  </b-button>
                  <span>Editar dados do pagamento</span>
                </v-tooltip>
              </td>
            </template>
            <template slot="expand" slot-scope="data">
              <v-card v-if="data.expanded" flat>
                <v-card-title>
                  <span class="headline">Preencha os dados do pagamento desta parcela</span>
                </v-card-title>
                <v-card-text>
                  <v-layout wrap justify-start>
                    <v-flex xs12 md3>
                      <v-menu
                        v-model="data.item.menu1"
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
                            v-model="data.item.data_baixa"
                            prepend-icon="event"
                            label="Data do pagamento*"
                            readonly
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          :color="color"
                          v-model="data.item.dataNotFormated"
                          @input="[data.item.menu1 = false, data.item.data_baixa = formatDate(data.item.dataNotFormated)]"
                          locale="pt-br"
                        ></v-date-picker>
                      </v-menu>
                    </v-flex>
                    <v-flex xs12 md3>
                      <v-autocomplete
                        dense
                        :color="color"
                        :items="financeiroStore.documentos"
                        v-model="data.item.documento_baixa"
                        label="Documento*"
                        no-data-text="Nenhum resultado"
                      ></v-autocomplete>
                    </v-flex>
                    <v-flex xs12 md3>
                      <v-text-field
                        :color="color"
                        v-model="data.item.num_documento_baixa"
                        label="Número documento"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12 md3>
                      <v-text-field
                        :color="color"
                        v-model="data.item.observacao"
                        label="Alguma observação?"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-card-text>
              </v-card>
            </template>
            <template slot="footer">
              <td colspan="2">
                <h5>TOTAIS</h5>
              </td>
              <td colspan="2">
                <v-tooltip bottom>
                  <v-chip
                    slot="activator"
                    :color="getColor(totaisFinanc.valor)"
                    dark
                  >{{ totaisFinanc.valor || 'R$ 0,00' }}</v-chip>
                  <span>Esse valor corresponde ao valor total da compra</span>
                </v-tooltip>
              </td>
              <td colspan="2">{{ totaisFinanc.pago || 'Nenhuma parcela paga' }}</td>
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
  loadProdutos,
  loadPessoas
} from "@/global";
import axios from "axios";
import { mapState } from "vuex";
import { formatToBRL, formatToCNPJ } from "brazilian-values";

export default {
  directives: { money: VMoney },
  name: "ImportarPedido",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "modalStore",
      "comprasStore",
      "empresaStore",
      "pessoaStore",
      "produtoStore",
      "financeiroStore"
    ])
  },
  data() {
    return {
      isLoadingImport: false,
      isLoadingSave: false,
      isLoadingCad: false,
      expand: true,
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
      question: {
        prefix: "?.",
        decimal: "",
        thousands: ""
      },
      expand: false,
      valid: false,
      urlBD: urlBD,
      xmls: [],

      produtoFilter: "",
      produtos: [],
      produto: {},
      financeiro: [],

      fileName: "",
      fileUrl: "",
      file: "",
      files: [],
      fieldsArquivos: [
        { value: "situacao", text: "Situação", sortable: true },
        { value: "nfeProc.NFe.infNFe.emit.CNPJ", text: "CNPJ", sortable: true },
        {
          value: "nfeProc.NFe.infNFe.emit.xNome",
          text: "Fornecedor",
          sortable: true
        },
        {
          value: "nfeProc.NFe.infNFe.ide.nNF",
          text: "Nota fiscal",
          sortable: true
        },
        {
          value: "nfeProc.NFe.infNFe.total.ICMSTot.vNF",
          text: "Valor total"
        },
        { value: "actions", text: "Ações" }
      ],
      fieldsProdutos: [
        { value: "situacao", text: "Situação", sortable: true },
        { value: "prod.produto", text: "Produto", sortable: false },
        { value: "prod.CFOP", text: "CFOP", sortable: false },
        {
          value: "prod.qtde_embalagem",
          text: "Qtde por embalagem",
          sortable: false
        },
        { value: "prod.qCom", text: "Quantidade", sortable: false },
        { value: "prod.vUnCom", text: "Valor unitário", sortable: false },
        { value: "prod.vProd", text: "Valor total", sortable: false },
        { value: "imposto.valor_st", text: "Valor ST", sortable: false },
        { value: "imposto.valor_ipi", text: "Valor IPI", sortable: false },
        { value: "prod.valor_seguro", text: "Valor seguro", sortable: false },
        { value: "prod.valor_frete", text: "Valor frete", sortable: false },
        {
          value: "prod.valor_desconto",
          text: "Valor desconto",
          sortable: false
        },
        { value: "prod.dif_aliquota", text: "Dif. aliquota", sortable: false },
        { value: "prod.perc_add", text: "Perc. Adicional", sortable: false },
        {
          value: "prod.valor_custo",
          text: `Custo un. produto`,
          sortable: false
        }
      ],
      fieldsFinanceiro: [
        { value: "parcelas", text: "Parcelas" },
        { value: "nota_fiscal", text: "Nota fiscal" },
        { value: "vDup", text: "Valor" },
        { value: "dVenc", text: "Data de vencimento" },
        { value: "pago", text: "Pago?" },
        { value: "actions", text: "Ações" }
      ],
      totais: [
        { value: "quantidade" },
        { value: "valor_unitario" },
        { value: "valor_desconto" },
        { value: "valor_total" }
      ],
      totaisFinanc: [{ value: "valor" }, { value: "data" }, { value: "pago" }],
      paginationArq: {
        descending: true,
        page: 1,
        rowsPerPage: 10, // -1 for All,
        sortBy: "situacao",
        totalItems: 0
      },
      paginationProd: {
        descending: true,
        page: 1,
        rowsPerPage: 50, // -1 for All,
        sortBy: "situacao",
        totalItems: 0
      },
      paginationFinanc: {
        descending: true,
        page: 1,
        rowsPerPage: 10, // -1 for All,
        sortBy: "",
        totalItems: 0
      },
      empRules: [v => !!v || "Empresa é obrigatória"],
      dataRules: [v => !!v || "Datas são obrigatórias"],
      notaRules: [v => !!v || "Nota fiscal é obrigatória"],
      cfopRules: [
        v => !!v || "CFOP é obrigatório",
        v => (!!v && v !== "?.000") || "CFOP é obrigatório"
      ]
    };
  },
  watch: {
    "$store.state.modalStore.compras.compras.importar": function() {
      if (this.modalStore.compras.compras.importar) {
        this.limpaTela();
      }
    },
    "$store.state.modalStore.produtos.visible": function() {
      if (!this.modalStore.produtos.visible) {
        this.upload();
      }
    },
    "$store.state.modalStore.pessoas.visible": function() {
      if (!this.modalStore.pessoas.visible) {
        this.upload();
      }
    }
  },
  methods: {
    getColor(valor) {
      if (!this.valor_total || valor === this.valor_total) return "green";
      else return "red";
    },
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    async limpaTela() {
      this.reset();
      this.loadTela(this.comprasStore.compra);
    },
    async limpaPagamento(data, item) {
      data.expanded = false;
      data.item.data_baixa = "";
      data.item.documento_baixa = "";
      data.item.num_documento_baixa = "";
      data.item.observacao = "";
    },
    async reset() {
      this.xmls = [];
      this.produtos = [];
      this.produto = {};

      this.financeiro = [];
      this.totaisFinanc = {};

      this.isLoadingImport = this.isLoadingSave = this.isLoadingCad = false;

      this.fileName = "";
      this.fileUrl = "";
      this.file = "";
      this.files = [];

      this.$refs.form ? this.$refs.form.reset() : "";
    },
    async pickFile() {
      this.$refs.xml.click();
    },
    async onFilePicked(e) {
      this.files = [];
      const files = e.target.files;

      for (let i = 0; i < files.length; i++) {
        let fr = new FileReader();
        fr.readAsDataURL(files[i]);
        await fr.addEventListener("load", () => {
          this.files.push(files[i]);
        });
      }

      this.upload(files);
    },
    async validarXML() {
      const filesUpload = [];

      if (this.files.length > 0) {
        for (let i = 0; i < this.files.length; i++) {
          filesUpload.push(this.files[i].name);
        }
      } else if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          filesUpload.push(files[i].name);
        }
      } else return;

      axios
        .post(`${urlBD}/compras/prepararXML`, filesUpload)
        .then(res => {
          this.xmls = res.data; //joga os xmls selecionados na tela

          this.produtos = [];
          this.xmls.forEach(arquivo => {
            let fornecedor = arquivo.nfeProc.NFe.infNFe.emit.xNome;
            arquivo.nfeProc.NFe.infNFe.total.ICMSTot.vNF = formatToBRL(
              arquivo.nfeProc.NFe.infNFe.total.ICMSTot.vNF
            );
            arquivo.nfeProc.NFe.infNFe.det.forEach(produto => {
              produto.fornecedor = fornecedor;
              this.produtos.push(produto);
            });
          });

          this.$toasted.global.defaultSuccess();
        })
        .catch(showError);
    },
    async upload(files) {
      const fd = new FormData();
      const filesUpload = [];

      if (this.files.length > 0) {
        for (let i = 0; i < this.files.length; i++) {
          fd.append("xml", this.files[i], this.files[i].name);
          filesUpload.push(this.files[i].name);
        }
      } else if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          fd.append("xml", files[i], files[i].name);
          filesUpload.push(files[i].name);
        }
      } else return;

      this.isLoadingImport = true;
      await axios
        .post(`${urlBD}/uploadXML`, fd) // arquivos salvos no backend: uploads/xml
        .then(res => {
          axios
            .post(`${urlBD}/compras/prepararXML`, filesUpload)
            .then(async res => {
              this.xmls = res.data; //joga os xmls selecionados na tela

              this.produtos = [];
              this.financeiro = [];
              this.xmls.forEach(arquivo => {
                arquivo.nfeProc.NFe.infNFe.emit.CNPJ = formatToCNPJ(
                  arquivo.nfeProc.NFe.infNFe.emit.CNPJ
                );
                arquivo.nfeProc.NFe.infNFe.total.ICMSTot.vNF = formatToBRL(
                  arquivo.nfeProc.NFe.infNFe.total.ICMSTot.vNF
                );

                arquivo.nfeProc.NFe.infNFe.det.forEach(produto => {
                  this.produtos.push(produto);
                });
                delete arquivo.nfeProc.NFe.infNFe.det;

                if (arquivo.nfeProc.NFe.infNFe.cobr) {
                  arquivo.nfeProc.NFe.infNFe.cobr.dup.forEach(parcela => {
                    this.financeiro.push(parcela);
                  });
                  delete arquivo.nfeProc.NFe.infNFe.cobr;
                }
              });

              this.$toasted.global.defaultSuccess();
            })
            .then(() => {
              this.calcTotalFinanc();
              this.isLoadingImport = false;
            })
            .catch(showError);
        })
        .catch(showError);
    },
    async vincularProduto(produto) {
      if (!produto.id) return showError("Produto não selecionado");
      if (!produto.id_fornecedor)
        return showError("Fornecedor do produto não cadastrado");
      if (!produto.prod.cProd)
        return showError(
          "Código do produto do fornecedor não encontrado no XML"
        );

      const prod = {
        id_produto_empresa: produto.id,
        id_fornecedor: produto.id_fornecedor,
        id_produto_fornecedor: produto.prod.cProd,
        qtde_embalagem: produto.prod.qtde_embalagem || "0,00"
      };

      const url = `${urlBD}/compras/vinculacao`;

      axios
        .post(url, prod)
        .then(res => {
          produto.situacao = 1;
          this.$toasted.global.defaultSuccess();
        })
        .catch(showError);
    },
    async calcEmbalagens(item) {
      const produto = item.prod;

      const qtde = parseNumber(produto.qtde_embalagem);
      const valor_unitario = parseNumber(produto.vUnCom);
      const soma =
        parseNumber(produto.valor_frete) +
        parseNumber(produto.valor_seguro) +
        parseNumber(item.imposto.valor_ipi) +
        parseNumber(item.imposto.valor_st) -
        parseNumber(produto.valor_desconto) +
        parseNumber(produto.perc_add) / 100;

      produto.valor_custo =
        qtde != 0
          ? formatToBRL(valor_unitario / qtde + soma)
          : formatToBRL(valor_unitario + soma);
    },
    async addPercentual(item) {
      const produto = item.prod;

      const percentual = parseNumber(produto.perc_add);

      let custo =
        parseNumber(produto.vUnCom) +
        parseNumber(produto.valor_frete) +
        parseNumber(produto.valor_seguro) +
        parseNumber(item.imposto.valor_st || "0,00") +
        parseNumber(item.imposto.valor_ipi || "0,00");

      if (percentual !== 0) {
        custo += (percentual / 100) * custo;
      }

      produto.valor_custo = formatToBRL(custo);
    },
    async calcTotalFinanc() {
      let valor = 0,
        pago = 0;

      this.financeiro.forEach(parcela => {
        valor += parseNumber(parcela.vDup || "0,00");
        pago += parcela.pago ? parseNumber(parcela.vDup || "0,00") : 0;
      });

      this.totaisFinanc = {
        valor: formatToBRL(valor),
        pago:
          pago === 0
            ? "Nenhuma parcela paga"
            : `Total pago - ${formatToBRL(pago)}`
      };
    },
    async removeArq(arquivo) {
      this.xmls = this.xmls.filter(xml => {
        return (
          xml.nfeProc.NFe.infNFe.emit.CNPJ !==
          arquivo.nfeProc.NFe.infNFe.emit.CNPJ
        );
      });
      this.produtos = this.produtos.filter(produto => {
        return produto.fornec !== arquivo.nfeProc.NFe.infNFe.emit.CNPJ;
      });
      this.financeiro = this.financeiro.filter(parcela => {
        return parcela.nota_fiscal !== arquivo.nfeProc.NFe.infNFe.ide.nNF;
      });
      this.calcTotalFinanc();
    },
    async cadFornecs() {
      this.isLoadingCad = true;
      var pessoas = this.xmls.map(xml => xml.nfeProc.NFe.infNFe.emit);
      var reduced = [];

      // elimina valores duplicados
      pessoas = pessoas.forEach(item => {
        var duplicated =
          reduced.findIndex(redItem => {
            return item.xNome == redItem.xNome;
          }) > -1;

        if (!duplicated) {
          reduced.push(item);
        }
      });

      const url = `${urlBD}/pessoas`;
      let requests = reduced.map(async pessoa => {
        const pessoaAtt = {
          tipo: "Jurídica",
          cnpj: formatToCNPJ(pessoa.CNPJ),
          nome: pessoa.xNome,
          contato: pessoa.fone,
          cep: pessoa.enderEmit.CEP,
          uf: pessoa.enderEmit.UF,
          cidade: pessoa.enderEmit.xMun,
          numero: pessoa.enderEmit.nro !== "S/N" ? pessoa.enderEmit.nro : "",
          bairro: pessoa.enderEmit.xBairro,
          logradouro: pessoa.enderEmit.xLgr,
          complemento: pessoa.enderEmit.xCpl,
          id_cidade: pessoa.enderEmit.cMun,
          situacao: "Ativo",
          fornecedor: true
        };

        return axios.post(url, pessoaAtt).catch(showError);
      });

      await Promise.all(requests).then(arrayOfResponses => {
        loadPessoas().then(() => this.upload());
      });

      this.isLoadingCad = false;
    },
    async cadProdutos() {
      this.isLoadingCad = true;
      var prods = this.produtos;
      var reduced = [];

      // elimina valores duplicados
      prods = prods.forEach(item => {
        var duplicated =
          reduced.findIndex(redItem => {
            return item.prod.cProd == redItem.prod.cProd && item.situacao !== 3;
          }) > -1;

        if (!duplicated) {
          reduced.push(item);
        }
      });

      const url = `${urlBD}/produtos`;
      let requests = reduced.map(async produto => {
        if (produto.situacao !== 2) return;
        if (!produto.fornec) return;

        const produtoAtt = {
          descricao: produto.prod.xProd,
          id_fornecedor: produto.prod.cProd,
          valor_unitario: produto.prod.vUnCom,
          fornecedor: produto.id_fornecedor || null
        };

        return axios.post(url, produtoAtt).catch(showError);
      });

      await Promise.all(requests).then(arrayOfResponses => {
        loadProdutos().then(() => this.upload());
      });
      this.isLoadingCad = false;
    },
    async addPessoa(fornec) {
      this.pessoaStore.pessoa = {
        tipo: "Jurídica",
        cnpj: fornec.CNPJ,
        nome: fornec.xNome,
        contato: fornec.fone,
        cep: fornec.enderEmit.CEP,
        uf: fornec.enderEmit.UF,
        cidade: fornec.enderEmit.xMun,
        numero: fornec.enderEmit.nro !== "S/N" ? fornec.enderEmit.nro : "",
        bairro: fornec.enderEmit.xBairro,
        logradouro: fornec.enderEmit.xLgr,
        complemento: fornec.enderEmit.xCpl,
        id_cidade: fornec.enderEmit.cMun,
        situacao: "Ativo",
        fornecedor: true
      };
      this.modalStore.pessoas.visible = true;
    },
    async addProduto(produto) {
      this.produtoStore.produto = {
        descricao: produto.prod.xProd,
        id_fornecedor: produto.prod.cProd,
        valor_unitario: produto.prod.vUnCom,
        fornecedor: this.pessoaStore.pessoas.find(
          pessoa => pessoa.cnpj === produto.fornec
        )
      };
      this.produtoStore.produto.fornecedor = this.produtoStore.produto
        .fornecedor
        ? this.produtoStore.produto.fornecedor.value
        : null;

      this.modalStore.produtos.visible = true;
    },
    async loadTela(compra) {
      let url = `${urlBD}/compras/Tela`;

      if (!compra) {
        axios
          .get(url)
          .then(res => {
            const tela = res.data;

            this.pessoaStore.pessoas = tela.pessoas;
            this.financeiroStore.documentos = tela.documentos;
            this.produtoStore.produtos = tela.produtos.map(produto => {
              produto.valor_unitario = formatToBRL(produto.valor_unitario);
              return produto;
            });
          })
          .catch(showError);
      } else if (compra.id) {
        axios
          .get(`${url}/${compra.id}`)
          .then(res => {
            const tela = res.data;

            this.compra = tela.compra;

            this.pessoaStore.pessoas = tela.pessoas;
            this.financeiroStore.documentos = tela.documentos;
            this.produtoStore.produtos = tela.produtos.map(produto => {
              produto.valor_unitario = formatToBRL(produto.valor_unitario);
              return produto;
            });
            this.parseValores();
            this.calcTotalFinanc();
          })
          .catch(showError);
      }
    },
    save() {
      this.isLoadingSave = true;

      const filesUpload = [];

      if (this.xmls.length === 0) {
        showError("Não há nada para ser importado!");
        return;
      } else {
        this.xmls.forEach(xml => {
          let arquivo = {};
          arquivo.id_empresa = this.empresaStore.currentEmpresa.value;
          arquivo.situacao = xml.situacao;
          arquivo.xml = this.files.find(file => {
            if (file.name.includes(xml.nfeProc.protNFe.infProt.chNFe))
              return file.name;
          });
          arquivo.xml = arquivo.xml && arquivo.xml.name ? arquivo.xml.name : "";
          arquivo.dados = {
            fornecedor: xml.nfeProc.NFe.infNFe.emit.xNome,
            cnpj: xml.nfeProc.NFe.infNFe.emit.CNPJ,
            ...xml.nfeProc.NFe.infNFe.ide,
            ...xml.nfeProc.NFe.infNFe.total.ICMSTot,
            ...xml.nfeProc.protNFe.infProt,
            observacao: xml.nfeProc.NFe.infNFe.infAdic
          };
          arquivo.produtos = this.produtos;
          arquivo.financeiro = this.financeiro;
          filesUpload.push(arquivo);
        });
      }

      axios
        .post(`${urlBD}/compras/importarXML`, filesUpload)
        .then(res => {
          this.$toasted.global.defaultSuccess();

          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
            "COMPRAS",
            `Usuário ${this.usuarioStore.currentUsuario.nome} IMPORTOU com ${this.xmls.length} arquivos`
          );

          this.modalStore.compras.compras.importar = false;
        })
        .catch(showError)
        .then(() => (this.isLoadingSave = false));
    }
  }
};
</script>

<style>
</style>
