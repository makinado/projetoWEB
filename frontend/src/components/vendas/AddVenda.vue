<template>
  <v-dialog
    v-model="modalStore.vendas.vendas.visible"
    fullscreen
    persistent
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card v-if="modalStore.vendas.vendas.visible">
      <v-toolbar dark :color="color" class="m-0 p-0">
        <v-btn icon @click="modalStore.vendas.vendas.visible = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title class="headline text-white font-weight-light">{{ modalStore.vendas.title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click>
          <v-icon>fa fa-2x fa-cog</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <v-container fluid grid-list-xl>
          <v-form v-model="valid" ref="form">
            <v-text-field label="id" v-model="venda.id" v-show="false"></v-text-field>
            <v-text-field v-model="venda.id_empresa" v-show="false"></v-text-field>
            <v-layout wrap>
              <v-flex xs12 md2>
                <v-autocomplete
                  class="tag-input"
                  chips
                  dense
                  :color="color"
                  label="Tipo*"
                  :items="[{ value: 1, text: 'Orçamento' }, { value: 2, text: 'Venda' }]"
                  v-model="venda.tipo"
                  deletable-chips
                  :rules="tipoRules"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12 md3>
                <v-combobox
                  class="tag-input"
                  dense
                  :color="color"
                  chips
                  deletable-chips
                  label="Cliente*"
                  :items="pessoaStore.pessoas"
                  prepend-icon="fa fa-lg fa-plus-circle"
                  @click:prepend="[pessoaStore.pessoa = null, modalStore.pessoas.visible = true, modalStore.pessoas.title = 'Adicionar pessoa']"
                  v-model="venda.id_pessoa"
                  :search-input.sync="clienteFilter"
                  @change="loadCliente"
                  :rules="clienteRules"
                >
                  <template v-slot:no-data>
                    <v-list-tile>
                      <v-list-tile-title>
                        Nenhum resultado para "
                        <strong>{{ clienteFilter }}</strong>". Pressione
                        <kbd>Enter</kbd> para continuar.
                      </v-list-tile-title>
                    </v-list-tile>
                  </template>
                </v-combobox>
              </v-flex>
              <v-spacer></v-spacer>
              <v-flex xs12 md4>
                <v-layout wrap justify-end class="mt-1">
                  <v-tooltip bottom>
                    <v-btn
                      slot="activator"
                      class="v-btn-common"
                      color="danger"
                      @click="limpaTela"
                    >Limpar</v-btn>
                    <span>Volta a tela ao seu estado inicial</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <v-btn slot="activator" class="v-btn-common" color="info">Confirmar venda</v-btn>
                    <span>Finaliza o orçamento e gera a venda</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <v-btn
                      slot="activator"
                      class="v-btn-common"
                      :loading="isLoading"
                      :color="color"
                      @click="save"
                    >Salvar</v-btn>
                    <span>Finaliza o orçamento</span>
                  </v-tooltip>
                </v-layout>
              </v-flex>
            </v-layout>
          </v-form>

          <v-container fluid>
            <v-form v-model="valid1" ref="form1">
              <v-layout justify-start wrap class="bege">
                <v-flex xs12 md4>
                  <v-card flat>
                    <v-layout justify-center wrap>
                      <v-card-title>
                        <span
                          class="headline"
                        >Dados do(a) {{ venda.tipo == 1 ? "orçamento" : "venda"}}</span>
                      </v-card-title>
                      <v-card-text>
                        <v-container grid-list-xl>
                          <v-layout wrap>
                            <v-flex xs12 md6>
                              <v-menu
                                v-model="menu"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                transition="scale-transition"
                                offset-y
                                full-width
                                max-width="290px"
                                min-width="290px"
                              >
                                <template v-slot:activator="{ on }">
                                  <v-text-field
                                    :color="color"
                                    v-model="computedDateFormatted"
                                    label="Data contato"
                                    prepend-icon="event"
                                    readonly
                                    v-on="on"
                                    :rules="dataRules"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  @input="menu = false"
                                  scrollable
                                  :color="color"
                                  v-model="venda.data_contato"
                                  locale="pt-br"
                                ></v-date-picker>
                              </v-menu>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-menu
                                lazy
                                v-model="menu1"
                                :close-on-content-click="false"
                                :nudge-right="40"
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
                                    label="Data agendamento"
                                    prepend-icon="event"
                                    readonly
                                    v-on="on"
                                    :rules="dataRules"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  @input="menu1 = false"
                                  scrollable
                                  :color="color"
                                  v-model="venda.data_agendamento"
                                  locale="pt-br"
                                ></v-date-picker>
                              </v-menu>
                            </v-flex>
                            <v-flex xs12>
                              <v-autocomplete
                                class="tag-input"
                                chips
                                dense
                                :color="color"
                                label="Vendedor*"
                                :items="usuarioStore.currentUsuarios"
                                prepend-icon="fa fa-lg fa-plus-circle"
                                @click:prepend="[usuarioStore.usuario = null, modalStore.usuarios.visible = true]"
                                v-model="venda.id_vendedor"
                                :rules="vendedorRules"
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12>
                              <v-autocomplete
                                class="tag-input"
                                chips
                                dense
                                :color="color"
                                label="Representante"
                                :items="usuarioStore.currentUsuarios"
                                prepend-icon="fa fa-lg fa-plus-circle"
                                @click:prepend="[usuarioStore.usuario = null, modalStore.usuarios.visible = true]"
                                v-model="venda.id_representante"
                                :rules="vendedorRules"
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12>
                              <v-textarea
                                :color="color"
                                label="Observação"
                                box
                                v-model="venda.observacao"
                              ></v-textarea>
                            </v-flex>
                          </v-layout>
                        </v-container>
                      </v-card-text>
                    </v-layout>
                  </v-card>
                </v-flex>
                <v-flex xs12 md4>
                  <v-card flat>
                    <v-layout justify-center wrap>
                      <v-card-title>
                        <span class="headline">Dados do cliente</span>
                      </v-card-title>
                      <v-card-text>
                        <v-container grid-list-xl>
                          <v-layout wrap>
                            <v-flex xs12 md4>
                              <v-text-field
                                v-model="cliente.cpf_cnpj"
                                readonly
                                :color="color"
                                label="CPF/CNPJ"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-text-field
                                v-model="cliente.situacao"
                                readonly
                                :color="color"
                                label="Situação do cliente"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-text-field
                                v-model="cliente.email"
                                readonly
                                :color="color"
                                label="E-mail"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-text-field
                                v-model="cliente.contato"
                                readonly
                                :color="color"
                                label="Contato"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-text-field
                                v-model="cliente.categoria"
                                readonly
                                :color="color"
                                label="Categoria"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-text-field
                                ref="cliente_financeiro"
                                v-model="cliente.financeiro"
                                readonly
                                :color="getColor(cliente.financeiro)"
                                label="Financeiro"
                              ></v-text-field>
                            </v-flex>
                          </v-layout>
                        </v-container>
                      </v-card-text>
                    </v-layout>
                  </v-card>
                </v-flex>
                <v-flex xs12 md4>
                  <v-card flat>
                    <v-layout justify-center wrap>
                      <v-card-title>
                        <span class="headline">Totalizadores</span>
                      </v-card-title>
                      <v-card-text>
                        <v-container grid-list-xl>
                          <v-layout wrap>
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="valor_frete"
                                v-model="venda.valor_frete"
                                :color="color"
                                label="VALOR DO FRETE"
                                v-money="money"
                                @blur="calcTotalizadores"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="valor_seguro"
                                v-model="venda.valor_seguro"
                                :color="color"
                                label="VALOR DO SEGURO"
                                v-money="money"
                                @blur="calcTotalizadores"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="valor_desconto"
                                v-model="venda.valor_desconto"
                                :color="color"
                                label="VALOR DE DESCONTO"
                                v-money="money"
                                @blur="calcTotalizadores"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="outras_despesas"
                                v-model="venda.outras_despesas"
                                :color="color"
                                label="VALOR DE OUTRAS DESPESAS"
                                v-money="money"
                                @blur="calcTotalizadores"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="valor_produtos"
                                v-model="venda.valor_produtos"
                                :color="color"
                                label="VALOR TOTAL DOS PRODUTOS"
                                placeholder="R$ 0,00"
                                readonly
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                ref="valor_total"
                                v-model="venda.valor_total"
                                :color="color"
                                label="VALOR TOTAL DO ORÇAMENTO"
                                placeholder="R$ 0,00"
                                readonly
                              ></v-text-field>
                            </v-flex>
                          </v-layout>
                        </v-container>
                      </v-card-text>
                    </v-layout>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-form>

            <v-flex xs12 class="mt-4">
              <v-layout justify-center>
                <v-icon class="mt-2 mr-2">fa fa-2x fa-archive</v-icon>
                <h2>Produtos</h2>
              </v-layout>
              <hr />
            </v-flex>
            <v-layout align-end>
              <span>Edite valores e quantidades do produto diretamente na tabela</span>
              <v-spacer></v-spacer>
              <v-flex xs12 md2 class="p-0">
                <v-tooltip bottom>
                  <v-autocomplete
                    slot="activator"
                    class="tag-input"
                    deletable-chips
                    dense
                    chips
                    v-model="venda.id_tabela_preco"
                    label="Tabela de preços"
                    :items="vendaStore.tabelas"
                    no-data-text="Nenhuma tabela cadastrada ou nenhuma empresa selecionada"
                    prepend-icon="fa fa-lg fa-plus-circle"
                    @click:prepend="modalStore.tabelas.visible = true"
                    @change="aplicarTabela"
                    return-object
                  ></v-autocomplete>
                  <span>Desconto aplicado sobre o valor total de cada produto</span>
                </v-tooltip>
              </v-flex>
              <v-tooltip bottom class="ml-3">
                <v-btn
                  slot="activator"
                  class="v-btn-common"
                  :color="color"
                  @click="addProduto()"
                >Adicionar produto</v-btn>
                <span>Adicionar novo produto à venda</span>
              </v-tooltip>
            </v-layout>
          </v-container>

          <v-data-table
            class="elevation-5 mb-3"
            :items="produtos_venda"
            :headers="fieldsProdutos"
            :pagination.sync="paginationProd"
            :rows-per-page-items="[5, 10, 20, 50]"
            rows-per-page-text="Produtos por página"
            no-data-text="Nenhum produto adicionado"
          >
            <template slot="items" slot-scope="data">
              <td>{{ data.item.sequencia }}</td>
              <td>
                <v-flex xs10>
                  <v-autocomplete
                    class="tag-input"
                    chips
                    v-model="data.item.id"
                    label="Selecione"
                    :items="produtoStore.produtos"
                    prepend-icon="fa fa-lg fa-plus-circle"
                    @click:prepend="modalStore.produtos.visible = true"
                    @change="[loadDados(data.item)]"
                  ></v-autocomplete>
                </v-flex>
              </td>
              <td>{{ data.item.qtdEstoque || "0,00"}}</td>
              <td>
                <v-flex xs12 md6>
                  <v-text-field
                    ref="qtde"
                    class="mt-2"
                    v-model="data.item.quantidade"
                    v-money="decimal"
                    @blur="[calcTotal(data.item)]"
                  ></v-text-field>
                </v-flex>
              </td>
              <td>
                <v-flex xs12 md6>
                  <v-text-field
                    ref="qtde"
                    class="mt-2"
                    v-model="data.item.valor_venda"
                    v-money="money"
                    @blur="[calcTotal(data.item)]"
                  ></v-text-field>
                </v-flex>
              </td>
              <td>
                <v-flex xs12 md6>
                  <v-text-field
                    ref="qtde"
                    class="mt-2"
                    v-model="data.item.valor_desconto"
                    v-money="money"
                    @blur="[calcTotal(data.item)]"
                  ></v-text-field>
                </v-flex>
              </td>
              <td>{{ data.item.valor_total || 'R$ 0,00'}}</td>
              <td>
                <v-tooltip bottom>
                  <b-button
                    slot="activator"
                    variant="secundary"
                    class="mr-1"
                    @click="deleteItem(data.item)"
                  >
                    <i class="fa fa-lg fa-trash"></i>
                  </b-button>
                  <span>Excluir produto</span>
                </v-tooltip>
              </td>
            </template>
            <template slot="footer">
              <td colspan="3">
                <h5>TOTAIS</h5>
              </td>
              <td>
                <v-layout row>{{ totais.quantidade || '0,00' }}</v-layout>
              </td>
              <td>
                <v-layout row>{{ totais.valor_venda || 'R$ 0,00' }}</v-layout>
              </td>
              <td>
                <v-layout row>{{ totais.valor_desconto || 'R$ 0,00' }}</v-layout>
              </td>
              <td colspan="2">
                <v-layout row>{{ totais.valor_total || 'R$ 0,00' }}</v-layout>
              </td>
            </template>
          </v-data-table>

          <v-container fluid>
            <v-flex xs12>
              <v-layout justify-center>
                <v-icon class="mt-2 mr-2">fa fa-2x fa-usd</v-icon>
                <h2>Financeiro</h2>
              </v-layout>
              <hr />
            </v-flex>
            <v-layout align-end>
              <span>Edite valores diretamente na tabela</span>
              <v-spacer></v-spacer>
              <v-tooltip bottom>
                <v-btn
                  slot="activator"
                  class="v-btn-common"
                  :color="color"
                  @click="addParcela()"
                >Adicionar parcela</v-btn>
                <span>Adicionar nova parcela à compra</span>
              </v-tooltip>
            </v-layout>
          </v-container>

          <v-data-table
            class="elevation-5 mb-3"
            :items="financeiro"
            :headers="fieldsFinanceiro"
            :pagination.sync="paginationFinanc"
            :rows-per-page-items="[5, 10, 20]"
            rows-per-page-text="Parcelas por página"
            no-data-text="Nenhuma parcela adicionada"
            :expand="expand"
            item-key="parcelas"
          >
            <template slot="items" slot-scope="data">
              <td>{{ data.item.parcelas }}</td>
              <td>
                <v-text-field
                  v-if="disable"
                  v-model.number="data.item.valor"
                  v-money="money"
                  @blur="[data.item.edit = true, attGridParc()]"
                ></v-text-field>
                <span v-else>{{ data.item.valor || "R$ 0,00"}}</span>
              </td>
              <td>
                <v-flex xs8>
                  <v-menu
                    v-model="data.item.menu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    full-width
                    max-width="290px"
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        :color="color"
                        v-model="data.item.data_vencimento"
                        prepend-icon="event"
                        readonly
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      :color="color"
                      v-model="data.item.dataNotFormated"
                      @input="[data.item.menu = false, data.item.data_vencimento = formatDate(data.item.dataNotFormated)]"
                      locale="pt-br"
                    ></v-date-picker>
                  </v-menu>
                </v-flex>
              </td>
              <td>
                <v-flex xs8>
                  <v-autocomplete
                    class="tag-input"
                    chips
                    dense
                    :color="color"
                    :items="financeiroStore.documentos"
                    v-model="data.item.documento_origem"
                    placeholder="Selecione"
                    prepend-icon="fa fa-lg fa-plus-circle"
                    @click:prepend="[modalStore.documentos.visible = true]"
                    no-data-text="Nenhum resultado"
                    auto-select-first
                  ></v-autocomplete>
                </v-flex>
              </td>
              <td>
                <v-switch
                  v-model="data.item.pago"
                  :color="color"
                  hide-details
                  @click.native="[!data.expanded && data.item.pago ? [data.expanded = true, loadPagamento(data.item)] : limpaPagamento(data), calcTotalFinanc()]"
                ></v-switch>
              </td>
              <td>
                <v-tooltip bottom>
                  <b-button
                    v-if="data.item.pago"
                    slot="activator"
                    variant="secundary"
                    class="mr-1"
                    @click="data.expanded = !data.expanded"
                  >
                    <i class="fa fa-lg fa-pencil"></i>
                  </b-button>
                  <span>Editar dados do pagamento</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <b-button
                    slot="activator"
                    variant="secundary"
                    class="mr-1"
                    @click="deleteParcela(data.item)"
                  >
                    <i class="fa fa-lg fa-trash"></i>
                  </b-button>
                  <span>Excluir parcela</span>
                </v-tooltip>
              </td>
            </template>
            <template slot="expand" slot-scope="data">
              <v-card v-if="data.expanded" flat color="bege">
                <v-card-title>
                  <span class="headline">Preencha os dados do pagamento desta parcela</span>
                </v-card-title>
                <v-card-text>
                  <v-layout row wrap>
                    <v-flex xs12 md2>
                      <v-autocomplete
                        clearable
                        dense
                        :color="color"
                        label="Conta*"
                        v-model="data.item.id_conta"
                        :items="financeiroStore.contas"
                        no-data-text="Nenhum caixa encontrado"
                        prepend-icon="fa fa-lg fa-plus-circle"
                        @click:prepend="[financeiroStore.caixa = null, modalStore.financeiro.caixa.visible = true]"
                        @change="loadSaldoConta(data.item)"
                      ></v-autocomplete>
                    </v-flex>
                    <v-flex xs12 md2>
                      <v-text-field
                        label="Saldo em conta"
                        placeholder="Selecione a conta para carregar"
                        readonly
                        v-model="data.item.saldo_atual"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                  <v-layout row wrap>
                    <v-flex xs12 md2>
                      <v-menu
                        v-model="data.item.menu1"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        full-width
                        max-width="290px"
                        min-width="290px"
                      >
                        <template v-slot:activator="{ on }">
                          <v-text-field
                            :color="color"
                            v-model="data.item.data_baixa"
                            prepend-icon="event"
                            label="Data do pagamento*"
                            readonly
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          :color="color"
                          v-model="data.item.dataNotFormated"
                          @input="[data.item.menu1 = false, data.item.data_baixa = formatDate(data.item.dataNotFormated)]"
                          locale="pt-br"
                        ></v-date-picker>
                      </v-menu>
                    </v-flex>
                    <v-flex xs12 md2>
                      <v-autocomplete
                        dense
                        :color="color"
                        label="Forma de pagamento"
                        v-model="data.item.documento_baixa"
                        :items="financeiroStore.documentos"
                        no-data-text="Nenhum documento encontrado"
                        prepend-icon="fa fa-lg fa-plus-circle"
                        @click:prepend="[financeiroStore.documento = null, modalStore.documentos.visible = true]"
                      ></v-autocomplete>
                    </v-flex>
                    <v-flex xs12 md2>
                      <v-text-field
                        :color="color"
                        v-model="data.item.num_documento_baixa"
                        label="Número documento"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12 md2>
                      <v-text-field
                        v-model="data.item.valor_acrescimo"
                        :color="color"
                        label="Valor acréscimo"
                        v-money="money"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12 md2>
                      <v-text-field
                        v-model="data.item.valor_desconto"
                        :color="color"
                        label="Valor desconto"
                        v-money="money"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12 md2>
                      <v-text-field
                        v-model="data.item.valor_pago"
                        :color="color"
                        label="Valor pago"
                        v-money="money"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-card-text>
              </v-card>
            </template>
            <template slot="footer">
              <td>
                <h5>TOTAIS</h5>
              </td>
              <td>
                <v-tooltip bottom>
                  <v-chip
                    slot="activator"
                    :color="getColor(totaisFinanc.valor)"
                    dark
                  >{{ totaisFinanc.valor || 'R$ 0,00' }}</v-chip>
                  <span>Esse valor deve corresponder ao valor total da compra</span>
                </v-tooltip>
              </td>
              <td colspan="2">{{ totaisFinanc.data || '0 meses' }}</td>
              <td colspan="2">{{ totaisFinanc.pago || 'Nenhuma parcela paga' }}</td>
            </template>
          </v-data-table>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { VMoney } from "v-money";
