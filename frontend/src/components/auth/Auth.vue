<template>
  <v-parallax :src="require('@/assets/predios2.jpg')" height="1080" alt="fundo_img">
    <v-container fluid class="container-parallax">
      <kinesis-container>
        <v-layout row>
          <v-flex
            xs12
            md6
            v-if="!($vuetify.breakpoint.name === 'xs' || $vuetify.breakpoint.name === 'sm')"
          >
            <v-layout align-center justify-center>
              <v-card width="800px" dark flat class="transparent">
                <v-layout align-center justify-center>
                  <kinesis-element :strength="20">
                    <img src="@/assets/logo.png" alt="Vuetify.js" height="200" />
                  </kinesis-element>
                </v-layout>
                <v-card-title
                  class="display-1"
                >Bem-vindo ao sistema financeiro online da Campag informática!</v-card-title>
              </v-card>
            </v-layout>
          </v-flex>

          <v-flex xs12 md6>
            <v-layout justify-center>
              <v-card
                :style="showSignup? 'top: -80px;' : 'top: 0px;'"
                width="500px"
                class="elevation-20"
              >
                <v-card-title>
                  <v-layout justify-center>
                    <span
                      class="headline"
                    >{{showForgotPassword ? "Recuperar senha" : showSignup ? "Cadastre-se" : "Entrar"}}</span>
                  </v-layout>
                </v-card-title>

                <v-card-text v-if="!showSignup">
                  <v-form v-model="valid" ref="form_login">
                    <v-text-field
                      ref="email"
                      v-model="usuario.email"
                      prepend-icon="fa fa-envelope"
                      label="E-mail"
                      :color="color"
                      @keyup.enter="showForgotPassword ? recoverPassword() : $refs.senha.focus()"
                      :rules="emailRules"
                    ></v-text-field>
                    <v-text-field
                      ref="senha"
                      v-if="!showForgotPassword"
                      v-model="usuario.senha"
                      prepend-icon="fa fa-lock"
                      label="Senha"
                      type="password"
                      :color="color"
                      @keyup.enter="showSignup ? $refs.confirmaSenha.focus() : signin()"
                      :rules="senhaRules"
                    ></v-text-field>
                    <v-text-field
                      v-if="showSignup"
                      ref="confirmaSenha"
                      v-show="!showForgotPassword"
                      v-model="usuario.confirmaSenha"
                      prepend-icon="fa fa-lock"
                      label="Confirme a senha"
                      type="password"
                      :color="color"
                      @keyup.enter="signup"
                      :rules="confirmaSenhaRules"
                    ></v-text-field>
                    <v-layout v-if="!showForgotPassword && !showSignup" justify-center wrap>
                      <v-btn
                        color="secondary"
                        flat
                        @click="showForgotPassword = !showForgotPassword"
                      >
                        <span>Esqueci minha senha</span>
                      </v-btn>
                    </v-layout>
                  </v-form>
                </v-card-text>

                <v-card-text v-else>
                  <v-tabs v-model="stepper" centered color="#FFFFFF" light icons-and-text>
                    <v-tabs-slider color="primary"></v-tabs-slider>

                    <v-tab href="#1">
                      Usuário
                      <v-icon>fa fa-lg fa-user</v-icon>
                    </v-tab>

                    <v-tab href="#2">
                      Empresa
                      <v-icon>fa fa-lg fa-building-o</v-icon>
                    </v-tab>

                    <v-tab-item value="1">
                      <v-form v-model="valid" ref="form_usuario" class="my-4">
                        <v-text-field
                          ref="nome"
                          v-model="usuario.nome"
                          prepend-icon="fa fa-user"
                          label="Nome"
                          :color="color"
                          @keyup.enter="$refs.email.focus()"
                          :rules="nomeRules"
                        ></v-text-field>
                        <v-text-field
                          ref="email"
                          v-model="usuario.email"
                          prepend-icon="fa fa-envelope"
                          label="E-mail"
                          :color="color"
                          @keyup.enter="$refs.contato.focus()"
                          :rules="emailRules"
                        ></v-text-field>
                        <v-text-field
                          ref="contato"
                          v-model="usuario.contato"
                          prepend-icon="fa fa-phone"
                          label="Contato pessoal"
                          v-mask="['(##) ####-####', '(##) #####-####']"
                          :color="color"
                          @keyup.enter="$refs.senha.focus()"
                          :rules="contatoRules"
                        ></v-text-field>
                        <v-text-field
                          ref="senha"
                          v-model="usuario.senha"
                          prepend-icon="fa fa-lock"
                          label="Senha"
                          type="password"
                          :color="color"
                          @keyup.enter="$refs.confirmaSenha.focus()"
                          :rules="senhaRules"
                        ></v-text-field>
                        <v-text-field
                          v-if="showSignup"
                          ref="confirmaSenha"
                          v-show="!showForgotPassword"
                          v-model="usuario.confirmaSenha"
                          prepend-icon="fa fa-lock"
                          label="Confirme a senha"
                          type="password"
                          :color="color"
                          @keyup.enter="signup"
                          :rules="confirmaSenhaRules"
                        ></v-text-field>
                      </v-form>
                      <!-- <v-flex xs12>
                      <v-layout align-center justify-center>
                        <v-btn color="#4267B2" dark large @click="socialLogin('facebook')">
                          <v-icon class="mr-2">fa fa-facebook</v-icon>
                          <span>Facebook</span>
                        </v-btn>
                        <v-btn color="#E44134" dark large @click="socialLogin('google')">
                          <v-icon class="mr-2">fa fa-google</v-icon>
                          <span>Google</span>
                        </v-btn>
                      </v-layout>
                      </v-flex>-->
                    </v-tab-item>

                    <v-tab-item value="2">
                      <v-form v-model="valid" ref="form_empresa">
                        <v-text-field
                          ref="cnpj"
                          v-model="usuario.cnpj"
                          prepend-icon="fa fa-file-text"
                          label="CNPJ"
                          :color="color"
                          v-mask="['##.###.###/####-##']"
                          @keyup.enter="$refs.nome_empresa.focus()"
                          :rules="cnpjRules"
                        ></v-text-field>
                        <v-text-field
                          ref="nome_empresa"
                          v-model="usuario.nomeEmpresa"
                          prepend-icon="fa fa-building-o"
                          label="Razão social"
                          :color="color"
                          @keyup.enter="$refs.email_empresa.focus()"
                          :rules="nomeRules"
                        ></v-text-field>
                        <v-text-field
                          ref="email_empresa"
                          v-model="usuario.emailEmpresa"
                          prepend-icon="fa fa-envelope"
                          label="E-mail empresarial (opcional)"
                          :color="color"
                          @keyup.enter="$refs.contato_empresa.focus()"
                          :rules="emailOptionalRules"
                        ></v-text-field>
                        <v-text-field
                          ref="contato_empresa"
                          v-model="usuario.contatoEmpresa"
                          prepend-icon="fa fa-phone"
                          label="Contato (opcional)"
                          :color="color"
                          v-mask="['(##) ####-####', '(##) #####-####']"
                          @keyup.enter="signup"
                          :rules="contatoRules"
                        ></v-text-field>
                      </v-form>
                    </v-tab-item>
                  </v-tabs>
                </v-card-text>

                <v-card-actions>
                  <v-layout wrap>
                    <v-flex xs12>
                      <v-layout align-center justify-center>
                        <v-btn
                          :loading="isLoading"
                          :class="color"
                          large
                          @click="[showForgotPassword ? recoverPassword() : showSignup? signup() : signin()]"
                        >{{ showForgotPassword ? "Enviar" : showSignup? "Continuar" :"Entrar" }}</v-btn>
                      </v-layout>
                      <v-divider class="my-4" />
                    </v-flex>
                    <v-flex xs12>
                      <v-layout justify-center>
                        <v-btn
                          class="mb-4 mt-3"
                          color="secondary"
                          flat
                          @click="[showForgotPassword ? showForgotPassword = false : showSignup ? showSignup = false : showSignup = true]"
                        >
                          <span>{{showForgotPassword ? "Voltar" : showSignup ? "Já possuo login" : "Não possuo login"}}</span>
                        </v-btn>
                      </v-layout>
                    </v-flex>
                  </v-layout>
                </v-card-actions>
              </v-card>
            </v-layout>
          </v-flex>
        </v-layout>
      </kinesis-container>
    </v-container>
  </v-parallax>
