<template>
  <v-dialog v-model="modalStore.pessoas.visible" lazy persistent max-width="900px">
    <v-card v-if="modalStore.pessoas.visible">
      <v-card-title>
        <span class="headline">{{ modalStore.pessoas.title }}</span>
      </v-card-title>
      <v-card-text>
        <v-container grid-list-md>
          <v-form v-model="valid" ref="form">
            <v-layout wrap>
              <v-text-field label="id" v-model="pessoa.id" v-show="false"></v-text-field>
              <v-flex xs12 md4>
                <v-autocomplete
                  dense
                  :color="color"
                  label="Tipo*"
                  v-model="pessoa.tipo"
                  :items="['Física','Jurídica']"
                  @change="[pessoa.cpf = '', pessoa.cnpj = '']"
                  :rules="tipoRules"
                ></v-autocomplete>
              </v-flex>
            </v-layout>

            <v-layout wrap>
              <v-flex xs12 md6 v-show="pessoa.tipo === 'Jurídica'">
                <v-text-field
                  :color="color"
                  label="CNPJ*"
                  v-mask="'##.###.###/####-##'"
                  v-model="pessoa.cnpj"
                  :disabled="modalStore.pessoas.title.includes('Alterar')"
                  :rules="cnpjRules"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md6 v-show="pessoa.tipo === 'Jurídica'">
                <v-text-field
                  :color="color"
                  label="Razão social*"
                  v-model="pessoa.nome"
                  @blur="[pessoa.fantasia = pessoa.nome, $refs.fantasia.value = pessoa.nome]"
                  :rules="nameRules"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md6 v-show="pessoa.tipo === 'Jurídica'">
                <v-text-field
                  ref="fantasia"
                  :color="color"
                  label="Fantasia"
                  v-model="pessoa.fantasia"
                  :rules="fantasiaRules"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md6 v-show="pessoa.tipo === 'Física'">
                <v-text-field
                  :color="color"
                  label="CPF*"
                  v-mask="'###.###.###-##'"
                  v-model="pessoa.cpf"
                  :disabled="modalStore.pessoas.title.includes('Alterar')"
                  :rules="cpfRules"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md6 v-if="pessoa.tipo === 'Física'">
                <v-text-field :color="color" label="Nome*" v-model="pessoa.nome" :rules="nameRules"></v-text-field>
              </v-flex>
            </v-layout>
          </v-form>

          <v-layout wrap>
            <v-flex xs12>
              <v-tabs v-model="tabIndex" centered color="#FFFFFF" light icons-and-text>
                <v-tabs-slider color="color"></v-tabs-slider>

                <v-tab href="#tab-1">
                  BÁSICO
                  <v-icon>fa fa-lg fa-file</v-icon>
                </v-tab>

                <v-tab href="#tab-2">
                  ENDEREÇO
                  <v-icon>location_on</v-icon>
                </v-tab>

                <v-tab href="#tab-3">
                  OUTROS
                  <v-icon>fa fa-lg fa-file-text</v-icon>
                </v-tab>

                <v-tab-item value="tab-1">
                  <v-card flat>
                    <v-card-text>
                      <v-container grid-list-md>
                        <v-form v-model="valid1" ref="form_basico">
                          <v-layout
                            v-if="$vuetify.breakpoint.name === 'xs' || $vuetify.breakpoint.name === 'sm'"
                            justify-space-around
                            align-center
                          >
                            <v-flex xs12>
                              <v-checkbox
                                :color="color"
                                v-model="selected"
                                label="Cliente"
                                value="Cliente"
                              ></v-checkbox>

                              <v-checkbox
                                :color="color"
                                v-model="selected"
                                label="Fornecedor"
                                value="Fornecedor"
                              ></v-checkbox>

                              <v-checkbox
                                :color="color"
                                v-model="selected"
                                label="Transportadora"
                                value="Transportadora"
                              ></v-checkbox>
                            </v-flex>
                          </v-layout>
                          <v-layout v-else justify-space-between align-center>
                            <v-checkbox
                              :color="color"
                              v-model="selected"
                              label="Cliente"
                              value="Cliente"
                            ></v-checkbox>

                            <v-checkbox
                              :color="color"
                              v-model="selected"
                              label="Fornecedor"
                              value="Fornecedor"
                            ></v-checkbox>

                            <v-checkbox
                              :color="color"
                              v-model="selected"
                              label="Transportadora"
                              value="Transportadora"
                            ></v-checkbox>
                          </v-layout>
                          <v-layout wrap>
                            <v-flex xs12 md6>
                              <v-autocomplete
                                dense
                                :color="color"
                                label="Situação*"
                                v-model="pessoa.situacao"
                                :items="['Ativo','Inativo', 'Em análise']"
                                no-data-text="Nenhum resultado"
                                :rules="sitRules"
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-autocomplete
                                dense
                                :color="color"
                                label="Categoria"
                                v-model="pessoa.categoria"
                                :items="this.categoriaStore.categorias"
                                :return-object="false"
                                :disabled="selected.includes('Transportadora') || selected.includes('Funcionário')? true:false"
                                no-data-text="Nenhum resultado"
                                prepend-icon="fa fa-lg fa-plus-circle"
                                @click:prepend="[modalStore.categorias.visible = true, modalStore.categorias.title = 'Adicionar categoria de pessoa']"
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="E-mail"
                                v-model="pessoa.email"
                                :rules="emailRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="E-mail 2"
                                v-model="pessoa.email2"
                                :rules="emailRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Contato"
                                v-mask="['(##)####-####','(##)#####-####']"
                                v-model="pessoa.contato"
                                :rules="foneRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Contato2"
                                v-mask="['(##)####-####','(##)#####-####']"
                                v-model="pessoa.contato2"
                                :rules="foneRules"
                              ></v-text-field>
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
                      <v-container grid-list-md>
                        <v-form v-model="valid2" ref="form_end">
                          <v-layout wrap>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="CEP*"
                                v-model="pessoa.cep"
                                v-mask="['#####-###']"
                                @keyup.enter="getCep"
                                append-icon="fa fa-search"
                                @click:append="getCep"
                                :rules="cepRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-autocomplete
                                :color="color"
                                label="UF"
                                v-model="pessoa.uf"
                                :rules="ufRules"
                                :items="[
                                  'AC', 'AL', 'AP', 'AM', 'BA',
                                  'CE', 'DF', 'ES', 'GO', 'MA',
                                  'MT', 'MS', 'MG', 'PA', 'PB',
                                  'PR', 'PE', 'PI', 'RJ', 'RN',
                                  'RS', 'RO', 'RR', 'SC', 'SP',
                                  'SE', 'TO'
                                ]"
                                dense
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Cidade*"
                                v-model="pessoa.cidade"
                                :rules="cidadeRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Bairro"
                                v-model="pessoa.bairro"
                                :rules="bairroRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Logradouro"
                                v-model="pessoa.logradouro"
                                :rules="logradRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Número*"
                                v-mask="['######']"
                                v-model="pessoa.numero"
                                :rules="numeroRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12>
                              <v-text-field
                                :color="color"
                                label="Complemento"
                                v-model="pessoa.complemento"
                              ></v-text-field>
                            </v-flex>
                          </v-layout>
                        </v-form>
                      </v-container>
                    </v-card-text>
                  </v-card>
                </v-tab-item>
                <v-tab-item value="tab-3">
                  <v-card flat>
                    <v-card-text>
                      <v-container grid-list-md>
                        <v-form v-model="valid3" ref="form_outros">
                          <v-layout wrap>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Inscrição estadual"
                                v-model="pessoa.inscricao_estadual"
                                :rules="inscRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Inscrição municipal"
                                v-model="pessoa.inscricao_municipal"
                              ></v-text-field>
                            </v-flex>
                            <v-textarea
                              :color="color"
                              label="Alguma observação?"
                              box
                              v-model="pessoa.observacao"
                            ></v-textarea>
                          </v-layout>
                        </v-form>
                      </v-container>
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
        <v-btn color="blue darken-1" flat @click="modalStore.pessoas.visible = false">Fechar</v-btn>
        <v-btn color="blue darken-1" flat @click="save()">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
