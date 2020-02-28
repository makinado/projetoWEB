<template>
  <v-parallax :src="require('@/assets/predios2.jpg')" height="1000" alt="fundo_img">
    <v-container fluid class="container-parallax">
      <v-layout row>
        <v-flex
          xs12
          md6
          v-if="!($vuetify.breakpoint.name === 'xs' || $vuetify.breakpoint.name === 'sm')"
        >
          <v-layout align-center justify-center>
            <v-card width="800px" dark flat class="transparent">
              <v-layout align-center justify-center>
                <img src="@/assets/logo.png" alt="Vuetify.js" height="200" />
              </v-layout>
              <v-card-title class="display-3">Aki vai vir uma frase top que ainda não sei qual é</v-card-title>
              <v-card-title
                sescondary-title
                class="display-1"
              >Sério mano, vai ser uma frase braba memo</v-card-title>
            </v-card>
          </v-layout>
        </v-flex>
        <v-flex xs12 md6>
          <v-layout justify-center align-center>
            <v-card width="500px" class="elevation-20">
              <v-card-title>
                <v-layout justify-center>
                  <span
                    class="headline"
                  >{{showForgotPassword ? "Recuperar senha" : showSignup ? "Cadastre-se" : "Entrar"}}</span>
                </v-layout>
              </v-card-title>
              <v-card-text>
                <v-form v-model="valid" ref="form">
                  <v-text-field
                    v-if="showSignup"
                    ref="nome"
                    v-model="usuario.nome"
                    prepend-icon="fa fa-user"
                    label="Nome"
                    type="text"
                    :color="color"
                    @keyup.enter="showForgotPassword ? recoverPassword() : $refs.senha.focus()"
                    :rules="nomeRules"
                  ></v-text-field>
                  <v-text-field
                    ref="email"
                    v-model="usuario.email"
                    prepend-icon="fa fa-envelope"
                    label="E-mail"
                    type="text"
                    :color="color"
                    @keyup.enter="showForgotPassword ? recoverPassword() : $refs.senha.focus()"
                    :rules="emailRules"
                  ></v-text-field>
                  <v-text-field
                    ref="senha"
                    v-show="!showForgotPassword"
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
                    <v-btn color="secondary" flat @click="showForgotPassword = !showForgotPassword">
                      <span>Esqueci minha senha</span>
                    </v-btn>
                  </v-layout>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-layout wrap>
                  <v-flex xs12>
                    <v-layout align-center justify-center>
                      <v-btn
                        :loading="isLoading"
                        :class="color"
                        large
                        @click="[showForgotPassword ? recoverPassword() : showSignup ? signup() : signin()]"
                      >{{ showForgotPassword ? "Enviar" : showSignup ? "Cadastrar" : "Entrar" }}</v-btn>
                    </v-layout>
                    <v-divider class="mb-4" />
                  </v-flex>
                  <v-flex xs12 v-show="!showForgotPassword">
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
                  </v-flex>
                  <v-flex xs12>
                    <v-layout justify-center>
                      <v-btn
                        class="mb-4 mt-3"
                        type="submit"
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
    </v-container>
  </v-parallax>
</template>

<script>
import { urlBD, showError, usuarioKey } from "@/global";
import axios from "axios";
import { mapState } from "vuex";

import firebase from "firebase";

export default {
  name: "Auth",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["modalStore", "usuarioStore", "empresaStore"])
  },
  data: function() {
    return {
      showSignup: false,
      showForgotPassword: false,
      valid: true,
      isLoading: false,
      usuario: {},
      nomeRules: [v => !!v || "Nome é obrigatório"],
      emailRules: [
        v => !!v || "Email é obrigatório",
        v => (v ? /.+@.+\..+/.test(v) || "E-mail inválido" : true)
      ],
      senhaRules: [
        v => !!v || "Senha é obrigatória",
        v => (!!v && v.length >= 6) || "Senha deve ter no mínimo 6 caracteres"
      ],
      confirmaSenhaRules: [
        v => !!v || "Confirmação de senha é obrigatória",
        v => (!!v && v.length >= 6) || "Senha deve ter no mínimo 6 caracteres",
        v => (!!v && v === this.usuario.senha) || "Senhas não conferem"
      ]
    };
  },
  methods: {
    afterSignIn(usuario) {
      this.$store.commit("setUsuario", usuario);
      localStorage.setItem(usuarioKey, JSON.stringify(usuario));
      socket.emit("login", usuario);

      axios.get(`${urlBD}/usuarioEmpresas/${usuario.id}`).then(res => {
        this.empresaStore.currentEmpresas = res.data;
        this.$store.commit("setEmpresa", res.data[0].value);
      });

      axios
        .get(`${urlBD}/perfis/${usuario.id_perfil}`)
        .then(res => {
          this.$store.commit("setPerfil", res.data);
        })
        .catch(showError);

      this.$router.push({ path: "/" });
    },
    signin() {
      if (!this.$refs.form.validate()) return;

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
      if (!this.$refs.form.validate()) return;

      this.isLoading = true;
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.usuario.email, this.usuario.senha)
        .then(data => {
          console.log(data.user);
        })
        .catch(e => {
          if (e.code == "auth/weak-password")
            return showError("Senha muito fraca");
        })
        .then(() => (this.isLoading = false));

      // this.usuario.id_perfil = 1;

      // axios
      //   .post(`${urlBD}/signup`, this.usuario)
      //   .then(() => {
      //     this.$toasted.global.defaultSuccess();
      //     this.usuario = {};
      //     this.showSignup = false;
      //   })
      //   .catch(showError)
      //   .then(() => (this.isLoading = false));
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