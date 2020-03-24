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
        <v-tooltip bottom>
          <v-btn
            slot="activator"
            class="v-btn-common"
            :color="color"
            @click="addParcela()"
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
            v-model.number="data.item.valor_parcela"
            v-money="money"
            @input="[data.item.edit = true, attGridParc()]"
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
              chips
              dense
              :color="color"
              :items="financeiroStore.documentos"
              v-model="data.item.documento_origem"
              placeholder="Selecione"
              prepend-icon="fa fa-lg fa-plus-circle"
              @click:prepend="[modalStore.documentos.visible = true]"
              no-data-text="Nenhum resultado"
              auto-select-first
            ></v-autocomplete>
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
  </div>
</template>

<script>
import { formatToBRL } from "brazilian-values";
import { parseNumber } from "@/global";
import { mapState } from "vuex";
import { VMoney } from "v-money";

export default {
  name: "financeiro-table",
  directives: { money: VMoney },
  computed: { ...mapState("app", ["color"]), ...mapState(["financeiroStore"]) },
  props: {
    component: { type: Object, default: null },
    title: { type: String, default: "Financeiro" },
    showTotais: { type: Boolean, default: true }
  },
  data() {
    return {
      disable: false,
      expand: false,
      totais: [],
      fieldsFinanceiro: [
        { value: "parcelas", text: "Parcelas" },
        { value: "valor", text: "Valor" },
        { value: "data", text: "Data de vencimento" },
        { value: "documento_origem", text: "Documento" },
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
      }
    };
  },
  methods: {
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    getColor(valor) {
      if (!this.component) return;

      if (!this.component.valor_total || valor === this.component.valor_total)
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
    addParcela(addParc) {
      if (!addParc) {
        let data;
        let documento_origem;
        if (this.financeiroStore.financ.length > 0) {
          data = this.financeiroStore.financ[
            this.financeiroStore.financ.length - 1
          ].data_vencimento;
          const [day, month, year] = data.split("/");

          data = new Date(year, month, day).toISOString().substr(0, 10);
          documento_origem = this.financeiroStore.financ[
            this.financeiroStore.financ.length - 1
          ].documento_origem;
        } else {
          data = new Date().toISOString().substr(0, 10);
        }

        const parcela = {
          edit: false,
          parcelas:
            this.financeiroStore.financ.length +
            1 +
            "/" +
            (this.financeiroStore.financ.length + 1),
          data,
          data_vencimento: this.formatDate(data),
          documento_origem
        };
        this.financeiroStore.financ.push(parcela);
      }
      this.attGridParc();
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

      console.log(this.totaisFinanc);
    },
    loadPagamento(item) {
      item.data_baixa = this.formatDate(new Date().toISOString().substr(0, 10));
      item.valor_pago = item.valor_parcela;
    },
    limpaPagamento(data) {
      data.expanded = false;
      data.item.data_baixa = "";
      data.item.documento_baixa = "";
      data.item.num_documento_baixa = "";
      data.item.observacao = "";
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