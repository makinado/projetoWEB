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
                  <span class="headline">{{showForgotPassword ? "Recuperar senha" : "Entrar"}}</span>
                </v-layout>
              </v-card-title>
              <v-card-text>
                <v-form v-model="valid" ref="form">
                  <v-text-field
                    ref="email"
                    v-model="usuario.email"
                    prepend-icon="fa fa-user"
                    name="login"
                    label="E-mail"
                    type="text"
                    :color="color"
                    @keyup.enter="showForgotPassword ? recoverPassword() :$refs.senha.focus()"
                  ></v-text-field>
                  <v-text-field
                    ref="senha"
                    v-show="!showForgotPassword"
                    v-model="usuario.senha"
                    id="password"
                    prepend-icon="fa fa-lock"
                    name="password"
                    label="Senha"
                    type="password"
                    :color="color"
                    @keyup.enter="signin"
                  ></v-text-field>
                  <v-layout v-show="!showForgotPassword" justify-center wrap>
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
                        @click="[showForgotPassword ? recoverPassword() : signin()]"
                      >{{ showForgotPassword ? "Enviar" : "Entrar" }}</v-btn>
                    </v-layout>
                    <v-divider class="mb-4" />
                  </v-flex>
                  <v-flex xs12 v-show="!showForgotPassword">
                    <v-layout align-center justify-center>
                      <v-btn v-facebook-signin-button="appId" color="#4267B2" dark large>
                        <v-icon class="mr-2">fa fa-facebook</v-icon>
                        <span>Facebook</span>
                      </v-btn>
                      <v-btn v-google-signin-button="clientId" color="#E44134" dark large>
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
                        @click="[showForgotPassword ? showForgotPassword = false : '']"
                      >
                        <span>{{showForgotPassword ? "Voltar" : "Não possuo login"}}</span>
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
import GoogleSignInButton from "vue-google-signin-button-directive";
import FacebookSignInButton from "vue-facebook-signin-button-directive";

import { urlBD, showError, usuarioKey } from "@/global";
import axios from "axios";
import { mapState } from "vuex";

export default {
  directives: {
    GoogleSignInButton,
    FacebookSignInButton
  },
  name: "Auth",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["modalStore", "usuarioStore", "empresaStore"])
  },
  data: function() {
    return {
      clientId:
        "53939190937-uk5vdlanvqab009o2plhgcshv01tb909.apps.googleusercontent.com",
      appId: "2495008730618015",
      showSignup: false,
      showForgotPassword: false,
      valid: true,
      isLoading: false,
      usuario: {}
    };
  },
  methods: {
    signin() {
      this.isLoading = true;
      axios
        .post(`${urlBD}/signin`, this.usuario)
        .then(res => {
          this.$store.commit("setUsuario", res.data);
          localStorage.setItem(usuarioKey, JSON.stringify(res.data));

          axios
            .get(
              `${urlBD}/usuarioEmpresas/${this.usuarioStore.currentUsuario.id}`
            )
            .then(res => {
              this.empresaStore.currentEmpresas = res.data;
              this.$store.commit(
                "setEmpresa",
                this.empresaStore.currentEmpresas[0]
              );
            });

          axios
            .get(`${urlBD}/perfis/${res.data.id_perfil}`)
            .then(res => {
              this.$store.commit("setPerfil", res.data);
            })
            .catch(showError);

          this.$router.push({ path: "/" });
        })
        .catch(showError)
        .then(() => (this.isLoading = false));
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
    },
    OnGoogleAuthSuccess(idToken) {
      console.log(idToken);
    },
    OnGoogleAuthFail(error) {
      console.log(error);
    },
    OnFacebookAuthSuccess(idToken) {
      console.log(idToken);
    },
    OnFacebookAuthFail(error) {
      console.log(error);
    }
  }
};
</script>

<style>
.container-parallax {
  margin-top: 180px;
}
</style>