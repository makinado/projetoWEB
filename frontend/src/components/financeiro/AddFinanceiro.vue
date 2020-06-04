<template>
  <v-dialog
    v-model="modalStore.financeiro.financ.visible"
    fullscreen
    persistent
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card v-if="modalStore.financeiro.financ.visible">
      <v-toolbar dense flat extended fixed extension-height="5" dark :color="color">
        <v-toolbar-side-icon
          @click="[financeiroStore.financ = null, modalStore.financeiro.financ.visible = false]"
        >
          <v-icon>close</v-icon>
        </v-toolbar-side-icon>
        <v-toolbar-title
          class="headline white--text font-weight-light"
        >{{ modalStore.financeiro.financ.title }}</v-toolbar-title>

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
          <span>Salvar nova conta</span>
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
                  @change="loadPessoa"
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
                  :rules="tipoRules"
                  deletable-chips
                  @change="delete financ.classificacao"
                ></v-autocomplete>
              </v-flex>
            </v-layout>
          </v-form>

          <v-container fluid>
            <v-layout justify-start wrap class="bege mb-4">
              <v-flex xs12 md6>
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
                                dense
                                :color="color"
                                label="Classificação"
                                v-model="financ.classificacao"
                                :items="classificacaoStore.classificacoes"
                                no-data-text="Selecione o tipo de conta para carregar as classificações"
                                prepend-icon="fa fa-lg fa-plus-circle"
                                @click:prepend="[financeiroStore.classificacao = null, modalStore.classificacoes.visible = true]"
                                clearable
                                item-text="path"
                                @focus="getTipoConta"
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md6>
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
              <v-flex xs12 md6>
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
            </v-layout>

            <FinanceiroVue
              :component="financ"
              :showTotais="!modalStore.financeiro.financ.title.includes('Visualizar')"
              :valor_total="financ.valor_total"
            />
          </v-container>
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
  components: {
    FinanceiroVue: () => import("../material/Financeiro")
  },
  data() {
    return {
      financ: {},
      pessoa: {},
      financeiro: [],
      isLoading: false,
      menu: false,
      valid: true,
      valid1: true,
      searchPessoa: null,
      money: {
        decimal: ",",
        thousands: ".",
        precision: 2,
        prefix: "R$ "
      },
      tipoRules: [v => !!v || "Tipo é obrigatório"],
      pessoaRules: [v => !!v || "Pessoa é obrigatória"],
      dataRules: [v => !!v || "Datas são obrigatórias"],
      valorRules: [
        v => !!v || "Valor total é obrigatório",
        v => (!!v && v !== "R$ 0,00") || "Valor total não pode ser 0,00"
      ]
    };
  },
  watch: {
    "$store.state.modalStore.financeiro.financ.visible"(val) {
      if (this.modalStore.financeiro.financ.visible) {
        this.limpaTela();
      }

      document.querySelector("html").style.overflow = val ? "hidden" : null;
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
    async limpaTela() {
      this.reset();
      this.loadTela(this.financeiroStore.financ);
    },
    getTipoConta() {
      if (!this.financ.tipo_conta) {
        this.$store.commit("setClassificacoes", []);
        return;
      }

      this.$store.dispatch(
        "loadClassificacoes",
        this.financ.tipo_conta == 1 ? 2 : 1
      );
    },
    reset() {
      this.financ = {};
      this.pessoa = {};
      this.totaisFinanc = {};
      this.financeiroStore.financ = [];
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
    loadPessoa() {
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
    save() {
      if (!this.$refs.form.validate()) return;

      this.isLoading = true;

      const method = this.financ.id ? "put" : "post";
      const id = this.financ.id ? this.financ.id : "";
      const url = `${urlBD}/financeiro/${id}`;
      this.financeiroStore.financ = this.financ;

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