<template>
  <div class="grid-import">
    <v-container fluid>
      <v-menu
        :close-on-content-click="false"
        :close-on-click="false"
        width="300"
        nudge-left="12"
        transition="slide-y-transition"
        v-model="funcoes"
        :position-x="getWindowSize()"
      >
        <v-card>
          <v-card-title class="headline">
            <v-icon class="mr-2">fa fa-cogs</v-icon>
            <span>Selecione uma opção</span>
          </v-card-title>
          <v-card-text>
            <hr />
            <v-layout wrap justify-center>
              <v-tooltip bottom v-if="concluir">
                <v-btn
                  slot="activator"
                  flat
                  icon
                  color="success"
                  @click="[financeiroStore.financ = financs_selecionados, modalStore.financeiro.financ.pagamento = true]"
                >
                  <v-icon>fa fa-2x fa-check</v-icon>
                </v-btn>
                <span>Realizar pagamento/recebimento</span>
              </v-tooltip>
              <v-tooltip bottom v-if="cancelar">
                <v-btn
                  slot="activator"
                  flat
                  icon
                  color="danger"
                  @click="[financeiroStore.financ = financs_selecionados, modalStore.financeiro.cancelFinanc = true]"
                >
                  <v-icon>fa fa-2x fa-times</v-icon>
                </v-btn>
                <span>Cancelar pagamento/recebimento</span>
              </v-tooltip>
              <v-tooltip bottom>
                <v-btn
                  slot="activator"
                  flat
                  icon
                  color="danger"
                  @click="[financeiroStore.financ = financs_selecionados, modalStore.financeiro.deleteFinanc = true]"
                >
                  <v-icon>fa fa-2x fa-trash</v-icon>
                </v-btn>
                <span>Excluir conta</span>
              </v-tooltip>
              <v-tooltip bottom>
                <v-btn
                  slot="activator"
                  flat
                  icon
                  color="primary"
                  @click="[modalStore.complementos.impressao.docs = financs_selecionados, modalStore.complementos.impressao.visible = true]"
                >
                  <v-icon>fa fa-2x fa-print</v-icon>
                </v-btn>
                <span>Exportar conta</span>
              </v-tooltip>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-menu>

      <v-layout
        justify-center
        v-if="$vuetify.breakpoint.name === 'xs' || $vuetify.breakpoint.name === 'sm' || $vuetify.breakpoint.name === 'md'"
      >
        <v-flex xs12>
          <v-layout justify-center>
            <v-menu
              :close-on-content-click="false"
              bottom
              right
              min-width="300"
              max-width="600"
              offset-x
              transition="slide-y-transition"
              @keyup.enter
              v-model="pesquisa"
            >
              <v-btn slot="activator" :color="color" icon>
                <v-icon>fa fa-lg fa-filter</v-icon>
              </v-btn>
              <v-card flat color="bege">
                <v-card-text>
                  <v-container grid-list-xl>
                    <v-form v-model="valid" ref="form">
                      <v-layout wrap>
                        <v-flex xs12>
                          <v-autocomplete
                            label="Selecione"
                            :items="[{value: 1, text:'Pesquisa rápida'}, {value: 1, text: 'Pesquisa avançada'}]"
                            v-model="filter.tipo"
                          ></v-autocomplete>
                        </v-flex>
                      </v-layout>
                      <v-layout wrap>
                        <v-flex xs12 md6>
                          <v-text-field label="Código" v-model="filter.id"></v-text-field>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-text-field label="Documento" v-model="filter.documento"></v-text-field>
                        </v-flex>
                        <v-flex xs12>
                          <v-autocomplete
                            label="Pesquisar por data"
                            dense
                            auto-select-first
                            :items="[
                              { value: 1, text: 'Data de criação' },
                              { value: 2, text: 'Data de emissão' },
                              { value: 3, text: 'Data de vencimento' },
                              { value: 4, text: 'Data de baixa' }
                            ]"
                            v-model="filter.tipo_data"
                            clearable
                          ></v-autocomplete>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-menu
                            ref="date"
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
                              v-model="filter.data_inicial"
                              @input="menu1 = false"
                              locale="pt-br"
                            ></v-date-picker>
                          </v-menu>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-menu
                            ref="date"
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
                              v-model="filter.data_final"
                              @input="menu2 = false"
                              locale="pt-br"
                            ></v-date-picker>
                          </v-menu>
                        </v-flex>
                        <v-flex xs12 md3>
                          <v-switch label="Pagar" :color="color" v-model="filter.pagar"></v-switch>
                        </v-flex>
                        <v-flex xs12 md3>
                          <v-switch label="Receber" :color="color" v-model="filter.receber"></v-switch>
                        </v-flex>
                        <v-flex xs12 md3>
                          <v-switch label="Pendentes" :color="color" v-model="filter.pendentes"></v-switch>
                        </v-flex>
                        <v-flex xs12 md3>
                          <v-switch label="Concluídos" :color="color" v-model="filter.concluidos"></v-switch>
                        </v-flex>
                      </v-layout>
                    </v-form>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="blue darken-1" flat @click="filter = {}">Limpar pesquisa</v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>
            <v-autocomplete
              label="Procurar por pessoa"
              :color="color"
              dense
              :items="pessoaStore.pessoas"
              clearable
              v-model="filter.pessoa"
            />
          </v-layout>

          <v-layout wrap justify-center>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                color="danger"
                @click.prevent="modalStore.documentos.visible = true"
              >Documentos</v-btn>
              <span>Gerenciar formas de pagamento</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                color="secondary"
                @click.prevent="modalStore.classificacoes.visible = true"
              >Classificações</v-btn>
              <span>Gerenciar classificações de conta</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                :color="color"
                @click.prevent="[financeiroStore.financ = null, modalStore.financeiro.financ.visible = true, modalStore.financeiro.financ.title = 'Adicionar conta']"
              >Adicionar conta</v-btn>
              <span>Adicionar conta a pagar/receber</span>
            </v-tooltip>
          </v-layout>
        </v-flex>
      </v-layout>

      <v-layout v-else justify-space-between align-center>
        <v-menu
          :close-on-content-click="false"
          bottom
          right
          min-width="300"
          max-width="600"
          offset-x
          transition="slide-y-transition"
          @keyup.enter
          v-model="pesquisa"
        >
          <v-btn slot="activator" :color="color" icon>
            <v-icon>fa fa-lg fa-filter</v-icon>
          </v-btn>
          <v-card flat color="bege">
            <v-card-text>
              <v-container grid-list-xl>
                <v-form v-model="valid" ref="form">
                  <v-layout wrap>
                    <v-flex xs12>
                      <v-autocomplete
                        label="Selecione"
                        :items="[{value: 1, text:'Pesquisa rápida'}, {value: 1, text: 'Pesquisa avançada'}]"
                        v-model="filter.tipo"
                      ></v-autocomplete>
                    </v-flex>
                  </v-layout>
                  <v-layout wrap>
                    <v-flex xs12 md6>
                      <v-text-field label="Código" v-model="filter.id"></v-text-field>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field label="Documento" v-model="filter.documento"></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-autocomplete
                        label="Pesquisar por data"
                        dense
                        auto-select-first
                        :items="[
                            { value: 1, text: 'Data de criação' },
                            { value: 2, text: 'Data de emissão' },
                            { value: 3, text: 'Data de vencimento' },
                            { value: 4, text: 'Data de baixa' }
                        ]"
                        v-model="filter.tipo_data"
                        clearable
                      ></v-autocomplete>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-menu
                        ref="date"
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
                          v-model="filter.data_inicial"
                          @input="menu1 = false"
                          locale="pt-br"
                        ></v-date-picker>
                      </v-menu>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-menu
                        ref="date"
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
                          v-model="filter.data_final"
                          @input="menu2 = false"
                          locale="pt-br"
                        ></v-date-picker>
                      </v-menu>
                    </v-flex>
                    <v-flex xs12 md3>
                      <v-switch label="Pagar" :color="color" v-model="filter.pagar"></v-switch>
                    </v-flex>
                    <v-flex xs12 md3>
                      <v-switch label="Receber" :color="color" v-model="filter.receber"></v-switch>
                    </v-flex>
                    <v-flex xs12 md3>
                      <v-switch label="Pendentes" :color="color" v-model="filter.pendentes"></v-switch>
                    </v-flex>
                    <v-flex xs12 md3>
                      <v-switch label="Concluídos" :color="color" v-model="filter.concluidos"></v-switch>
                    </v-flex>
                  </v-layout>
                </v-form>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-btn color="blue darken-1" flat @click="filter = {}">Limpar pesquisa</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
        <v-autocomplete
          label="Procurar por pessoa"
          :color="color"
          dense
          :items="pessoaStore.pessoas"
          clearable
          v-model="filter.pessoa"
        />

        <v-spacer></v-spacer>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            class="v-btn-common"
            color="danger"
            @click.prevent="modalStore.documentos.visible = true"
          >Documentos</v-btn>
          <span>Gerenciar formas de pagamento</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn
            slot="activator"
            class="v-btn-common"
            color="secondary"
            @click.prevent="modalStore.classificacoes.visible = true"
          >Classificações</v-btn>
          <span>Gerenciar classificações de conta</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn
            slot="activator"
            class="v-btn-common"
            :color="color"
            @click.prevent="[financeiroStore.financ = null, modalStore.financeiro.financ.visible = true, modalStore.financeiro.financ.title = 'Adicionar conta']"
          >Adicionar conta</v-btn>
          <span>Adicionar conta a pagar/receber</span>
        </v-tooltip>
      </v-layout>
    </v-container>
    <v-data-table
      class="elevation-5"
      :items="financeiroStore.financs"
      :headers="fields"
      :pagination.sync="pagination"
      :rows-per-page-items="[5, 10, 20, 50, 100]"
      rows-per-page-text="Registros por página"
      no-results-text="Nenhum registro encontrado"
      no-data-text="Nenhuma conta cadastrada"
      select-all
      v-model="financs_selecionados"
      :total-items="count"
    >
      <v-progress-linear slot="progress" color="blue" height="3" indeterminate></v-progress-linear>
      <template slot="items" slot-scope="data">
        <td>
          <v-checkbox v-model="data.selected" :color="color" hide-details></v-checkbox>
        </td>
        <td>{{ data.item.id }}</td>

        <td>{{ data.item.empresa }}</td>
        <td>{{ data.item.pessoa }}</td>
        <td>
          <v-chip :color="getColor(data.item.tipo_conta)" dark>{{ data.item.tipo_conta }}</v-chip>
        </td>
        <td>
          <v-chip :color="getColor(data.item.pago)" dark>{{ data.item.pago }}</v-chip>
        </td>
        <td>{{ data.item.documento_origem }}</td>
        <td>{{ data.item.data_vencimento }}</td>
        <td>{{ data.item.data_baixa == '01/01/1970' ? "" : data.item.data_baixa }}</td>
        <td>{{ data.item.valor_parcela }}</td>
        <td>
          <v-tooltip bottom v-if="data.item.pago == 'PENDENTE'">
            <b-button
              slot="activator"
              variant="secundary"
              class="mr-1"
              @click.prevent="[financeiroStore.financ = data.item, modalStore.financeiro.financ.pagamento = true]"
            >
              <i class="fa fa-lg fa-check"></i>
            </b-button>
            <span>Realizar pagamento/recebimento</span>
          </v-tooltip>
          <v-tooltip bottom v-else-if="data.item.pago == 'CONCLUÍDA'">
            <b-button
              slot="activator"
              variant="secundary"
              class="mr-1"
              @click.prevent="[modalStore.financeiro.cancelFinanc = true, financeiroStore.financ = data.item]"
            >
              <i class="fa fa-lg fa-times"></i>
            </b-button>
            <span>Cancelar pagamento/recebimento</span>
          </v-tooltip>
          <v-tooltip bottom v-if="data.item.pago == 'PENDENTE'">
            <b-button
              slot="activator"
              variant="secundary"
              @click.prevent="[financeiroStore.financ = data.item, modalStore.financeiro.financ.visible = true,modalStore.financeiro.financ.title = 'Alterar parcela do financeiro']"
              class="mr-1"
            >
              <i class="fa fa-lg fa-pencil"></i>
            </b-button>
            <span>Editar conta</span>
          </v-tooltip>
          <v-tooltip bottom v-else>
            <b-button
              slot="activator"
              variant="secundary"
              @click.prevent="[financeiroStore.financ = data.item, modalStore.financeiro.financ.visualizar = true]"
              class="mr-1"
            >
              <i class="fa fa-lg fa-eye"></i>
            </b-button>
            <span>Visualizar detalhes da conta</span>
          </v-tooltip>
          <v-tooltip bottom>
            <b-button
              slot="activator"
              variant="secundary"
              @click.prevent="[modalStore.financeiro.deleteFinanc = true, financeiroStore.financ = data.item]"
              class="mr-1"
            >
              <i class="fa fa-lg fa-trash"></i>
            </b-button>
            <span>Excluir conta</span>
          </v-tooltip>
          <v-tooltip bottom>
            <b-button
              slot="activator"
              variant="secundary"
              @click.prevent="[modalStore.complementos.impressao.visible = true]"
            >
              <i class="fa fa-lg fa-print"></i>
            </b-button>
            <span>Exportar conta</span>
          </v-tooltip>
        </td>
      </template>
    </v-data-table>

    <v-dialog
      v-model="modalStore.financeiro.deleteFinanc"
      persistent
      max-width="500px"
      v-if="financeiroStore.financ"
      lazy
    >
      <v-card>
        <v-card-title>
          <span class="headline">Excluir parcela</span>
        </v-card-title>
        <v-card-text
          v-if="!Array.isArray(financeiroStore.financ)"
        >Cancelar conta {{ financeiroStore.financ.id }} no valor de {{ financeiroStore.financ.valor_parcela }}?</v-card-text>
        <v-card-text v-else>
          <v-flex xs12>Excluir {{ financeiroStore.financ.length }} contas?</v-flex>
          <v-flex xs12>
            <font color="red" v-if="confirmacao">
              <small>Você selecionou contas já concluidas, confirma exclusão?</small>
            </font>
          </v-flex>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            flat
            @click="[modalStore.financeiro.deleteFinanc = false, confirmacao = false]"
          >Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="remove()">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="modalStore.financeiro.cancelFinanc"
      persistent
      max-width="500px"
      v-if="financeiroStore.financ"
      lazy
    >
      <v-card>
        <v-card-title>
          <span
            class="headline"
          >Cancelar {{ financeiroStore.financ.tipo_conta == 'RECEBER' ? 'recebimento' : 'pagamento' }}</span>
        </v-card-title>
        <v-card-text
          v-if="!Array.isArray(financeiroStore.financ)"
        >Cancelar {{ financeiroStore.financ.tipo_conta == 'RECEBER' ? 'recebimento' : 'pagamento' }} no valor de {{ financeiroStore.financ.valor_pago || "R$ 0,00" }}?</v-card-text>
        <v-card-text v-else>Cancelar {{ financeiroStore.financ.length }} contas?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            flat
            @click="modalStore.financeiro.cancelFinanc = false"
          >Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="remove_pagamento()">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <Impressao />
  </div>
