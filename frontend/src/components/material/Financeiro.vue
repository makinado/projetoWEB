<template>
  <div>
    <v-container fluid>
      <v-flex xs12>
        <v-layout justify-center>
          <v-icon class="my-4 mr-1">fa fa-2x fa-usd</v-icon>
          <h2>Financeiro</h2>
        </v-layout>
        <v-divider></v-divider>
      </v-flex>
      <v-layout align-end>
        <span>Edite valores diretamente na tabela</span>
        <v-spacer></v-spacer>
        <v-tooltip bottom v-if="addNewParcela">
          <v-btn
            slot="activator"
            class="v-btn-common"
            :color="color"
            @click="showAddParcela = true"
          >Adicionar parcela</v-btn>
          <span>Adicionar nova parcela</span>
        </v-tooltip>
      </v-layout>
    </v-container>

    <v-data-table
      class="elevation-5 mb-3"
      :items="financeiroStore.financ"
      :headers="fieldsFinanceiro"
      :pagination.sync="paginationFinanc"
      :rows-per-page-items="[5, 10, 20]"
      rows-per-page-text="Parcelas por página"
      no-data-text="Nenhuma parcela adicionada"
      :expand="expand"
      item-key="parcelas"
    >
      <template slot="items" slot-scope="data">
        <td>{{ data.item.parcelas }}</td>
        <td>
          <v-text-field
            v-if="disable"
            v-model="data.item.valor_parcela"
            v-money="money"
            @blur="[data.item.edit = true, attGridParc()]"
          ></v-text-field>
          <span v-else>{{ data.item.valor_parcela || "R$ 0,00"}}</span>
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
          <v-flex xs8>
            <v-autocomplete
              class="tag-input"
              dense
              chips
              :color="color"
              label="Documento"
              v-model="data.item.documento_origem"
              :items="financeiroStore.documentos"
              prepend-icon="fa fa-lg fa-plus-circle"
              @click:prepend="[financeiroStore.documento = null, modalStore.documentos.visible = true]"
              @focus="$store.dispatch('loadDocumentos')"
              no-data-text="Nenhum documento encontrado"
              deletable-chips
            ></v-autocomplete>
          </v-flex>
        </td>
        <td>
          <v-flex xs8>
            <v-text-field v-model="data.item.num_documento_origem"></v-text-field>
          </v-flex>
        </td>
        <td>
          <v-switch
            v-model="data.item.pago"
            :color="color"
            hide-details
            @change="[!data.expanded && data.item.pago 
              ? [data.expanded = true, loadPagamento(data.item)] 
              : (data.expanded = false, limpaPagamento(data.item), calcTotalFinanc())]"
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
            <v-btn slot="activator" icon class="mr-1" @click="deleteParcela(data.item)">
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
                  @focus="$store.dispatch('loadContas')"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12 md3>
                <v-text-field
                  label="Saldo em conta"
                  placeholder="Selecione a conta para carregar o saldo"
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
                  prepend-icon="fa fa-lg fa-plus-circle"
                  @click:prepend="[financeiroStore.documento = null, modalStore.documentos.visible = true]"
                  @focus="$store.dispatch('loadDocumentos')"
                  no-data-text="Nenhum documento encontrado"
                  clearable
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
      <template slot="footer" v-if="showTotais">
        <td>
          <h5>TOTAIS</h5>
        </td>
        <td>
          <v-tooltip bottom>
            <v-chip
              slot="activator"
              :color="getColor(totaisFinanc.valor)"
              dark
            >{{ totaisFinanc.valor || "R$ 0,00" }}</v-chip>
            <span>Esse valor deve corresponder ao valor total</span>
          </v-tooltip>
        </td>
        <td colspan="2">{{ totaisFinanc.data || '0 meses' }}</td>
        <td colspan="2">{{ totaisFinanc.pago || 'Nenhuma parcela paga' }}</td>
      </template>
    </v-data-table>

    <v-dialog v-model="showAddParcela" persistent max-width="1000px">
      <v-card>
        <v-card-title class="headline">Adicinonar dados financeiros</v-card-title>

        <v-card-text>
          <v-container grid-list-xl>
            <v-form v-model="valid" ref="form">
              <v-layout row wrap>
                <v-flex xs12 md4>
                  <v-text-field
                    ref="valor_total"
                    label="VALOR TOTAL*"
                    v-model="financeiro.valor_total"
                    v-money="money"
                    :rules="valorRules"
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
                        v-model="financeiro.data_vencimento"
                        prepend-icon="event"
                        label="Data de vencimento*"
                        readonly
                        v-on="on"
                        :rules="dataRules"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      :color="color"
                      v-model="financeiro.dataNotFormated"
                      @input="[menu = false, financeiro.data_vencimento = formatDate(financeiro.dataNotFormated)]"
                      locale="pt-br"
                    ></v-date-picker>
                  </v-menu>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field
                    label="Quantidade de parcelas*"
                    v-model.number="financeiro.parcelas"
                    :rules="parcelasRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md6>
                  <v-autocomplete
                    dense
                    :color="color"
                    clearable
                    label="Documento de origem"
                    v-model="financeiro.documento_origem"
                    :items="financeiroStore.documentos"
                    prepend-icon="fa fa-lg fa-plus-circle"
                    @click:prepend="[financeiroStore.documento = null, modalStore.documentos.visible = true]"
                    @focus="$store.dispatch('loadDocumentos')"
                    no-data-text="Nenhum documento encontrado"
                    :rules="docRules"
                  ></v-autocomplete>
                </v-flex>
                <v-flex xs12 md6>
                  <v-text-field
                    v-model="financeiro.num_documento_origem"
                    placeholder="Número do documento"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-textarea box v-model="financeiro.observacao" placeholder="Alguma observação?"></v-textarea>
                </v-flex>
                <v-flex xs12>
                  <v-switch
                    label="PAGO?"
                    v-model="financeiro.pago"
                    @change="financeiro.pago ? loadPagamento(financeiro) : limpaPagamento(financeiro)"
                    :color="color"
                  ></v-switch>
                </v-flex>
              </v-layout>

              <transition name="slide" mode="out-in">
                <v-layout v-if="financeiro.pago" row wrap>
                  <v-flex xs12>
                    <v-text-field
                      v-model.number="financeiro.parcelas_pagas"
                      label="Quantas parcelas estão pagas?"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 md6>
                    <v-autocomplete
                      clearable
                      dense
                      :color="color"
                      label="Conta*"
                      v-model="financeiro.id_conta"
                      :items="financeiroStore.contas"
                      no-data-text="Nenhum caixa encontrado"
                      prepend-icon="fa fa-lg fa-plus-circle"
                      @click:prepend="[financeiroStore.caixa = null, modalStore.financeiro.caixa.visible = true]"
                      @change="loadSaldoConta(financeiro)"
                      @focus="$store.dispatch('loadContas')"
                      :rules="contaRules"
                    ></v-autocomplete>
                  </v-flex>
                  <v-flex xs12 md3>
                    <v-text-field
                      label="Saldo em conta"
                      placeholder="Selecione a conta para carregar o saldo"
                      readonly
                      v-model="financeiro.saldo_atual"
                    ></v-text-field>
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
                          v-model="financeiro.data_baixa"
                          prepend-icon="event"
                          label="Data do pagamento*"
                          readonly
                          v-on="on"
                          :rules="dataRules"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        :color="color"
                        v-model="financeiro.dataNotFormated"
                        @input="[menu1 = false, financeiro.data_baixa = formatDate(financeiro.dataNotFormated)]"
                        locale="pt-br"
                      ></v-date-picker>
                    </v-menu>
                  </v-flex>
                  <v-flex xs12 md4>
                    <v-autocomplete
                      dense
                      :color="color"
                      label="Forma de pagamento"
                      v-model="financeiro.documento_baixa"
                      :items="financeiroStore.documentos"
                      prepend-icon="fa fa-lg fa-plus-circle"
                      @click:prepend="[financeiroStore.documento = null, modalStore.documentos.visible = true]"
                      @focus="$store.dispatch('loadDocumentos')"
                      no-data-text="Nenhum documento encontrado"
                      clearable
                      :rules="formaPagamentoRules"
                    ></v-autocomplete>
                  </v-flex>
                  <v-flex xs12 md4>
                    <v-text-field
                      :color="color"
                      v-model="financeiro.num_documento_baixa"
                      label="Número documento"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 md4>
                    <v-text-field
                      v-model="financeiro.valor_acrescimo"
                      :color="color"
                      label="Valor acréscimo"
                      v-money="money"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 md4>
                    <v-text-field
                      v-model="financeiro.valor_desconto"
                      :color="color"
                      label="Valor desconto"
                      v-money="money"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 md4>
                    <v-text-field
                      v-model="financeiro.valor_pago"
                      :color="color"
                      label="Valor pago"
                      v-money="money"
                      :rules="valorRules"
                      disabled
                    ></v-text-field>
                  </v-flex>
                </v-layout>
              </transition>
            </v-form>
          </v-container>
        </v-card-text>

        <!-- <v-card-title class="headline">Adicinonar dados de pagamento (não obrigatório)</v-card-title> -->

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="showAddParcela = false">Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="addFinanceiro">Adicionar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <Documentos />
  </div>
