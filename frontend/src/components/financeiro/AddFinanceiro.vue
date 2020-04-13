<template>
  <v-dialog
    v-model="modalStore.financeiro.financ.visible"
    fullscreen
    persistent
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card v-if="modalStore.financeiro.financ.visible">
      <v-toolbar fixed dark :color="color">
        <v-toolbar-side-icon @click="modalStore.financeiro.financ.visible = false">
          <v-icon>close</v-icon>
        </v-toolbar-side-icon>
        <v-toolbar-title
          class="headline white--text font-weight-light"
        >{{ modalStore.financeiro.financ.title }}</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn class="mr-3" icon @click="limpaTela">
          <v-icon>fa fa-2x fa-eraser</v-icon>
        </v-btn>
        <v-btn class="mr-3" icon @click="save">
          <v-icon>fa fa-2x fa-check</v-icon>
        </v-btn>
        <v-btn class="mr-3" icon>
          <v-icon>fa fa-2x fa-cog</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <v-container fluid grid-list-xl class="my-5">
          <v-form v-model="valid" ref="form">
            <v-text-field label="id" v-model="financ.id" v-show="false"></v-text-field>
            <v-text-field v-model="financ.id_empresa" v-show="false"></v-text-field>
            <v-layout wrap>
              <v-flex xs12 md3>
                <v-autocomplete
                  class="tag-input"
                  chips
                  dense
                  :color="color"
                  label="Pessoa*"
                  :items="pessoaStore.pessoas"
                  prepend-icon="fa fa-lg fa-plus-circle"
                  @click:prepend="[pessoaStore.pessoa = null, modalStore.pessoas.visible = true]"
                  v-model="financ.id_pessoa"
                  no-data-text="Nenhuma pessoa cadastrada"
                  :rules="pessoaRules"
                  @change="[getTipoConta(), loadPessoa()]"
                  @focus="$store.dispatch('loadPessoas')"
                  deletable-chips
                  :search-input.sync="searchPessoa"
                >
                  <template v-slot:no-data>
                    <v-btn
                      type="submit"
                      color="secondary"
                      flat
                      small
                      v-if="searchPessoa"
                      @click="$store.dispatch('addPessoa', { nome: searchPessoa })"
                    >
                      <span>
                        <v-icon>fa fa-lg fa-plus-circle</v-icon>
                        {{ searchPessoa }}
                      </span>
                    </v-btn>
                  </template>
                </v-autocomplete>
              </v-flex>
              <v-flex xs12 md3>
                <v-autocomplete
                  class="tag-input"
                  chips
                  dense
                  :color="color"
                  :items="[{value: 1, text: 'PAGAR'}, {value: 2, text:'RECEBER'}]"
                  label="Tipo de conta*"
                  v-model="financ.tipo_conta"
                  no-data-text="Sem dados"
                  :rules="pessoaRules"
                  @change="loadClassificacoes()"
                  deletable-chips
                ></v-autocomplete>
              </v-flex>
            </v-layout>
          </v-form>

          <v-container fluid>
            <v-layout justify-start wrap class="bege mb-4">
              <v-flex xs12 md4>
                <v-card flat>
                  <v-layout justify-center wrap>
                    <v-card-title>
                      <span class="headline">Dados da conta</span>
                    </v-card-title>
                    <v-card-text>
                      <v-container grid-list-xl>
                        <v-form v-model="valid1" ref="form1">
                          <v-layout wrap>
                            <v-flex xs12 md6>
                              <v-autocomplete
                                class="tag-input"
                                chips
                                dense
                                :color="color"
                                label="Classificação"
                                v-model="financ.classificacao"
                                :items="classificacaoStore.classificacoes"
                                no-data-text="Selecione o tipo de conta para carregar as classificações"
                                prepend-icon="fa fa-lg fa-plus-circle"
                                @click:prepend="[financeiroStore.classificacao = null, modalStore.classificacoes.visible = true]"
                                deletable-chips
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-autocomplete
                                class="tag-input"
                                chips
                                dense
                                :color="color"
                                label="Documento"
                                v-model="financ.documento_origem"
                                :items="financeiroStore.documentos"
                                no-data-text="Nenhum documento encontrado"
                                prepend-icon="fa fa-lg fa-plus-circle"
                                @click:prepend="[financeiroStore.documento = null, modalStore.documentos.visible = true]"
                                @focus="$store.dispatch('loadDocumentos')"
                                deletable-chips
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12>
                              <v-menu
                                ref="date"
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
                                    :color="color"
                                    v-model="computedDateFormatted"
                                    label="Data da emissão do documento"
                                    prepend-icon="event"
                                    readonly
                                    v-on="on"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  :color="color"
                                  v-model="financ.data_emissao"
                                  @input="menu = false"
                                  locale="pt-br"
                                ></v-date-picker>
                              </v-menu>
                            </v-flex>
                          </v-layout>
                        </v-form>
                      </v-container>
                    </v-card-text>
                  </v-layout>
                </v-card>
              </v-flex>
              <v-flex xs12 md4>
                <v-card flat>
                  <v-layout justify-center wrap>
                    <v-card-title>
                      <span class="headline">Dados da pessoa</span>
                    </v-card-title>
                    <v-card-text>
                      <v-container grid-list-xl>
                        <v-layout wrap>
                          <v-flex xs12 md4>
                            <v-text-field
                              v-model="pessoa.cpf_cnpj"
                              readonly
                              :color="color"
                              label="CPF/CNPJ"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 md4>
                            <v-text-field
                              v-model="pessoa.situacao"
                              readonly
                              :color="color"
                              label="Situação da pessoa"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 md4>
                            <v-text-field
                              v-model="pessoa.email"
                              readonly
                              :color="color"
                              label="E-mail"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 md4>
                            <v-text-field
                              v-model="pessoa.contato"
                              readonly
                              :color="color"
                              label="Contato"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 md4>
                            <v-text-field
                              v-model="pessoa.categoria"
                              readonly
                              :color="color"
                              label="Categoria"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 md4>
                            <v-text-field
                              ref="pessoa_financeiro"
                              v-model="pessoa.financeiro"
                              readonly
                              :color="getColorPessoa(pessoa.financeiro)"
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
                              ref="valor_total"
                              v-model="financ.valor_total"
                              :color="color"
                              label="VALOR TOTAL DA CONTA"
                              v-money="money"
                              :rules="valorRules"
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
                <v-icon class="my-4 mr-1">fa fa-2x fa-usd</v-icon>
                <h2>Parcelas</h2>
              </v-layout>
              <v-divider></v-divider>
            </v-flex>
            <v-layout align-end>
              <span>Edite valores diretamente na tabela</span>
              <v-spacer></v-spacer>
              <v-tooltip bottom>
                <v-btn
                  slot="activator"
                  class="v-btn-common"
                  :color="color"
                  @click="addParcela()"
                >Adicionar parcela</v-btn>
                <span>Adicionar nova parcela à financ</span>
              </v-tooltip>
            </v-layout>
          </v-container>

          <v-data-table
            class="elevation-5 mb-3"
            :items="financeiro"
            :headers="fieldsFinanceiro"
            :pagination.sync="paginationFinanc"
            :rows-per-page-items="[5, 10, 20]"
            rows-per-page-text="Parcela por página"
            no-data-text="Nenhuma parcela adicionada"
            :expand="expand"
            item-key="parcela"
          >
            <template slot="items" slot-scope="data">
              <td>{{ data.item.parcela }}</td>
              <td>
                <v-flex xs10>
                  <v-text-field
                    v-model="data.item.num_documento_origem"
                    placeholder="Número do documento"
                  ></v-text-field>
                </v-flex>
              </td>
              <td>
                <v-flex xs8>
                  <v-text-field
                    v-if="disable"
                    v-model="data.item.valor"
                    v-money="money"
                    @blur="[data.item.edit = true, attGridParc()]"
                  ></v-text-field>
                  <span v-else>{{ data.item.valor || "R$ 0,00"}}</span>
                </v-flex>
              </td>
              <td>
                <v-flex xs8>
                  <v-menu
                    v-model="data.item.menu"
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
                        v-model="data.item.data_vencimento"
                        prepend-icon="event"
                        readonly
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      :color="color"
                      v-model="data.item.dataNotFormated"
                      @input="[data.item.menu = false, data.item.data_vencimento = formatDate(data.item.dataNotFormated)]"
                      locale="pt-br"
                    ></v-date-picker>
                  </v-menu>
                </v-flex>
              </td>
              <td>
                <v-flex xs10>
                  <v-text-field v-model="data.item.observacao" placeholder="Alguma observação?"></v-text-field>
                </v-flex>
              </td>
              <td>
                <v-switch
                  v-model="data.item.pago"
                  :color="color"
                  hide-details
                  @click.native="[!data.expanded && data.item.pago ? [data.expanded = true, loadPagamento(data.item)] : limpaPagamento(data), calcTotalFinanc()]"
                ></v-switch>
              </td>
              <td>
                <v-tooltip bottom>
                  <v-btn
                    v-if="data.item.pago"
                    slot="activator"
                    icon
                    class="mr-1"
                    @click="data.expanded = !data.expanded"
                  >
                    <i class="fa fa-lg fa-pencil"></i>
                  </v-btn>
                  <span>Editar dados do pagamento</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn
                    v-if="!modalStore.financeiro.financ.title.includes('Alterar')"
                    slot="activator"
                    icon
                    class="mr-1"
                    @click="deleteParcela(data.item)"
                  >
                    <i class="fa fa-lg fa-trash"></i>
                  </v-btn>
                  <span>Excluir parcela</span>
                </v-tooltip>
              </td>
            </template>
            <template slot="expand" slot-scope="data">
              <v-card v-if="data.expanded" flat color="bege">
                <v-card-title>
                  <span class="headline">Preencha os dados do pagamento desta parcela</span>
                </v-card-title>
                <v-card-text>
                  <v-layout row wrap>
                    <v-flex xs12 md2>
                      <v-autocomplete
                        clearable
                        dense
                        :color="color"
                        label="Conta*"
                        v-model="data.item.id_conta"
                        :items="financeiroStore.contas"
                        no-data-text="Nenhum caixa encontrado"
                        prepend-icon="fa fa-lg fa-plus-circle"
                        @click:prepend="[financeiroStore.caixa = null, modalStore.financeiro.caixa.visible = true]"
                        @change="loadSaldoConta(data.item)"
                      ></v-autocomplete>
                    </v-flex>
                    <v-flex xs12 md2>
                      <v-text-field
                        label="Saldo em conta"
                        placeholder="Selecione a conta para carregar"
                        readonly
                        v-model="data.item.saldo_atual"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                  <v-layout row wrap>
                    <v-flex xs12 md2>
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
                    <v-flex xs12 md2>
                      <v-autocomplete
                        dense
                        :color="color"
                        label="Forma de pagamento"
                        v-model="data.item.documento_baixa"
                        :items="financeiroStore.documentos"
                        no-data-text="Nenhum documento encontrado"
                        prepend-icon="fa fa-lg fa-plus-circle"
                        @click:prepend="[financeiroStore.documento = null, modalStore.documentos.visible = true]"
                      ></v-autocomplete>
                    </v-flex>
                    <v-flex xs12 md2>
                      <v-text-field
                        :color="color"
                        v-model="data.item.num_documento_baixa"
                        label="Número documento"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12 md2>
                      <v-text-field
                        v-model="data.item.valor_acrescimo"
                        :color="color"
                        label="Valor acréscimo"
                        v-money="money"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12 md2>
                      <v-text-field
                        v-model="data.item.valor_desconto"
                        :color="color"
                        label="Valor desconto"
                        v-money="money"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12 md2>
                      <v-text-field
                        v-model="data.item.valor_pago"
                        :color="color"
                        label="Valor pago"
                        v-money="money"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-card-text>
              </v-card>
            </template>
            <template slot="footer" v-if="!modalStore.financeiro.financ.title.includes('Alterar')">
              <td colspan="2">
                <h5>TOTAIS</h5>
              </td>
              <td>
                <v-tooltip bottom>
                  <v-chip
                    slot="activator"
                    :color="getColor(totaisFinanc.valor)"
                    dark
                  >{{ totaisFinanc.valor || 'R$ 0,00' }}</v-chip>
                  <span>Esse valor deve corresponder ao valor total da conta</span>
                </v-tooltip>
              </td>
              <td colspan="2">{{ totaisFinanc.data || '0 meses' }}</td>
              <td>{{ totaisFinanc.pago || 'Nenhuma parcela paga' }}</td>
            </template>
          </v-data-table>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { VMoney } from "v-money";
