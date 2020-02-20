<template>
  <div class="grid-empresas">
    <v-container fluid>
      <v-layout
        justify-center
        v-if="$vuetify.breakpoint.name === 'xs' || $vuetify.breakpoint.name === 'sm' || $vuetify.breakpoint.name === 'md'"
      >
        <v-flex xs12>
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
                          :items="[{value: 1, text:'Pesquisa rápida'}, {value: 2, text:'Pesquisa avançada'}]"
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
                          label="CNPJ"
                          v-model="filter.cnpj"
                          v-mask="['##.###.###/####-##']"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 md6>
                        <v-text-field label="E-mail" v-model="filter.email"></v-text-field>
                      </v-flex>
                      <v-flex xs12 md6>
                        <v-text-field
                          label="Contato"
                          v-model="filter.contato"
                          v-mask="['(##)####-####', '(##)#####-####']"
                        ></v-text-field>
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

          <v-layout justify-center>
            <v-text-field
              label="Procurar por Razão social"
              clearable
              :color="color"
              v-model="filter.nome"
              append-icon="fa fa-search"
            />
          </v-layout>

          <v-layout justify-center>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                @click.left.exact="navigate('/metasEmp',false)"
                @click.ctrl="navigate('/metasEmp',true)"
                color="secondary"
              >Metas</v-btn>
              <span>Metas da empresa</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                :color="color"
                @click.prevent="[ empresaStore.empresa = null,modalStore.empresas.visible = true,modalStore.empresas.title = 'Adicionar empresa']"
              >Adicionar</v-btn>
              <span>Adicionar empresa</span>
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
                        dense
                        :items="[{value: 1, text:'Pesquisa rápida'}, {value: 2, text:'Pesquisa avançada'}]"
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
                        label="CNPJ"
                        v-model="filter.cnpj"
                        v-mask="['##.###.###/####-##']"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field label="E-mail" v-model="filter.email"></v-text-field>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field
                        label="Contato"
                        v-model="filter.contato"
                        v-mask="['(##)####-####', '(##)#####-####']"
                      ></v-text-field>
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
          label="Procurar por Razão social"
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
            @click.left.exact="navigate('/metasEmp',false)"
            @click.ctrl="navigate('/metasEmp',true)"
            color="secondary"
          >Metas</v-btn>
          <span>Metas da empresa</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn
            slot="activator"
            class="v-btn-common"
            :color="color"
            @click.prevent="[empresaStore.empresa = null,modalStore.empresas.visible = true,modalStore.empresas.title = 'Adicionar empresa']"
          >Adicionar</v-btn>
          <span>Adicionar empresa</span>
        </v-tooltip>
      </v-layout>
    </v-container>
    <Card v-resize="onResize" :color="color" title="Ações rápidas" :actions="globalActions">
      <v-data-table
        :items="empresaStore.empresas"
        :headers="fields"
        rows-per-page-text="Registros por página"
        no-results-text="Nenhum registro encontrado"
        no-data-text="Nenhuma empresa cadastrada"
        :rows-per-page-items="[5, 10, 20, 50, 100]"
        :total-items="count"
        :pagination.sync="pagination"
        v-model="itens_selecionados"
        select-all
        :hide-headers="isMobile"
        :class="{mobile: isMobile}"
      >
        <template slot="items" slot-scope="data">
          <tr v-if="!isMobile">
            <td>
              <v-checkbox v-model="data.selected" :color="color" hide-details></v-checkbox>
            </td>
            <td>{{ data.item.id }}</td>
            <td>{{ data.item.cnpj }}</td>
            <td>{{ data.item.nome }}</td>
            <td>{{ data.item.email }}</td>
            <td>{{ data.item.contato }}</td>
            <td>
              <v-tooltip bottom>
                <b-button
                  slot="activator"
                  variant="secundary"
                  @click.prevent="[empresaStore.empresa = data.item, modalStore.empresas.visible = true, modalStore.empresas.title = 'Alterar empresa']"
                  class="mr-1"
                >
                  <i class="fa fa-lg fa-pencil"></i>
                </b-button>
                <span>Editar empresa</span>
              </v-tooltip>
              <v-tooltip bottom>
                <b-button
                  slot="activator"
                  variant="secundary"
                  @click.prevent="[confirmaExclusao = true,empresaStore.empresa = data.item]"
                  class="mr-1"
                >
                  <i class="fa fa-lg fa-trash"></i>
                </b-button>
                <span>Excluir empresa</span>
              </v-tooltip>
              <v-tooltip bottom>
                <b-button
                  slot="activator"
                  variant="secundary"
                  @click.prevent="[modalStore.email.visible = true, modalStore.email.para = data.item.email]"
                >
                  <i class="fa fa-lg fa-envelope"></i>
                </b-button>
                <span>Enviar e-mail</span>
              </v-tooltip>
            </td>
          </tr>
          <tr v-else>
            <td>
              <ul class="flex-content">
                <li class="flex-item" data-label="Código">{{ data.item.id }}</li>
                <li class="flex-item" data-label="CNPJ">{{ data.item.cnpj }}</li>
                <li class="flex-item" data-label="Nome">{{ data.item.nome }}</li>
                <li class="flex-item" data-label="E-mail">{{ data.item.email }}</li>
                <li class="flex-item" data-label="Contato">{{ data.item.contato }}</li>
              </ul>
            </td>
          </tr>
        </template>
      </v-data-table>
    </Card>

    <v-dialog v-model="confirmaExclusao" persistent max-width="500px" v-if="empresaStore.empresa">
      <v-card>
        <v-card-title>
          <span class="headline">Excluir empresa</span>
        </v-card-title>
        <v-card-text
          v-if="!Array.isArray(empresaStore.empresa)"
        >Excluir {{ empresaStore.empresa.nome }}?</v-card-text>
        <v-card-text v-else>
          <v-flex xs12>Excluir {{ empresaStore.empresa.length }} empresas?</v-flex>
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

