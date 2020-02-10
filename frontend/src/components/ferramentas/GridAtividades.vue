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
                            dense
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
                          <v-autocomplete
                            label="Tipo"
                            dense
                            auto-select-first
                            v-model="filter"
                            :items="[{ value: 1, text: 'Gravação' }, { value: 2, text: 'Alteração' }, { value: 3, text: 'Exclusão' }]"
                          ></v-autocomplete>
                        </v-flex>
                        <v-flex xs12 md6>
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
                          <v-menu
                            ref="hora_inicial"
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
                                v-model="filter.hora_inicial"
                                label="Hora inicial"
                                prepend-icon="access_time"
                                readonly
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-time-picker
                              format="24hr"
                              v-if="menu3"
                              v-model="filter.hora_inicial"
                              full-width
                              @click:minute="$refs.hora_inicial.save(filter.hora_inicial)"
                            ></v-time-picker>
                          </v-menu>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-menu
                            ref="hora_final"
                            v-model="menu4"
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
                                v-model="filter.hora_final"
                                label="Hora final"
                                prepend-icon="access_time"
                                readonly
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-time-picker
                              format="24hr"
                              v-if="menu4"
                              v-model="filter.hora_final"
                              full-width
                              @click:minute="$refs.hora_final.save(filter.hora_final)"
                            ></v-time-picker>
                          </v-menu>
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
              label="Procurar por usuário"
              :color="color"
              dense
              :items="usuarioStore.usuarios"
              v-model="filter.usuario"
              clearable
            />
          </v-layout>
        </v-flex>
      </v-layout>

      <v-flex v-else xs12 md4 class="p-0 m-0">
        <v-layout justify-start align-center>
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
                        <v-autocomplete
                          label="Tipo"
                          dense
                          auto-select-first
                          :items="[
                            { value: 1, text: 'Gravação' },
                            { value: 2, text: 'Alteração' },
                            { value: 3, text: 'Exclusão' },
                        ]"
                          v-model="filter.tipo_acao"
                        ></v-autocomplete>
                      </v-flex>
                      <v-flex xs12 md6>
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
                        <v-menu
                          ref="hora_inicial"
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
                              v-model="filter.hora_inicial"
                              label="Hora inicial"
                              prepend-icon="access_time"
                              readonly
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-time-picker
                            format="24hr"
                            v-if="menu3"
                            v-model="filter.hora_inicial"
                            full-width
                            @click:minute="$refs.hora_inicial.save(filter.hora_inicial)"
                          ></v-time-picker>
                        </v-menu>
                      </v-flex>
                      <v-flex xs12 md6>
                        <v-menu
                          ref="hora_final"
                          v-model="menu4"
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
                              v-model="filter.hora_final"
                              label="Hora final"
                              prepend-icon="access_time"
                              readonly
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-time-picker
                            format="24hr"
                            v-if="menu4"
                            v-model="filter.hora_final"
                            full-width
                            @click:minute="$refs.hora_final.save(filter.hora_final)"
                          ></v-time-picker>
                        </v-menu>
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
            label="Procurar por usuário"
            :color="color"
            dense
            :items="usuarioStore.usuarios"
            v-model="filter.usuario"
            clearable
          />
        </v-layout>
      </v-flex>
    </v-container>
    <v-data-table
      class="elevation-5"
      :items="atividadeStore.atividades"
      :headers="fields"
      :pagination.sync="pagination"
      :rows-per-page-items="[5, 10, 20, 50, 100]"
      rows-per-page-text="Registros por página"
      no-results-text="Nenhum registro encontrado"
      no-data-text="Nenhuma atividade encontrada"
      :total-items="count"
    >
      <v-progress-linear slot="progress" color="blue" height="3" indeterminate></v-progress-linear>
      <template slot="items" slot-scope="data">
        <td>{{ data.item.id }}</td>
        <td>{{ data.item.usuario }}</td>
        <td>
          <v-chip :color="getColor(data.item.tipo)" dark>{{ data.item.tipo }}</v-chip>
        </td>
        <td>{{ data.item.data }}</td>
        <td>{{ data.item.hora }}</td>
        <td>
          <v-chip :color="getColor()" dark>{{ data.item.tela }}</v-chip>
        </td>
        <td>{{ data.item.detalhe }}</td>
        <td>
          <v-tooltip bottom>
            <b-button
              slot="activator"
              variant="secundary"
              @click.prevent="[modalStore.atividades.deleteAtividade = true]"
              class="mr-1"
            >
              <i class="fa fa-lg fa-trash"></i>
            </b-button>
            <span>Excluir atividade</span>
          </v-tooltip>
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import axios from "axios";
import { urlBD, showError, formatDate, loadUsuarios } from "@/global";
import { mapState } from "vuex";

export default {
  name: "GridAtividades",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "atividadeStore",
      "modalStore",
      "usuarioStore",
      "empresaStore"
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
  data() {
    return {
      valid: true,
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "usuario", text: "Usuário", sortable: true },
        { value: "tipo", text: "Tipo", sortable: true },
        { value: "data", text: "Data", sortable: true },
        { value: "hora", text: "Hora", sortable: true },
        { value: "tela", text: "Tela", sortable: true },
        { value: "detalhe", text: "Observação", sortable: true },
        { value: "actions", text: "Ações", sortable: false }
      ],
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 20, // -1 for All,
        sortBy: "data",
        totalItems: 0
      },
      count: 0,
      concluir: false,
      filter: {},
      menu1: false,
      menu2: false,
      menu3: false,
      menu4: false,
      pesquisa: false
    };
  },
  watch: {
    params() {
      this.loadAtividades();
    }
  },
  methods: {
    getColor(tipo) {
      if (tipo) {
        if (tipo == "GRAVAÇÃO") return "green";
        else if (tipo == "ALTERAÇÃO") return "blue";
        else return "red";
      } else {
        return "blue";
      }
    },
    async loadAtividades() {
      const url = `${urlBD}/log?page=${this.pagination.page}&limit=${
        this.pagination.rowsPerPage
      }&tipo=${this.filter.tipo || 1}&id=${this.filter.id ||
        ""}&tipo_acao=${this.filter.tipo_acao || ""}&usuario=${this.filter
        .usuario || ""}&data_inicial=${this.filter.data_inicial ||
        ""}&data_final=${this.filter.data_final || ""}&hora_inicial=${this
        .filter.hora_inicial || ""}&hora_final=${this.filter.hora_final || ""}`;

      await axios
        .get(url)
        .then(res => {
          this.atividadeStore.atividades = res.data.data.map(log => {
            log.data = formatDate(
              new Date(log.data).toISOString().substr(0, 10)
            );

            return log;
          });
          this.count = res.data.count;
          this.pagination.rowsPerPage = res.data.limit;
        })
        .catch(showError);
    },
    async remove() {}
  },
  mounted() {
    loadUsuarios();
  }
};
</script>

<style>
</style>