<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex xs12 md8>
        <v-card class="mt-5">
          <v-card-title>
            <span class="headline">Editar perfil</span>
          </v-card-title>
          <v-card-text></v-card-text>
          <v-form v-model="valid" ref="form">
            <v-container py-0>
              <v-layout wrap>
                <v-flex xs12 md4>
                  <v-text-field
                    color="primary"
                    label="Nome*"
                    v-model="usuarioStore.currentUsuario.nome"
                    :rules="nameRules"
                  />
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field
                    color="primary"
                    label="E-mail*"
                    v-model="usuarioStore.currentUsuario.email"
                    :rules="emailRules"
                  />
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field
                    color="primary"
                    label="Contato"
                    v-mask="['(##)####-####','(##)#####-####']"
                    v-model="usuarioStore.currentUsuario.contato"
                    :rules="foneRules"
                  />
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field
                    color="primary"
                    label="Imagem de perfil"
                    prepend-icon="fa fa-lg fa-folder-open-o"
                    readonly
                    v-model="imageName"
                    :placeholder="usuarioStore.currentUsuario.img"
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
                <v-flex xs12 md4>
                  <v-text-field
                    color="primary"
                    label="Senha"
                    type="password"
                    v-model="usuarioStore.currentUsuario.senha"
                    :rules="senhaRules"
                  />
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field
                    color="primary"
                    label="Confirmação de senha"
                    type="password"
                    v-model="usuarioStore.currentUsuario.confirmaSenha"
                    :rules="confirmaSenhaRules"
                  />
                </v-flex>
                <v-flex xs12 text-xs-right>
                  <v-btn class="v-btn-common" color="primary" @click="save()">Atualizar</v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
        </v-card>
      </v-flex>
      <v-flex xs12 md4>
        <v-card class="mt-5 v-card-profile">
          <v-card-text class="text-xs-center">
            <v-avatar color="primary" class="mx-auto d-block avatar" size="180">
              <img
                v-if="usuarioStore.currentUsuario.img"
                :src="`${urlBD}/${usuarioStore.currentUsuario.img}`"
                alt="Imagem de perfil"
                height="50"
              />
              <v-icon v-else class="text-light">fa fa-user fa-4x</v-icon>
            </v-avatar>
            <h4 class="card-title font-weight-light">{{ usuario.nome }}</h4>
            <p class="card-description font-weight-light">
              A única maneira de fazer um bom trabalho é amando o que se faz.
              <i>Steve Jobs</i>.
            </p>
            <v-btn color="primary" round class="v-btn-common">Planos</v-btn>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { urlBD, showError, usuarioKey } from "@/global";
import axios from "axios";
import { mapState } from "vuex";

export default {
  name: "Usuario",
  computed: {
    ...mapState(["usuarioStore", "modalStore"])
  },
  data: function() {
    return {
      urlBD: urlBD,
      valid: true,
      usuario: {},
      imageName: "",
      imageUrl: "",
      imageFile: "",
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
        v => (!!v && v.length >= 4) || "Senha deve ter no mínimo 4 caracteres"
      ],
      confirmaSenhaRules: [
        v => !!v || "Confirmação de senha é obrigatória",
        v => (!!v && v.length >= 4) || "Senha deve ter no mínimo 4 caracteres",
        v =>
          (!!v && v === this.usuarioStore.currentUsuario.senha) ||
          "Senhas não conferem"
      ]
    };
  },
  methods: {
    reset() {
      this.usuario = {};
      this.$refs.form ? this.$refs.form.reset() : "";
    },
    save() {
      if (!this.$refs.form.validate()) return;

      this.usuario = { ...this.usuarioStore.currentUsuario };
      const id = this.usuario.id;
      const url = `${urlBD}/usuarios/${id}`;

      if (this.imageFile) {
        const fd = new FormData();
        fd.append("img", this.imageFile, this.imageName);
        axios
          .post(`${urlBD}/uploadIMG`, fd)
          .then(res => {
            this.usuario.img = res.data;
            axios
              .put(url, this.usuario)
              .then(() => {
                this.$toasted.global.defaultSuccess();
                this.signin();
                this.reset();
              })
              .catch(showError);
          })
          .catch(showError);
      } else {
        axios
          .put(url, this.usuario)
          .then(() => {
            this.$toasted.global.defaultSuccess();
            this.signin();
            this.reset();
          })
          .catch(showError);
      }
    },
    signin() {
      axios
        .post(`${urlBD}/signin`, this.usuario)
        .then(res => {
          this.$store.commit("setUsuario", res.data);
          localStorage.setItem(usuarioKey, JSON.stringify(res.data));
        })
        .catch(showError);
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
    }
  }
};
</script>

<style>
.avatar {
  margin-top: -50px;
  margin-bottom: 30px;
}
</style>
