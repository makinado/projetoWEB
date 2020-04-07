<template>
  <div>
    <v-card flat>
      <v-card-text>
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
                <span class="mr-2">PRODUTOS</span>
                <strong class="body-2">{{ vendaStore.pdv.totais.valor_produtos || "0,00" }}</strong>
              </v-flex>
              <v-flex xs12 md4>
                <span class="mr-2">DESCONTOS</span>
                <strong class="body-2">{{ vendaStore.pdv.totais.valor_desconto || "R$ 0,00" }}</strong>
              </v-flex>
              <v-flex xs12 md4>
                <span class="mr-2">ACRÉSCIMOS</span>
                <strong class="body-2">{{ vendaStore.pdv.totais.valor_acrescimo || "R$ 0,00" }}</strong>
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
                >pagamento venda (F9)</v-btn>
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
  </div>
</template>

<script>
import { mapState } from "vuex";
import { VMoney } from "v-money";

import axios from "axios";
import { urlBD, showError, saveLog, parseNumber } from "@/global";
import { formatToBRL } from "brazilian-values";

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
    stepper: {
      get() {
        return this.modalStore.vendas.pdv.stepper;
      },
      set(value) {
        this.modalStore.vendas.pdv.stepper = value;
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
    }
  },
  data() {
    return {
      confirmaCancelar: false,
      produtos: []
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
    verificaVenda() {
      if (this.venda.produtos.length == 0) return false;
      return true;
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

      if (!aguardar) {
        this.stepper += 1;
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
    this.financeiro = [];
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