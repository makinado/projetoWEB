<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="Agenda" icon="fa fa-calendar" sub="Gerencie seus agendamentos" />
      </v-flex>
      <v-flex xs12>
        <v-sheet height="500">
          <v-calendar
            ref="calendar"
            locale="pt-br"
            v-model="start"
            :type="type"
            :end="end"
            color="primary"
            :now="today"
            :value="today"
          >
            <template v-slot:day="{ date }">
              <!-- Evento mes - dia todo/hora -->
              <template v-for="evento in eventsMap[date]">
                <v-menu :key="evento.descricao" v-model="evento.open" full-width offset-x>
                  <template v-slot:activator="{ on }">
                    <v-card
                      v-on="on"
                      v-html="evento.descricao"
                      color="primary"
                      flat
                      class="pt-0 pl-1 text-light my-event"
                    ></v-card>
                  </template>
                  <v-card color="grey lighten-4" min-width="350px" flat>
                    <v-toolbar color="primary" dark>
                      <v-toolbar-title class="text-light" v-html="evento.descricao"></v-toolbar-title>
                    </v-toolbar>
                    <v-card-title primary-title>
                      <span v-html="evento.observacao"></span>
                    </v-card-title>
                    <v-card-actions>
                      <v-btn
                        flat
                        color="secondary"
                        @click="[modalStore.eventos.deleteEvento = true, eventoStore.evento = evento]"
                      >Excluir</v-btn>
                      <v-btn
                        flat
                        color="secondary"
                        @click="[modalStore.eventos.visible = true, modalStore.eventos.title = 'Alterar evento', eventoStore.evento = evento]"
                      >Editar</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-menu>
              </template>
            </template>

            <template v-slot:dayHeader="{ date }">
              <!-- Evento semanal - dia todo -->
              <template v-for="evento in eventsMap[date]">
                <v-menu :key="evento.descricao" v-model="evento.open" full-width offset-x>
                  <template v-slot:activator="{ on }">
                    <v-card
                      v-if="!evento.hora"
                      v-on="on"
                      v-html="evento.descricao"
                      color="primary"
                      flat
                      class="pt-0 pl-1 text-light my-event"
                    ></v-card>
                  </template>
                  <v-card color="grey lighten-4" min-width="350px" flat>
                    <v-toolbar color="primary" dark>
                      <v-toolbar-title class="text-light" v-html="evento.descricao"></v-toolbar-title>
                    </v-toolbar>
                    <v-card-title primary-title>
                      <span v-html="evento.observacao"></span>
                    </v-card-title>
                    <v-card-actions>
                      <v-btn
                        flat
                        color="secondary"
                        @click="[modalStore.eventos.deleteEvento = true, eventoStore.evento = evento]"
                      >Excluir</v-btn>
                      <v-btn
                        flat
                        color="secondary"
                        @click="[modalStore.eventos.visible = true, modalStore.eventos.title = 'Alterar evento', eventoStore.evento = evento]"
                      >Editar</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-menu>
              </template>
            </template>

            <template v-slot:dayBody="{ date, timeToY, minutesToPixels }">
              <!-- Evento semanal - hora -->
              <template v-for="evento in eventsMap[date]">
                <v-menu :key="evento.descricao" v-model="evento.open" full-width offset-x>
                  <template v-slot:activator="{ on }">
                    <v-card
                      v-if="evento.hora"
                      v-on="on"
                      v-html="evento.descricao"
                      color="primary"
                      :style="{ top: '200px', heigth: '10rpx' }"
                      flat
                      class="pt-0 pl-1 text-light my-event"
                    ></v-card>
                  </template>
                  <v-card color="grey lighten-4" min-width="350px" flat>
                    <v-toolbar color="primary" dark>
                      <v-toolbar-title class="text-light" v-html="evento.descricao"></v-toolbar-title>
                    </v-toolbar>
                    <v-card-title primary-title>
                      <span v-html="evento.observacao"></span>
                    </v-card-title>
                    <v-card-actions>
                      <v-btn
                        flat
                        color="secondary"
                        @click="[modalStore.eventos.deleteEvento = true, eventoStore.evento = evento]"
                      >Excluir</v-btn>
                      <v-btn
                        flat
                        color="secondary"
                        @click="[modalStore.eventos.visible = true, modalStore.eventos.title = 'Alterar evento', eventoStore.evento = evento]"
                      >Editar</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-menu>
              </template>
            </template>
          </v-calendar>
        </v-sheet>
      </v-flex>

      <v-flex sm4 xs12 class="text-sm-left text-xs-center">
        <v-btn class="v-btn-common" color="primary" @click="$refs.calendar.prev()">
          <v-icon dark left>keyboard_arrow_left</v-icon>Ant
        </v-btn>
        <v-btn class="v-btn-common" color="primary" @click="$refs.calendar.next()">
          Prox
          <v-icon right dark>keyboard_arrow_right</v-icon>
        </v-btn>
      </v-flex>
      <v-flex sm4 xs12 class="text-xs-center">
        <v-select v-model="type" :items="options" label="Tipo"></v-select>
      </v-flex>
      <v-flex sm4 xs12 class="text-sm-right text-xs-center">
        <v-btn
          class="v-btn-common"
          color="primary"
          @click="[modalStore.eventos.visible = true, this.eventoStore.evento = null]"
        >Adicionar evento</v-btn>
      </v-flex>
      <AddEvento />
      <v-dialog
        v-model="modalStore.eventos.deleteEvento"
        persistent
        max-width="500px"
        v-if="eventoStore.evento"
      >
        <v-card>
          <v-card-title>
            <span class="headline">Excluir evento</span>
          </v-card-title>
          <v-card-text>Excluir {{ eventoStore.evento.descricao }} ?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              flat
              @click="modalStore.eventos.deleteEvento = false"
            >Fechar</v-btn>
            <v-btn color="blue darken-1" flat @click="remove()">Confirmar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>

