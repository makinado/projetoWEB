<template>
  <div class="movimento_conta">
    <v-dialog v-model="modalStore.financeiro.movimento.visible" lazy persistent max-width="1200px">
      <v-card v-if="modalStore.financeiro.movimento.visible">
        <v-card-title>
          <span class="headline">{{ modalStore.financeiro.movimento.title }}</span>
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
                  CONTA
                  <v-icon>fa fa-lg fa-bank</v-icon>
                </v-tab>

                <v-tab href="#tab-2">
                  MOVIM. DE CONTA
                  <v-icon>fa fa-lg fa-exchange</v-icon>
                </v-tab>

                <v-tab-item value="tab-1">
                  <v-card flat>
                    <v-card-text>
                      <v-container grid-list-xl>
                        <v-form ref="form" v-model="valid">
                          <v-layout wrap>
                            <v-flex xs12 md3>
                              <v-text-field
                                ref="valor"
                                color="primary"
                                label="VALOR DA MOVIMENTAÇÃO"
                                v-money="money"
                                v-model="movim.valor"
                                :rules="valorRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md3>
                              <v-autocomplete
                                dense
                                :color="color"
                                label="Classificação"
                                v-model="movim.id_classificacao"
                                :items="classificacaoStore.classificacoes"
                                prepend-icon="fa fa-lg fa-plus-circle"
                                @click:prepend="[financeiroStore.classificacao = null, modalStore.classificacoes.visible = true]"
                                @input="getTipoClass(movim.id_classificacao)"
                                @focus="$store.dispatch('loadClassificacoes')"
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md3>
                              <v-autocomplete
                                no-data-text="Nenhum resultado"
                                dense
                                color="primary"
                                label="Tipo de movimentação"
                                v-model="movim.dc"
                                :items="[{ value: 'D', text: 'Débito' }, { value: 'C', text: 'Crédito' }]"
                                :rules="tipoRules"
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md3>
                              <v-autocomplete
                                dense
                                :color="color"
                                label="Documento"
                                v-model="movim.id_documento"
                                :items="financeiroStore.documentos"
                                prepend-icon="fa fa-lg fa-plus-circle"
                                @click:prepend="[financeiroStore.documento = null, modalStore.documentos.visible = true]"
                                @focus="$store.dispatch('loadDocumentos')"
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md3>
                              <v-text-field
                                :color="color"
                                label="Número documento"
                                v-model="movim.num_documento"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
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
                                    color="primary"
                                    v-model="computedDateFormatted"
                                    label="Data de lançamento"
                                    prepend-icon="event"
                                    readonly
                                    v-on="on"
                                    :rules="dataRules"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  color="primary"
                                  v-model="movim.data_lancamento"
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
                                    color="primary"
                                    v-model="computedDateFormatted1"
                                    label="Data de emissão"
                                    prepend-icon="event"
                                    readonly
                                    v-on="on"
                                    :rules="dataRules"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  color="primary"
                                  v-model="movim.data_emissao"
                                  @input="menu1 = false"
                                  locale="pt-br"
                                ></v-date-picker>
                              </v-menu>
                            </v-flex>
                            <v-flex xs12>
                              <v-textarea
                                color="primary"
                                label="Alguma observação?"
                                box
                                v-model="movim.observacao"
                              ></v-textarea>
                            </v-flex>
                          </v-layout>
                        </v-form>
                      </v-container>
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
                                  label="Data inicial"
                                  prepend-icon="event"
                                  readonly
                                  v-on="on"
                                ></v-text-field>
                              </template>
                              <v-date-picker
                                :color="color"
                                v-model="date1"
                                @input="menu2 = false"
                                locale="pt-br"
                              ></v-date-picker>
                            </v-menu>
                          </v-flex>

                          <v-flex xs12 md5>
                            <v-menu
                              ref="date2"
                              v-model="menu3"
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
                                  v-model="computedDateFormatted3"
                                  label="Data final"
                                  prepend-icon="event"
                                  readonly
                                  v-on="on"
                                ></v-text-field>
                              </template>
                              <v-date-picker
                                :color="color"
                                v-model="date2"
                                @input="menu3 = false"
                                locale="pt-br"
                              ></v-date-picker>
                            </v-menu>
                          </v-flex>
                          <v-flex xs12 md1>
                            <v-btn class="v-btn-common" color="secondary" @click="loadMovim">
                              <v-icon>fa fa-lg fa-search</v-icon>
                            </v-btn>
                          </v-flex>
                        </v-layout>
                      </v-container>

                      <v-data-table
                        class="elevation-4"
                        :items="movimContaItens"
                        :headers="fieldsMovim"
                        :pagination.sync="paginationMovim"
                        :rows-per-page-items="[10,20]"
                        rows-per-page-text="Registros por página"
                        no-results-text="Nenhum registro encontrado"
                        no-data-text="Nenhum registro"
                        :total-items="count"
                        :expand="expand"
                        item-key="id"
                      >
                        <template slot="items" slot-scope="data">
                          <td>{{ data.item.id }}</td>
                          <td>{{ data.item.empresa }}</td>
                          <td>
                            <v-chip :color="getColor(data.item.dc)" dark>{{ data.item.dc }}</v-chip>
                          </td>
                          <td>{{ data.item.data_lancamento }}</td>
                          <td>{{ data.item.valor }}</td>
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
                                    slot="activator"
                                    icon
                                    dark
                                    @click.prevent="[modalStore.financeiro.deleteMovimento = true, financeiroStore.movim = data.item]"
                                    class="mr-1"
                                    :disabled="(data.item.tipoStr === 'Entrada' || data.item.tipoStr === 'Saída') || (data.item.origem === 'Implantação de saldo' && movimContaItens.length > 1)"
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
                                <h4>Data de lançamento - {{ formatDate(new Date(data.item.dados.data_lancamento).toISOString().substr(0, 10)) }}</h4>
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
            @click="modalStore.financeiro.movimento.visible = false"
          >Fechar</v-btn>
          <v-btn v-if="this.tabIndex === 'tab-1'" color="blue darken-1" flat @click="save">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="modalStore.financeiro.deleteMovimento"
      persistent
      max-width="500px"
      v-if="financeiroStore.movim"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Excluir movimentação de conta</span>
        </v-card-title>
        <v-card-text>Excluir movimento {{ financeiroStore.movim.id }} no valor de {{ financeiroStore.movim.valor }} ?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            flat
            @click="modalStore.financeiro.deleteMovimento = false"
          >Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="remove()">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import { urlBD, showError, formatDate, saveLog } from "@/global";
