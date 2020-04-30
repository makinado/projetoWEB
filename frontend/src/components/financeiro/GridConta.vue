<template>
  <div class="grid-conta">
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
                            dense
                            label="Selecione"
                            :items="[{value: 1, text:'Pesquisa rápida'}, {value: 2, text: 'Pesquisa avançada'}]"
                            v-model="filter.tipo"
                          ></v-autocomplete>
                        </v-flex>
                      </v-layout>
                      <v-layout wrap>
                        <v-flex xs12 md6>
                          <v-text-field label="Código" v-model="filter.id"></v-text-field>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-text-field label="Valor" v-model="filter.valor" v-money="money"></v-text-field>
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
            <v-text-field
              label="Procurar por nome"
              :color="color"
              clearable
              v-model="filter.nome"
              append-icon="fa fa-search"
            />
          </v-layout>

          <v-layout wrap justify-center>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                :color="color"
                @click.prevent="[financeiroStore.conta = null, modalStore.financeiro.conta.visible = true, modalStore.financeiro.conta.title = 'Adicionar conta']"
                v-if="usuarioStore.currentUsuario.contas_create"
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
                        dense
                        label="Selecione"
                        :items="[{value: 1, text:'Pesquisa rápida'}, {value: 2, text: 'Pesquisa avançada'}]"
                        v-model="filter.tipo"
                      ></v-autocomplete>
                    </v-flex>
                  </v-layout>
                  <v-layout wrap>
                    <v-flex xs12 md6>
                      <v-text-field label="Código" v-model="filter.id"></v-text-field>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field label="Valor" v-model="filter.valor" v-money="money"></v-text-field>
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
        <v-text-field
          label="Procurar por nome"
          :color="color"
          clearable
          v-model="filter.nome"
          append-icon="fa fa-search"
        />

        <v-spacer></v-spacer>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            class="v-btn-common"
            :color="color"
            @click.prevent="[financeiroStore.conta = null, modalStore.financeiro.conta.visible = true, modalStore.financeiro.conta.title = 'Adicionar conta']"
            v-if="usuarioStore.currentUsuario.contas_create"
          >Adicionar conta</v-btn>
          <span>Adicionar conta conta</span>
        </v-tooltip>
      </v-layout>
    </v-container>

    <Card :color="color" title="Ações rápidas" :actions="globalActions">
      <v-data-table
        :items="financeiroStore.contas"
        :headers="fields"
        :pagination.sync="pagination"
        :rows-per-page-items="[5, 10, 20, 50, 100]"
        rows-per-page-text="Registros por página"
        no-results-text="Nenhum registro encontrado"
        no-data-text="Nenhuma conta cadastrada"
        :total-items="count"
        select-all
        v-model="itens_selecionados"
        :loading="loading"
      >
        <template slot="items" slot-scope="data">
          <td>
            <v-checkbox v-model="data.selected" :color="color" hide-details></v-checkbox>
          </td>
          <td>{{ data.item.id }}</td>
          <td>{{ data.item.empresa }}</td>
          <td>{{ data.item.nome }}</td>
          <td>{{ data.item.saldo_atual || "R$ 0,00" }}</td>
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
                    @click.prevent="[financeiroStore.conta = data.item, modalStore.financeiro.movimento.visible = true]"
                    class="mr-1"
                    v-if="usuarioStore.currentUsuario.contas_update"
                  >
                    <i class="fa fa-lg fa-eye"></i>
                  </v-btn>
                  <span>Ver movimento</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn
                    slot="activator"
                    icon
                    dark
                    @click.prevent="[financeiroStore.conta = data.item, modalStore.financeiro.conta.visible = true,modalStore.financeiro.conta.title = 'Alterar conta']"
                    class="mr-1"
                    v-if="usuarioStore.currentUsuario.contas_update"
                  >
                    <i class="fa fa-lg fa-pencil"></i>
                  </v-btn>
                  <span>Editar conta</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn
                    slot="activator"
                    icon
                    dark
                    @click.prevent="[confirmaExclusao = true, financeiroStore.conta = data.item]"
                    class="mr-1"
                    v-if="usuarioStore.currentUsuario.contas_delete"
                  >
                    <i class="fa fa-lg fa-trash"></i>
                  </v-btn>
                  <span>Excluir conta</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn
                    slot="activator"
                    icon
                    dark
                    @click.prevent="[modalStore.complementos.impressao = true]"
                  >
                    <i class="fa fa-lg fa-print"></i>
                  </v-btn>
                  <span>Exportar conta</span>
                </v-tooltip>
              </v-card>
            </v-menu>
          </td>
        </template>
      </v-data-table>
    </Card>

    <v-dialog v-model="confirmaExclusao" persistent max-width="500px" v-if="financeiroStore.conta">
      <v-card>
        <v-card-title>
          <span class="headline">Excluir conta</span>
        </v-card-title>
        <v-card-text
          v-if="!Array.isArray(financeiroStore.conta)"
        >Excluir conta {{ financeiroStore.conta.id }}?</v-card-text>
        <v-card-text v-else>
          <v-flex xs12>Excluir {{ financeiroStore.conta.length }} contas?</v-flex>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="[confirmaExclusao = false]">Fechar</v-btn>
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