</template>

<script>
import axios from "axios";
import { urlBD, showError, formatDate, loadPessoas, saveLog } from "@/global";
import { mapState } from "vuex";

import { formatToBRL } from "brazilian-values";

export default {
  name: "Gridcompras",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "financeiroStore",
      "usuarioStore",
      "modalStore",
      "pessoaStore"
    ]),
    computedDateFormatted1() {
      return formatDate(this.filter.data_inicial);
    },
    computedDateFormatted2() {
      return formatDate(this.filter.data_final);
    },
    params() {
      return {
        ...this.pagination,
        ...this.filter
      };
    }
  },
  components: {
    Impressao: () => import("@/components/complementos/Impressao")
  },
  data: function() {
    return {
      valid: true,
      concluir: true,
      cancelar: true,
      financs_selecionados: [],
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "empresa", text: "Empresa", sortable: true },
        { value: "pessoa", text: "Pessoa", sortable: true },
        { value: "tipo_conta", text: "Tipo", sortable: true },
        { value: "pago", text: "Situação", sortable: true },
        { value: "documento_origem", text: "Documento", sortable: false },
        { value: "data_vencimento", text: "Data vencimento", sortable: true },
        { value: "data_baixa", text: "Data baixa", sortable: true },
        { value: "valor_parcela", text: "Valor da parcela", sortable: true },
        { value: "actions", text: "Ações", sortable: false }
      ],
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 20, // -1 for All,
        sortBy: "tipo",
        totalItems: 0
      },
      count: 0,
      concluir: false,
      filter: {},
      menu1: false,
      menu2: false,
      pesquisa: false,
      funcoes: false,
      confirmacao: false
    };
  },
  watch: {
    financs_selecionados: function() {
      if (this.financs_selecionados.length > 1) {
        this.funcoes = this.getFinancSit();
      } else {
        this.funcoes = false;
      }
    },
    params() {
      this.loadFinanceiro();
    },
    "$store.state.modalStore.financeiro.financ.visible": function() {
      if (!this.modalStore.financeiro.financ.visible) {
        this.loadFinanceiro();
      }
    },
    "$store.state.modalStore.financeiro.financ.pagamento": function() {
      if (!this.modalStore.financeiro.financ.pagamento) {
        this.loadFinanceiro();
        this.financs_selecionados = [];
      }
    }
  },
  methods: {
    getWindowSize() {
      return window.innerWidth / 2 - 150;
    },
    getFinancSit() {
      const item_pago = this.financs_selecionados.filter(
        item => item.pago === "CONCLUÍDA"
      );
      const item_pendente = this.financs_selecionados.filter(
        item => item.pago === "PENDENTE"
      );

      if (item_pago.length > 0 && item_pendente.length == 0) {
        this.concluir = false;
        this.cancelar = true;
      } else if (item_pendente.length > 0 && item_pago.length == 0) {
        this.concluir = true;
        this.cancelar = false;
      } else {
        this.concluir = false;
        this.cancelar = false;
      }

      return true;
    },
    getColor(situacao) {
      if (situacao === "PENDENTE") return "blue";
      else if (situacao === "CANCELADO") return "red";
      else if (situacao === "CONCLUÍDA") return "green";
      else if (situacao === "PAGAR") return "warning";
      else if (situacao === "RECEBER") return "green";
      else return "red";
    },
    async loadFinanceiro() {
      const url = `${urlBD}/financeiro?page=${this.pagination.page}&limit=${
        this.pagination.rowsPerPage
      }&tipo=${this.filter.tipo || 1}&id=${this.filter.id || ""}&pessoa=${this
        .filter.pessoa || ""}&documento=${this.filter.documento ||
        ""}&tipo_data=${this.filter.tipo_data || ""}&data_inicial=${this.filter
        .data_inicial || ""}&data_final=${this.filter.data_final ||
        ""}&pendentes=${this.filter.pendentes || ""}&concluidos=${this.filter
        .concluidos || ""}&pagar=${this.filter.pagar || ""}&receber=${this
        .filter.receber || ""}`;

      axios.get(url).then(res => {
        this.financeiroStore.financs = res.data.data.map(conta => {
          conta.data_vencimento = formatDate(
            new Date(conta.data_vencimento).toISOString().substr(0, 10)
          );
          conta.data_baixa = formatDate(
            new Date(conta.data_baixa).toISOString().substr(0, 10)
          );
          conta.valor_parcela = formatToBRL(conta.valor_parcela);
          conta.valor_pago = formatToBRL(conta.valor_pago);
          conta.tipo_conta = conta.tipo_conta === 1 ? "PAGAR" : "RECEBER";
          conta.pago = conta.pago ? "CONCLUÍDA" : "PENDENTE";

          return conta;
        });
        this.count = res.data.count;
        this.pagination.rowsPerPage = res.data.limit;
      });
    },
    async remove() {
      var financs = [];

      if (!this.financeiroStore.financ.id) {
        financs = this.financeiroStore.financ.map(item => {
          return {
            id: item.id,
            valor_parcela: item.valor_parcela,
            pago: item.pago
          };
        });
      } else {
        financs.push({
          id: this.financeiroStore.financ.id,
          valor_parcela: this.financeiroStore.financ.valor_parcela,
          pago: this.financeiroStore.financ.pago
        });
      }

      const aux = financs.filter(item => item.pago == "CONCLUÍDA");
      if (aux.length > 0 && !this.confirmacao) {
        this.confirmacao = true;
        return;
      }

      financs.map(async item => {
        const url = `${urlBD}/financeiro/${item.id}`;
        await axios
          .delete(url)
          .then(() => {
            this.$toasted.global.defaultSuccess();
            this.modalStore.financeiro.deleteFinanc = false;
            this.financs_selecionados = [];
            this.confirmacao = false;

            this.loadFinanceiro();

            saveLog(
              new Date(),
              "EXCLUSÃO",
              "FINANCEIRO",
              `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu a parcela ${item.id} no valor de ${item.valor_parcela}`
            );
          })
          .catch(showError);
      });
    },
    async remove_pagamento() {
      var financs = [];

      if (!this.financeiroStore.financ.id) {
        financs = this.financeiroStore.financ.map(item => {
          return {
            id: item.id,
            valor_pago: item.valor_pago
          };
        });
      } else {
        financs.push({
          id: this.financeiroStore.financ.id,
          valor_pago: this.financeiroStore.financ.valor_pago
        });
      }

      financs.map(async item => {
        const url = `${urlBD}/financeiro/pagamento/${item.id}`;
        await axios
          .delete(url)
          .then(() => {
            this.$toasted.global.defaultSuccess();
            this.modalStore.financeiro.cancelFinanc = false;
            this.financs_selecionados = [];

            this.loadFinanceiro();

            saveLog(
              new Date(),
              "EXCLUSÃO",
              "FINANCEIRO",
              `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu o pagamento da parcela ${item.id} no valor de ${item.valor_pago}`
            );
          })
          .catch(showError);
      });
    }
  },
  mounted() {
    loadPessoas();
    this.concluir = true;
    this.cancelar = true;
  }
};
</script>

<style>
</style>