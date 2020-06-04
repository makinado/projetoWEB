<template>
  <v-dialog v-model="modalStore.produtos.visible" persistent max-width="900px">
    <v-card v-if="modalStore.produtos.visible">
      <v-card-title>
        <span class="headline">{{ modalStore.produtos.title }}</span>
      </v-card-title>

      <v-card-text>
        <v-container grid-list-xl>
          <v-text-field label="id" v-model="produto.id" v-show="false"></v-text-field>
          <v-layout row>
            <v-flex xs12>
              <v-tabs
                v-model="tabIndex"
                centered
                color="transparent"
                :slider-color="color"
                icons-and-text
              >
                <v-tab href="#tab-1">
                  BÁSICO
                  <v-icon>fa fa-lg fa-file</v-icon>
                </v-tab>

                <v-tab href="#tab-2">
                  VALORES
                  <v-icon>fa fa-lg fa-usd</v-icon>
                </v-tab>

                <v-tab href="#tab-4">
                  FISCAL
                  <v-icon>fa fa-lg fa-file-text</v-icon>
                </v-tab>

                <v-tab-item value="tab-1">
                  <v-card flat>
                    <v-card-text>
                      <v-container grid-list-xl>
                        <v-form v-model="valid1" ref="form_basico">
                          <v-layout wrap>
                            <v-flex xs12 md6>
                              <v-text-field
                                color="primary"
                                label="Descrição*"
                                v-model="produto.descricao"
                                :rules="descRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                color="primary"
                                label="Código de barras"
                                v-model="produto.codigo_barras"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-autocomplete
                                no-data-text="Nenhum resultado"
                                dense
                                color="primary"
                                label="Fornecedor"
                                :items="pessoaStore.fornecedores"
                                prepend-icon="fa fa-lg fa-plus-circle"
                                @click:prepend="[modalStore.pessoas.visible = true, pessoaStore.pessoa = null, categoriaStore.loadCategorias = 'Produto']"
                                v-model="produto.fornecedor"
                                @focus="$store.dispatch('loadFornecs')"
                                clearable
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                color="primary"
                                label="Código do produto do fornecedor"
                                v-model="produto.id_fornecedor"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-autocomplete
                                no-data-text="Nenhum resultado"
                                class="tag-input"
                                dense
                                chips
                                deletable-chips
                                color="primary"
                                label="Categoria"
                                :items="categoriaStore.categorias"
                                prepend-icon="fa fa-lg fa-plus-circle"
                                @click:prepend="[modalStore.categorias.visible = true, modalStore.categorias.title = 'Adicionar categoria de produto']"
                                v-model="produto.categoria"
                                @focus="$store.dispatch('loadCategoriasProdutos')"
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-autocomplete
                                no-data-text="Nenhum resultado"
                                class="tag-input"
                                dense
                                chips
                                deletable-chips
                                color="primary"
                                label="Marca"
                                :items="produtoStore.marcas"
                                prepend-icon="fa fa-lg fa-plus-circle"
                                @click:prepend="modalStore.marcas.visible = true"
                                v-model="produto.marca"
                                @focus="$store.dispatch('loadMarcas')"
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-autocomplete
                                no-data-text="Nenhum resultado"
                                class="tag-input"
                                dense
                                chips
                                deletable-chips
                                color="primary"
                                label="Unidade"
                                :items="produtoStore.unidades"
                                prepend-icon="fa fa-lg fa-plus-circle"
                                @click:prepend="modalStore.unidades.visible = true"
                                v-model="produto.unidade"
                                @focus="$store.dispatch('loadUnidades')"
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-tooltip bottom>
                                <v-text-field
                                  slot="activator"
                                  ref="estoque_min"
                                  color="primary"
                                  label="Estoque mínimo"
                                  v-model="produto.estoque_min"
                                  v-money="decimal"
                                ></v-text-field>
                                <span>Informe um estoque mínimo para que o sistema gere avisos de limite</span>
                              </v-tooltip>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-tooltip bottom>
                                <v-text-field
                                  slot="activator"
                                  ref="estoque_max"
                                  color="primary"
                                  label="Estoque máximo"
                                  v-model="produto.estoque_max"
                                  v-money="decimal"
                                ></v-text-field>
                                <span>Informe um estoque máximo para que o sistema gere avisos de limite</span>
                              </v-tooltip>
                            </v-flex>
                            <v-flex xs12>
                              <v-switch label="Ativo" v-model="produto.ativo" :color="color"></v-switch>
                            </v-flex>
                          </v-layout>
                        </v-form>
                      </v-container>
                    </v-card-text>
                  </v-card>
                </v-tab-item>

                <v-tab-item value="tab-2">
                  <v-card flat>
                    <v-card-text>
                      <v-container grid-list-xl>
                        <v-form v-model="valid2" ref="form_valores">
                          <v-layout justify-start wrap>
                            <v-flex xs12 md3>
                              <v-text-field
                                ref="valor_venda"
                                v-money="money"
                                color="primary"
                                label="Valor de venda"
                                v-model="produto.valor_venda"
                                :rules="valorVendaRules"
                              ></v-text-field>
                            </v-flex>
                          </v-layout>
                          <v-layout wrap>
                            <v-flex xs12 md3>
                              <v-text-field
                                ref="valor_unitario"
                                v-money="money"
                                color="primary"
                                label="Valor unitário"
                                v-model="produto.valor_unitario"
                                @change="calcMargemContrib"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md3>
                              <v-text-field
                                ref="valor_custo_medio"
                                v-money="money"
                                color="primary"
                                label="Valor de custo médio"
                                v-model="produto.valor_custo_medio"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md3>
                              <v-text-field
                                ref="perc_margem_contribuicao"
                                v-money="percent"
                                color="primary"
                                label="Margem de contribuição"
                                v-model="produto.perc_margem_contribuicao"
                                @blur="calcMargemContrib"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md3>
                              <v-text-field
                                ref="valor_lucro_bruto"
                                v-money="money"
                                color="primary"
                                label="Valor de lucro bruto"
                                v-model="produto.valor_lucro_bruto"
                                readonly
                              ></v-text-field>
                            </v-flex>
                          </v-layout>
                          <v-layout justify-start>
                            <v-flex xs12 md3>
                              <v-text-field
                                ref="perc_comissao"
                                color="primary"
                                v-money="percent"
                                label="Percentual de comissão"
                                v-model="produto.perc_comissao"
                                @blur="calcComissao"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md3>
                              <v-text-field
                                ref="valor_comissao"
                                v-money="money"
                                color="primary"
                                label="Valor de comissão"
                                v-model="produto.valor_comissao"
                                readonly
                              ></v-text-field>
                            </v-flex>
                          </v-layout>
                        </v-form>
                      </v-container>
                    </v-card-text>
                  </v-card>
                </v-tab-item>

                <v-tab-item value="tab-4">
                  <v-card flat>
                    <v-card-text>
                      <v-container grid-list-xl>
                        <v-form v-model="valid3" ref="form_fiscal">
                          <v-layout wrap>
                            <v-flex xs12 md6>
                              <v-autocomplete
                                color="primary"
                                label="Origem*"
                                :items="[
                                '0 - Nacional, exceto as indicadas nos códigos 3 a 5',
                                '1 - Estrangeira - Importação direta, exceto a indicada no código 6',
                                '2 - Estrangeira - Adquirida no mercado interno, exceto a indicada no código 7',
                                '3 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40%',
                                '4 - Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos de que tratam o Decreto-Lei nº 288/1967 , e as Leis nºs 8.248/1991, 8.387/1991, 10.176/2001 e 11.484/2007',
                                '5 - Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%',
                                '6 - Estrangeira - Importação direta, sem similar nacional, constante em lista de Resolução Camex e gás natural',
                                '7 - Estrangeira - Adquirida no mercado interno, sem similar nacional, constante em lista de Resolução Camex e gás natural',
                              ]"
                                :menu-props="{maxWidth:'900px'}"
                                v-model="produto.origem"
                                dense
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md3>
                              <v-text-field
                                ref="perc_reducao_icms"
                                color="primary"
                                label="Percentual de redução de ICMS"
                                v-model="produto.perc_reducao_icms"
                                v-money="percent"
                                maxlength="8"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md3>
                              <v-text-field
                                ref="perc_ipi"
                                color="primary"
                                label="Percentual de IPI*"
                                v-model="produto.perc_ipi"
                                v-money="percent"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="ncm"
                                color="primary"
                                label="NCM"
                                v-model="produto.ncm"
                                v-mask="['########']"
                                append-icon="fa fa-search"
                                @click:append="navigate('https://portalunico.siscomex.gov.br/classif/#/sumario?perfil=publico')"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="cest"
                                color="primary"
                                label="CEST"
                                v-model="produto.cest"
                                v-mask="['#######']"
                                append-icon="fa fa-search"
                                @click:append="navigate('https://portalunico.siscomex.gov.br/classif/#/sumario?perfil=publico')"
                              ></v-text-field>
                            </v-flex>
                          </v-layout>

                          <v-layout wrap align-center mb-3>
                            <span>* Caso necessário, selecione o(s) grupo(s) tributário(s) deste produto</span>
                            <v-spacer></v-spacer>
                            <v-btn
                              class="v-btn-common"
                              color="primary"
                              @click.prevent="[modalStore.grupo_trib.addGrupo = true, modalStore.grupo_trib.title = 'Adicionar grupo de tributação']"
                            >Adicionar grupo</v-btn>
                          </v-layout>
                        </v-form>
                      </v-container>

                      <v-data-table
                        v-model="grupos_selecionados"
                        :items="grupos_trib"
                        :headers="fields"
                        :pagination.sync="pagination"
                        no-results-text="Nenhum registro encontrado"
                        no-data-text="Nenhuma tributação por estado adicionada"
                        hide-actions
                        select-all
                        item-key="id"
                      >
                        <template slot="items" slot-scope="data">
                          <td>
                            <v-checkbox v-model="data.selected" color="primary" hide-details></v-checkbox>
                          </td>
                          <td>{{ data.item.id }}</td>
                          <td>{{ data.item.descricao }}</td>
                          <td>{{ data.item.uf }}</td>
                          <td>{{ data.item.cfop }}</td>
                        </template>
                      </v-data-table>
                    </v-card-text>
                  </v-card>
                </v-tab-item>
              </v-tabs>
            </v-flex>
          </v-layout>
        </v-container>
        <small>* indica os campos obrigatórios</small>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue darken-1"
          flat
          @click="[produtoStore.produto = null, modalStore.produtos.visible = false]"
        >Fechar</v-btn>
        <v-btn v-if="tabIndex !== 'tab-3'" color="blue darken-1" flat @click="save()">Salvar</v-btn>
      </v-card-actions>

      <AddGrupoTrib />
    </v-card>
  </v-dialog>