</template>

<script>
import { formatToBRL } from "brazilian-values";
import { parseNumber, formatDate } from "@/global";
import { mapState } from "vuex";
import { VMoney } from "v-money";

export default {
  name: "financeiro-table",
  directives: { money: VMoney },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["financeiroStore", "modalStore"])
  },
  props: {
    component: { type: Object, default: null },
    title: { type: String, default: "Financeiro" },
    showTotais: { type: Boolean, default: true },
    addNewParcela: { type: Boolean, default: true },
    valor_total: { type: String, default: "R$ 0,00" }
  },
  components: {
    Documentos: () => import("../financeiro/AddDocumentos")
  },
  watch: {
    showAddParcela() {
      if (this.showAddParcela) {
        this.reset();
      }
    }
  },
  data() {
    return {
      valid: true,
      valid1: true,
      menu: false,
      menu1: false,
      disable: false,
      showAddParcela: false,
      expand: false,
      financeiro: {},
      totais: [],
      fieldsFinanceiro: [
        { value: "parcelas", text: "Parcelas" },
        { value: "valor", text: "Valor" },
        { value: "data", text: "Data de vencimento" },
        { value: "documento_origem", text: "Documento" },
        { value: "num_documento_origem", text: "Número documento" },
        { value: "pago", text: "Pago?" },
        { value: "actions", text: "Ações" }
      ],
      totaisFinanc: [{ value: "valor" }, { value: "data" }, { value: "pago" }],
      paginationFinanc: {
        descending: false,
        page: 1,
        rowsPerPage: 5, // -1 for All,
        sortBy: "parcelas",
        totalItems: 0
      },
      money: {
        decimal: ",",
        thousands: ".",
        precision: 2,
        prefix: "R$ "
      },
      docRules: [v => !!v || "Documento é obrigatório"],
      dataRules: [v => !!v || "Datas são obrigatórias"],
      valorRules: [
        v => !!v || "Valor total é obrigatório",
        v => (!!v && v !== "R$ 0,00") || "Valor total não pode ser R$ 0,00"
      ],
      parcelasRules: [
        v => !!v || "Parcela é obrigatória",
        v =>
          (!!v && v === parseInt(v)) || "Informe um número inteiro neste campo"
      ],
      contaRules: [v => !!v || "Conta de pagamento é obrigatória"],
      formaPagamentoRules: [v => !!v || "Forma de pagamento é obrigatória"]
    };
  },
  methods: {
    reset() {
      this.$refs.form ? this.$refs.form.reset() : null;

      this.$set(this.financeiro, "valor_total", this.valor_total);
      this.$set(this.financeiro, "parcelas", 1);
      this.$set(
        this.financeiro,
        "data_vencimento",
        formatDate(new Date().toISOString().substr(0, 10))
      );
      this.$set(this.financeiro, "pago", false);

      this.$refs.valor_total.$el.getElementsByTagName(
        "input"
      )[0].value = this.financeiro.valor_total;
    },
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    getColor(valor) {
      if (!this.component) return;

      if (
        !this.component.valor_total ||
        !valor ||
        valor === this.component.valor_total
      )
        return "green";
      else return "red";
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
    addFinanceiro() {
      if (!this.$refs.form.validate()) return;

      let data;
      data = this.financeiro.data_vencimento;

      for (let i = 0; i < this.financeiro.parcelas; i++) {
        if (i < this.financeiro.parcelas_pagas)
          this.financeiroStore.financ.push({
            ...this.financeiro,
            parcelas: i + 1,
            valor_total: this.financeiro.valor_total,
            valor_parcela: formatToBRL(
              parseNumber(this.financeiro.valor_total) /
                this.financeiro.parcelas
            ),
            valor_pago: formatToBRL(
              parseNumber(this.financeiro.valor_total) /
                this.financeiro.parcelas
            ),
            data_vencimento: i == 0 ? this.financeiro.data_vencimento : data
          });
        else {
          this.financeiroStore.financ.push({
            parcelas: i + 1,
            valor_parcela: formatToBRL(
              parseNumber(this.financeiro.valor_total) /
                this.financeiro.parcelas
            ),
            valor_total: this.financeiro.valor_total,
            data_vencimento: i == 0 ? this.financeiro.data_vencimento : data,
            documento_origem: this.financeiro.documento_origem,
            num_documento_origem: this.financeiro.num_documento_origem
          });
        }

        const [day, month, year] = data.split("/");
        data = formatDate(
          new Date(year, month, day).toISOString().substr(0, 10)
        );
      }

      this.showAddParcela = false;
      this.calcTotalFinanc();
    },
    attGridParc() {
      if (!this.component) return;
      // gambiarra necessária para forçar o campo valor a se atualizar
      this.disable = false;
      const valor = formatToBRL(
        parseNumber(this.component.valor_total || "0,00") /
          this.financeiroStore.financ.length
      );

      this.financeiroStore.financ.forEach(item => {
        const parcelaAtual = item.parcelas.split("/");
        item.parcelas =
          parcelaAtual[0] + "/" + this.financeiroStore.financ.length;

        if (!item.edit) item.valor_parcela = valor;
      });

      this.calcTotalFinanc().then(() => (this.disable = true));
    },
    async calcTotalFinanc() {
      let valor = 0,
        data = 0,
        pago = 0;

      this.financeiroStore.financ.forEach(parcela => {
        valor += parseNumber(parcela.valor_parcela || "0,00");
        data += 1;
        pago += parcela.pago ? parseNumber(parcela.valor_parcela || "0,00") : 0;
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
    loadPagamento(item) {
      item.data_baixa = this.formatDate(new Date().toISOString().substr(0, 10));
      item.parcelas_pagas = item.parcelas;
      item.valor_pago = item.valor_parcela
        ? item.valor_parcela
        : item.valor_total;
    },
    limpaPagamento(item) {
      delete item.id_conta;
      delete item.saldo_atual;
      delete item.item_baixa;
      delete item.documento_baixa;
      delete item.num_documento_baixa;
      delete item.observacao;
    },
    deleteParcela(parcela) {
      if (parcela) {
        this.financeiroStore.financ = this.financeiroStore.financ.filter(
          item => {
            return item.parcelas !== parcela.parcelas;
          }
        );
      }

      this.calcTotalFinanc();
    }
  }
};
</script>

<style>
</style>