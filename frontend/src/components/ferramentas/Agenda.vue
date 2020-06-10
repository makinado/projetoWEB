<template>
  <v-container fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex xs12>
        <PageTitle main="Agenda" icon="fa fa-calendar" sub="Gerencie seus agendamentos" />
      </v-flex>

      <v-layout row wrap>
        <v-flex xs12 md4>
          <v-btn class="v-btn-common" :color="color" @click="$refs.calendar.prev()">
            <v-icon dark left>keyboard_arrow_left</v-icon>Ant
          </v-btn>
          <v-btn class="v-btn-common" :color="color" @click="$refs.calendar.next()">
            Prox
            <v-icon right dark>keyboard_arrow_right</v-icon>
          </v-btn>
        </v-flex>
        <v-flex xs12 md4>
          <v-autocomplete
            class="tag-input"
            label="Tipo"
            dense
            chips
            v-model="type"
            :color="color"
            :items="options"
          ></v-autocomplete>
        </v-flex>
        <v-flex xs12 md4 class="text-xs-right">
          <v-btn
            class="v-btn-common"
            :color="color"
            @click="[modalStore.eventos.visible = true, this.eventoStore.evento = null]"
          >Adicionar evento</v-btn>
        </v-flex>
      </v-layout>

      <v-flex xs12>
        <v-sheet height="550">
          <v-calendar
            ref="calendar"
            locale="pt-br"
            v-model="start"
            :type="type"
            :end="end"
            :color="color"
            :now="today"
            :value="today"
          >
            <template slot="day" slot-scope="{ date }">
              <template v-for="evento in eventsMap[date]">
                <v-menu :key="evento.descricao" v-model="evento.open" full-width offset-x>
                  <template v-slot:activator="{ on }">
                    <v-card
                      v-on="on"
                      v-html="evento.descricao"
                      :color="color"
                      flat
                      dark
                      class="pt-0 pl-1 text-light my-event"
                    ></v-card>
                  </template>
                  <v-card color="grey lighten-4" min-width="350px" flat>
                    <v-toolbar :color="color" dark>
                      <v-toolbar-title class="text-light white--text" v-html="evento.descricao"></v-toolbar-title>
                    </v-toolbar>
                    <v-card-title primary-title>
                      <span v-html="evento.observacao"></span>
                    </v-card-title>
                    <v-card-actions>
                      <v-btn
                        flat
                        color="secondary"
                        @click="[confirmaExclusao = true, eventoStore.evento = evento]"
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

            <template slot="dayHeader" slot-scope="{ date }">
              <template v-for="evento in eventsMap[date]">
                <v-menu :key="evento.descricao" v-model="evento.open" full-width offset-x>
                  <template v-slot:activator="{ on }">
                    <v-card
                      v-if="!evento.hora"
                      v-on="on"
                      v-html="evento.descricao"
                      :color="color"
                      flat
                      class="pt-0 pl-1 text-light my-event"
                    ></v-card>
                  </template>
                  <v-card color="grey lighten-4" min-width="350px" flat>
                    <v-toolbar :color="color" dark>
                      <v-toolbar-title class="text-light white--text" v-html="evento.descricao"></v-toolbar-title>
                    </v-toolbar>
                    <v-card-title primary-title>
                      <span v-html="evento.observacao"></span>
                    </v-card-title>
                    <v-card-actions>
                      <v-btn
                        flat
                        color="secondary"
                        @click="[confirmaExclusao = true, eventoStore.evento = evento]"
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

            <template slot="dayBody" slot-scope="{ date, timeToY, minutesToPixels }">
              <template v-for="evento in eventsMap[date]">
                <v-menu :key="evento.descricao" v-model="evento.open" full-width offset-x>
                  <template v-slot:activator="{ on }">
                    <v-card
                      v-on="on"
                      v-if="evento.hora"
                      :key="evento.descricao"
                      v-html="evento.descricao + ' - ' + evento.hora"
                      :style="{ top: timeToY(evento.hora) + 'px', height: '40px' }"
                      :color="color"
                      dark
                      class="my-event with-time"
                    ></v-card>
                  </template>
                  <v-card color="grey lighten-4" min-width="350px" flat>
                    <v-toolbar :color="color" dark>
                      <v-toolbar-title class="text-light white--text" v-html="evento.descricao"></v-toolbar-title>
                    </v-toolbar>
                    <v-card-title primary-title>
                      <span v-html="evento.observacao"></span>
                    </v-card-title>
                    <v-card-actions>
                      <v-btn
                        flat
                        color="secondary"
                        @click="[confirmaExclusao = true, eventoStore.evento = evento]"
                      >{{ new Date() == today ? 'Concluir' : 'Excluir'}}</v-btn>
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

      <AddEvento />

      <v-dialog v-model="confirmaExclusao" persistent max-width="500px" v-if="eventoStore.evento">
        <v-card>
          <v-card-title>
            <span class="headline">Excluir evento</span>
          </v-card-title>
          <v-card-text>Excluir {{ eventoStore.evento.descricao }} ?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="confirmaExclusao = false">Fechar</v-btn>
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
import { urlBD, showError, formatDate } from "@/global";
import { mapState } from "vuex";

export default {
  name: "Agenda",
  components: { PageTitle, AddEvento },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["modalStore", "eventoStore"]),
    eventsMap() {
      const map = {};
      this.eventoStore.eventos.forEach(e =>
        (map[e.data] = map[e.data] || []).push(e)
      );
      return map;
    }
  },
  data() {
    return {
      type: "month",
      start: "01-01-2010",
      end: "31-12-2025",
      confirmaExclusao: false,
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
          this.confirmaExclusao = false;

          this.loadEventos();
        })
        .catch(showError);
    }
  },
  mounted() {
    this.loadEventos();
    this.start = this.$route.params.data || null;
    this.end = this.$route.params.data || null;
  }
};
</script>

<style lang="stylus" scoped>
/* .my-event {
  height: 25px;
  width: 100%;
  cursor: pointer;
  margin-bottom: 1px;
} */
.my-event {
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 5px;
  border: 1px solid;
  padding: 3px;
  cursor: pointer;
  margin-bottom: 1px;
  left: 4px;
  margin-right: 8px;
  position: relative;
  color: #FFF;

  &.with-time {
    position: absolute;
    right: 4px;
    margin-right: 0px;
  }
}
</style>
