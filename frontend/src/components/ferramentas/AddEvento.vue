<template>
  <v-layout row justify-center>
    <v-dialog v-model="modalStore.eventos.visible" lazy persistent max-width="900px">
      <v-card v-if="modalStore.eventos.visible">
        <v-card-title>
          <span class="headline">{{ modalStore.eventos.title }}</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="valid" ref="form">
            <v-container grid-list-md>
              <v-text-field label="id" v-model="evento.id" v-show="false"></v-text-field>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field
                    color="primary"
                    label="Descrição*"
                    required
                    v-model="evento.descricao"
                    :rules="descRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-menu
                    v-model="menu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    lazy
                    transition="scale-transition"
                    offset-y
                    full-width
                    max-width="290px"
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        color="primary"
                        v-model="computedDateFormatted"
                        label="Data do evento"
                        prepend-icon="event"
                        readonly
                        v-on="on"
                        :rules="dataRules"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      color="primary"
                      v-model="date"
                      @input="menu = false"
                      locale="pt-br"
                    ></v-date-picker>
                  </v-menu>
                </v-flex>
                <v-flex xs12 md4>
                  <v-select
                    dense
                    color="primary"
                    label="Tipo"
                    :items="['Dia todo', 'Hora']"
                    v-model="evento.tipo"
                    :rules="tipoRules"
                  ></v-select>
                </v-flex>
                <v-flex xs12 md4>
                  <v-select
                    v-if="evento.tipo === 'Hora'"
                    dense
                    color="primary"
                    label="Selecione a hora do evento"
                    :items="horas"
                    v-model="evento.hora"
                  ></v-select>
                </v-flex>
                <v-flex xs12>
                  <v-textarea color="primary" label="Observações" box v-model="evento.observacao"></v-textarea>
                </v-flex>
                <v-flex xs12 md6>
                  <v-checkbox v-model="avisar" label="Avisar um dia antes?" color="primary"></v-checkbox>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="modalStore.eventos.visible = false">Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="save()">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import axios from "axios";
import { urlBD, showError, formatDate } from "@/global";
import { mapState } from "vuex";

export default {
  computed: {
    computedDateFormatted() {
      return formatDate(this.date);
    },
    ...mapState(["modalStore", "eventoStore"])
  },
  data() {
    return {
      valid: true,
      evento: {},
      horas: [
        "01:00",
        "02:00",
        "03:00",
        "04:00",
        "05:00",
        "06:00",
        "07:00",
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
        "23:00",
        "00:00"
      ],
      date: "",
      menu: null,
      avisar: false,
      descRules: [v => !!v || "Descrição inválida"],
      dataRules: [v => !!v || "Data inválida"],
      tipoRules: [v => !!v || "Tipo inválido"]
    };
  },
  watch: {
    "$store.state.modalStore.eventos.visible": function() {
      this.reset();
      if (this.modalStore.eventos.visible) {
        this.loadEvento(this.eventoStore.evento);
      } else {
        this.loadEventos();
      }
    }
  },
  methods: {
    loadEvento(evento) {
      if (evento) {
        const url = `${urlBD}/eventos_agenda/${evento.id}`;
        axios.get(url).then(res => {
          this.evento = res.data;
          this.date = this.evento.data;
          this.avisar = this.evento.avisar;
        });
      }
    },
    loadEventos() {
      const url = `${urlBD}/eventos_agenda`;
      axios.get(url).then(res => {
        this.eventoStore.eventos = res.data;
        this.eventoStore.eventos.map(evento => {
          evento.open = false;
        });
      });
    },
    reset() {
      this.evento = {};
      this.date = "";
      this.avisar = false;
      this.$refs.form ? this.$refs.form.reset() : "";
    },
    save() {
      if (!this.$refs.form.validate()) return;

      const method = this.evento.id ? "put" : "post";
      const id = this.evento.id ? this.evento.id : "";
      const urlEvento = `${urlBD}/eventos_agenda/${id}`;

      this.evento.data = this.date;
      this.evento.avisar = this.avisar;

      axios[method](urlEvento, this.evento)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.modalStore.eventos.visible = false;
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>