</template>

<script>
import { urlBD, showError, usuarioKey, funcionarioKey } from "@/global";
import axios from "axios";
import { mapState } from "vuex";

import { isCNPJ } from "brazilian-values";
import { KinesisContainer, KinesisElement } from "vue-kinesis";

import firebase from "firebase";

export default {
  name: "Auth",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["modalStore", "usuarioStore", "empresaStore"])
  },
  components: {
    KinesisContainer,
    KinesisElement
  },
  data() {
    return {
      stepper: 1,
      showFunc: false,
      showSignup: false,
      showForgotPassword: false,
      valid: true,
      valid2: true,
      isLoading: false,
      usuario: {},
      nomeRules: [v => !!v || "Nome é obrigatório"],
      emailRules: [
        v => !!v || "Email é obrigatório",
        v => (v ? /.+@.+\..+/.test(v) || "E-mail inválido" : true)
      ],
      senhaMestreRules: [v => !!v || "Senha mestre é obrigatória"],
      senhaRules: [
        v => !!v || "Senha é obrigatória",
        v => (!!v && v.length >= 6) || "Senha deve ter no mínimo 6 caracteres"
      ],
      confirmaSenhaRules: [
        v => !!v || "Confirmação de senha é obrigatória",
        v => (!!v && v.length >= 6) || "Senha deve ter no mínimo 6 caracteres",
        v => (!!v && v === this.usuario.senha) || "Senhas não conferem"
      ],
      emailOptionalRules: [
        v => (v ? /.+@.+\..+/.test(v) || "E-mail inválido" : true)
      ],
      contatoRules: [v => (!!v && v.length >= 14) || "Contato inválido"],
      cnpjRules: [v => (!!v && isCNPJ(v)) || "CNPJ inválido"]
    };
  },
  methods: {
    afterSignIn(usuario) {
      this.$store.commit("setUsuario", usuario);
      localStorage.setItem(usuarioKey, JSON.stringify(usuario));
      this.$socket.emit("login", {
        id: usuario.id,
        nome: usuario.nome
      });

      console.log(this.usuarioStore.currentusuario);

      axios
        .get(`${urlBD}/usuarioEmpresas/${this.usuarioStore.currentUsuario.id}`)
        .then(res => {
          this.empresaStore.currentEmpresas = res.data;
          this.$store.commit(
            "setEmpresa",
            this.empresaStore.currentEmpresas[0].value
          );
        });

      this.$router.push({ path: "/" });
    },
    signin() {
      if (!this.$refs.form_login.validate()) return;

      this.isLoading = true;
      axios
        .post(`${urlBD}/signin`, this.usuario)
        .then(res => {
          this.afterSignIn(res.data);
        })
        .catch(showError)
        .then(() => (this.isLoading = false));
    },
    signup() {
      if (!this.$refs.form_usuario.validate()) {
        return (this.stepper = "1");
      }
      if (!this.$refs.form_empresa.validate()) {
        return (this.stepper = "2");
      }

      this.isLoading = true;

      axios
        .post(`${urlBD}/signup`, this.usuario)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.showSignup = false;
        })
        .catch(showError)
        .then(() => (this.isLoading = false));
    },
    socialLogin(method) {
      if (!method) return;
      this.socialLoading = true;

      var provider;

      if (method == "google") provider = new firebase.auth.GoogleAuthProvider();
      else provider = new firebase.auth.FacebookAuthProvider();

      firebase
        .auth()
        .signInWithPopup(provider)
        .then(data => {
          const token = data.credential.accessToken;
          console.log(data);
        })
        .catch(showError)
        .then(() => (this.socialLoading = false));
    },
    recoverPassword() {
      this.isLoading = true;
      axios
        .post(`${urlBD}/recoverPassword`, { email: this.usuario.email })
        .then(res => {
          this.$toasted.global.defaultSuccess();
        })
        .catch(showError)
        .then(() => (this.isLoading = false));
    }
  }
};
</script>

<style>
.container-parallax {
  margin-top: 180px;
}
</style>