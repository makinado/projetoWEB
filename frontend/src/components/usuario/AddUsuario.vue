<template>
  <v-dialog
    v-model="modalStore.usuarios.visible"
    fullscreen
    persistent
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card v-if="modalStore.usuarios.visible">
      <v-toolbar dense flat extended fixed extension-height="5" dark :color="color">
        <v-toolbar-side-icon @click="modalStore.usuarios.visible = false">
          <v-icon>close</v-icon>
        </v-toolbar-side-icon>
        <v-toolbar-title
          class="headline white--text font-weight-light"
        >{{ modalStore.usuarios.title }}</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-tooltip bottom>
          <v-btn slot="activator" class="mr-3" icon @click="reset">
            <v-icon>fa fa-2x fa-eraser</v-icon>
          </v-btn>
          <span>Limpar tela</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn slot="activator" class="mr-3" icon @click="save">
            <v-icon>fa fa-2x fa-check</v-icon>
          </v-btn>
          <span>Salvar usuário</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn slot="activator" class="mr-3" icon>
            <v-icon>fa fa-2x fa-cog</v-icon>
          </v-btn>
          <span>Configurações</span>
        </v-tooltip>
      </v-toolbar>

      <v-card-text>
        <v-container fluid grid-list-xl class="my-5">
          <v-container fluid>
            <v-form v-model="valid1" ref="form_basico">
              <v-layout justify-start wrap class="bege">
                <v-flex xs12>
                  <v-card flat>
                    <v-layout justify-center wrap>
                      <v-card-title>
                        <span class="headline">Dados do usuario</span>
                      </v-card-title>
                      <v-card-text>
                        <v-container grid-list-xl>
                          <v-layout wrap>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Nome*"
                                v-model="usuario.nome"
                                :rules="nameRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                color="primary"
                                label="Imagem de perfil"
                                prepend-icon="fa fa-lg fa-folder-open-o"
                                readonly
                                v-model="imageName"
                                @click="pickFile"
                              ></v-text-field>
                              <input
                                name="file"
                                type="file"
                                style="display: none"
                                ref="image"
                                accept="image/*"
                                @change="onFilePicked"
                              />
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="E-mail*"
                                v-model="usuario.email"
                                :rules="emailRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Contato"
                                v-mask="['(##)####-####','(##)#####-####']"
                                v-model="usuario.contato"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Senha*"
                                type="password"
                                v-model="usuario.senha"
                                :rules="senhaRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Confirmar senha*"
                                type="password"
                                v-model="usuario.confirmaSenha"
                                :rules="confirmaSenhaRules"
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
                <v-icon class="mt-4 mr-2">fa fa-2x fa-key</v-icon>
                <h2>Acesso</h2>
              </v-layout>
              <v-divider class="my-3"></v-divider>
            </v-flex>

            <v-form v-model="valid1" ref="form_acesso">
              <v-layout wrap>
                <v-flex xs12 md6>
                  <v-autocomplete
                    class="tag-input"
                    multiple
                    dense
                    chips
                    deletable-chips
                    :color="color"
                    label="Selecione as empresas que o usuário terá acesso*"
                    v-model="usuario.empresas"
                    :items="empresaStore.empresas"
                    :menu-props="{ maxHeight: '300' }"
                    persistent-hint
                    :rules="empresaRules"
                    @focus="$store.dispatch('loadEmpresas')"
                  ></v-autocomplete>
                </v-flex>
                <v-flex xs12>
                  <v-switch label="Selecionar tudo" :color="color" @change="selectAll"></v-switch>

                  <v-layout row wrap>
                    <v-flex xs12 sm4 md2 v-for="opcao in opcoes" :key="opcao.nome">
                      <v-card :class="'primary--text'">
                        <v-card-title class="subheading font-weight-bold">
                          <span>{{ opcao.text }}</span>

                          <v-spacer></v-spacer>

                          <v-checkbox :color="color" @change="selectCard($event, opcao.nome)"></v-checkbox>
                        </v-card-title>

                        <v-list dense>
                          <v-list-tile v-for="acao in acoes" :key="acao.text">
                            <v-list-tile-action>
                              <v-checkbox :color="color" v-model="acessos[opcao.nome + acao.nome]"></v-checkbox>
                            </v-list-tile-action>
                            <v-list-tile-content class="align-start">{{ acao.text }}</v-list-tile-content>
                          </v-list-tile>
                        </v-list>
                      </v-card>
                    </v-flex>

                    <v-flex xs12 sm4 md2>
                      <v-card :class="'primary--text'">
                        <v-card-title class="subheading font-weight-bold">
                          <span>Relatórios</span>

                          <v-spacer></v-spacer>

                          <v-checkbox :color="color" @change="selectCard($event, 'relatorios')"></v-checkbox>
                        </v-card-title>

                        <v-list dense>
                          <v-list-tile>
                            <v-list-tile-action>
                              <v-checkbox :color="color" v-model="acessos.rel_cadastros"></v-checkbox>
                            </v-list-tile-action>
                            <v-list-tile-content class="align-start">Cadastros</v-list-tile-content>
                          </v-list-tile>
                          <v-list-tile>
                            <v-list-tile-action>
                              <v-checkbox :color="color" v-model="acessos.rel_compras"></v-checkbox>
                            </v-list-tile-action>
                            <v-list-tile-content class="align-start">Compras</v-list-tile-content>
                          </v-list-tile>
                          <v-list-tile>
                            <v-list-tile-action>
                              <v-checkbox :color="color" v-model="acessos.rel_vendas"></v-checkbox>
                            </v-list-tile-action>
                            <v-list-tile-content class="align-start">Vendas</v-list-tile-content>
                          </v-list-tile>
                          <v-list-tile>
                            <v-list-tile-action>
                              <v-checkbox :color="color" v-model="acessos.rel_estoque"></v-checkbox>
                            </v-list-tile-action>
                            <v-list-tile-content class="align-start">Estoque</v-list-tile-content>
                          </v-list-tile>
                          <v-list-tile>
                            <v-list-tile-action>
                              <v-checkbox :color="color" v-model="acessos.rel_financeiro"></v-checkbox>
                            </v-list-tile-action>
                            <v-list-tile-content class="align-start">Financeiro</v-list-tile-content>
                          </v-list-tile>
                          <v-list-tile>
                            <v-list-tile-action>
                              <v-checkbox :color="color" v-model="acessos.rel_estat"></v-checkbox>
                            </v-list-tile-action>
                            <v-list-tile-content class="align-start">Estatísticas</v-list-tile-content>
                          </v-list-tile>
                        </v-list>
                      </v-card>
                    </v-flex>

                    <v-flex xs12 sm4 md2>
                      <v-card :class="'primary--text'">
                        <v-card-title class="subheading font-weight-bold">
                          <span>Outros</span>

                          <v-spacer></v-spacer>

                          <v-checkbox :color="color" @change="selectCard($event, 'outros')"></v-checkbox>
                        </v-card-title>

                        <v-list dense>
                          <v-list-tile>
                            <v-list-tile-action>
                              <v-checkbox :color="color" v-model="acessos.agenda"></v-checkbox>
                            </v-list-tile-action>
                            <v-list-tile-content class="align-start">Agenda</v-list-tile-content>
                          </v-list-tile>
                          <v-list-tile>
                            <v-list-tile-action>
                              <v-checkbox :color="color" v-model="acessos.atividades"></v-checkbox>
                            </v-list-tile-action>
                            <v-list-tile-content class="align-start">Atividades</v-list-tile-content>
                          </v-list-tile>
                          <v-list-tile>
                            <v-list-tile-action>
                              <v-checkbox :color="color" v-model="acessos.configuracoes"></v-checkbox>
                            </v-list-tile-action>
                            <v-list-tile-content class="align-start">Configurações</v-list-tile-content>
                          </v-list-tile>
                        </v-list>
                      </v-card>
                    </v-flex>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { urlBD, showError, formatDate, saveLog } from "@/global";