<script>
import PageTitle from "@/components/template/PageTitle";
import AddEvento from "./AddEvento";

import axios from "axios";
import { urlBD, showError } from "@/global";
import { mapState } from "vuex";

export default {
  name: "Agenda",
  components: { PageTitle, AddEvento },
  computed: {
    ...mapState(["modalStore", "eventoStore"]),
    eventsMap() {
      const map = {};
      this.eventoStore.eventos.forEach(e =>
        (map[e.data] = map[e.data] || []).push(e)
      );
      return map;
    },
    title() {
      return "";
    },
    monthFormatter() {
      return this.$refs.calendar.getFormatter({
        timeZone: "UTC",
        month: "long"
      });
    }
  },
  watch: {
    "$store.state.modalStore.eventos.deleteEvento": function() {
      if (!this.modalStore.eventos.deleteEvento) {
        this.loadEventos();
      }
    }
  },
  data: function() {
    return {
      type: "month",
      start: "01-01-2017",
      end: "31-12-2025",
      options: [
        { text: "Dia", value: "day" },
        { text: "4 Dias", value: "4day" },
        { text: "Semana", value: "week" },
        { text: "Mês", value: "month" }
      ],
      eventos: [],
      today: new Date().toISOString().substr(0, 10)
    };
  },
  methods: {
    loadEventos() {
      const url = `${urlBD}/eventos_agenda`;
      axios.get(url).then(res => {
        this.eventoStore.eventos = res.data;
        this.eventoStore.eventos.map(evento => {
          evento.open = false;
        });
      });
    },
    remove() {
      const id = this.eventoStore.evento.id;
      const url = `${urlBD}/eventos_agenda/${id}`;
      axios
        .delete(url)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.modalStore.eventos.deleteEvento = false;
        })
        .catch(showError);
    },
    setToday() {
      this.focus = this.today;
    }
  },
  mounted() {
    this.loadEventos();
  }
};
</script>

<style>
.my-event {
  height: 25px;
  width: 100%;
  cursor: pointer;
  margin-bottom: 1px;
}
</style>