import { formatToBRL } from "brazilian-values";
import { VMoney } from "v-money";

export default {
  directives: { money: VMoney },
  name: "GridConta",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "financeiroStore",
      "usuarioStore",
      "empresaStore",
      "modalStore"
    ]),
    params() {
      return {
        ...this.pagination,
        ...this.filter
      };
    }
  },
  components: {
    Card: () => import("../material/Card")
  },
  data() {
    return {
      valid: true,
      loading: false,
      itens_selecionados: [],
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "empresa", text: "Empresa", sortable: true },
        { value: "nome", text: "Nome", sortable: true },
        { value: "saldo_atual", text: "Saldo atual", sortable: true },
        { value: "actions", text: "Ações", sortable: false }
      ],
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 10, // -1 for All,
        sortBy: "nome",
        totalItems: 0
      },
      count: 0,
      concluir: false,
      filter: {},
      pesquisa: false,
      confirmaExclusao: false,
      money: {
        decimal: ",",
        thousands: ".",
        prefix: "R$ ",
        precision: 2
      },
      globalActions: [
        {
          icon: "fa fa-lg fa-print",
          tooltip: "Imprimir selecionados",
          method: "print"
        },
        {
          icon: "fa fa-lg fa-trash",
          tooltip: "Excluir selecionados",
          method: "remove",
          store: "conta"
        },
        {
          icon: "fa fa-lg fa-refresh",
          tooltip: "Recarregar itens",
          method: "loadContas",
          required: true
        }
      ]
    };
  },
  watch: {
    params() {
      this.loadContas();
    },
    "$store.state.modalStore.financeiro.conta.visible": function() {
      if (!this.modalStore.financeiro.conta.visible) {
        this.loadContas();
      }
    },
    "$store.state.modalStore.financeiro.movimento.visible": function() {
      if (!this.modalStore.financeiro.movimento.visible) {
        this.loadContas();
      }
    }
  },
  methods: {
    async loadContas() {
      this.loading = true;

      const url = `${urlBD}/conta?page=${this.pagination.page}&limit=${
        this.pagination.rowsPerPage
      }&order=${this.pagination.sortBy || ""}&desc=${
        this.pagination.descending ? "desc" : "asc"
      }&tipo=${this.filter.tipo || 1}&id=${this.filter.id || ""}&empresa=${this
        .filter.empresa || ""}&nome=${this.filter.nome || ""}&valor=${this
        .filter.valor || ""}`;

      await axios
        .get(url)
        .then(res => {
          this.financeiroStore.contas = res.data.data.map(item => {
            item.saldo_atual = formatToBRL(item.saldo_atual);
            return item;
          });
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

      var contas = [];

      if (!this.financeiroStore.conta.id) {
        contas = this.financeiroStore.conta.map(item => {
          return {
            id: item.id,
            nome: item.nome
          };
        });
      } else {
        contas.push({
          id: this.financeiroStore.conta.id,
          nome: this.financeiroStore.conta.nome
        });
      }

      contas.map(async item => {
        const url = `${urlBD}/conta/${item.id}`;
        await axios
          .delete(url)
          .then(() => {
            this.$toasted.global.defaultSuccess();
            this.confirmaExclusao = false;
            this.itens_selecionados = [];

            this.loadContas();

            saveLog(
              new Date(),
              "EXCLUSÃO",
              "CONTAS",
              `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu a conta ${this.financeiroStore.conta.nome}`
            );
          })
          .catch(showError);
      });
    }
  }
};
</script>

<style>
</style>