import { mapState } from "vuex";

import { VMoney } from "v-money";
import { formatToBRL } from "brazilian-values";

export default {
  directives: { money: VMoney },
  name: "MovimentoCaixa",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "financeiroStore",
      "empresaStore",
      "usuarioStore",
      "classificacaoStore",
      "modalStore"
    ]),
    computedDateFormatted: {
      get() {
        return formatDate(this.movim.data_lancamento);
      },
      set(value) {
        this.movim.data_lancamento = value;
      }
    },
    computedDateFormatted1: {
      get() {
        return formatDate(this.movim.data_emissao);
      },
      set(value) {
        this.movim.data_emissao = value;
      }
    },
    computedDateFormatted2: {
      get() {
        return formatDate(this.date1);
      },
      set(value) {
        this.date1 = value;
      }
    },
    computedDateFormatted3: {
      get() {
        return formatDate(this.date2);
      },
      set(value) {
        this.date2 = value;
      }
    }
  },

  data() {
    return {
      movim: {},
      valid: true,
      expand: false,
      menu: false,
      menu1: false,
      menu2: false,
      menu3: false,
      movimContaItens: [],
      movimConta: {},
      count: 0,
      date1: "",
      date2: "",
      tabIndex: "tab-1",
      fields: [
        { value: "empresa", text: "Empresa" },
        { value: "conta", text: "Conta" },
        { value: "saldo_atual", text: "Saldo atual" }
      ],
      fieldsMovim: [
        { value: "id", text: "Código" },
        { value: "empresa", text: "Empresa", sortable: true },
        { value: "dc", text: "Tipo", sortable: true },
        { value: "data_lancamento", text: "Data lançamento", sortable: true },
        { value: "valor", text: "Valor" },
        { value: "actions", text: "Ações" }
      ],
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 5, // -1 for All,
        sortBy: "data_lancamento",
        totalItems: 0
      },
      paginationMovim: {
        page: 1,
        totalItems: 0,
        rowsPerPage: 20
      },
      money: {
        decimal: ",",
        thousands: ".",
        prefix: "R$ ",
        precision: 2
      },
      tipoRules: [v => v === "C" || v === "D" || "Tipo é obrigatório"],
      empresaRules: [v => !!v || "Empresa é obrigatória"],
      nameRules: [
        v => !!v || "Nome é obrigatório",
        v => (!!v && v.length < 20) || "Nome deve ter no máximo 20 caracteres"
      ],
      valorRules: [v => (!!v && v !== "R$ 0,00") || "Valor é obrigatório"],
      dataRules: [v => !!v || "Datas são obrigatórias"]
    };
  },
  watch: {
    "$store.state.modalStore.financeiro.movimento.visible": function() {
      if (this.modalStore.financeiro.movimento.visible) {
        this.limpaTela();
      }
    },
    paginationMovim() {
      this.loadMovim();
    }
  },
  methods: {
    getColor(tipo) {
      if (tipo === "C") return "green";
      else return "red";
    },
    limpaTela() {
      this.reset();
      this.$store.dispatch("loadDocumentos");
      this.$store.dispatch("loadEmpresas");
    },
    reset() {
      this.movim = {};
      this.isBank = false;
      this.tabIndex = "tab-1";
      this.$refs.form ? this.$refs.form.reset() : "";

      this.$refs.valor
        ? (this.$refs.valor.$el.getElementsByTagName("input")[0].value = 0)
        : "";
    },
    resetMovim() {
      this.date1 = "";
      this.date2 = "";
      this.movimContaItens = [];

      this.loadMovim();
    },
    loadMovim() {
      if (this.financeiroStore.conta) {
        this.movimConta.dataIni = this.date1;
        this.movimConta.dataFim = this.date2;

        let url = `${urlBD}/movimConta/${this.financeiroStore.conta.id}?page=${this.paginationMovim.page}&limit=${this.paginationMovim.rowsPerPage}`;

        if (this.movimConta.dataIni && this.movimConta.dataIni)
          url += `&data_inicial=${this.movimConta.dataIni}&data_final=${this.movimConta.dataFim}`;
        axios
          .get(url)
          .then(res => {
            this.count = res.data.count;
            this.paginationMovim.rowsPerPage = res.data.limit;
            this.movimContaItens = res.data.data.map(movim => {
              movim.data_lancamento = formatDate(
                new Date(movim.data_lancamento).toISOString().substr(0, 10)
              );
              movim.valor = formatToBRL(movim.valor);

              return movim;
            });
          })
          .catch(showError);
      } else {
        showError("Nenhuma conta selecionada");
      }
    },
    getTipoClass(id) {
      const clas = this.classificacaoStore.classificacoes.find(
        item => item.value === id
      );

      if (clas) this.movim.dc = clas.tipo === 1 ? "C" : "D";
    },
    save() {
      if (!this.$refs.form.validate()) return;

      let url = `${urlBD}/movimConta/${this.financeiroStore.conta.id}`;
      this.movim.id_conta = this.financeiroStore.conta.id;
      this.movim.origem = "DIGITADO";

      if (!this.movim.id_empresa)
        this.movim.id_empresa = this.empresaStore.currentEmpresa;

      axios
        .post(url, this.movim)
        .then(res => {
          this.$toasted.global.defaultSuccess();

          saveLog(
            new Date(),
            "GRAVAÇÃO",
            "MOVIMENTO DE CAIXA",
            `Usuário ${this.usuarioStore.currentUsuario.nome} fez uma movimentação no caixa ${this.financeiroStore.conta.nome}`
          );

          this.limpaTela();
        })
        .catch(showError);
    },
    remove() {
      const url = `${urlBD}/movimConta/${this.financeiroStore.movim.id}`;

      axios
        .delete(url)
        .then(res => {
          this.limpaTela();

          this.$toasted.global.defaultSuccess();
          this.modalStore.produtos.estoque.deleteMovim = false;

          saveLog(
            new Date(),
            "EXCLUSÃO",
            "MOVIMENTO DE CONTA",
            `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu o movimento ${this.financeiroStore.movim.id} no valor de ${this.financeiroStore.movim.valor}`
          );
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>