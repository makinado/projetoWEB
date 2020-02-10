<template>
  <div class="add-backup">
    <v-dialog v-model="modalStore.backups.visible" persistent max-width="900px">
      <v-card v-if="modalStore.backups.visible">
        <v-card-title>{{ modalStore.backups.title }}</v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-form v-model="valid" ref="form">
              <v-text-field v-model="backup.id" v-show="false"></v-text-field>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field
                    :color="color"
                    label="Nome*"
                    v-model="backup.nome"
                    v-uppercase
                    :rules="nameRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md6>
                  <v-checkbox :color="color" label="Backup local" v-model="backup.local"></v-checkbox>
                </v-flex>
                <v-flex xs12 md6>
                  <v-checkbox :color="color" label="Backup em núvem" v-model="backup.nuvem"></v-checkbox>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="modalStore.backups.visible = false">Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="save()">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import { urlBD, showError, formatDate, saveLog, loadEmpresas } from "@/global";
import { mapState } from "vuex";

export default {
  name: "Add-backup",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["produtoStore", "usuarioStore", "modalStore", "empresaStore"]),
    computedDateFormatted() {
      return formatDate(this.backup.data);
    }
  },
  data: function() {
    return {
      menu: false,
      backup: {},
      valid: true,
      nameRules: [
        v => !!v || "Nome é obrigatório",
        v => (!!v && v.length >= 3) || "Nome deve ter no mínimo 3 caracteres"
      ]
    };
  },
  watch: {
    "$store.state.modalStore.backups.visible": function() {
      this.reset();
    },
    "$store.state.modalStore.backups.deletebackup": function() {
      this.reset();
    }
  },
  methods: {
    reset() {
      this.backup = {};
      this.$refs.form ? this.$refs.form.reset() : "";
    },
    loadbackup(backup) {
      if (backup) {
        const url = `${urlBD}/backups`;
        axios
          .get(`${url}/${backup.id}`)
          .then(res => {
            this.backup = res.data;
          })
          .catch(showError);
      } else {
        this.backup = {};
      }
    },
    loadbackups() {
      const url = `${urlBD}/backups`;
      axios
        .get(url)
        .then(res => {
          this.produtoStore.backups = res.data.map(backup => {
            backup.value = backup.id;
            backup.text = backup.nome;

            return backup;
          });
        })
        .catch(showError);
    },
    async save() {
      const method = this.backup.id ? "put" : "post";
      const id = this.backup.id ? this.backup.id : "";
      const urlbackups = `${urlBD}/backups/${id}`;

      await axios[method](urlbackups, this.backup)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
            "Backup",
            `Usuário ${this.usuarioStore.currentUsuario.nome} ${
              method === "post" ? "ADICIONOU" : "ALTEROU"
            } a backup ${this.backup.nome}`
          );
          this.reset();
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>