import {
  urlBD,
  showError,
  moneyToNumber,
  parseNumber,
  formatDate,
  loadProdutos,
  loadClientes,
  loadTabelas,
  loadUsuarios
} from "@/global";
import axios from "axios";
import { mapState } from "vuex";
import { formatToBRL } from "brazilian-values";

export default {
  directives: { money: VMoney },
  name: "AddVenda",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "vendaStore",
      "usuarioStore",
      "produtoStore",
      "pessoaStore",
      "empresaStore",
      "modalStore"
    ]),
    computedDateFormatted: {
      get() {
        return formatDate(this.venda.data_contato);
      },
      set(value) {
        this.venda.data_contato = formatDate(value);
      }
    },
    computedDateFormatted1: {
      get() {
        return formatDate(this.venda.data_agendamento);
      },
      set(value) {
        this.venda.data_agendamento = formatDate(value);
      }
    }
  },
  watch: {
    "$store.state.modalStore.vendas.vendas.visible": function() {
      if (this.modalStore.vendas.vendas.visible) {
        this.limpaTela();
      }
    },
    "$store.state.modalStore.produtos.visible": function() {
      if (!this.modalStore.produtos.visible) {
        loadProdutos();
      }
    },
    "$store.state.modalStore.pessoas.visible": function() {
      if (!this.modalStore.pessoas.visible) {
        loadClientes();
      }
    },
    "$store.state.modalStore.tabelas.visible": function() {
      if (!this.modalStore.tabelas.visible) {
        loadTabelas();
      }
    }
  },
  data() {
    return {
      venda: {},
      produtos_venda: [],
      financeiro: [],
      cliente: {},
      clienteFilter: null,
      menu: false,
      menu1: false,
      valid: true,
      valid1: true,
      isLoading: false,
      expand: false,
      money: {
        decimal: ",",
        thousands: ".",
        precision: 2,
        prefix: "R$ "
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
      fieldsFinanceiro: [
        { value: "parcelas", text: "Parcelas" },
        { value: "valor", text: "Valor" },
        { value: "data", text: "Data de vencimento" },
        { value: "documento_origem", text: "Documento" },
        { value: "pago", text: "Pago?" },
        { value: "actions", text: "Ações" }
      ],
      fieldsProdutos: [
        { value: "sequencia", text: "Item" },
        { value: "produto", text: "Produto" },
        { value: "qtdEstoque", text: "Estoque disponível" },
        { value: "quantidade", text: "Quantidade" },
        { value: "valor_venda", text: "Valor venda" },
        { value: "valor_desconto", text: "Valor desconto" },
        { value: "valor_total", text: "Valor total" },
        { value: "actions", text: "Ações" }
      ],
      paginationProd: {
        descending: false,
        page: 1,
        rowsPerPage: 10, // -1 for All,
        sortBy: "sequencia",
        totalItems: 0
      },
      paginationFinanc: {
        descending: false,
        page: 1,
        rowsPerPage: 5, // -1 for All,
        sortBy: "parcelas",
        totalItems: 0
      },
      totais: [
        { value: "quantidade" },
        { value: "valor_venda" },
        { value: "valor_desconto" },
        { value: "valor_total" }
      ],
      totaisFinanc: [{ value: "valor" }, { value: "data" }, { value: "pago" }],
      empRules: [v => !!v || "Empresa é obrigatória"],
      clienteRules: [v => !!v || "Cliente é obrigatório"],
      vendedorRules: [v => !!v || "Vendedor é obrigatório"],
      tipoRules: [v => !!v || "Tipo é obrigatório"],
      dataRules: [v => !!v || "Datas são obrigatórias"]
    };
  },
  methods: {
    getColor(valor) {
      if (!this.venda.valor_total || valor === this.venda.valor_total)
        return "green";
      else return "red";
    },
    async limpaTela() {
      this.reset();
      this.loadTela(this.vendaStore.venda);
    },
    async addProduto(addProd) {
      if (!addProd) {
        const produto = {
          sequencia: this.produtos_venda.length
        };

        this.produtos_venda.push(produto);
      }
    },
    async reset() {
      this.produto = {};
      this.produtos_venda = [];
      this.venda = {};

      this.cliente = {};
      this.totais = {};

      this.$refs.form ? this.$refs.form.reset() : "";
      this.$refs.form1 ? this.$refs.form1.reset() : "";

      this.$refs.valor_frete
        ? (this.$refs.valor_frete.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.valor_seguro
        ? (this.$refs.valor_seguro.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.valor_desconto
        ? (this.$refs.valor_desconto.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.outras_despesas
        ? (this.$refs.outras_despesas.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
    },
    async loadTela(venda) {
      loadClientes();
      loadUsuarios();
      loadProdutos();
      loadTabelas();

      if (!venda) return;
      let url = `${urlBD}/vendas`;
      if (venda.id) {
        axios
          .get(`${url}/${venda.id}`)
          .then(res => {
            this.venda = res.data;

            this.parseValores();
            this.calcTotal();
            this.venda.id_pessoa.value ? this.loadCliente() : undefined;
          })
          .catch(showError);
      }
    },
    parseValores() {
      this.venda.valor_frete = formatToBRL(this.venda.valor_frete);
      this.venda.valor_seguro = formatToBRL(this.venda.valor_seguro);
      this.venda.valor_desconto = formatToBRL(this.venda.valor_desconto);
      this.venda.outras_despesas = formatToBRL(this.venda.outras_despesas);
      this.venda.valor_produtos = formatToBRL(this.venda.valor_produtos);
      this.venda.valor_total = formatToBRL(this.venda.valor_total);

      this.$refs.valor_frete.$el.getElementsByTagName(
        "input"
      )[0].value = this.venda.valor_frete;
      this.$refs.valor_seguro.$el.getElementsByTagName(
        "input"
      )[0].value = this.venda.valor_seguro;
      this.$refs.valor_desconto.$el.getElementsByTagName(
        "input"
      )[0].value = this.venda.valor_desconto;
      this.$refs.outras_despesas.$el.getElementsByTagName(
        "input"
      )[0].value = this.venda.outras_despesas;
      this.$refs.valor_produtos.$el.getElementsByTagName(
        "input"
      )[0].value = this.venda.valor_produtos;
      this.$refs.valor_total.$el.getElementsByTagName(
        "input"
      )[0].value = this.venda.valor_total;

      this.produtos_venda = this.venda.produtos;
      this.financeiro = this.venda.financeiro;

      let i = 0;
      this.produtos_venda = this.produtos_venda.map(produto => {
        produto.quantidade = formatToBRL(produto.quantidade).replace("R$", "");
        produto.valor_venda = formatToBRL(produto.valor_venda);
        produto.valor_desconto = formatToBRL(produto.valor_desconto);
        produto.valor_total = formatToBRL(produto.valor_total);
        produto.sequencia = i++;

        return produto;
      });
      delete this.venda.produtos;
    },
    async loadCliente() {
      if (!this.venda) return;

      if (this.venda.id_pessoa && this.venda.id_pessoa.value) {
        const url = `${urlBD}/pessoasComFinanceiro/${this.venda.id_pessoa.value}`;
        axios.get(url).then(res => {
          this.cliente = res.data;
          this.cliente.cpf_cnpj = res.data.cpf ? res.data.cpf : res.data.cnpj;
        });
        this.$refs.cliente_financeiro.focus();
      } else {
        this.cliente = {};
      }
    },
    async loadDados(item) {
      if (!item.id) return;

      const produtoFilter = this.produtoStore.produtos.find(produto => {
        return produto.value === item.id;
      });

      this.produtos_venda = this.produtos_venda.map(produto => {
        if (produto.sequencia === item.sequencia) {
          produto.valor_venda = produtoFilter.valor_venda;
          produto.qtdEstoque = produtoFilter.qtdEstoque;
        }
        return produto;
      });

      this.$refs.qtde.focus();
    },
    async deleteItem(item) {
      this.produtos_venda = this.produtos_venda.filter(produto => {
        return produto.sequencia !== item.sequencia;
      });
      this.calcTotal();
    },
    async calcTotal(item, flag = true) {
      if (item) {
        this.produtos_venda = this.produtos_venda.filter(produto => {
          if (produto.sequencia === item.sequencia) {
            const percentual = this.venda.id_tabela_preco
              ? this.venda.id_tabela_preco.percentual
              : "0,00";

            produto.valor_total =
              parseNumber(produto.quantidade || "0,00") *
                parseNumber(produto.valor_venda || "0,00") -
              parseNumber(produto.valor_desconto || "0,00");

            if (percentual != "0,00") {
              produto.valor_total =
                produto.valor_total -
                (parseNumber(percentual) * produto.valor_total) / 100;
            }
            produto.valor_total = formatToBRL(produto.valor_total);
          }

          return produto;
        });
      }

      if (flag) {
        let quantidade = 0,
          valor_venda = 0,
          valor_desconto = 0,
          valor_total = 0;

        this.produtos_venda.forEach(produto => {
          quantidade += parseNumber(produto.quantidade || "0,00");
          valor_venda += parseNumber(produto.valor_venda || "0,00");
          valor_desconto += parseNumber(produto.valor_desconto || "0,00");
          valor_total += parseNumber(produto.valor_total || "0,00");
        });
        this.totais = {
          quantidade: formatToBRL(quantidade).replace("R$", ""),
          valor_venda: formatToBRL(valor_venda),
          valor_desconto: formatToBRL(valor_desconto),
          valor_total: formatToBRL(valor_total)
        };

        this.calcTotalizadores();
      }
    },
    async aplicarTabela() {
      this.produtos_venda.forEach(item => {
        this.calcTotal(item, false);
      });
      this.calcTotal();
    },
    async calcTotalizadores() {
      const {
        valor_frete,
        valor_seguro,
        valor_desconto,
        outras_despesas
      } = this.venda;

      // valor dos produtos
      this.venda.valor_produtos = this.totais.valor_total;
      const valor_produtos = this.venda.valor_produtos;
      this.$refs.valor_produtos.$el.getElementsByTagName("input")[0].value =
        this.venda.valor_produtos || "";

      // valor total da nota
      this.venda.valor_total = formatToBRL(
        parseNumber(valor_produtos || "0,00") +
          parseNumber(valor_frete) +
          parseNumber(valor_seguro) +
          parseNumber(outras_despesas) -
          parseNumber(valor_desconto)
      );
      this.$refs.valor_total.$el.getElementsByTagName(
        "input"
      )[0].value = this.venda.valor_total;
    },
    save() {
      if (!this.$refs.form.validate() || !this.$refs.form1.validate()) return;

      this.isLoading = true;

      const method = this.venda.id ? "put" : "post";
      const id = this.venda.id ? this.venda.id : "";
      const url = `${urlBD}/vendas/${id}`;

      if (!this.venda.id_empresa) {
        this.venda.id_empresa = this.empresaStore.currentEmpresa.value;
      }

      this.venda.produtos = this.produtos_venda;

      axios[method](url, this.venda)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.modalStore.vendas.vendas.visible = false;

          let data = new Date();
          const hora = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`;
          const log = {
            id_usuario: this.usuarioStore.currentUsuario.id,
            data: formatDate(data.toISOString().substr(0, 10)),
            hora,
            tipo: method === "post" ? "GRAVAÇÂO" : "ALTERAÇÃO",
            tela: "ORÇAMENTOS/ADICIONAR",
            detalhe:
              method === "post"
                ? `Orçamento adicionado: /Data de lançamento: ${this.venda.data_lancamento}`
                : `Orçamento alterado: Código: ${this.venda.id}/de lançamento: ${this.venda.data_lancamento}`
          };

          axios.post(`${urlBD}/log`, log).catch(showError);
        })
        .catch(e => showError(e));

      this.isLoading = false;
    }
  }
};
</script>

<style>
</style>