import axios from "axios";
import { mapState } from "vuex";

export default {
  name: "Add-Usuario",
  data: function() {
    return {
      pagination: {
        page: 1,
        rowsPerPage: 20, // -1 for All,
        sortBy: "path",
        groupBy: "group",
        totalItems: 0
      },
      valid: true,
      valid1: true,
      valid2: true,
      usuario: {},
      acessos: {},
      opcoes: [
        { nome: "empresa", text: "Empresa" },
        { nome: "usuario", text: "Usuário" },
        { nome: "pessoa", text: "Pessoa" },
        { nome: "produto", text: "Produto" },
        { nome: "pedidos", text: "Pedidos" },
        { nome: "compras", text: "Compras" },
        { nome: "vendas", text: "Vendas" },
        { nome: "pdv", text: "PDV" },
        { nome: "financeiro", text: "Financeiro" },
        { nome: "contas", text: "Contas" },
        { nome: "nfe", text: "NF-e" },
        { nome: "nfce", text: "NFC-e" },
        { nome: "mdfe", text: "MDF-e" }
      ],
      acoes: [
        { nome: "_create", text: "Adicionar" },
        { nome: "_read", text: "Acessar" },
        { nome: "_update", text: "Alterar" },
        { nome: "_delete", text: "Excluir" }
      ],
      imageName: "",
      imageUrl: "",
      imageFile: "",
      tabIndex: 0,
      fields: [
        { key: "id", label: "Código", sortable: true },
        { key: "cnpj", label: "CNPJ", sortable: true },
        { key: "nome", label: "Razão social", sortable: true }
      ],
      perfilRules: [v => !!v || "Perfil é obrigatório"],
      nameRules: [
        v => !!v || "Nome é obrigatório",
        v => (!!v && v.length >= 5) || "Nome deve ter no mínimo 5 caracteres"
      ],
      emailRules: [
        v => !!v || "E-mail é obrigatório",
        v => (!!v && /.+@.+\..+/.test(v)) || "E-mail inválido"
      ],
      senhaRules: [
        v => !!v || "Senha é obrigatória",
        v => (!!v && v.length >= 6) || "Senha deve ter no mínimo 6 caracteres"
      ],
      confirmaSenhaRules: [
        v => !!v || "Confirmação de senha é obrigatória",
        v => (!!v && v.length >= 6) || "Senha deve ter no mínimo 6 caracteres",
        v => (!!v && v === this.usuario.senha) || "Senhas não conferem"
      ],
      empresaRules: [v => (!!v && v.length > 0) || "Empresa é obrigatória"]
    };
  },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["usuarioStore", "empresaStore", "modalStore"])
  },
  watch: {
    "$store.state.modalStore.usuarios.visible": function() {
      if (this.modalStore.usuarios.visible) {
        this.reset();
        this.loadTela(this.usuarioStore.usuario);
      }
    }
  },
  methods: {
    reset() {
      this.usuario = {};
      this.acessos = {};

      this.imageName = "";
      this.imageUrl = "";
      this.imageFile = "";

      this.$refs.form_basico ? this.$refs.form_basico.reset() : "";
      this.$refs.form_acesso ? this.$refs.form_acesso.reset() : "";

      this.tabIndex = "tab-1";
    },
    async loadTela(usuario) {
      if (!usuario) return;

      this.$store.dispatch("loadEmpresas");
      let url = `${urlBD}/usuarios`;
      if (usuario.id) {
        await axios
          .get(`${url}/${usuario.id}`)
          .then(res => {
            this.usuario = res.data;
            this.acessos = this.usuario.acessos;
            delete this.usuario.acessos;

            this.imageName = this.usuario.img || "";
          })
          .catch(showError);
      }
    },
    pickFile() {
      this.$refs.image.click();
    },
    onFilePicked(e) {
      const files = e.target.files;
      if (files[0] !== undefined) {
        this.imageName = files[0].name;
        if (this.imageName.lastIndexOf(".") <= 0) {
          return;
        }
        const fr = new FileReader();
        fr.readAsDataURL(files[0]);
        fr.addEventListener("load", () => {
          this.imageUrl = fr.result;
          this.imageFile = files[0]; // this is an image file that can be sent to server...
        });
      } else {
        this.imageName = "";
        this.imageFile = "";
        this.imageUrl = "";
      }
    },
    selectCard(event, card) {
      if (event) {
        if (card == "outros") {
          this.$set(this.acessos, "agenda", true);
          this.$set(this.acessos, "atividades", true);
          this.$set(this.acessos, "configuracoes", true);
        } else if (card == "relatorios") {
          this.$set(this.acessos, "rel_cadastros", true);
          this.$set(this.acessos, "rel_compras", true);
          this.$set(this.acessos, "rel_vendas", true);
          this.$set(this.acessos, "rel_estoque", true);
          this.$set(this.acessos, "rel_financeiro", true);
          this.$set(this.acessos, "rel_estat", true);
        } else {
          this.$set(this.acessos, card + "_create", true);
          this.$set(this.acessos, card + "_read", true);
          this.$set(this.acessos, card + "_update", true);
          this.$set(this.acessos, card + "_delete", true);
        }
      } else {
        if (card == "outros") {
          this.$set(this.acessos, "agenda", false);
          this.$set(this.acessos, "atividades", false);
          this.$set(this.acessos, "configuracoes", false);
        } else if (card == "relatorios") {
          this.$set(this.acessos, "rel_cadastros", false);
          this.$set(this.acessos, "rel_compras", false);
          this.$set(this.acessos, "rel_vendas", false);
          this.$set(this.acessos, "rel_estoque", false);
          this.$set(this.acessos, "rel_financeiro", false);
          this.$set(this.acessos, "rel_estat", false);
        } else {
          this.$set(this.acessos, card + "_create", false);
          this.$set(this.acessos, card + "_read", false);
          this.$set(this.acessos, card + "_update", false);
          this.$set(this.acessos, card + "_delete", false);
        }
      }
    },
    selectAll(event) {
      if (event) {
        this.$set(this.acessos, "empresa_create", true);
        this.$set(this.acessos, "empresa_read", true);
        this.$set(this.acessos, "empresa_update", true);
        this.$set(this.acessos, "empresa_delete", true);

        this.$set(this.acessos, "usuario_create", true);
        this.$set(this.acessos, "usuario_read", true);
        this.$set(this.acessos, "usuario_update", true);
        this.$set(this.acessos, "usuario_delete", true);

        this.$set(this.acessos, "pessoa_create", true);
        this.$set(this.acessos, "pessoa_read", true);
        this.$set(this.acessos, "pessoa_update", true);
        this.$set(this.acessos, "pessoa_delete", true);

        this.$set(this.acessos, "produto_create", true);
        this.$set(this.acessos, "produto_read", true);
        this.$set(this.acessos, "produto_update", true);
        this.$set(this.acessos, "produto_delete", true);

        this.$set(this.acessos, "pedidos_create", true);
        this.$set(this.acessos, "pedidos_read", true);
        this.$set(this.acessos, "pedidos_update", true);
        this.$set(this.acessos, "pedidos_delete", true);

        this.$set(this.acessos, "compras_create", true);
        this.$set(this.acessos, "compras_read", true);
        this.$set(this.acessos, "compras_update", true);
        this.$set(this.acessos, "compras_delete", true);

        this.$set(this.acessos, "vendas_create", true);
        this.$set(this.acessos, "vendas_read", true);
        this.$set(this.acessos, "vendas_update", true);
        this.$set(this.acessos, "vendas_delete", true);

        this.$set(this.acessos, "pdv_create", true);
        this.$set(this.acessos, "pdv_read", true);
        this.$set(this.acessos, "pdv_update", true);
        this.$set(this.acessos, "pdv_delete", true);

        this.$set(this.acessos, "financeiro_create", true);
        this.$set(this.acessos, "financeiro_read", true);
        this.$set(this.acessos, "financeiro_update", true);
        this.$set(this.acessos, "financeiro_delete", true);

        this.$set(this.acessos, "contas_create", true);
        this.$set(this.acessos, "contas_read", true);
        this.$set(this.acessos, "contas_update", true);
        this.$set(this.acessos, "contas_delete", true);

        this.$set(this.acessos, "nfe_create", true);
        this.$set(this.acessos, "nfe_read", true);
        this.$set(this.acessos, "nfe_update", true);
        this.$set(this.acessos, "nfe_delete", true);

        this.$set(this.acessos, "nfce_create", true);
        this.$set(this.acessos, "nfce_read", true);
        this.$set(this.acessos, "nfce_update", true);
        this.$set(this.acessos, "nfce_delete", true);

        this.$set(this.acessos, "mdfe_create", true);
        this.$set(this.acessos, "mdfe_read", true);
        this.$set(this.acessos, "mdfe_update", true);
        this.$set(this.acessos, "mdfe_delete", true);

        this.$set(this.acessos, "agenda", true);
        this.$set(this.acessos, "atividades", true);
        this.$set(this.acessos, "configuracoes", true);

        this.$set(this.acessos, "rel_cadastros", true);
        this.$set(this.acessos, "rel_compras", true);
        this.$set(this.acessos, "rel_vendas", true);
        this.$set(this.acessos, "rel_estoque", true);
        this.$set(this.acessos, "rel_financeiro", true);
        this.$set(this.acessos, "rel_estat", true);
      } else {
        this.$set(this.acessos, "empresa_create", false);
        this.$set(this.acessos, "empresa_read", false);
        this.$set(this.acessos, "empresa_update", false);
        this.$set(this.acessos, "empresa_delete", false);

        this.$set(this.acessos, "usuario_create", false);
        this.$set(this.acessos, "usuario_read", false);
        this.$set(this.acessos, "usuario_update", false);
        this.$set(this.acessos, "usuario_delete", false);

        this.$set(this.acessos, "pessoa_create", false);
        this.$set(this.acessos, "pessoa_read", false);
        this.$set(this.acessos, "pessoa_update", false);
        this.$set(this.acessos, "pessoa_delete", false);

        this.$set(this.acessos, "produto_create", false);
        this.$set(this.acessos, "produto_read", false);
        this.$set(this.acessos, "produto_update", false);
        this.$set(this.acessos, "produto_delete", false);

        this.$set(this.acessos, "pedidos_create", false);
        this.$set(this.acessos, "pedidos_read", false);
        this.$set(this.acessos, "pedidos_update", false);
        this.$set(this.acessos, "pedidos_delete", false);

        this.$set(this.acessos, "compras_create", false);
        this.$set(this.acessos, "compras_read", false);
        this.$set(this.acessos, "compras_update", false);
        this.$set(this.acessos, "compras_delete", false);

        this.$set(this.acessos, "vendas_create", false);
        this.$set(this.acessos, "vendas_read", false);
        this.$set(this.acessos, "vendas_update", false);
        this.$set(this.acessos, "vendas_delete", false);

        this.$set(this.acessos, "pdv_create", false);
        this.$set(this.acessos, "pdv_read", false);
        this.$set(this.acessos, "pdv_update", false);
        this.$set(this.acessos, "pdv_delete", false);

        this.$set(this.acessos, "financeiro_create", false);
        this.$set(this.acessos, "financeiro_read", false);
        this.$set(this.acessos, "financeiro_update", false);
        this.$set(this.acessos, "financeiro_delete", false);

        this.$set(this.acessos, "contas_create", false);
        this.$set(this.acessos, "contas_read", false);
        this.$set(this.acessos, "contas_update", false);
        this.$set(this.acessos, "contas_delete", false);

        this.$set(this.acessos, "nfe_create", false);
        this.$set(this.acessos, "nfe_read", false);
        this.$set(this.acessos, "nfe_update", false);
        this.$set(this.acessos, "nfe_delete", false);

        this.$set(this.acessos, "nfce_create", false);
        this.$set(this.acessos, "nfce_read", false);
        this.$set(this.acessos, "nfce_update", false);
        this.$set(this.acessos, "nfce_delete", false);

        this.$set(this.acessos, "mdfe_create", false);
        this.$set(this.acessos, "mdfe_read", false);
        this.$set(this.acessos, "mdfe_update", false);
        this.$set(this.acessos, "mdfe_delete", false);

        this.$set(this.acessos, "agenda", false);
        this.$set(this.acessos, "atividades", false);
        this.$set(this.acessos, "configuracoes", false);

        this.$set(this.acessos, "rel_cadastros", false);
        this.$set(this.acessos, "rel_compras", false);
        this.$set(this.acessos, "rel_vendas", false);
        this.$set(this.acessos, "rel_estoque", false);
        this.$set(this.acessos, "rel_financeiro", false);
        this.$set(this.acessos, "rel_estat", false);
      }
    },
    save() {
      if (
        !this.$refs.form_basico.validate() ||
        !this.$refs.form_acesso.validate()
      )
        return;

      const method = this.usuario.id ? "put" : "post";
      const id = this.usuario.id ? this.usuario.id : "";
      const url = `${urlBD}/usuarios/${id}`;

      this.usuario.empresas = this.usuario.empresas.map(empresa => {
        empresa = empresa.value ? empresa.value : empresa;

        return empresa;
      });
      this.usuario.acessos = this.acessos;
      this.usuario.nome_base = this.usuarioStore.currentUsuario.nome_base;

      if (this.imageFile) {
        const fd = new FormData();
        fd.append("img", this.imageFile, this.imageName);
        axios
          .post(`${urlBD}/uploadIMG`, fd)
          .then(res => {
            this.usuario.img = res.data;
            axios[method](url, this.usuario)
              .then(res => {
                this.$toasted.global.defaultSuccess();
                saveLog(
                  new Date(),
                  method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
                  "USUÁRIOS",
                  `Usuário ${this.usuarioStore.currentUsuario.nome} ${
                    method === "post" ? "ADICIONOU" : "ALTEROU"
                  } o usuário ${this.usuario.nome}`
                );

                this.modalStore.usuarios.visible = false;
              })
              .catch(showError);
          })
          .catch(showError);
      } else {
        axios[method](url, this.usuario)
          .then(res => {
            this.$toasted.global.defaultSuccess();
            saveLog(
              new Date(),
              method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
              "USUÁRIOS",
              `Usuário ${this.usuarioStore.currentUsuario.nome} ${
                method === "post" ? "ADICIONOU" : "ALTEROU"
              } o usuário ${this.usuario.nome}`
            );

            this.modalStore.usuarios.visible = false;
          })
          .catch(showError);
      }
    }
  }
};
</script>

<style>
</style>
