<template>
  <div class="email">
    <v-layout row justify-center>
      <v-dialog
        v-if="modalStore.email.visible"
        v-model="modalStore.email.visible"
        persistent
        max-width="600px"
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
                    <v-textarea
                      color="primary"
                      box
                      label="Mensagem"
                      auto-grow
                      v-model="email.mensagem"
                      :rules="mensagemRules"
                    ></v-textarea>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="modalStore.email.visible = false">Fechar</v-btn>
            <v-btn color="blue darken-1" flat @click="enviarEmail()">Enviar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </div>
</template>

<script>
import { mapState } from "vuex";

import axios from "axios";
import { urlBD, showError } from "@/global";

export default {
  name: "Email",
  data: function() {
    return {
      email: {},
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
    ...mapState(["modalStore", "usuarioStore", "empresaStore"])
  },
  watch: {
    "$store.state.modalStore.email.visible": function() {
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
      if (this.$refs.form.validate()) {
        const url = `${urlBD}/email`;

        axios
          .post(url, this.email)
          .then(() => {
            this.$toasted.global.defaultSuccess();
            this.modalStore.email.visible = false;
          })
          .catch(showError);
      }
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
        this.emailsEmpresa = Object.values(res.data);
      });
    }
  }
};
</script>

<style>
</style>
