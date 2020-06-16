<template>
  <div class="grid-import">
    <v-container fluid>
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
                  <v-btn
                    color="blue darken-1"
                    flat
                    @click="$store.commit('setFilter', {})"
                  >Limpar pesquisa</v-btn>
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
                v-if="usuarioStore.currentUsuario.financeiro_create"
              >Documentos</v-btn>
              <span>Gerenciar formas de pagamento</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                color="secondary"
                @click.prevent="modalStore.classificacoes.visible = true"
                v-if="usuarioStore.currentUsuario.financeiro_create"
              >Classificações</v-btn>
              <span>Gerenciar classificações de conta</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                :color="color"
                @click.prevent="[financeiroStore.financ = null, modalStore.financeiro.financ.visible = true, modalStore.financeiro.financ.title = 'Adicionar conta']"
                v-if="usuarioStore.currentUsuario.financeiro_create"
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
              <v-btn
                color="blue darken-1"
                flat
                @click="$store.commit('setFilter', {})"
              >Limpar pesquisa</v-btn>
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
            v-if="usuarioStore.currentUsuario.financeiro_create"
          >Documentos</v-btn>
          <span>Gerenciar formas de pagamento</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn
            slot="activator"
            class="v-btn-common"
            color="secondary"
            @click.prevent="modalStore.classificacoes.visible = true"
            v-if="usuarioStore.currentUsuario.financeiro_create"
          >Classificações</v-btn>
          <span>Gerenciar classificações de conta</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn
            slot="activator"
            class="v-btn-common"
            :color="color"
            @click.prevent="[financeiroStore.financ = null, modalStore.financeiro.financ.visible = true, modalStore.financeiro.financ.title = 'Adicionar conta']"
            v-if="usuarioStore.currentUsuario.financeiro_create"
          >Adicionar conta</v-btn>
          <span>Adicionar conta a pagar/receber</span>
        </v-tooltip>
      </v-layout>
    </v-container>

    <Card :color="color" title="Ações rápidas" :actions="globalActions">
      <v-data-table
        :items="financeiroStore.financs"
        :headers="fields"
        :pagination.sync="pagination"
        :rows-per-page-items="[5, 10, 20, 50, 100]"
        rows-per-page-text="Registros por página"
        no-results-text="Nenhum registro encontrado"
        no-data-text="Nenhuma conta cadastrada"
        select-all
        v-model="itens_selecionados"
        :total-items="count"
        :loading="loading"
      >
        <template slot="items" slot-scope="data">
          <td>
            <v-checkbox v-model="data.selected" :color="color" hide-details></v-checkbox>
          </td>
          <td>{{ data.item.id }}</td>
          <td class="text-truncate">{{ data.item.pessoa }}</td>
          <td>
            <v-chip :color="getColor(data.item.tipo_conta)" dark>{{ data.item.tipo_conta }}</v-chip>
          </td>
          <td>
            <v-chip :color="getColor(data.item.pago)" dark>{{ data.item.pago }}</v-chip>
          </td>
          <td>{{ data.item.documento_origem }}</td>
          <td>{{ data.item.num_documento_origem }}</td>
          <td>{{ data.item.data_vencimento | date }}</td>
          <td>{{ data.item.data_baixa | date }}</td>
          <td>{{ data.item.valor_parcela | currency }}</td>
          <td>
            <v-menu offset-y left>
              <v-btn icon slot="activator">
                <v-icon>fa fa-lg fa-ellipsis-v</v-icon>
              </v-btn>
              <v-card :color="color">
                <v-tooltip bottom v-if="data.item.pago == 'PENDENTE'">
                  <v-btn
                    slot="activator"
                    icon
                    dark
                    class="mr-1"
                    @click.prevent="[financeiroStore.financ = data.item, concluirConta()]"
                    v-if="usuarioStore.currentUsuario.financeiro_update"
                  >
                    <i class="fa fa-lg fa-check"></i>
                  </v-btn>
                  <span>Realizar pagamento/recebimento</span>
                </v-tooltip>
                <v-tooltip bottom v-else-if="data.item.pago == 'CONCLUÍDA'">
                  <v-btn
                    slot="activator"
                    icon
                    dark
                    class="mr-1"
                    @click.prevent="[financeiroStore.financ = data.item, cancelarConta()]"
                    v-if="usuarioStore.currentUsuario.financeiro_update"
                  >
                    <i class="fa fa-lg fa-times"></i>
                  </v-btn>
                  <span>Cancelar pagamento/recebimento</span>
                </v-tooltip>
                <v-tooltip bottom v-if="data.item.pago == 'PENDENTE'">
                  <v-btn
                    slot="activator"
                    icon
                    dark
                    @click.prevent="[financeiroStore.financ = data.item, modalStore.financeiro.financ.visible = true,modalStore.financeiro.financ.title = 'Alterar parcela do financeiro']"
                    class="mr-1"
                    v-if="usuarioStore.currentUsuario.financeiro_update"
                  >
                    <i class="fa fa-lg fa-pencil"></i>
                  </v-btn>
                  <span>Editar conta</span>
                </v-tooltip>
                <v-tooltip bottom v-else>
                  <v-btn
                    slot="activator"
                    icon
                    dark
                    @click.prevent="[financeiroStore.financ = data.item, modalStore.financeiro.financ.visualizar = true]"
                    class="mr-1"
                  >
                    <i class="fa fa-lg fa-eye"></i>
                  </v-btn>
                  <span>Visualizar detalhes da conta</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn
                    slot="activator"
                    icon
                    dark
                    @click.prevent="[confirmaExclusao = true, financeiroStore.financ = data.item]"
                    class="mr-1"
                    v-if="usuarioStore.currentUsuario.financeiro_delete && data.item.pago == 'PENDENTE'"
                  >
                    <i class="fa fa-lg fa-trash"></i>
                  </v-btn>
                  <span>Excluir conta</span>
                </v-tooltip>
              </v-card>
            </v-menu>
          </td>
        </template>
      </v-data-table>
    </Card>

    <v-dialog v-model="confirmaExclusao" persistent max-width="500px" v-if="financeiroStore.financ">
      <v-card>
        <v-card-title>
          <span class="headline">Excluir parcela</span>
        </v-card-title>
        <v-card-text
          v-if="!Array.isArray(financeiroStore.financ)"
        >Cancelar conta {{ financeiroStore.financ.id }} no valor de {{ financeiroStore.financ.valor_parcela | currency }}?</v-card-text>
        <v-card-text v-else>
          <v-flex xs12>Excluir {{ financeiroStore.financ.length }} contas?</v-flex>
          <v-flex xs12>
            <font color="red" v-if="!confirmacao">
              <small>Atenção! essa é uma operação que afetará as seguintes áreas do sistema - financeiro e contas. Deseja continuar?</small>
            </font>
            <font color="red" v-else-if="confirmacao">
              <small>Atenção! você está prestes a excluir uma conta financeira já concluída. Deseja continuar?</small>
            </font>
          </v-flex>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            flat
            @click="[confirmaExclusao = false, confirmacao = false]"
          >Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="remove()">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="confirmaCancelamento"
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
        >Cancelar {{ financeiroStore.financ.tipo_conta == 'RECEBER' ? 'recebimento' : 'pagamento' }} no valor de {{ financeiroStore.financ.valor_pago | currency }}?</v-card-text>
        <v-card-text v-else>Cancelar {{ financeiroStore.financ.length }} contas?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="confirmaCancelamento = false">Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="remove_pagamento()">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- <Impressao /> -->
  </div>
