<template>
  <div class="grid-metas">
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
              max-width="500"
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
                            dense
                            :items="[{ value: 1, text: 'Pesquisa rápida'}, { value: 2, text: 'Pesquisa avançada'}]"
                            v-model="filter.tipo"
                          ></v-autocomplete>
                        </v-flex>
                      </v-layout>
                      <v-layout wrap>
                        <v-flex xs12 md6>
                          <v-text-field label="Código" v-model="filter.id"></v-text-field>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-text-field label="Empresa" v-model="filter.empresa"></v-text-field>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-text-field label="Valor" v-model="filter.valor"></v-text-field>
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
              clearable
              :color="color"
              v-model="filter.nome"
              append-icon="fa fa-search"
            ></v-text-field>
          </v-layout>

          <v-layout justify-center wrap>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                :color="color"
                @click.prevent="[empresaStore.meta = null, modalStore.empresas.metas.visible = true, modalStore.empresas.metas.title = 'Adicionar meta']"
                v-if="usuarioStore.currentUsuario.empresa_create"
              >Adicionar</v-btn>
              <span>Adicionar meta</span>
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
          max-width="500"
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
                        dense
                        :items="[{ value: 1, text: 'Pesquisa rápida'}, { value: 2, text: 'Pesquisa avançada'}]"
                        v-model="filter.tipo"
                      ></v-autocomplete>
                    </v-flex>
                  </v-layout>
                  <v-layout wrap>
                    <v-flex xs12 md6>
                      <v-text-field label="Código" v-model="filter.id"></v-text-field>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field label="Empresa" v-model="filter.empresa"></v-text-field>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field label="Valor" v-model="filter.valor"></v-text-field>
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
          clearable
          :color="color"
          v-model="filter.nome"
          append-icon="fa fa-search"
        />

        <v-spacer></v-spacer>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            class="v-btn-common"
            :color="color"
            @click.prevent="[empresaStore.meta = null, modalStore.empresas.metas.visible = true, modalStore.empresas.metas.title = 'Adicionar meta']"
            v-if="usuarioStore.currentUsuario.empresa_create"
          >Adicionar</v-btn>
          <span>Adicionar meta</span>
        </v-tooltip>
      </v-layout>
    </v-container>

    <Card :color="color" title="Ações rápidas" :actions="globalActions">
      <v-data-table
        :items="empresaStore.metas"
        :headers="fields"
        :pagination.sync="pagination"
        :rows-per-page-items="[5, 10, 15, 20]"
        rows-per-page-text="Registros por página"
        no-results-text="Nenhum registro encontrado"
        no-data-text="Nenhuma meta cadastrada"
        select-all
        :loading="loading"
        v-model="itens_selecionados"
      >
        <template slot="items" slot-scope="data">
          <td>
            <v-checkbox v-model="data.selected" :color="color" hide-details></v-checkbox>
          </td>
          <td>{{ data.item.id }}</td>
          <td>{{ data.item.empresa }}</td>
          <td>{{ data.item.nome }}</td>
          <td>
            <v-chip
              :color="getColor(data.item.tipo_receita_despesa)"
              dark
            >{{ data.item.tipo_receita_despesa }}</v-chip>
          </td>
          <td>{{ data.item.data | date }}</td>
          <td>{{ data.item.valor | currency }}</td>
          <td>
            {{ data.item.concluido_valor | currency }} - {{ data.item.valor | currency }}
            <v-progress-linear :value="data.item.concluido_porc"></v-progress-linear>
          </td>
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
                    @click.prevent="[empresaStore.meta = data.item, modalStore.empresas.metas.visible = true,modalStore.empresas.metas.title = 'Alterar meta']"
                    class="mr-1"
                  >
                    <i class="fa fa-lg fa-pencil"></i>
                  </v-btn>
                  <span>Editar meta</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn
                    slot="activator"
                    icon
                    dark
                    @click.prevent="[confirmaExclusao = true,empresaStore.meta = data.item]"
                    class="mr-1"
                  >
                    <i class="fa fa-lg fa-trash"></i>
                  </v-btn>
                  <span>Excluir meta</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn
                    slot="activator"
                    icon
                    dark
                    @click.prevent="[modalStore.email.visible = true, modalStore.email.para = data.item.email]"
                  >
                    <i class="fa fa-lg fa-envelope"></i>
                  </v-btn>
                  <span>Enviar meta por e-mail</span>
                </v-tooltip>
              </v-card>
            </v-menu>
          </td>
        </template>
      </v-data-table>
    </Card>

    <v-dialog v-model="confirmaExclusao" persistent max-width="500px" v-if="empresaStore.meta">
      <v-card>
        <v-card-title>
          <span class="headline">Excluir meta</span>
        </v-card-title>

        <v-card-text v-if="!Array.isArray(empresaStore.meta)">Excluir {{ empresaStore.meta.nome }}?</v-card-text>
        <v-card-text v-else>
          <v-flex xs12>Excluir {{ empresaStore.meta.length }} metas?</v-flex>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="confirmaExclusao = false">Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="remove()">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import { urlBD, showError, saveLog } from "@/global";
