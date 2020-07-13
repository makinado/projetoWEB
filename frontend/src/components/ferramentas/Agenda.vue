<template>
  <v-container fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex xs12>
        <PageTitle main="Agenda" icon="fa fa-calendar" sub="Gerencie seus agendamentos" />
      </v-flex>

      <v-layout row wrap>
        <v-container grid-list-xl fill-height>
          <v-menu bottom right>
            <template v-slot:activator="{ on }">
              <v-btn outline :color="color" class="v-btn-common mr-3" v-on="on">
                <span>Visualizar</span>
                <v-icon right>keyboard_arrow_down</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-tile @click="type = 'day'">
                <v-list-tile-title>Dia</v-list-tile-title>
              </v-list-tile>

              <v-list-tile @click="type = 'week'">
                <v-list-tile-title>Semana</v-list-tile-title>
              </v-list-tile>

              <v-list-tile @click="type = 'month'">
                <v-list-tile-title>Mês</v-list-tile-title>
              </v-list-tile>

              <v-list-tile @click="type = '4day'">
                <v-list-tile-title>4 dias</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
          <v-btn outline class="v-btn-common mr-3" :color="color" @click="setToday">Hoje</v-btn>
          <v-btn fab text small @click="$refs.calendar.prev()">
            <v-icon small>keyboard_arrow_left</v-icon>
          </v-btn>
          <v-btn fab text small @click="$refs.calendar.next()" class="mr-3">
            <v-icon small>keyboard_arrow_right</v-icon>
          </v-btn>
          <h3>{{ title }}</h3>

          <v-spacer></v-spacer>

          <v-btn
            class="v-btn-common"
            :color="color"
            @click="[eventoStore.evento = null, modalStore.eventos.visible = true]"
          >Adicionar evento</v-btn>
        </v-container>
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
            @change="setTitle"
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
                      >{{ deleteName }}</v-btn>
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
                      >{{ deleteName }}</v-btn>
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

            <template slot="dayBody" slot-scope="{ date, timeToY }">
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
                      >{{ deleteName }}</v-btn>
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
    },
    deleteName() {
      return new Date() >= new Date(this.today) ? "Concluir" : "Excluir";
    }
  },
  data() {
    return {
      type: "month",
      title: "",
      start: null,
      end: null,
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
    setToday() {
      this.start = this.today;
    },
    setTitle(e) {
      const { start, end } = e;
      const dayName = [
        "domingo",
        "segunda",
        "terça",
        "quarta",
        "quinta",
        "sexta",
        "sábado"
      ];
      const monName = [
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "Maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro"
      ];

      const startMonth = monName[start.month - 1];
      const endMonth = monName[end.month - 1];

      const startYear = start.year;
      const endYear = end.year;

      const startDay = start.day;
      const endDay = end.day;

      this.title = "";
      switch (this.type) {
        case "month":
          this.title = `${startMonth} ${startYear}`;
          break;
        case "week":
        case "4day":
          this.title = `${startDay} - ${endDay} ${startMonth} ${startYear}`;
          break;
        case "day":
          this.title = `${startDay} ${startMonth} ${startYear}`;
          break;
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
