<template>
  <div class="email">
    <v-layout row justify-center>
      <v-dialog
        v-if="modalStore.email.visible"
        v-model="modalStore.email.visible"
        persistent
        max-width="800px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">{{ modalStore.email.title }}</span>
          </v-card-title>
          <v-card-text>
            <v-form v-model="valid" ref="form">
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-autocomplete
                    no-data-text="Nenhum resultado"
                    dense
                    color="primary"
                    label="Empresa*"
                    v-model="email.id_empresa"
                    :items="empresaStore.empresas"
                    @change="loadEmails"
                  ></v-autocomplete>
                </v-layout>
                <v-layout wrap>
                  <v-flex xs12 md6>
                    <v-autocomplete
                      color="primary"
                      label="De*"
                      v-model="email.de"
                      :items="emailsEmpresa"
                      no-data-text="Nenhum e-mail cadastrado ou empresa não selecionada"
                      :rules="deRules"
                    ></v-autocomplete>
                  </v-flex>

                  <v-flex xs12 md6>
                    <v-text-field
                      color="primary"
                      label="Para*"
                      v-model="email.para"
                      :rules="paraRules"
                    ></v-text-field>
                  </v-flex>

                  <v-flex xs12>
                    <v-text-field
                      color="primary"
                      label="Assunto*"
                      v-model="email.assunto"
                      :rules="assuntoRules"
                    ></v-text-field>
                  </v-flex>

                  <v-flex xs12>
                    <v-text-field
                      :color="color"
                      label="Anexar arquivos"
                      prepend-icon="fa fa-lg fa-folder-open-o"
                      readonly
                      v-model="email.file"
                      @click="pickFile"
                    ></v-text-field>
                    <input
                      type="file"
                      style="display: none"
                      ref="files"
                      accept="file/*"
                      multiple
                      @change="onFilePicked"
                    />
                  </v-flex>

                  <v-flex xs12>
                    <VueEditor v-model="email.mensagem" :rules="mensagemRules" />
                  </v-flex>
                </v-layout>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn :disabled="isLoading" color="blue darken-1" flat @click="modalStore.email.visible = false">Fechar</v-btn>
            <v-btn :disabled="isLoading" color="blue darken-1" flat @click="enviarEmail()" :loading="isLoading">Enviar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </div>
</template>

<script>
import { VueEditor } from "vue2-editor";

import { mapState } from "vuex";

import axios from "axios";
import { urlBD, showError } from "@/global";

export default {
  name: "Email",
  components: { VueEditor },
  data() {
    return {
      isLoading: false,
      email: {},
      fileName: "",
      fileUrl: "",
      files: "",
      emailsEmpresa: [],
      deRules: [
        v => !!v || "E-mail inválido",
        v => /.+@.+/.test(v) || "E-mail inválido"
      ],
      paraRules: [
        v => !!v || "E-mail inválido",
        v => /.+@.+/.test(v) || "E-mail inválido"
      ],
      assuntoRules: [v => !!v || "Assunto inválido"],
      mensagemRules: [v => !!v || "Mensagem inválida"],
      valid: true
    };
  },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["modalStore", "usuarioStore", "empresaStore"])
  },
  watch: {
    "$store.state.modalStore.email.visible"() {
      if (this.modalStore.email.visible) {
        this.reset();
        this.prepareEmail();
      }
    }
  },
  methods: {
    reset() {
      this.email = {};
      this.$refs.form ? this.$refs.form.reset() : "";
    },
    async prepareEmail() {
      this.email = {};
      this.email.para = this.modalStore.email.para;

      this.loadEmpresas();
    },
    enviarEmail() {
      if (!this.$refs.form.validate()) return;

      const url = `${urlBD}/email`;
      const fd = new FormData();
      const attachments = [];

      this.isLoading = true;
      if (this.files.length > 0) {
        for (let i = 0; i < this.files.length; i++) {
          fd.append("file", this.files[i], this.files[i].name);
          attachments.push({
            filename: this.files[i].name,
            path: `../backend/uploads/arquivos/${this.files[i].name}`
          });
        }

        axios
          .post(`${urlBD}/uploadFiles`, fd)
          .then(res => {
            this.email.attachments = attachments;
            axios
              .post(url, this.email)
              .then(() => {
                this.$toasted.global.defaultSuccess();
                this.modalStore.email.visible = false;
              })
              .catch(showError);
          })
          .catch(showError)
          .finally(_ => (this.isLoading = false));
      } else {
        axios
          .post(url, this.email)
          .then(() => {
            this.$toasted.global.defaultSuccess();
            this.modalStore.email.visible = false;
          })
          .catch(showError)
          .finally(_ => (this.isLoading = false));
      }
    },
    onFilePicked(e) {
      const files = e.target.files;
      if (files[0] !== undefined) {
        this.fileName = files[0].name;
        if (this.fileName.lastIndexOf(".") <= 0) {
          return;
        }

        if (files.length == 1) this.$set(this.email, "file", this.fileName);
        else
          this.$set(
            this.email,
            "file",
            files.length + " arquivos selecionados"
          );

        const fr = new FileReader();
        fr.readAsDataURL(files[0]);
        fr.addEventListener("load", () => {
          this.fileUrl = fr.result;
          this.files = files; // this is an file file that can be sent to server...
        });
      } else {
        this.fileName = "";
        this.files = "";
        this.fileUrl = "";
      }
    },
    pickFile() {
      this.$refs.files.click();
    },
    async loadEmpresas() {
      const url = `${urlBD}/usuarioEmpresas/${this.usuarioStore.currentUsuario.id}`;
      axios.get(url).then(res => {
        this.empresaStore.empresas = res.data;
        if (this.empresaStore.empresas.length === 1) {
          this.email.id_empresa = this.empresaStore.empresas[0].value;
          this.loadEmails();
        }
      });
    },
    async loadEmails() {
      let url = `${urlBD}`;
      if (this.email.id_empresa) {
        url += `/emailsEmpresa/${this.email.id_empresa}`;
      } else {
        return;
      }

      axios.get(url).then(res => {
        this.emailsEmpresa = [
          this.usuarioStore.currentUsuario.email,
          ...res.data
        ];
      });
    }
  }
};
</script>

<style>
</style>
