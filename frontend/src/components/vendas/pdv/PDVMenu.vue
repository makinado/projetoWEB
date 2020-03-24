<template>
  <div>
    <v-card flat>
      <v-card-text>
        <v-form v-model="valid" ref="form">
          <v-layout row wrap>
            <v-text-field v-model="vendaStore.pdv.id" v-show="false"></v-text-field>
            <v-flex xs12>
              <GridProdutos />
            </v-flex>

            <v-flex xs12 md6>
              <v-layout column>
                <v-flex xs12>
                  <h3>TOTAIS</h3>
                </v-flex>
                <v-flex xs12 md4>
                  <span class="mr-2">QUANTIDADE</span>
                  <strong class="body-2">{{ vendaStore.pdv.totais.quantidade || "0,00" }}</strong>
                </v-flex>
                <v-flex xs12 md4>
                  <span class="mr-2">DESCONTO</span>
                  <strong class="body-2">{{ vendaStore.pdv.totais.valor_desconto || "R$ 0,00" }}</strong>
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex xs12 md6>
              <v-layout column>
                <v-flex xs12>
                  <h3>TOTAL A PAGAR</h3>
                </v-flex>
                <v-flex xs12 md4>
                  <span class="display-3">{{ vendaStore.pdv.totais.valor_total || "R$ 0,00" }}</span>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-flex xs12>
          <v-layout row wrap justify-space-between>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  block
                  color="danger"
                  class="v-btn-common mr-2"
                  @click="cancel"
                >Descartar</v-btn>
              </template>
              <span>Limpa a tela e descarta a venda</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  slot="activator"
                  block
                  color="warning"
                  class="v-btn-common mr-2"
                  @click="save(true)"
                >Aguardar</v-btn>
              </template>
              <span>Salva a venda do tipo "Orçamento"</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  slot="activator"
                  block
                  :color="color"
                  class="v-btn-common"
                  @click="save()"
                >Finalizar venda (F9)</v-btn>
              </template>
              <span>Abrir tela de pagamento</span>
            </v-tooltip>
          </v-layout>
        </v-flex>
      </v-card-actions>
    </v-card>

    <v-dialog v-if="confirmaCancelar" v-model="confirmaCancelar" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Cancelar venda</span>
        </v-card-title>
        <v-card-text>
          <v-flex xs12>Descartar dados?</v-flex>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="confirmaCancelar = false">Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="cancel">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-if="finalizar" v-model="finalizar" persistent max-width="1100px">
      <v-stepper v-model="stepper">
        <v-stepper-header>
          <v-stepper-step :complete="stepper > 1" step="1">Formas de pagamento</v-stepper-step>

          <v-divider></v-divider>

          <v-stepper-step :complete="stepper > 2" step="2">Finalizar venda</v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <v-card>
              <v-card-text>
                <v-layout align-end>
                  <span>Edite os valores do pagamento diretamente na tabela</span>
                  <v-spacer></v-spacer>
                  <v-tooltip bottom class="ml-3">
                    <v-btn
                      slot="activator"
                      class="v-btn-common"
                      :color="color"
                      @click="addPagamento"
                    >Adicionar</v-btn>
                    <span>Adicionar nova forma de pagamento</span>
                  </v-tooltip>
                </v-layout>

                <v-data-table
                  class="mt-3"
                  :headers="fields"
                  :items="pagamento"
                  hide-actions
                  no-data-text="Nenhuma forma de pagamento adicionada"
                >
                  <template slot="items" slot-scope="data">
                    <td>{{ data.item.sequencia}}</td>
                    <td>
                      <v-flex xs12 md8>
                        <v-autocomplete
                          class="tag-input"
                          dense
                          chips
                          deletable-chips
                          :color="color"
                          v-model="data.item.documento_baixa"
                          placeholder="Selecione"
                          :items="financeiroStore.documentos"
                          no-data-text="Nenhum documento encontrado"
                          prepend-icon="fa fa-lg fa-plus-circle"
                          @click:prepend="[financeiroStore.documento = null, modalStore.documentos.visible = true]"
                        ></v-autocomplete>
                      </v-flex>
                    </td>
                    <td>
                      <v-flex xs12 md6>
                        <v-text-field v-model="data.item.valor" :color="color" v-money="money"></v-text-field>
                      </v-flex>
                    </td>
                    <td>
                      <v-tooltip bottom>
                        <v-btn
                          slot="activator"
                          icon
                          class="mr-1"
                          @click.prevent="deletePagamento(data.item)"
                        >
                          <i class="fa fa-lg fa-trash"></i>
                        </v-btn>
                        <span>Excluir forma de pagamento</span>
                      </v-tooltip>
                    </td>
                  </template>
                </v-data-table>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" flat @click="finalizar = false">Fechar</v-btn>
                <v-btn color="blue darken-1" flat @click="stepper = 2">Continuar</v-btn>
              </v-card-actions>
            </v-card>
          </v-stepper-content>

          <v-stepper-content step="2">
            <v-card>
              <v-card-text>
                <v-layout row wrap>
                  <v-flex xs12 md4>
                    <v-autocomplete
                      dense
                      label="Cliente"
                      readonly
                      :items="pessoaStore.clientes"
                      v-model="venda.id_pessoa"
                      append-icon="fa fa-user"
                    ></v-autocomplete>
                  </v-flex>
                  <v-flex xs12 md4>
                    <v-text-field
                      label="CPF/CNPJ"
                      v-mask="['###.###.###-##', '##.###.###/####-##']"
                      v-model="venda.cpf_cnpj"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 md4>
                    <v-autocomplete
                      dense
                      label="Vendedor"
                      readonly
                      :items="usuarioStore.currentUsuarios"
                      v-model="venda.id_vendedor"
                      append-icon="fa fa-user"
                    ></v-autocomplete>
                  </v-flex>

                  <v-flex xs12></v-flex>

                  <v-flex xs12>
                    <Card title="Totais" :color="color">
                      <v-layout row justify-space-between>
                        <v-flex xs12 md3>
                          <v-text-field
                            label="QUANTIDADE"
                            readonly
                            v-model="venda.totais.quantidade"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 md4>
                          <v-text-field
                            label="VALOR DESCONTO"
                            readonly
                            v-model="venda.totais.valor_desconto"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 md4>
                          <v-text-field
                            label="VALOR TOTAL"
                            readonly
                            v-model="venda.totais.valor_total"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                    </Card>
                  </v-flex>
                </v-layout>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" flat @click="stepper = 1">Voltar</v-btn>
                <v-btn color="blue darken-1" flat @click="finalizar = false">Fechar</v-btn>
                <v-btn color="blue darken-1" flat @click="finalizar = false">Confirmar</v-btn>
              </v-card-actions>
            </v-card>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { VMoney } from "v-money";

