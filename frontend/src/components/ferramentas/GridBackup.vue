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
                :color="color"
                @click.prevent="[backupStore.backup = null, modalStore.backups.visible = true]"
              >Adicionar backup</v-btn>
              <span>Realizar backup dos dados do sistema</span>
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
            :color="color"
            @click.prevent="[backupStore.backup = null, modalStore.backups.visible = true]"
          >Adicionar backup</v-btn>
          <span>Realizar backup dos dados do sistema</span>
        </v-tooltip>
      </v-layout>
    </v-container>

    <v-data-table
      class="elevation-5"
      :headers="fields"
      :pagination.sync="pagination"
      :rows-per-page-items="[5, 10, 20, 50, 100]"
      rows-per-page-text="Registros por página"
      no-results-text="Nenhum registro encontrado"
      no-data-text="Nenhuma conta cadastrada"
      select-all
      v-model="backups_selecionados"
      :items="backupStore.backups"
      :total-items="count"
    >
      <v-progress-linear slot="progress" color="blue" height="3" indeterminate></v-progress-linear>
      <template slot="items" slot-scope="data">
        <td>
          <v-checkbox v-model="data.selected" :color="color" hide-details></v-checkbox>
        </td>
        <td>{{ data.item.id }}</td>
        <td>{{ data.item.nome }}</td>
        <td>{{ data.item.data }}</td>
        <td>{{ data.item.tipo }}</td>
        <td></td>
      </template>
    </v-data-table>

    <v-dialog
      v-model="modalStore.backups.deleteBackup"
      persistent
      max-width="500px"
      v-if="backupStore.backup"
      lazy
    >
      <v-card>
        <v-card-title>
          <span class="headline">Excluir parcela</span>
        </v-card-title>
        <v-card-text
          v-if="!Array.isArray(backupStore.backup)"
        >Cancelar conta {{ backupStore.backup.id }} no valor de {{ backupStore.backup.valor_parcela }}?</v-card-text>
        <v-card-text v-else>
          <v-flex xs12>Excluir {{ backupStore.backup.length }} contas?</v-flex>
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
            @click="[modalStore.backups.deleteBackup = false, confirmacao = false]"
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

import { formatToBRL } from "brazilian-values";

export default {
  name: "GridBackup",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["backupStore", "usuarioStore", "modalStore", "pessoaStore"]),
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
  data() {
    return {
      valid: true,
      concluir: true,
      cancelar: true,
      backups_selecionados: [],
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "nome", text: "Nome", sortable: true },
        { value: "data", text: "Data", sortable: true },
        { value: "tipo", text: "Tipo", sortable: true },
        { value: "actions", text: "Ações", sortable: false }
      ],
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 20, // -1 for All,
        sortBy: "id",
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
    backups_selecionados: function() {
      if (this.backups_selecionados.length > 1) {
        this.funcoes = true;
      } else {
        this.funcoes = false;
      }
    },
    params() {
      this.loadBackups();
    },
    "$store.state.modalStore.backups.visible": function() {
      if (!this.modalStore.backups.visible) {
        this.loadBackups();
      }
    }
  },
  methods: {
    getWindowSize() {
      return window.innerWidth / 2 - 150;
    },
    getColor(situacao) {
      if (situacao === "PENDENTE") return "blue";
      else if (situacao === "CANCELADO") return "red";
      else if (situacao === "CONCLUÍDA") return "green";
      else if (situacao === "PAGAR") return "warning";
      else if (situacao === "RECEBER") return "green";
      else return "red";
    },
    async loadBackups() {},
    async remove() {}
  }
};
</script>

<style>
</style>