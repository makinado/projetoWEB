<template>
  <div class="add-empresa">
    <v-layout row justify-center>
      <v-dialog v-model="modalStore.usuarios.visible" lazy persistent max-width="900px">
        <v-card v-if="modalStore.usuarios.visible">
          <v-card-title>
            <span class="headline">{{ modalStore.usuarios.title }}</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-text-field label="id" v-model="usuario.id" v-show="false"></v-text-field>

              <v-form v-model="valid" ref="form">
                <v-flex xs12 sm4>
                  <v-autocomplete
                    class="tag-input"
                    dense
                    chips
                    deletable-chips
                    :color="color"
                    label="Perfil do usuário"
                    v-model="usuario.id_perfil"
                    :items="usuarioStore.perfis"
                    prepend-icon="fa fa-lg fa-plus-circle"
                    @click:prepend="modalStore.perfis.addPerfil = true"
                    :rules="perfilRules"
                  ></v-autocomplete>
                </v-flex>
              </v-form>

              <v-layout wrap>
                <v-flex xs12>
                  <v-tabs
                    v-model="tabIndex"
                    fixed-tabs
                    centered
                    color="#FFFFFF"
                    light
                    icons-and-text
                  >
                    <v-tabs-slider color="color"></v-tabs-slider>

                    <v-tab href="#tab-1">
                      BÁSICO
                      <v-icon>fa fa-lg fa-file</v-icon>
                    </v-tab>

                    <v-tab href="#tab-2">
                      Empresas
                      <v-icon>fa fa-lg fa-building</v-icon>
                    </v-tab>

                    <v-tab-item value="tab-1" class="tabs">
                      <v-card flat>
                        <v-card-text>
                          <v-container grid-list-md>
                            <v-form v-model="valid1" ref="form_basico">
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
                                    :rules="foneRules"
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
                            </v-form>
                          </v-container>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>

                    <v-tab-item value="tab-2" class="tabs">
                      <v-card flat>
                        <v-card-text>
                          <v-container grid-list-md>
                            <v-form v-model="valid2" ref="form_emp">
                              <v-layout wrap>
                                <v-flex xs12>
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
                                  ></v-autocomplete>
                                </v-flex>
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
            <v-btn color="blue darken-1" flat @click="modalStore.usuarios.visible = false">Fechar</v-btn>
            <v-btn color="blue darken-1" flat @click="save()">Salvar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </div>
</template>

<script>
import { urlBD, showError, formatDate, saveLog, loadEmpresas } from "@/global";
import axios from "axios";
import { mapState } from "vuex";

export default {
  name: "Add-Usuario",
  data: function() {
    return {
      valid: true,
      valid1: true,
      valid2: true,
      usuario: {},
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
      foneRules: [
        v => !!v || "Contato é obrigatório",
        v => (!!v && v.length > 12) || "Contato inválido"
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

      this.imageName = "";
      this.imageUrl = "";
      this.imageFile = "";

      this.$refs.form ? this.$refs.form.reset() : "";
      this.$refs.form_basico ? this.$refs.form_basico.reset() : "";
      this.$refs.form_emp ? this.$refs.form_emp.reset() : "";

      this.tabIndex = "tab-1";
    },
    async loadTela(usuario) {
      loadEmpresas();

      if (!usuario) return;
      let url = `${urlBD}/usuarios`;
      if (usuario.id) {
        await axios
          .get(`${url}/${usuario.id}`)
          .then(res => {
            this.usuario = res.data;

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
    save() {
      if (!this.$refs.form.validate()) return;
      if (!this.$refs.form_basico.validate()) {
        this.tabIndex = "tab-1";
        return;
      }
      if (!this.$refs.form_emp.validate()) {
        this.tabIndex = "tab-2";
        return;
      }

      const method = this.usuario.id ? "put" : "post";
      const id = this.usuario.id ? this.usuario.id : "";
      const urlUsuario = `${urlBD}/usuarios/${id}`;

      this.usuario.empresas = this.usuario.empresas.map(empresa => {
        empresa = empresa.value ? empresa.value : empresa;

        return empresa;
      });

      if (this.imageFile) {
        const fd = new FormData();
        fd.append("img", this.imageFile, this.imageName);
        axios
          .post(`${urlBD}/uploadIMG`, fd)
          .then(res => {
            this.usuario.img = res.data;
            axios[method](urlUsuario, this.usuario)
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
        axios[method](urlUsuario, this.usuario)
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
