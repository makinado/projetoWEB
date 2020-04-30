<template>
  <v-container fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex xs12>
        <PageTitle
          main="Relatório de compras"
          icon="fa fa-cart-arrow-down"
          sub="Emita relatórios das compras"
        />
      </v-flex>
      <v-flex xs12>
        <Card :color="color" title="Selecione as opções para a emissão do relatório">
          <v-form ref="form" v-model="valid">
            <v-layout row wrap>
              <v-flex xs12 md4>
                <v-autocomplete
                  class="tag-input"
                  dense
                  chips
                  deletable-chips
                  :color="color"
                  label="Selecione o relatório desejado"
                  v-model="filter.relatorio"
                  :items="relatorios"
                  :rules="tipoRules"
                  :menu-props="{ maxHeight: '500' }"
                ></v-autocomplete>
              </v-flex>
              <v-flex class="mt-2" xs12 md2>
                <v-menu
                  v-model="menu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  full-width
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      :color="color"
                      v-model="computedDateFormatted"
                      label="Data inicial"
                      prepend-icon="event"
                      readonly
                      v-on="on"
                      :rules="dataRules"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    :color="color"
                    v-model="filter.data_inicial"
                    @input="menu = false"
                    locale="pt-br"
                  ></v-date-picker>
                </v-menu>
              </v-flex>
              <v-flex class="mt-2" xs12 md2>
                <v-menu
                  v-model="menu1"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  full-width
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      :color="color"
                      v-model="computedDateFormatted1"
                      label="Data final"
                      prepend-icon="event"
                      readonly
                      v-on="on"
                      :rules="dataRules"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    :color="color"
                    v-model="filter.data_final"
                    @input="menu1 = false"
                    locale="pt-br"
                  ></v-date-picker>
                </v-menu>
              </v-flex>
            </v-layout>
          </v-form>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="v-btn-common" color="warning" @click="reset">Limpar</v-btn>
            <v-btn class="v-btn-common" color="danger" @click="emit('pdf')" :loading="isLoading">PDF</v-btn>
            <v-btn
              class="v-btn-common"
              color="success"
              @click="emit('csv')"
              :loading="isLoading"
            >Excel</v-btn>
          </v-card-actions>
        </Card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import { urlBD, showError, parseNumber, formatDate } from "@/global";
import axios from "axios";

import { ExportToCsv } from "export-to-csv";

export default {
  name: "rel_compras",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["usuarioStore", "empresaStore"]),
    computedDateFormatted: {
      get() {
        return formatDate(this.filter.data_inicial);
      },
      set(value) {
        this.filter.data_inicial = value;
      }
    },
    computedDateFormatted1: {
      get() {
        return formatDate(this.filter.data_final);
      },
      set(value) {
        this.filter.data_final = value;
      }
    }
  },
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    Card: () => import("../material/Card")
  },
  data() {
    return {
      valid: true,
      menu: false,
      menu1: false,
      isLoading: false,
      filter: {},
      relatorios: [
        { header: "Pedidos" },
        {
          group: "Pedidos",
          value: "pedidos",
          text: "Pedidos pendentes",
          disabled: false
        },
        { header: "Compras" },
        {
          group: "Compras",
          value: "nfs",
          text: "Notas fiscais",
          disabled: false
        },
        {
          group: "Compras",
          value: "analise de compra",
          text: "Analise de compra",
          disabled: false
        }
      ],
      tipoRules: [v => !!v || "Tipo de relatório obrigatório"],
      dataRules: [v => !!v || "Datas são obrigatórias"]
    };
  },
  methods: {
    async reset() {
      this.filter = {};

      this.$refs.form ? this.$refs.form.reset() : "";
    },
    emit(type) {
      if (!this.$refs.form.validate()) return;

      this.isLoading = true;

      const url = `${urlBD}/rel_compras?relatorio=${this.filter.relatorio ||
        ""}&data_inicial=${this.filter.data_inicial || ""}&data_final=${this
        .filter.data_final || ""}`;

      axios
        .get(url)
        .then(res => {
          this.$toasted.global.defaultSuccess();

          if (type == "pdf") {
            this.emitPDF(res.data);
          } else {
            this.emitCSV(res.data);
          }
        })
        .catch(showError)
        .then(() => (this.isLoading = false));
    },
    emitPDF(data) {},
    emitCSV(data) {}
  }
};
</script>