import { mapState } from "vuex";

export default {
  name: "GridMetas",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["empresaStore", "usuarioStore", "modalStore"]),
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
  watch: {
    params() {
      this.loadMetas();
    },
    "$store.state.modalStore.empresas.metas.visible"() {
      if (
        !this.modalStore.empresas.metas.visible &&
        this.empresaStore.meta != null
      )
        this.loadMetas();
    },
    pesquisa() {
      if (this.pesquisa) {
        this.$store.dispatch("loadEmpresas");
      }
    }
  },
  data() {
    return {
      itens_selecionados: [],
      valid: true,
      loading: false,
      confirmaExclusao: false,
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "empresa", text: "Empresa", sortable: true },
        { value: "nome", text: "Nome", sortable: true },
        { value: "tipo_receita_despesa", text: "Tipo", sortable: true },
        { value: "data", text: "Data", sortable: true },
        { value: "valor", text: "Valor", sortable: true },
        { value: "concluido_proc", text: "Concluído", sortable: false },
        { value: "actions", text: "Ações", sortable: false }
      ],
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 10, // -1 for All,
        sortBy: "empresa",
        totalItems: 0
      },
      filter: {},
      pesquisa: false,
      count: 0,
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
          store: "empresaMeta"
        },
        {
          icon: "fa fa-lg fa-refresh",
          tooltip: "Recarregar itens",
          method: "loadMetas",
          required: true
        }
      ]
    };
  },
  methods: {
    getColor(situacao) {
      if (situacao === "RECEITA") return "green";
      else return "blue";
    },
    async loadMetas() {
      this.loading = true;

      const url = `${urlBD}/empresaMetas?page=${this.pagination.page}&limit=${
        this.pagination.rowsPerPage
      }&order=${this.pagination.sortBy || ""}&desc=${
        this.pagination.descending ? "desc" : "asc"
      }&tipo=${this.filter.tipo || 1}&id=${this.filter.id || ""}&nome=${this
        .filter.nome || ""}`;

      axios
        .get(url)
        .then(res => {
          this.empresaStore.metas = res.data.data;
          this.count = res.data.count;
          this.pagination.rowsPerPage = res.data.limit;
        })
        .catch(showError)
        .finally(() => (this.loading = false));
    },
    remove() {
      if (!this.confirmaExclusao) {
        this.confirmaExclusao = true;
        return;
      }

      var metas = [];

      if (!this.empresaStore.meta.id) {
        metas = this.empresaStore.meta.map(item => {
          return {
            id: item.id,
            nome: item.nome
          };
        });
      } else {
        metas.push({
          id: this.empresaStore.meta.id,
          valor_parcela: this.empresaStore.meta.nome
        });
      }

      metas.map(async item => {
        const url = `${urlBD}/empresaMetas/${item.id}`;

        await axios
          .delete(url)
          .then(() => {
            this.$toasted.global.defaultSuccess();

            this.loadMetas();
            this.confirmaExclusao = false;

            saveLog(
              new Date(),
              "EXCLUSÃO",
              "METAS DA EMPRESA",
              `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu a meta ${this.empresaStore.meta.nome}`
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