</template>

<script>
import axios from "axios";
import { urlBD, showError, showSuccess, formatDate, saveLog } from "@/global";
import { mapState } from "vuex";

import { formatToBRL } from "brazilian-values";

export default {
  name: "Gridcompras",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "financeiroStore",
      "empresaStore",
      "usuarioStore",
      "modalStore",
      "pessoaStore",
      "filter"
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
        ...this.filter,
        ...this.empresaStore.currentEmpresa
      };
    }
  },
  components: {
    Impressao: () => import("@/components/complementos/Impressao"),
    Card: () => import("../material/Card")
  },
  data() {
    return {
      valid: true,
      concluir: true,
      cancelar: true,
      loading: false,
      itens_selecionados: [],
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "pessoa", text: "Pessoa", sortable: true },
        { value: "tipo_conta", text: "Tipo", sortable: true },
        { value: "pago", text: "Situação", sortable: true },
        { value: "documento_origem", text: "Documento", sortable: true },
        { value: "num_documento_origem", text: "Número doc", sortable: true },
        { value: "data_vencimento", text: "Data vencimento", sortable: true },
        { value: "data_baixa", text: "Data baixa", sortable: true },
        { value: "valor_parcela", text: "Valor da parcela", sortable: true },
        { value: "actions", text: "Ações", sortable: false }
      ],
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 20, // -1 for All,
        sortBy: "tipo_conta",
        totalItems: 0
      },
      count: 0,
      confirmaExclusao: false,
      confirmaCancelamento: false,
      concluir: false,
      menu1: false,
      menu2: false,
      pesquisa: false,
      funcoes: false,
      confirmacao: false,
      globalActions: [
        {
          icon: "fa fa-lg fa-check",
          tooltip: "Concluir selecionados",
          method: "concluirConta",
          store: "financ",
          disabled: false
        },
        {
          icon: "fa fa-lg fa-times",
          tooltip: "Cancelar selecionados",
          method: "cancelarConta",
          store: "financ",
          disabled: false
        },
        {
          icon: "fa fa-lg fa-print",
          tooltip: "Imprimir selecionados",
          method: "print"
        },
        {
          icon: "fa fa-lg fa-trash",
          tooltip: "Excluir selecionados",
          method: "remove",
          store: "financ"
        },
        {
          icon: "fa fa-lg fa-refresh",
          tooltip: "Recarregar itens",
          method: "loadFinanceiro",
          required: true
        }
      ]
    };
  },
  watch: {
    itens_selecionados() {
      if (
        this.itens_selecionados.find(item => item.tipo_conta == "PAGAR") &&
        this.itens_selecionados.find(item => item.tipo_conta == "RECEBER")
      )
        this.globalActions[0].disabled = true;
      else this.globalActions[0].disabled = false;

      if (this.itens_selecionados.find(item => item.pago == "CONCLUÍDA"))
        this.globalActions[0].disabled = true;
      else this.globalActions[0].disabled = false;

      if (this.itens_selecionados.find(item => item.pago == "PENDENTE"))
        this.globalActions[1].disabled = true;
      else this.globalActions[1].disabled = false;
    },
    params() {
      this.loadFinanceiro();
    },
    "$store.state.modalStore.financeiro.financ.visible": function() {
      if (
        !this.modalStore.financeiro.financ.visible &&
        this.financeiroStore.financ != null
      ) {
        this.loadFinanceiro();
      }
    },
    "$store.state.modalStore.financeiro.financ.pagamento": function() {
      if (!this.modalStore.financeiro.financ.pagamento) {
        this.loadFinanceiro();
        this.itens_selecionados = [];
      }
    }
  },
  methods: {
    getColor(situacao) {
      if (situacao === "PENDENTE") return "blue";
      else if (situacao === "CANCELADO") return "red";
      else if (situacao === "CONCLUÍDA") return "green";
      else if (situacao === "PAGAR") return "warning";
      else if (situacao === "RECEBER") return "green";
      else return "red";
    },
    concluirConta() {
      console.log(this.financeiroStore.financ);
      this.modalStore.financeiro.financ.pagamento = true;
    },
    cancelarConta() {
      this.confirmaCancelamento = true;
    },
    async loadFinanceiro() {
      this.loading = true;

      const url = `${urlBD}/financeiro?page=${this.pagination.page}&limit=${
        this.pagination.rowsPerPage
      }&order=${this.pagination.sortBy || ""}&desc=${
        this.pagination.descending ? "desc" : "asc"
      }&empresa=${this.empresaStore.currentEmpresa || ""}&tipo=${this.filter
        .tipo || 1}&id=${this.filter.id || ""}&pessoa=${this.filter.pessoa ||
        ""}&documento=${this.filter.documento || ""}&tipo_data=${this.filter
        .tipo_data || ""}&data_inicial=${this.filter.data_inicial ||
        ""}&data_final=${this.filter.data_final || ""}&pendentes=${this.filter
        .pendentes || ""}&concluidos=${this.filter.concluidos ||
        ""}&pagar=${this.filter.pagar || ""}&receber=${this.filter.receber ||
        ""}`;

      axios
        .get(url)
        .then(res => {
          this.financeiroStore.financs = res.data.data;
          this.count = res.data.count;
          this.pagination.rowsPerPage = res.data.limit;
        })
        .catch(showError)
        .finally(() => (this.loading = false));
    },
    async remove() {
      if (!this.confirmaExclusao) {
        this.confirmaExclusao = true;
        return;
      }

      var itens = [];

      if (!this.financeiroStore.financ.id) {
        itens = this.financeiroStore.financ.map(item => {
          return {
            id: item.id,
            valor_parcela: item.valor_parcela,
            pago: item.pago
          };
        });
      } else {
        itens.push({
          id: this.financeiroStore.financ.id,
          valor_parcela: this.financeiroStore.financ.valor_parcela,
          pago: this.financeiroStore.financ.pago
        });
      }

      const aux = itens.filter(item => item.pago == "CONCLUÍDA");
      if (aux.length > 0 && !this.confirmacao) {
        this.confirmacao = true;
        return;
      }

      itens = itens.map(async item => {
        const url = `${urlBD}/financeiro/${item.id}`;

        await axios
          .delete(url)
          .then(() => {
            showSuccess("Financeiro excluído com sucesso!");

            saveLog(
              new Date(),
              "EXCLUSÃO",
              "FINANCEIRO",
              `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu a parcela ${item.id} no valor de ${item.valor_parcela}`
            );
          })
          .catch(showError);
      });

      await Promise.all(itens).then(() => {
        this.confirmacao = false;
        this.confirmaExclusao = false;
        this.itens_selecionados = [];
        this.loadFinanceiro();
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
            this.confirmaCancelamento = false;
            this.itens_selecionados = [];

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
    this.$store.dispatch("loadPessoas");
    this.concluir = true;
    this.cancelar = true;
  }
};
</script>

<style>
</style>