<template>
  <div class="grid-vendas">
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
                            :items="['Pesquisa rápida', 'Pesquisa avançada']"
                            v-model="filter.tipo"
                          ></v-autocomplete>
                        </v-flex>
                      </v-layout>
                      <v-layout wrap>
                        <v-flex xs12 md6>
                          <v-text-field label="Código" v-model="filter.id"></v-text-field>
                        </v-flex>
                        <v-flex xs12>
                          <v-autocomplete
                            label="Pesquisar por data"
                            dense
                            auto-select-first
                            :items="[{ value: 1, text: 'Data do contato', selected: true }, { value: 2, text: 'Data de agendamento' }]"
                            v-model="filter.tipo_data"
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
                        <v-flex xs12 md6>
                          <v-switch label="Pendentes" :color="color" v-model="filter.pendentes"></v-switch>
                        </v-flex>
                        <v-flex xs12 md6>
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
              label="Procurar por cliente"
              :color="color"
              v-model="filter.cliente"
              dense
              :items="pessoaStore.clientes"
              clearable
            ></v-autocomplete>
          </v-layout>

          <v-layout justify-center>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                color="secondary"
                @click.prevent="modalStore.tabelas.visible = true"
                v-if="usuarioStore.currentUsuario.vendas_create"
              >Tabelas de preço</v-btn>
              <span>Gerenciar tabelas de preço</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                :color="color"
                @click.prevent="[vendaStore.venda = null, modalStore.vendas.vendas.visible = true, modalStore.vendas.vendas.title = 'Adicionar orçamento / venda']"
                v-if="usuarioStore.currentUsuario.vendas_create"
              >Adicionar</v-btn>
              <span>Adicionar orçamento/venda</span>
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
                        :items="['Pesquisa rápida', 'Pesquisa avançada']"
                        v-model="filter.tipo"
                      ></v-autocomplete>
                    </v-flex>
                  </v-layout>
                  <v-layout wrap>
                    <v-flex xs12 md6>
                      <v-text-field label="Código" v-model="filter.id"></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-autocomplete
                        label="Pesquisar por data"
                        dense
                        auto-select-first
                        :items="[{ value: 1, text: 'Data do contato', selected: true }, { value: 2, text: 'Data de agendamento' }]"
                        v-model="filter.tipo_data"
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
                    <v-flex xs12 md4>
                      <v-switch label="Pendentes" :color="color" v-model="filter.pendentes"></v-switch>
                    </v-flex>
                    <v-flex xs12 md4>
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
          label="Procurar por cliente"
          :color="color"
          v-model="filter.cliente"
          dense
          :items="pessoaStore.clientes"
          clearable
        ></v-autocomplete>

        <v-spacer></v-spacer>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            class="v-btn-common"
            color="secondary"
            @click.prevent="modalStore.tabelas.visible = true"
            v-if="usuarioStore.currentUsuario.vendas_create"
          >Tabelas de preço</v-btn>
          <span>Gerenciar tabelas de preço</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn
            slot="activator"
            class="v-btn-common"
            :color="color"
            @click.prevent="[vendaStore.venda = null, modalStore.vendas.vendas.visible = true, modalStore.vendas.vendas.title = 'Adicionar orçamento / venda']"
            v-if="usuarioStore.currentUsuario.vendas_create"
          >Adicionar</v-btn>
          <span>Adicionar orçamento/venda</span>
        </v-tooltip>
      </v-layout>
    </v-container>

    <Card :color="color" title="Ações rápidas" :actions="globalActions">
      <v-data-table
        :items="vendaStore.vendas"
        :headers="fields"
        :pagination.sync="pagination"
        :rows-per-page-items="[5, 10, 20, 50, 100]"
        rows-per-page-text="Registros por página"
        no-results-text="Nenhum registro encontrado"
        no-data-text="Nenhum orçamento / venda realizado"
        select-all
        v-model="itens_selecionados"
        :loading="loading"
      >
        <template slot="items" slot-scope="data">
          <td>
            <v-checkbox v-model="data.selected" :color="color" hide-details></v-checkbox>
          </td>
          <td>{{ data.item.id }}</td>
          <td>
            <v-chip :color="getColor(data.item.tipo)" dark>{{ data.item.tipo }}</v-chip>
          </td>
          <td>{{ data.item.cliente }}</td>
          <td>
            <span v-if="data.item.vendedores.length == 1">{{ data.item.vendedores[0].usuario }}</span>
            <span v-else>{{ data.item.vendedores.length }} vendedores</span>
          </td>
          <td>{{ data.item.documento_fiscal }}</td>
          <td>{{ data.item.data_criacao| date }}</td>
          <td>{{ data.item.valor_total | currency }}</td>
          <td>
            <v-menu offset-y left>
              <v-btn icon slot="activator">
                <v-icon>fa fa-lg fa-ellipsis-v</v-icon>
              </v-btn>
              <v-card :color="color">
                <v-tooltip
                  v-if="usuarioStore.currentUsuario.vendas_update && data.item.tipo == 'ORÇAMENTO'"
                  bottom
                >
                  <v-btn
                    slot="activator"
                    icon
                    dark
                    @click.prevent="[vendaStore.venda = { ...data.item, finalizarOrçamento: true }, modalStore.vendas.vendas.visible = true, modalStore.vendas.vendas.title = 'Alterar orçamento / venda']"
                    class="mr-1"
                  >
                    <i class="fa fa-lg fa-check"></i>
                  </v-btn>
                  <span>Concluir venda</span>
                </v-tooltip>
                <v-tooltip
                  v-if="usuarioStore.currentUsuario.vendas_update && data.item.tipo == 'ORÇAMENTO'"
                  bottom
                >
                  <v-btn
                    slot="activator"
                    icon
                    dark
                    @click.prevent="[vendaStore.venda = data.item, modalStore.vendas.vendas.visible = true, modalStore.vendas.vendas.title = 'Alterar orçamento / venda']"
                    class="mr-1"
                  >
                    <i class="fa fa-lg fa-pencil"></i>
                  </v-btn>
                  <span>Editar orçamento</span>
                </v-tooltip>
                <v-tooltip v-else-if="data.item.tipo == 'VENDA'" bottom>
                  <v-btn
                    slot="activator"
                    icon
                    dark
                    @click="vendaStore.venda = data.item, modalStore.vendas.vendas.visible = true, modalStore.vendas.vendas.title = 'Visualizar dados da venda'"
                    class="mr-1"
                  >
                    <i class="fa fa-lg fa-eye"></i>
                  </v-btn>
                  <span>Visualizar dados da venda</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn
                    slot="activator"
                    icon
                    dark
                    @click.prevent="[confirmaExclusao = true,vendaStore.venda = data.item]"
                    class="mr-1"
                    v-if="usuarioStore.currentUsuario.vendas_delete"
                  >
                    <i class="fa fa-lg fa-trash"></i>
                  </v-btn>
                  <span>Excluir orçamento</span>
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
                  <span>Exportar orçamento</span>
                </v-tooltip>
              </v-card>
            </v-menu>
          </td>
        </template>
      </v-data-table>
    </Card>

    <v-dialog v-model="confirmaExclusao" persistent max-width="500px" v-if="vendaStore.venda">
      <v-card>
        <v-card-title>
          <span class="headline">Excluir parcela</span>
        </v-card-title>
        <v-card-text
          v-if="!Array.isArray(vendaStore.venda)"
        >Cancelar conta {{ vendaStore.venda.id }} no valor de {{ vendaStore.venda.valor_total | currency }}?</v-card-text>
        <v-card-text v-else>
          <v-flex xs12>Excluir {{ vendaStore.venda.length }} vendas?</v-flex>
          <v-flex xs12>
            <font color="red">
              <small>Atenção! essa é uma operação que afetará as seguintes áreas do sistema - comissões, metas, financeiro e contas. Deseja continuar?</small>
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
  </div>
