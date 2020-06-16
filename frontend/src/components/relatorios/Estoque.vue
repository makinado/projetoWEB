<template>
  <v-container fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="Relatório de estoque" icon="fa fa-th" sub="Emita relatórios dos estoque" />
      </v-flex>
      <v-flex xs12>
        <Card :color="color" title="Selecione as opções para a emissão do relatório">
          <v-form ref="form" v-model="valid">
            <v-layout row wrap>
              <v-flex xs12 md3>
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
              <v-flex xs12 md3>
                <v-autocomplete
                  class="tag-input"
                  dense
                  chips
                  deletable-chips
                  :color="color"
                  label="Produto"
                  v-model="filter.produto"
                  :items="produtoStore.produtos"
                  @focus="$store.dispatch('loadProdutos')"
                ></v-autocomplete>
              </v-flex>
              <v-flex class="mt-2" xs12 md3>
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
              <v-flex class="mt-2" xs12 md3>
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
  name: "rel_estoque",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["usuarioStore", "empresaStore", "produtoStore"]),
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
    },
    nomeEmpresa() {
      if (!this.empresaStore.currentEmpresa)
        return "Todas as empresas estão selecionadas";
      return this.empresaStore.currentEmpresas.find(
        emp => emp.value == this.empresaStore.currentEmpresa
      ).text;
    }
  },
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    Card: () => import("../material/Card")
  },
  data() {
    return {
      filter: {},
      valid: true,
      menu: false,
      menu1: false,
      isLoading: false,
      relatorios: [
        { header: "Produtos" },
        {
          group: "Produtos",
          value: "inventario",
          text: "Inventário",
          disabled: false
        },
        { header: "Movimento de estoque" },
        {
          group: "Movimento de estoque",
          value: "entradas",
          text: "Entradas",
          disabled: false
        },
        {
          group: "Movimento de estoque",
          value: "saidas",
          text: "Saídas",
          disabled: false
        },
        {
          group: "Movimento de estoque",
          value: "movimento_estoque",
          text: "Movimento de estoque completo",
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

      const url = `${urlBD}/rel_estoque?relatorio=${this.filter.relatorio ||
        ""}&produto=${this.filter.produto || ""}&data_inicial=${this.filter
        .data_inicial || ""}&data_final=${this.filter.data_final || ""}`;

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
    emitPDF(data) {
      const addHeadersFooters = doc => {
        const pageCount = doc.internal.getNumberOfPages();

        doc.setFont("helvetica", "italic");

        for (var i = 1; i <= pageCount; i++) {
          doc.setPage(i);

          //cabeçalho
          doc.setFontSize(8);
          doc.text(this.nomeEmpresa, 40, 35);
          doc.setFontSize(12);
          doc.text(
            "Relatório de cadastros",
            doc.internal.pageSize.width / 2 -
              (doc.getStringUnitWidth("Relatório de cadastros") *
                doc.internal.getFontSize()) /
                2,
            20
          );
          doc.setFontSize(8);
          const date = new Date();
          doc.text(
            String(i) + " de " + String(pageCount),
            doc.internal.pageSize.width - 100,
            35
          );
          doc.line(20, 50, doc.internal.pageSize.width - 20, 50);

          // rodapé
          doc.text(this.usuarioStore.currentUsuario.nome, 40, 580);
          doc.text(
            date.toLocaleDateString() + " - " + date.toLocaleTimeString(),
            doc.internal.pageSize.width - 120,
            580
          );
        }
      };

      var doc = new jsPDF("landscape", "pt", "a4"),
        inventario_columns = [
          { title: "Codigo", dataKey: "id" },
          { title: "Descrição", dataKey: "descricao" },
          { title: "NCM", dataKey: "ncm" },
          { title: "Vlr unit.", dataKey: "valor_unitario" },
          { title: "Vlr custo", dataKey: "valor_custo_medio" },
          { title: "Qtde estoque", dataKey: "qtdEstoque" }
        ];

      if (data.inventario) {
        doc.setFontSize(12);
        doc.text(
          "Totalizadores",
          doc.internal.pageSize.width / 2 -
            (doc.getStringUnitWidth("Totalizadores") *
              doc.internal.getFontSize()) /
              2,
          80
        );
        doc.autoTable(
          [
            { title: "Produtos", dataKey: "produtos" },
            { title: "Ativos", dataKey: "ativos" },
            { title: "Inativos", dataKey: "inativos" }
          ],
          [data.stats],
          {
            theme: "striped",
            margin: { top: 90 },
            headStyles: { fillColor: "#B2DFDB", textColor: "black" }
          }
        );
        doc.autoTable(inventario_columns, data.inventario, {
          theme: "striped",
          headStyles: { fillColor: "#B2DFDB", textColor: "black" }
        });
      }

      addHeadersFooters(doc);
      doc.save(
        "RelatorioDeEstoque_" +
          new Date()
            .toLocaleDateString()
            .split("/")
            .join("") +
          ".pdf"
      );
    },
    emitCSV(data) {
      const options = {
        fieldSeparator: ";",
        quoteStrings: '"',
        decimalSeparator: ".",
        showLabels: true,
        showTitle: false,
        title:
          "RelatorioDeEstoque" +
          new Date()
            .toLocaleDateString()
            .split("/")
            .join(""),
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true
        // headers: ['id', 'Nome', ''] //<-- Won't work with useKeysAsHeaders present!
      };

      const csvExporter = new ExportToCsv(options);

      if (data.inventario) {
        csvExporter.generateCsv(data.inventario);
      }
    }
  }
};
</script>