import { urlBD, showError, parseNumber, formatDate, saveLog } from "@/global";
import axios from "axios";
import { mapState } from "vuex";
import { formatToBRL, isCPF } from "brazilian-values";

export default {
  directives: { money: VMoney },
  name: "AddCPag",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "modalStore",
      "financeiroStore",
      "empresaStore",
      "pessoaStore",
      "usuarioStore",
      "classificacaoStore"
    ]),
    computedDateFormatted: {
      get() {
        return formatDate(this.financ.data_emissao);
      },
      set(value) {
        this.financ.data_emissao = formatDate(value);
      }
    }
  },
  data() {
    return {
      financ: {},
      pessoa: {},
      financeiro: [],
      isLoading: false,
      menu: false,
      disable: true,
      valid: true,
      valid1: true,
      searchPessoa: null,
      expand: false,
      fieldsFinanceiro: [
        { value: "parcela", text: "Parcela" },
        { value: "num_documento_origem", text: "Número documento" },
        { value: "valor", text: "Valor da parcela" },
        { value: "data", text: "Data de vencimento" },
        { value: "observacao", text: "Observações" },
        { value: "pago", text: "Pago?" },
        { value: "actions", text: "Ações" }
      ],
      totaisFinanc: [{ value: "valor" }, { value: "data" }, { value: "pago" }],
      paginationFinanc: {
        descending: false,
        page: 1,
        rowsPerPage: 5, // -1 for All,
        sortBy: "parcela",
        totalItems: 0
      },
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
      empRules: [v => !!v || "Empresa é obrigatória"],
      pessoaRules: [v => !!v || "Pessoa é obrigatória"],
      dataRules: [v => !!v || "Datas são obrigatórias"],
      valorRules: [
        v => !!v || "Valor total é obrigatório",
        v => (!!v && v !== "R$ 0,00") || "Valor total não pode ser 0,00"
      ]
    };
  },
  watch: {
    "$store.state.modalStore.financeiro.financ.visible": function() {
      if (this.modalStore.financeiro.financ.visible) {
        this.limpaTela();
      }
    }
  },
  methods: {
    getColor(valor) {
      if (!this.financ.valor_total || valor === this.financ.valor_total)
        return "green";
      else return "red";
    },
    getColorPessoa(financeiro) {
      if (financeiro === "OK") return "green";
      else if (financeiro === "Venda impossibilitada") return "red";
      else return "yellow darken";
    },
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    loadSaldoConta(item) {
      if (!item.id_conta) {
        item.saldo_atual = "";
        return;
      }

      item.saldo_atual = formatToBRL(
        this.financeiroStore.contas.find(conta => conta.value == item.id_conta)
          .saldo_atual || 0
      );
    },
    async limpaTela() {
      this.reset();
      this.loadTela(this.financeiroStore.financ);
    },
    getTipoConta() {
      if (!this.pessoa) {
        this.financ.tipo_conta = "";
        return;
      }
      if (isCPF(this.pessoa.cpf_cnpj)) this.financ.tipo_conta = 2;
      else this.financ.tipo_conta = 1;

      this.loadClassificacoes();
    },
    loadClassificacoes() {
      if (!this.financ.tipo_conta) {
        this.classificacaoStore.classificacoes = [];
        return;
      }

      const url = `${urlBD}/classificacoes/?tipo=${
        this.financ.tipo_conta == 1 ? 2 : 1
      }`;
      axios.get(url).then(res => {
        this.classificacaoStore.classificacoes = res.data.map(item => {
          item.text = item.descricao;
          item.value = item.id;
          return item;
        });
      });
    },
    reset() {
      this.financ = {};
      this.pessoa = {};
      this.totaisFinanc = {};
      this.financeiro = [];
      this.classificacaoStore.classificacoes = [];

      this.$refs.form ? this.$refs.form.reset() : "";
      this.$refs.form1 ? this.$refs.form1.reset() : "";

      this.$refs.valor_total
        ? (this.$refs.valor_total.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.valor_desconto
        ? (this.$refs.valor_desconto.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.valor_multa
        ? (this.$refs.valor_multa.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";

      // this.addParcela();
    },
    loadPagamento(item) {
      item.data_baixa = formatDate(new Date().toISOString().substr(0, 10));
      item.valor_pago = item.valor;
    },
    limpaPagamento(data) {
      data.expanded = false;

      delete data.item.data_baixa;
      delete data.item.documento_baixa;
      delete data.item.num_documento_baixa;
      delete data.item.observacao;
    },
    loadTela(financ) {
      if (!financ) return;

      this.$store.dispatch("loadPessoas");
      this.$store.dispatch("loadDocumentos");
      this.$store.dispatch("loadContas");
      let url = `${urlBD}/financeiro`;
      if (financ.id) {
        axios
          .get(`${url}/${financ.id}`)
          .then(res => {
            this.financ = res.data;

            this.parseValores();
            this.calcTotalFinanc();
            this.financ.id_pessoa ? this.loadPessoa() : "";
          })
          .catch(showError);
      }
    },
    parseValores() {
      this.financ.data_emissao = new Date(this.financ.data_emissao)
        .toISOString()
        .substr(0, 10);
      this.financ.data_vencimento = new Date(this.financ.data_vencimento)
        .toISOString()
        .substr(0, 10);

      this.$refs.valor_total.$el.getElementsByTagName(
        "input"
      )[0].value = formatToBRL(this.financ.valor_total);

      this.financeiro.push({
        parcela: this.financ.parcela,
        num_documento_origem: this.financ.num_documento_origem,
        valor: formatToBRL(this.financ.valor_parcela),
        data_vencimento: formatDate(this.financ.data_vencimento),
        observacao: this.financ.observacao,
        pago: this.financ.pago,

        data_baixa: this.financ.data_baixa
          ? formatDate(this.financ.data_baixa)
          : undefined,
        documento_baixa: this.financ.documento_baixa || undefined,
        num_documento_baixa: this.financ.num_documento_baixa || undefined,
        valor_acrescimo: formatToBRL(this.financ.valor_acrescimo || 0),
        valor_desconto: formatToBRL(this.financ.valor_desconto || 0),
        valor_pago: formatToBRL(this.financ.valor_pago || 0)
      });
    },
    async loadPessoa() {
      if (!this.financ) return;

      if (this.financ.id_pessoa) {
        const url = `${urlBD}/pessoasComFinanceiro/${this.financ.id_pessoa}`;

        axios.get(url).then(res => {
          this.pessoa = res.data;
          this.pessoa.cpf_cnpj = res.data.cpf ? res.data.cpf : res.data.cnpj;
        });
        this.$refs.pessoa_financeiro.focus();
      } else {
        this.pessoa = {};
      }
    },
    async addParcela(addParc) {
      if (!addParc) {
        let data;
        let perc_juros;
        if (this.financeiro.length > 0) {
          data = this.financeiro[this.financeiro.length - 1].data_vencimento;
          const [day, month, year] = data.split("/");
          perc_juros = this.financeiro[this.financeiro.length - 1].perc_juros;

          data = new Date(year, month, day).toISOString().substr(0, 10);
        } else {
          data = new Date().toISOString().substr(0, 10);
        }

        const parcela = {
          edit: false,
          parcela:
            this.financeiro.length + 1 + "/" + (this.financeiro.length + 1),
          data,
          perc_juros,
          data_vencimento: formatDate(data)
        };
        this.financeiro.push(parcela);
      }
      this.attGridParc();
    },
    async attGridParc() {
      // gambiarra necessária para forçar o campo valor a se atualizar
      this.disable = false;
      const valor = formatToBRL(
        parseNumber(this.financ.valor_total || "0,00") / this.financeiro.length
      );

      this.financeiro.forEach(item => {
        const parcelaAtual = item.parcela.split("/");
        item.parcela = parcelaAtual[0] + "/" + this.financeiro.length;

        if (!item.edit) item.valor = valor;
      });

      this.calcTotalFinanc().then(() => (this.disable = true));
    },
    calcValorJuros(item) {
      if (!item) return;

      item.valor_juros = formatToBRL(
        (parseNumber(item.perc_juros || "0,00") / 100) *
          parseNumber(item.valor || "0,00")
      );
    },
    async calcTotalFinanc() {
      let valor = 0,
        data = 0,
        pago = 0;

      this.financeiro.forEach(parcela => {
        valor += parseNumber(parcela.valor || "0,00");
        data += 1;
        pago += parcela.pago ? parseNumber(parcela.valor || "0,00") : 0;
      });

      this.totaisFinanc = {
        valor: formatToBRL(valor),
        data: data === 1 ? `${data} mês` : `${data} meses`,
        pago:
          pago === 0
            ? "Nenhuma parcela paga"
            : `Total pago - ${formatToBRL(pago)}`
      };
    },
    async deleteParcela(parcela) {
      if (parcela) {
        this.financeiro = this.financeiro.filter(item => {
          return item.parcela !== parcela.parcela;
        });
      }

      this.calcTotalFinanc();
    },
    save() {
      if (!this.$refs.form.validate()) return;

      this.isLoading = true;

      const method = this.financ.id ? "put" : "post";
      const id = this.financ.id ? this.financ.id : "";
      const url = `${urlBD}/financeiro/${id}`;

      if (!this.financ.id_empresa) {
        this.financ.id_empresa = this.empresaStore.currentEmpresa;
      }

      const financeiro = this.financeiro.map(item => {
        return { ...this.financ, ...item };
      });

      axios[method](url, financeiro)
        .then(res => {
          this.$toasted.global.defaultSuccess();
          if (!this.modalStore.financeiro.financ.title.includes("Alterar"))
            this.limpaTela();
          else this.modalStore.financeiro.financ.visible = false;

          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
            "FINANCEIRO",
            `Usuário ${this.usuarioStore.currentUsuario.nome} ${
              method === "post" ? "ADICIONOU" : "ALTEROU"
            } uma conta`
          );
        })
        .catch(showError)
        .then(() => (this.isLoading = false));
    }
  }
};
</script>

<style>
</style>