<template>
  <v-parallax :src="require('@/assets/predios2.jpg')" height="1000" alt="fundo_img">
    <v-container fluid class="container-parallax">
      <v-layout row>
        <v-flex xs12 md6>
          <v-layout justify-center align-center>
            <v-card width="500px" class="elevation-20">
              <v-card-title>
                <v-layout justify-center>
                  <span class="headline">Recuperação de senha solicitada</span>
                </v-layout>
              </v-card-title>
              <v-card-text>
                <v-form v-model="valid" ref="form">
                  <v-text-field
                    ref="senha"
                    v-model="usuario.email"
                    prepend-icon="fa fa-key"
                    label="Senha"
                    type="password"
                    :color="color"
                    @keyup.enter="$refs.confirma_senha.focus()"
                  ></v-text-field>
                  <v-text-field
                    ref="confirma_senha"
                    v-model="usuario.confirma_senha"
                    id="password"
                    prepend-icon="fa fa-lock"
                    label="Senha"
                    type="password"
                    :color="color"
                    @keyup.enter="recoverPassword"
                  ></v-text-field>
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
                        @click="[recoverPassword() ]"
                      >Enviar</v-btn>
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
import { urlBD, showError, usuarioKey } from "@/global";
import axios from "axios";
import { mapState } from "vuex";

export default {
  name: "recover-password",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["modalStore", "usuarioStore", "empresaStore"])
  },
  data: function() {
    return {
      valid: true,
      isLoading: false,
      usuario: {}
    };
  },
  methods: {
    recoverPassword() {
      // this.isLoading = true;
      // axios
      //   .post(`${urlBD}/recoverPassword`, { email: this.usuario.email })
      //   .then(res => {
      //     this.$toasted.global.defaultSuccess();
      //   })
      //   .catch(showError)
      //   .then(() => (this.isLoading = false));
    }
  }
};
</script>

<style>
.container-parallax {
  margin-top: 180px;
}
</style>