</template>

<script>
import axios from "axios";
import { urlBD, showError, showSuccess, formatDate, saveLog } from "@/global";
import { mapState } from "vuex";

import { formatToBRL } from "brazilian-values";

export default {
  name: "Gridvendas",
  components: {
    Card: () => import("../material/Card")
  },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "vendaStore",
      "modalStore",
      "categoriaStore",
      "pessoaStore",
      "usuarioStore",
      "empresaStore",
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
  watch: {
    params() {
      this.loadVendas();
    },
    "$store.state.modalStore.vendas.vendas.visible"() {
      if (
        !this.modalStore.vendas.vendas.visible &&
        this.vendaStore.venda != null
      ) {
        this.loadVendas();
      }
    }
  },
  data() {
    return {
      valid: true,
      loading: false,
      confirmaExclusao: false,
      itens_selecionados: [],
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "tipo", text: "Tipo", sortable: true },
        { value: "cliente", text: "Cliente", sortable: true },
        { value: "vendedores", text: "Vendedores", sortable: true },
        { value: "documento_fiscal", text: "Documento fiscal", sortable: true },
        { value: "data_criacao", text: "Data venda" },
        { value: "valor_total", text: "Valor total" },
        { value: "actions", text: "Ações" }
      ],
      pagination: {
        descending: true,
        page: 1,
        rowsPerPage: 20, // -1 for All,
        sortBy: "data_criacao",
        totalItems: 0
      },
      count: 0,
      concluir: false,
      menu1: false,
      menu2: false,
      pesquisa: false,
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
          store: "venda"
        },
        {
          icon: "fa fa-lg fa-refresh",
          tooltip: "Recarregar itens",
          method: "loadVendas",
          required: true
        }
      ]
    };
  },
  methods: {
    getColor(item) {
      if (item == "CONCLUÍDO") return "green";
      else if (item == "CANCELADO") return "red";
      else if (item == "VENDA") return "green";
      else if (item == "ORÇAMENTO") return "blue";
      else return "blue";
    },
    async loadVendas() {
      this.loading = true;

      const url = `${urlBD}/vendas?page=${this.pagination.page}&limit=${
        this.pagination.rowsPerPage
      }&empresa=${this.empresaStore.currentEmpresa || ""}&tipo=${this.filter
        .tipo || 1}&id=${this.filter.id || ""}&cliente=${this.filter.cliente ||
        ""}&tipo_data=${this.filter.tipo_data || ""}&data_inicial=${this.filter
        .data_inicial || ""}&data_final=${this.filter.data_final ||
        ""}&pendentes=${this.filter.pendentes || ""}&concluidos=${this.filter
        .concluidos || ""}`;

      axios
        .get(url)
        .then(res => {
          this.vendaStore.vendas = res.data.data;
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

      let itens = [];

      if (!this.vendaStore.venda.id) {
        itens = this.vendaStore.venda.map(item => {
          return {
            id: item.id,
            valor_total: item.valor_total
          };
        });
      } else {
        itens.push({
          id: this.vendaStore.venda.id,
          valor_total: this.vendaStore.venda.valor_total
        });
      }

      itens = itens.map(async item => {
        console.log(item)
        await axios
          .delete(`${urlBD}/vendas/${item.id}`)
          .then(() => {
            showSuccess("Venda excluída com sucesso!");

            saveLog(
              new Date(),
              "EXCLUSÃO",
              "VENDAS",
              `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu a venda ${item.id} no valor de ${item.valor_total}`
            );
          })
          .catch(showError);
      });

      await Promise.all(itens).then(() => {
        this.confirmaExclusao = false;
        this.itens_selecionados = [];
        this.loadVendas();
      });
    }
  },
  mounted() {
    this.$store.dispatch("loadClientes");
  }
};
</script>

<style>
</style>