import { urlBD, showError, saveLog } from "@/global";
import { mapState, mapActions } from "vuex";

import ViaCep from "vue-viacep";

import { isCNPJ, isCPF, formatToCNPJ } from "brazilian-values";

export default {
  name: "AddPessoa",
  data: function() {
    return {
      valid: true,
      valid1: true,
      valid2: true,
      valid3: true,
      tabIndex: "",
      pessoa: {},
      selected: [],
      empresas: [],
      tipoRules: [v => !!v || "Tipo é obrigatório"],
      cnpjRules: [
        v =>
          this.pessoa.tipo === "Jurídica" ? !!v || "CNPJ é obrigatório" : true,
        v =>
          this.pessoa.tipo === "Jurídica"
            ? (!!v && isCNPJ(v)) || "CNPJ inválido"
            : true
      ],
      cpfRules: [
        v =>
          this.pessoa.tipo === "Física" ? !!v || "CPF é obrigatório" : true,
        v =>
          this.pessoa.tipo === "Física"
            ? (!!v && isCPF(v)) || "CPF inválido"
            : true
      ],
      nameRules: [
        v => !!v || "Nome é obrigatório",
        v => (!!v && v.length >= 5) || "Nome deve ter no mínimo 5 caracteres"
      ],
      fantasiaRules: [
        v =>
          v
            ? (!!v && v.length >= 5) ||
              "Fantasia deve ter no mínimo 5 caracteres"
            : true
      ],
      emailRules: [v => (v ? /.+@.+\..+/.test(v) || "E-mail inválido" : true)],
      foneRules: [
        v => (v ? (!!v && v.length > 12) || "Contato inválido" : true)
      ],
      sitRules: [v => !!v || "Situação é obrigatória"],
      cepRules: [
        v => !!v || "CEP é obrigatório",
        v => (!!v && v.length > 8) || "CEP inválido"
      ],
      ufRules: [v => !!v || "UF é obrigatória"],
      cidadeRules: [v => !!v || "Cidade é obrigatória"],
      bairroRules: [v => !!v || "Bairro é obrigatório"],
      logradRules: [v => !!v || "Logradouro é obrigatório"],
      numeroRules: [v => !!v || "Número é obrigatório"],
      inscRules: [v => (v ? !!v || "Inscrição estadual é obrigatória" : true)],
      checkRules: [v => !!v || "Selecione ao menos 1 opção"]
    };
  },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["pessoaStore", "usuarioStore", "modalStore", "categoriaStore"])
  },
  watch: {
    "$store.state.modalStore.pessoas.visible": function() {
      if (this.modalStore.pessoas.visible) {
        this.reset();
        this.loadTela(this.pessoaStore.pessoa);
      }
    },
    "$store.state.modalStore.categorias.visible": function() {
      if (!this.modalStore.categorias.visible) this.loadCategoriasPessoas();
    }
  },
  methods: {
    reset() {
      this.pessoa = {};
      this.empresas = this.selected = [];

      this.$refs.form ? this.$refs.form.reset() : "";
      this.$refs.form_basico ? this.$refs.form_basico.reset() : "";
      this.$refs.form_end ? this.$refs.form_end.reset() : "";
      this.$refs.form_outros ? this.$refs.form_end.reset() : "";

      this.tabIndex = "tab-1";
    },
    getCep() {
      this.$viaCep
        .buscarCep(this.pessoa.cep)
        .then(res => {
          this.pessoa.cep = res.cep;
          this.pessoa.bairro = res.bairro;
          this.pessoa.logradouro = res.logradouro;
          this.pessoa.complemento = res.complemento;
          this.pessoa.cidade = res.localidade;
          this.pessoa.uf = res.uf;
          this.pessoa.id_cidade = res.ibge;
          this.tabIndex = "tab-3";
          this.tabIndex = "tab-2";

          this.$toasted.global.defaultSuccess();
        })
        .catch(showError);
    },
    async loadTela(pessoa) {
      this.$store.dispatch("loadCategoriasPessoas");

      if (!pessoa) return;
      let url = `${urlBD}/pessoas`;
      if (pessoa.id) {
        await axios
          .get(`${url}/${pessoa.id}`)
          .then(res => {
            this.pessoa = res.data;
            this.pessoa.cliente ? this.selected.push("Cliente") : "";
            this.pessoa.fornecedor ? this.selected.push("Fornecedor") : "";
            this.pessoa.transportadora
              ? this.selected.push("Transportadora")
              : "";
          })
          .catch(showError);
      } else {
        this.pessoa = pessoa;
        this.pessoa.cliente ? this.selected.push("Cliente") : "";
        this.pessoa.fornecedor ? this.selected.push("Fornecedor") : "";
        this.pessoa.transportadora ? this.selected.push("Transportadora") : "";
      }
    },
    save() {
      if (!this.$refs.form.validate()) return;
      if (!this.$refs.form_basico.validate()) {
        this.tabIndex = "tab-1";
        return;
      }
      if (!this.$refs.form_end.validate()) {
        this.tabIndex = "tab-2";
        return;
      }
      if (!this.$refs.form_outros.validate()) {
        this.tabIndex = "tab-3";
        return;
      }

      const method = this.pessoa.id ? "put" : "post";
      const id = this.pessoa.id ? this.pessoa.id : "";
      const url = `${urlBD}/pessoas/${id}`;

      this.selected.includes("Cliente")
        ? (this.pessoa.cliente = true)
        : (this.pessoa.cliente = false);
      this.selected.includes("Fornecedor")
        ? (this.pessoa.fornecedor = true)
        : (this.pessoa.fornecedor = false);
      this.selected.includes("Transportadora")
        ? (this.pessoa.transportadora = true)
        : (this.pessoa.transportadora = false);

      axios[method](url, this.pessoa)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.modalStore.pessoas.visible = false;

          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
            "PESSOAS",
            `Usuário ${this.usuarioStore.currentUsuario.nome} ${
              method === "post" ? "ADICIONOU" : "ALTEROU"
            } a pessoa ${this.pessoa.nome}`
          );
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>
