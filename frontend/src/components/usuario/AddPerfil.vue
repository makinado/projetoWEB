<template>
  <div class="perfis">
    <v-layout row justify-center>
      <v-dialog v-model="modalStore.perfis.addPerfil" persistent max-width="530px">
        <v-card v-if="modalStore.perfis.addPerfil">
          <v-card-title>
            <span class="headline">{{ modalStore.perfis.title }}</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md fluid>
              <v-form v-model="valid" ref="form">
                <v-layout wrap>
                  <v-text-field label="id" v-model="perfil.id" v-show="false"></v-text-field>
                  <v-flex xs12>
                    <v-text-field
                      color="primary"
                      label="Descricao*"
                      required
                      v-model="perfil.descricao"
                      v-uppercase
                      autofocus
                      :rules="descRules"
                    ></v-text-field>
                  </v-flex>
                  <strong class="headline m-0">
                    <v-icon class="mr-2">fa fa-archive</v-icon>Cadastros
                  </strong>
                  <v-flex xs12>
                    <v-layout row>
                      <v-checkbox
                        v-model="selected"
                        color="primary"
                        label="Empresas"
                        value="empresas"
                      ></v-checkbox>
                      <v-checkbox
                        v-model="selected"
                        color="primary"
                        label="Usuários"
                        value="usuarios"
                      ></v-checkbox>
                      <v-checkbox
                        v-model="selected"
                        color="primary"
                        label="Pessoas"
                        value="pessoas"
                      ></v-checkbox>
                      <v-checkbox
                        v-model="selected"
                        color="primary"
                        label="Produtos"
                        value="produtos"
                      ></v-checkbox>
                    </v-layout>
                  </v-flex>
                  <strong class="headline m-0">
                    <v-icon class="mr-2">fa fa-cart-arrow-down</v-icon>Compras
                  </strong>
                  <v-flex xs12>
                    <v-layout row>
                      <v-checkbox
                        v-model="selected"
                        color="primary"
                        label="Pedidos"
                        value="pedidos"
                      ></v-checkbox>
                      <v-checkbox
                        v-model="selected"
                        color="primary"
                        label="Nota fiscal"
                        value="nfe"
                      ></v-checkbox>
                    </v-layout>
                  </v-flex>
                  <strong class="headline m-0">
                    <v-icon class="mr-2">fa fa-shopping-cart</v-icon>Vendas
                  </strong>
                  <v-flex xs12>
                    <v-layout row>
                      <v-checkbox
                        v-model="selected"
                        color="primary"
                        label="Orçamentos"
                        value="orcamentos"
                      ></v-checkbox>
                      <v-checkbox
                        v-model="selected"
                        color="primary"
                        label="Vendas (NF-e)"
                        value="vendas"
                      ></v-checkbox>
                      <v-checkbox v-model="selected" color="primary" label="PDV" value="pdv"></v-checkbox>
                    </v-layout>
                  </v-flex>
                  <strong class="headline m-0">
                    <v-icon class="mr-2">fa fa-usd</v-icon>Financeiro
                  </strong>
                  <v-flex xs12>
                    <v-layout row>
                      <v-checkbox
                        v-model="selected"
                        color="primary"
                        label="Contas a pagar"
                        value="cpag"
                      ></v-checkbox>
                      <v-checkbox
                        v-model="selected"
                        color="primary"
                        label="Contas a receber"
                        value="crec"
                      ></v-checkbox>
                      <v-checkbox v-model="selected" color="primary" label="Caixa" value="caixa"></v-checkbox>
                    </v-layout>
                  </v-flex>
                  <strong class="headline m-0">
                    <v-icon class="mr-2">fa fa-line-chart</v-icon>Relatórios
                  </strong>
                  <v-flex xs12>
                    <v-layout row>
                      <v-checkbox
                        v-model="selected"
                        color="primary"
                        label="Cadastros"
                        value="listar cadastros"
                      ></v-checkbox>
                      <v-checkbox
                        v-model="selected"
                        color="primary"
                        label="Compras"
                        value="listar compras"
                      ></v-checkbox>
                      <v-checkbox
                        v-model="selected"
                        color="primary"
                        label="Vendas"
                        value="listar vendas"
                      ></v-checkbox>
                      <v-checkbox
                        v-model="selected"
                        color="primary"
                        label="Estoque"
                        value="listar estoque"
                      ></v-checkbox>
                      <v-checkbox
                        v-model="selected"
                        color="primary"
                        label="Financeiro"
                        value="listar financeiro"
                      ></v-checkbox>
                      <v-checkbox
                        v-model="selected"
                        color="primary"
                        label="Estatísticas"
                        value="listar estat"
                      ></v-checkbox>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-form>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-btn color="blue darken-1" flat @click="selectAll()">{{btn_select}}</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="modalStore.perfis.addPerfil = false">Fechar</v-btn>
            <v-btn color="blue darken-1" flat @click="save()">Salvar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </div>