export default {
  name: "GridEmpresas",
  components: {
    Card: () => import("../material/Card")
  },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["empresaStore", "modalStore", "usuarioStore"]),
    params() {
      return {
        ...this.pagination,
        ...this.filter
      };
    }
  },
  watch: {
    params() {
      this.loadEmpresas();
    },
    "$store.state.modalStore.empresas.visible": function() {
      if (!this.modalStore.empresas.visible) {
        this.loadEmpresas();
      }
    },
    "$store.state.modalStore.email.visible": function() {
      if (!this.modalStore.email.visible) {
        this.loadEmpresas();
      }
    }
  },
  data() {
    return {
      itens_selecionados: [],
      valid: true,
      loading: true,
      isMobile: false,
      confirmaExclusao: false,
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "cnpj", text: "CNPJ", sortable: true },
        { value: "nome", text: "Razão social", sortable: true },
        { value: "email", text: "E-mail", sortable: true },
        { value: "contato", text: "Contato" },
        { value: "actions", text: "Ações" }
      ],
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 20, // -1 for All,
        sortBy: "nome",
        totalItems: 0
      },
      count: 0,
      filter: {},
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
          store: "empresa"
        },
        {
          icon: "fa fa-lg fa-refresh",
          tooltip: "Recarregar itens",
          method: "loadEmpresas",
          required: true
        }
      ]
    };
  },
  methods: {
    onResize() {
      if (window.innerWidth < 769) this.isMobile = true;
      else this.isMobile = false;
    },
    navigate(path, newTab) {
      if (newTab) {
        const routeData = this.$router.resolve({ path: path });
        window.open(routeData.href, "_blank");
      } else {
        this.$router.push({ path: path });
      }
    },
    async reset() {
      this.filter = {};
    },
    async loadEmpresas() {
      const url = `${urlBD}/empresas?page=${this.pagination.page}&limit=${
        this.pagination.rowsPerPage
      }&tipo=${this.filter.tipo || 1}&id=${this.filter.id || ""}&nome=${this
        .filter.nome || ""}&email=${this.filter.email || ""}&contato=${this
        .filter.contato || ""}&cnpj=${this.filter.cnpj || ""}`;

      axios.get(url).then(res => {
        this.empresaStore.empresas = res.data.data;
        this.count = res.data.count;
        this.pagination.rowsPerPage = res.data.limit;
      });
    },
    async remove() {
      if (!this.confirmaExclusao) {
        this.confirmaExclusao = true;
        return;
      }

      var empresas = [];

      if (!this.empresaStore.empresa.id) {
        empresas = this.empresaStore.empresa.map(item => {
          return {
            id: item.id,
            nome: item.nome
          };
        });
      } else {
        empresas.push({
          id: this.empresaStore.empresa.id,
          nome: this.empresaStore.empresa.nome
        });
      }

      empresas.map(async item => {
        const url = `${urlBD}/empresas/${item.id}`;

        await axios
          .delete(url)
          .then(() => {
            this.$toasted.global.defaultSuccess();

            this.loadEmpresas();
            this.confirmaExclusao = false;

            saveLog(
              new Date(),
              "EXCLUSÃO",
              "EMPRESAS",
              `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu a empresa ${this.empresaStore.empresa.nome}`
            );
          })
          .catch(showError);
      });
    }
  }
};
</script>

<style>
.mobile {
  color: #333;
}

@media screen and (max-width: 768px) {
  .mobile table.v-table tr {
    max-width: 100%;
    position: relative;
    display: block;
  }

  .mobile table.v-table tr:nth-child(odd) {
    border-left: 6px solid deeppink;
  }

  .mobile table.v-table tr:nth-child(even) {
    border-left: 6px solid cyan;
  }

  .mobile table.v-table tr td {
    display: flex;
    width: 100%;
    border-bottom: 1px solid #f5f5f5;
    height: auto;
    padding: 10px;
  }

  .mobile table.v-table tr td ul li:before {
    content: attr(data-label);
    padding-right: 0.5em;
    text-align: left;
    display: block;
    color: #999;
  }
  .v-datatable__actions__select {
    width: 50%;
    margin: 0px;
    justify-content: flex-start;
  }
  .mobile .theme--light.v-table tbody tr:hover:not(.v-datatable__expand-row) {
    background: transparent;
  }
}
.flex-content {
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.flex-item {
  padding: 5px;
  width: 50%;
  height: 40px;
  font-weight: bold;
}
</style>