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
                          <v-text-field
                            label="CPF/CNPJ"
                            v-model="filter.cpf_cnpj"
                            v-mask="['###.###.###-##', '##.###.###/####-##']"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-text-field label="E-mail" v-model="filter.email"></v-text-field>
                        </v-flex>
                        <v-flex xs12 md4>
                          <v-switch label="Clientes" :color="color" v-model="filter.cliente"></v-switch>
                        </v-flex>
                        <v-flex xs12 md4>
                          <v-switch label="Fornecedores" :color="color" v-model="filter.fornecedor"></v-switch>
                        </v-flex>
                        <v-flex xs12 md4>
                          <v-switch
                            label="Funcionários"
                            :color="color"
                            v-model="filter.funcionario"
                          ></v-switch>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-switch
                            label="Transpotadoras"
                            :color="color"
                            v-model="filter.transportadora"
                          ></v-switch>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-switch label="Vendedores" :color="color" v-model="filter.vendedor"></v-switch>
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
                      <v-text-field
                        label="CPF/CNPJ"
                        v-model="filter.cpf_cnpj"
                        v-mask="['###.###.###-##', '##.###.###/####-##']"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field label="E-mail" v-model="filter.email"></v-text-field>
                    </v-flex>
                    <v-flex xs12 md4>
                      <v-switch label="Clientes" :color="color" v-model="filter.cliente"></v-switch>
                    </v-flex>
                    <v-flex xs12 md4>
                      <v-switch label="Fornecedores" :color="color" v-model="filter.fornecedor"></v-switch>
                    </v-flex>
                    <v-flex xs12 md4>
                      <v-switch label="Funcionários" :color="color" v-model="filter.funcionario"></v-switch>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-switch
                        label="Transpotadoras"
                        :color="color"
                        v-model="filter.transportadora"
                      ></v-switch>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-switch label="Vendedores" :color="color" v-model="filter.vendedor"></v-switch>
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
      >
        <v-progress-linear slot="progress" color="blue" height="3" indeterminate></v-progress-linear>
        <template slot="items" slot-scope="data">
          <td>{{ data.item.id }}</td>
          <td>{{ data.item.empresa }}</td>
          <td>
            <v-chip
              :color="getColor(data.item.tipo_receita_despesa)"
              dark
            >{{ data.item.tipo_receita_despesa }}</v-chip>
          </td>
          <td>{{ data.item.valor_total }}</td>
          <td>
            <b-button
              variant="secundary"
              @click.prevent="[empresaStore.meta = data.item, modalStore.empresas.metas.visible = true,modalStore.empresas.metas.title = 'Alterar meta']"
              class="mr-1"
            >
              <i class="fa fa-lg fa-pencil"></i>
            </b-button>
            <b-button
              variant="secundary"
              @click.prevent="[modalStore.empresas.metas.deleteMeta = true,empresaStore.meta = data.item]"
              class="mr-1"
            >
              <i class="fa fa-lg fa-trash"></i>
            </b-button>
            <b-button
              variant="secundary"
              @click.prevent="[modalStore.email.visible = true, modalStore.email.para = data.item.email]"
            >
              <i class="fa fa-lg fa-envelope"></i>
            </b-button>
          </td>
        </template>
      </v-data-table>
    </Card>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "GridMetas",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["empresaStore", "modalStore"])
  },
  components: {
    Card: () => import("../material/Card")
  },
  data() {
    return {
      valid: true,
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "empresa", text: "Empresa", sortable: true },
        { value: "tipo_receita_despesa", text: "Tipo", sortable: true },
        { value: "valor_total", text: "Valor total", sortable: true },
        { value: "actions", text: "Ações" }
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
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 10, // -1 for All,
        sortBy: "pessoa",
        totalItems: 0
      },
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
          store: "meta"
        },
        {
          icon: "fa fa-lg fa-refresh",
          tooltip: "Recarregar itens",
          method: "loadMetas"
        }
      ]
    };
  },
  methods: {
    getColor(situacao) {
      if (situacao === "RECEITA") return "green";
      else return "blue";
    }
  }
};
</script>

<style>
</style>