</template>

<script>
import { VMoney } from "v-money";
import { mapState } from "vuex";
import { formatToBRL, formatToNumber } from "brazilian-values";

import axios from "axios";
import {
  urlBD,
  showError,
  formatDate,
  parseNumber,
  moneyToNumber,
  saveLog
} from "@/global";

export default {
  directives: { money: VMoney },
  name: "Add-Produto",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "produtoStore",
      "pessoaStore",
      "usuarioStore",
      "categoriaStore",
      "modalStore"
    ])
  },
  components: { AddGrupoTrib: () => import("./AddGrupoTrib") },
  data() {
    return {
      valid1: true,
      valid2: true,
      valid3: true,
      ncm_hint: "",
      cest_hint: "",
      produto: {},
      empresas: [],
      grupos_trib: [],
      grupos_selecionados: [],
      cfops: [],
      tabIndex: "tab-1",
      fields: [
        { value: "id", text: "Código", sortable: true },
        { value: "descricao", text: "Descricao", sortable: true },
        { value: "uf", text: "UF", sortable: true },
        { value: "cfop", text: "CFOP", sortable: true }
      ],
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 10, // -1 for All,
        sortBy: "id",
        totalItems: 0
      },
      money: {
        decimal: ",",
        thousands: ".",
        prefix: "R$ ",
        precision: 2
      },
      percent: {
        decimal: ",",
        thousands: ".",
        precision: 2,
        suffix: " %"
      },
      decimal: {
        decimal: ",",
        thousands: ".",
        precision: 2
      },
      descRules: [
        v => !!v || "Descrição é obrigatória",
        v =>
          (!!v && v.length >= 3) || "Descrição deve ter no mínimo 3 caracteres"
      ],
      valorVendaRules: [
        v => !!v || "Valor de venda é obrigatório",
        v => (!!v && v !== "R$ 0,00") || "Valor de venda não pode ser 0,00"
      ]
    };
  },
  watch: {
    "$store.state.modalStore.produtos.visible"() {
      if (this.modalStore.produtos.visible) {
        this.reset();
        this.loadTela(this.produtoStore.produto);
      }
    }
  },
  methods: {
    navigate(path) {
      window.open(path, "_blank");
    },
    calcMargemContrib() {
      var valor_unitario = parseNumber(this.produto.valor_unitario);
      var valor_venda = parseNumber(this.produto.valor_venda);
      var perc_margem_contribuicao = parseNumber(
        this.produto.perc_margem_contribuicao
      );

      if (valor_unitario !== 0 && perc_margem_contribuicao !== 0) {
        valor_venda =
          valor_unitario + valor_unitario * (perc_margem_contribuicao / 100);
        var valor_lucro_bruto = valor_venda - valor_unitario;
      }

      this.produto.valor_venda = formatToBRL(valor_venda);
      this.produto.valor_lucro_bruto = formatToBRL(valor_lucro_bruto);
      this.$refs.valor_venda.$el.getElementsByTagName(
        "input"
      )[0].value = this.produto.valor_venda;

      this.$refs.valor_lucro_bruto.$el.getElementsByTagName(
        "input"
      )[0].value = this.produto.valor_lucro_bruto;
    },
    calcComissao() {
      let perc_comissao = parseFloat(parseNumber(this.produto.perc_comissao));
      let valor_venda = parseFloat(parseNumber(this.produto.valor_venda));
      let valor_comissao = parseFloat(parseNumber(this.produto.valor_comissao));

      valor_comissao = valor_venda * (perc_comissao / 100);

      this.produto.valor_comissao = formatToBRL(valor_comissao);
      this.$refs.valor_comissao.$el.getElementsByTagName(
        "input"
      )[0].value = this.produto.valor_comissao;
    },
    reset() {
      this.$refs.form_basico ? this.$refs.form_basico.reset() : "";
      this.$refs.form_valores ? this.$refs.form_valores.reset() : "";
      this.$refs.form_fiscal ? this.$refs.form_fiscal.reset() : "";

      this.produto = {
        ativo: true
      };
      this.tributacao_estado = {};
      this.grupos_trib = [];
      this.grupos_selecionados = [];
      this.tabIndex = "tab-1";

      this.$refs.estoque_min
        ? (this.$refs.estoque_min.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.estoque_max
        ? (this.$refs.estoque_max.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.valor_venda
        ? (this.$refs.valor_venda.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.valor_unitario
        ? (this.$refs.valor_unitario.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.valor_custo_medio
        ? (this.$refs.valor_custo_medio.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.perc_margem_contribuicao
        ? (this.$refs.perc_margem_contribuicao.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.valor_lucro_bruto
        ? (this.$refs.valor_lucro_bruto.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.perc_comissao
        ? (this.$refs.perc_comissao.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.valor_comissao
        ? (this.$refs.valor_comissao.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.perc_reducao_icms
        ? (this.$refs.perc_reducao_icms.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.perc_ipi
        ? (this.$refs.perc_ipi.$el.getElementsByTagName("input")[0].value = 0)
        : "";
    },
    async loadTela(produto) {
      if (!produto) return;

      this.$store.dispatch("loadFornecs");
      this.$store.dispatch("loadCategoriasProdutos");
      this.$store.dispatch("loadMarcas");
      this.$store.dispatch("loadUnidades");

      let url = `${urlBD}/produtos`;
      if (produto.id) {
        await axios
          .get(`${url}/${produto.id}`)
          .then(res => {
            this.produto = res.data;
            this.produto.qtdEstoque = moneyToNumber(
              formatToBRL(this.produto.qtdEstoque)
            );
            this.parseValores();
            this.grupos_selecionados = produto.grupos_produto;
          })
          .catch(showError);
      } else {
        this.produto = produto;
      }
    },
    parseValores() {
      this.produto.estoque_min = formatToBRL(this.produto.estoque_min);
      this.produto.estoque_max = formatToBRL(this.produto.estoque_max);
      this.produto.valor_unitario = formatToBRL(this.produto.valor_unitario);
      this.produto.valor_venda = formatToBRL(this.produto.valor_venda);
      this.produto.valor_custo_medio = formatToBRL(
        this.produto.valor_custo_medio
      );
      this.produto.valor_lucro_bruto = formatToBRL(
        this.produto.valor_lucro_bruto
      );
      this.produto.valor_comissao = formatToBRL(this.produto.valor_comissao);

      this.produto.perc_margem_contribuicao = formatToBRL(
        this.produto.perc_margem_contribuicao
      );
      this.produto.perc_comissao = formatToBRL(this.produto.perc_comissao);
      this.produto.perc_reducao_icms = formatToBRL(
        this.produto.perc_reducao_icms
      );
      this.produto.perc_ipi = formatToBRL(this.produto.perc_ipi);

      this.$refs.estoque_min.$el.getElementsByTagName(
        "input"
      )[0].value = this.produto.estoque_min;
      this.$refs.estoque_max.$el.getElementsByTagName(
        "input"
      )[0].value = this.produto.estoque_max;
      this.$refs.valor_venda.$el.getElementsByTagName(
        "input"
      )[0].value = this.produto.valor_venda;
      this.$refs.valor_custo_medio.$el.getElementsByTagName(
        "input"
      )[0].value = this.produto.valor_custo_medio;
      this.$refs.valor_unitario.$el.getElementsByTagName(
        "input"
      )[0].value = this.produto.valor_unitario;
      this.$refs.perc_margem_contribuicao.$el.getElementsByTagName(
        "input"
      )[0].value = this.produto.perc_margem_contribuicao;
      this.$refs.valor_lucro_bruto.$el.getElementsByTagName(
        "input"
      )[0].value = this.produto.valor_lucro_bruto;
      this.$refs.perc_comissao.$el.getElementsByTagName(
        "input"
      )[0].value = this.produto.perc_comissao;
      this.$refs.valor_comissao.$el.getElementsByTagName(
        "input"
      )[0].value = this.produto.valor_comissao;
      this.$refs.perc_reducao_icms.$el.getElementsByTagName(
        "input"
      )[0].value = this.produto.perc_reducao_icms;
      this.$refs.perc_ipi.$el.getElementsByTagName(
        "input"
      )[0].value = this.produto.perc_ipi;
    },
    save() {
      if (!this.$refs.form_basico.validate()) {
        this.tabIndex = "tab-1";
        return;
      }
      if (!this.$refs.form_valores.validate()) {
        this.tabIndex = "tab-2";
        return;
      }
      if (!this.$refs.form_valores.validate()) {
        this.tabIndex = "tab-3";
        return;
      }

      const method = this.produto.id ? "put" : "post";
      const id = this.produto.id ? this.produto.id : "";
      const urlProdutos = `${urlBD}/produtos/${id}`;
      this.produtoStore.produto = this.produto;

      this.produto.grupos = this.grupos_selecionados;

      axios[method](urlProdutos, this.produto)
        .then(res => {
          this.$toasted.global.defaultSuccess();
          this.modalStore.produtos.visible = false;

          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
            "PRODUTOS",
            `Usuário ${this.usuarioStore.currentUsuario.nome} ${
              method === "post" ? "ADICIONOU" : "ALTEROU"
            } o produto ${this.produto.nome}`
          );
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>