</template>

<script>
import axios from "axios";
import { urlBD, showError, formatDate, saveLog } from "@/global";
import { mapState } from "vuex";

export default {
  data() {
    return {
      perfil: {},
      valid: true,
      btn_select: "Selecionar tudo",
      selected: [],
      descRules: [
        v => !!v || "Descrição é obrigatória",
        v =>
          (!!v && v.length >= 5) || "Descrição deve ter no mínimo 5 caracteres"
      ]
    };
  },
  computed: mapState(["modalStore", "usuarioStore"]),
  watch: {
    "$store.state.modalStore.perfis.addPerfil": function() {
      this.reset();
      if (this.modalStore.perfis.addPerfil) {
        this.loadPerfil(this.usuarioStore.perfil);
      }
    }
  },
  methods: {
    async reset() {
      this.perfil = {};
      this.selected = [];
      this.btn_select = "Selecionar tudo";

      this.$refs.form ? this.$refs.form.reset() : "";
    },
    async loadPerfil(perfil) {
      if (perfil) {
        this.perfil = this.usuarioStore.perfil;
        if (this.perfil.empresas) this.selected.push("empresas");
        if (this.perfil.usuarios) this.selected.push("usuarios");
        if (this.perfil.pessoas) this.selected.push("pessoas");
        if (this.perfil.produtos) this.selected.push("produtos");
        if (this.perfil.pedidos) this.selected.push("pedidos");
        if (this.perfil.nfe) this.selected.push("nfe");
        if (this.perfil.venda) this.selected.push("vendas");
        if (this.perfil.pdv) this.selected.push("pdv");
        if (this.perfil.orcamentos) this.selected.push("orcamentos");
        if (this.perfil.contas_pagar) this.selected.push("cpag");
        if (this.perfil.contas_receber) this.selected.push("crec");
        if (this.perfil.caixa) this.selected.push("caixa");
        if (this.perfil.rel_cadastros) this.selected.push("listar cadastros");
        if (this.perfil.rel_compras) this.selected.push("listar compras");
        if (this.perfil.rel_vendas) this.selected.push("listar vendas");
        if (this.perfil.rel_estoque) this.selected.push("listar estoque");
        if (this.perfil.rel_financeiro) this.selected.push("listar financeiro");
        if (this.perfil.rel_estat) this.selected.push("listar estat");
      } else {
        this.perfil = {};
      }
    },
    async save() {
      if (!this.$refs.form.validate()) return;
      if (this.selected.length == 0)
        return showError("Nenhum acesso permitido!");

      const method = this.perfil.id ? "put" : "post";
      const id = this.perfil.id ? this.perfil.id : "";
      const urlPerfil = `${urlBD}/perfis/${id}`;

      if (
        this.selected.includes("empresas") ||
        this.selected.includes("usuarios") ||
        this.selected.includes("pessoas") ||
        this.selected.includes("produtos")
      ) {
        this.perfil.cadastros = true;
        if (this.selected.includes("empresas")) {
          this.perfil.empresas = true;
        } else {
          this.perfil.empresas = false;
        }
        if (this.selected.includes("usuarios")) {
          this.perfil.usuarios = true;
        } else {
          this.perfil.usuarios = false;
        }
        if (this.selected.includes("pessoas")) {
          this.perfil.pessoas = true;
        } else {
          this.perfil.pessoas = false;
        }
        if (this.selected.includes("produtos")) {
          this.perfil.produtos = true;
        } else {
          this.perfil.produtos = false;
        }
      } else {
        this.perfil.cadastros = false;
      }

      if (this.selected.includes("pedidos") || this.selected.includes("nfe")) {
        this.perfil.compras = true;
        if (this.selected.includes("pedidos")) {
          this.perfil.pedidos = true;
        } else {
          this.perfil.pedidos = false;
        }
        if (this.selected.includes("nfe")) {
          this.perfil.nfe = true;
        } else {
          this.perfil.nfe = false;
        }
      } else {
        this.perfil.compras = false;
      }

      if (
        this.selected.includes("orcamentos") ||
        this.selected.includes("vendas") ||
        this.selected.includes("pdv")
      ) {
        this.perfil.vendas = true;
        if (this.selected.includes("orcamentos")) {
          this.perfil.orcamentos = true;
        } else {
          this.perfil.orcamentos = false;
        }
        if (this.selected.includes("vendas")) {
          this.perfil.venda = true;
        } else {
          this.perfil.venda = false;
        }
        if (this.selected.includes("pdv")) {
          this.perfil.pdv = true;
        } else {
          this.perfil.pdv = false;
        }
      } else {
        this.perfil.vendas = false;
      }

      if (
        this.selected.includes("cpag") ||
        this.selected.includes("crec") ||
        this.selected.includes("caixa")
      ) {
        this.perfil.financeiro = true;
        if (this.selected.includes("cpag")) {
          this.perfil.contas_pagar = true;
        } else {
          this.perfil.contas_pagar = false;
        }
        if (this.selected.includes("crec")) {
          this.perfil.contas_receber = true;
        } else {
          this.perfil.contas_receber = false;
        }
        if (this.selected.includes("caixa")) {
          this.perfil.caixa = true;
        } else {
          this.perfil.caixa = false;
        }
      } else {
        this.perfil.financeiro = false;
      }

      if (
        this.selected.includes("listar cadastros") ||
        this.selected.includes("listar compras") ||
        this.selected.includes("listar vendas") ||
        this.selected.includes("listar estoque") ||
        this.selected.includes("listar financeiro") ||
        this.selected.includes("listar estat")
      ) {
        this.perfil.relatorios = true;
        if (this.selected.includes("listar cadastros")) {
          this.perfil.rel_cadastros = true;
        } else {
          this.perfil.rel_cadastros = false;
        }
        if (this.selected.includes("listar compras")) {
          this.perfil.rel_compras = true;
        } else {
          this.perfil.rel_compras = false;
        }
        if (this.selected.includes("listar vendas")) {
          this.perfil.rel_vendas = true;
        } else {
          this.perfil.rel_vendas = false;
        }
        if (this.selected.includes("listar estoque")) {
          this.perfil.rel_estoque = true;
        } else {
          this.perfil.rel_estoque = false;
        }
        if (this.selected.includes("listar financeiro")) {
          this.perfil.rel_financeiro = true;
        } else {
          this.perfil.rel_financeiro = false;
        }
        if (this.selected.includes("listar estat")) {
          this.perfil.rel_estat = true;
        } else {
          this.perfil.rel_estat = false;
        }
      } else {
        this.perfil.relatorios = false;
      }

      axios[method](urlPerfil, this.perfil)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.modalStore.perfis.addPerfil = false;

          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
            "PERFIS DE USUÁRIOS",
            `Usuário ${this.usuarioStore.currentUsuario.nome} ${
              method === "post" ? "ADICIONOU" : "ALTEROU"
            } o perfil ${this.perfil.descricao}`
          );
        })
        .catch(showError);
    },
    selectAll() {
      if (this.btn_select === "Selecionar tudo") {
        this.selected.push("empresas");
        this.selected.push("usuarios");
        this.selected.push("pessoas");
        this.selected.push("produtos");
        this.selected.push("pedidos");
        this.selected.push("nfe");
        this.selected.push("orcamentos");
        this.selected.push("vendas");
        this.selected.push("pdv");
        this.selected.push("cpag");
        this.selected.push("crec");
        this.selected.push("caixa");
        this.selected.push("listar cadastros");
        this.selected.push("listar compras");
        this.selected.push("listar vendas");
        this.selected.push("listar estoque");
        this.selected.push("listar financeiro");
        this.selected.push("listar estat");
        this.btn_select = "Deselecionar tudo";
      } else {
        this.selected = [];
        this.btn_select = "Selecionar tudo";
      }
    }
  }
};
</script>

<style>
</style>