import axios from "axios";
import { urlBD, showError, saveLog, parseNumber } from "@/global";
import { formatToBRL, parseToNumber } from "brazilian-values";

export default {
  directives: { money: VMoney },
  name: "pdv-menu",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "produtoStore",
      "pessoaStore",
      "usuarioStore",
      "financeiroStore",
      "empresaStore",
      "vendaStore",
      "modalStore"
    ]),
    venda: {
      get() {
        return this.vendaStore.pdv;
      }
    },
    pagamento: {
      get() {
        return this.financeiroStore.financ;
      },
      set(value) {
        this.financeiroStore.financ = value;
      }
    },
    finalizar: {
      get() {
        return this.modalStore.vendas.pdv.finalizar;
      },
      set(value) {
        this.modalStore.vendas.pdv.finalizar = value;
      }
    }
  },
  components: {
    Card: () => import("@/components/material/Card"),
    GridProdutos: () => import("./GridProdutos")
  },
  watch: {
    "$store.state.modalStore.pessoas.visible": function() {
      if (!this.modalStore.pessoas.visible) {
        this.$store.dispatch("loadClientes");
      }
    },
    "$store.state.modalStore.documentos.visible": function() {
      if (!this.modalStore.documentos.visible) {
        this.$store.dispatch("loadDocumentos");
      }
    },
    finalizar() {
      if (this.finalizar) {
        this.stepper = 1;
        if (this.pagamento.length == 0) this.addPagamento();
      }
    }
  },
  data() {
    return {
      valid: true,
      confirmaCancelar: false,
      stepper: 1,
      produtos: [],
      fields: [
        { value: "sequencia", text: "Sequencia" },
        { value: "documento_baixa", text: "Forma de pagamento" },
        { value: "valor", text: "Valor" },
        { value: "actions", text: "Ações" }
      ],
      money: {
        decimal: ",",
        thousands: ".",
        prefix: "R$ ",
        precision: 2,
        masked: false
      },
      decimal: {
        decimal: ",",
        thousands: ".",
        prefix: "",
        precision: 2,
        masked: false
      }
    };
  },
  methods: {
    reset() {
      this.$set(this.venda, "id_pessoa", null);
      this.$set(this.venda, "id_pessoa", null);
      this.$set(this.venda, "cpf_cnpj", null);
      this.$store.commit("setPDVProdutos", []);
      this.$store.dispatch("calcTotalPDV");
    },
    addPagamento() {
      var valor = this.venda.totais.valor_total;

      const pagamento = {
        sequencia: this.pagamento.length,
        valor
      };
      this.pagamento.push(pagamento);
      this.pagamento.length > 1 ? this.atualizaPagamento() : null;
    },
    atualizaPagamento() {
      var valor =
        parseNumber(this.venda.totais.valor_total) / this.pagamento.length;

      this.pagamento.forEach(item => {
        item.valor = formatToBRL(valor);
      });
    },
    deletePagamento(pag) {
      if (!pag) return;

      this.pagamento = this.pagamento.filter(item => {
        return item.sequencia !== pag.sequencia;
      });
    },
    verificaVenda() {
      if (!this.venda.totais) return false;
      else if (!this.venda.totais.valor_total) return false;
      else if (this.venda.totais.valor_total == "R$ 0,00") return false;
      else return true;
    },
    cancel() {
      if (!this.verificaVenda())
        return showError("Não há nada para ser descartado");
      if (!this.confirmaCancelar) {
        this.confirmaCancelar = true;
        return;
      }

      this.confirmaCancelar = false;
      this.reset();
    },
    save(aguardar = false) {
      if (!this.verificaVenda()) return showError("Nenhum produto adicionado");

      if (!this.finalizar && !aguardar) {
        this.$store.dispatch("loadDocumentos");
        this.finalizar = true;
        return;
      }

      const method = this.venda.id ? "put" : "post";
      const id = this.venda.id ? this.venda.id : "";
      const url = `${urlBD}/vendas/${id}`;

      const venda = { ...this.venda };
      if (!venda.id_empresa) {
        venda.id_empresa = this.empresaStore.currentEmpresa;
      }
      if (aguardar) {
        venda.tipo = 1; // orçamento
      } else {
        venda.tipo = 2; // venda
      }
      venda.valor_desconto = venda.totais.valor_desconto;
      venda.valor_total = venda.totais.valor_total;
      delete venda.pdvProduto;
      delete venda.totais;

      venda.produtos = venda.produtos.map(p => {
        p.id = p.id ? p.id : p.produto.value;
        delete p.produto;
        return p;
      });

      axios[method](url, venda)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.reset();

          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
            "ORÇAMENTOS/VENDAS",
            `Usuário ${this.usuarioStore.currentUsuario.nome} ${
              method === "post" ? "ADICIONOU" : "ALTEROU"
            } uma venda ao cliente ${this.venda.id_pessoa}`
          );
        })
        .catch(showError);
    }
  },
  mounted() {
    this.pagamento = [];
  }
};
</script>

<style>
.produtos-container {
  box-sizing: border-box;
  height: calc(50vh - 10rem);
  overflow-y: auto;
  padding: 10px;
}
</style>