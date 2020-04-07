<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex xs12 md8 my-5>
        <Card :color="color" title="Editar perfil">
          <v-form v-model="valid" ref="form">
            <v-container py-0>
              <v-layout wrap>
                <v-flex xs12 md4>
                  <v-text-field
                    :color="color"
                    label="Nome*"
                    v-model="usuario.nome"
                    :rules="nameRules"
                  />
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field
                    :color="color"
                    label="E-mail*"
                    v-model="usuario.email"
                    :rules="emailRules"
                  />
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field
                    :color="color"
                    label="Contato"
                    v-mask="['(##)####-####','(##)#####-####']"
                    v-model="usuario.contato"
                  />
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field
                    :color="color"
                    label="Imagem de perfil"
                    prepend-icon="fa fa-lg fa-folder-open-o"
                    readonly
                    v-model="imageName"
                    :placeholder="usuario.img"
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
                    :color="color"
                    label="Senha"
                    type="password"
                    v-model="usuario.senha"
                    :rules="senhaRules"
                  />
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field
                    :color="color"
                    label="Confirmação de senha"
                    type="password"
                    v-model="usuario.confirmaSenha"
                    :rules="confirmaSenhaRules"
                  />
                </v-flex>
                <v-flex xs12 text-xs-right>
                  <v-btn
                    class="v-btn-common"
                    :color="color"
                    @click="save()"
                    :loading="isLoading"
                  >Atualizar</v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
        </Card>
      </v-flex>
      <v-flex xs12 md4 my-5>
        <Card class="v-card-profile">
          <v-avatar slot="offset" :color="color" class="mx-auto d-block avatar" size="180">
            <img
              v-if="usuario.img"
              :src="`${urlBD}/${usuario.img}`"
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
          <v-flex xs12 text-xs-center>
            <v-btn :color="color" round class="v-btn-common">Planos</v-btn>
          </v-flex>
        </Card>
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
    ...mapState("app", ["color"]),
    ...mapState(["usuarioStore", "empresaStore", "modalStore"]),
    usuario: {
      get() {
        return this.usuarioStore.currentUsuario;
      },
      set(value) {
        this.usuarioStore.currentUsuario = value;
      }
    }
  },
  components: {
    Card: () => import("../material/Card")
  },
  data() {
    return {
      urlBD: urlBD,
      valid: true,
      isLoading: false,
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
    reset() {
      delete this.usuario.senha;
      delete this.usuario.confirmaSenha;
    },
    save() {
      if (!this.$refs.form.validate()) return;
      this.isLoading = true;

      const usuario = {
        id: this.usuario.id,
        nome: this.usuario.nome,
        email: this.usuario.email,
        contato: this.usuario.contato,
        senha: this.usuario.senha,
        confirmaSenha: this.usuario.confirmaSenha,
        token: this.usuario.token
      };
      const url = `${urlBD}/usuarios/${this.usuario.id}`;

      if (this.imageFile) {
        const fd = new FormData();
        fd.append("img", this.imageFile, this.imageName);
        axios
          .post(`${urlBD}/uploadIMG`, fd)
          .then(res => {
            usuario.img = res.data;
            axios
              .put(url, usuario)
              .then(() => {
                this.$toasted.global.defaultSuccess();
                this.signin();
              })
              .catch(showError);
          })
          .catch(showError);
      } else {
        axios
          .put(url, usuario)
          .then(() => {
            this.$toasted.global.defaultSuccess();
            this.signin();
          })
          .catch(showError)
          .then(() => (this.isLoading = false));
      }
    },
    signin() {
      axios
        .post(`${urlBD}/signin`, this.usuario)
        .then(res => {
          this.afterSignIn(res.data);
        })
        .catch(showError);
    },
    afterSignIn(usuario) {
      this.$store.commit("setUsuario", usuario);
      localStorage.setItem(usuarioKey, JSON.stringify(usuario));
      this.$socket.emit("login", { id: usuario.id, nome: usuario.nome });

      axios.get(`${urlBD}/usuarioEmpresas/${usuario.id}`).then(res => {
        this.empresaStore.currentEmpresas = res.data;
        this.$store.commit("setEmpresa", res.data[0].value);
      });

      this.$router.push({ path: "/" });
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
  },
  mounted() {
    console.log(this.usuario);
  }
};
</script>

<style>
.avatar {
  margin-top: -50px;
  margin-bottom: 30px;
}
</style>
