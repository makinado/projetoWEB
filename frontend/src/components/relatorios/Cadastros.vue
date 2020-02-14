<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle
          main="Relatório de cadastros"
          icon="fa fa-archive"
          sub="Emita relatórios dos cadastros"
        />
        <v-card class="p-3">
          <v-card-title class="headline">Selecione as opções para emissão do relatório</v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid">
              <v-layout row wrap>
                <v-flex xs12 md6>
                  <v-autocomplete
                    class="tag-input"
                    multiple
                    dense
                    chips
                    deletable-chips
                    :color="color"
                    label="Selecione os cadastros"
                    v-model="filter.cadastros"
                    :items="cadastros"
                    :rules="cadRules"
                    :menu-props="{ maxHeight: '500' }"
                  ></v-autocomplete>
                </v-flex>
                <v-flex xs12 md2>
                  <v-autocomplete
                    class="tag-input"
                    dense
                    chips
                    deletable-chips
                    :color="color"
                    label="Ordenar por"
                    v-model="filter.ordem"
                    :items="ordens"
                  ></v-autocomplete>
                </v-flex>
              </v-layout>
              <v-layout row wrap>
                <v-flex xs12 md2>
                  <v-radio-group v-model="filter.data_type" :mandatory="false">
                    <v-radio label="Data de inclusão" :color="color" value="data_criado"></v-radio>
                    <v-radio label="Data de alteração" :color="color" value="data_atualizado"></v-radio>
                  </v-radio-group>
                </v-flex>
                <v-flex xs12 md2>
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
                <v-flex xs12 md2>
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
                <v-flex xs12 md4>
                  <v-tooltip bottom>
                    <v-btn
                      slot="activator"
                      class="v-btn-common"
                      :color="color"
                      @click="emit('pdf')"
                    >confirmar pdf</v-btn>
                    <span>Confirma as opções e emite o relatório em PDF</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <v-btn
                      slot="activator"
                      class="v-btn-common"
                      color="warning"
                      @click="emit('csv')"
                    >confirmar csv</v-btn>
                    <span>Confirma as opções e emite o relatório em CSV</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <v-btn
                      slot="activator"
                      class="v-btn-common"
                      color="danger"
                      @click="reset"
                    >limpar</v-btn>
                    <span>Limpa as opções selecionadas</span>
                  </v-tooltip>
                </v-flex>
              </v-layout>
            </v-form>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import {
  urlBD,
  showError,
  parseNumber,
  formatDate,
  loadEmpresas
} from "@/global";
import axios from "axios";

import jsPDF from "jspdf";
import "jspdf-autotable";
import { ExportToCsv } from "export-to-csv";

export default {
  name: "cadastros",
  components: {
    PageTitle: () => import("@/components/template/PageTitle")
  },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["usuarioStore", "empresaStore"]),
    computedDateFormatted() {
      return formatDate(this.filter.data_inicial);
    },
    computedDateFormatted1() {
      return formatDate(this.filter.data_final);
    }
  },
  watch: {
    "filter.cadastros": function() {
      if (
        this.filter.cadastros.includes("cliente") ||
        this.filter.cadastros.includes("fornecedor") ||
        this.filter.cadastros.includes("vendedor") ||
        this.filter.cadastros.includes("funcionario") ||
        this.filter.cadastros.includes("transportadora")
      ) {
        this.cadastros.map(item => {
          if (item.group != "Pessoas") item.disabled = true;

          return item;
        });
      } else {
        this.cadastros.map(item => {
          if (item.group != "Pessoas") item.disabled = false;

          return item;
        });
        if (this.filter.cadastros.includes("usuario")) {
          this.cadastros.map(item => {
            if (item.group != "Usuários") item.disabled = true;

            return item;
          });
        } else {
          this.cadastros.map(item => {
            if (item.group != "Usuários") item.disabled = false;

            return item;
          });
          if (this.filter.cadastros.includes("produto")) {
            this.cadastros.map(item => {
              if (item.group != "Produtos") item.disabled = true;

              return item;
            });
          } else {
            this.cadastros.map(item => {
              if (item.group != "Produtos") item.disabled = false;

              return item;
            });
          }
        }
      }
    }
  },
  data() {
    return {
      filter: {},
      cadastros: [
        { header: "Pessoas" },
        {
          group: "Pessoas",
          value: "cliente",
          text: "Clientes",
          disabled: false
        },
        {
          group: "Pessoas",
          value: "fornecedor",
          text: "Fornecedores",
          disabled: false
        },
        {
          group: "Pessoas",
          value: "vendedor",
          text: "Vendedores",
          disabled: false
        },
        {
          group: "Pessoas",
          value: "funcionario",
          text: "Funcionários",
          disabled: false
        },
        {
          group: "Pessoas",
          value: "transportadora",
          text: "Transportadoras",
          disabled: false
        },
        { header: "Usuários" },
        {
          group: "Usuários",
          value: "usuario",
          text: "Usuários",
          disabled: false
        },
        { header: "Produtos" },
        {
          group: "Produtos",
          value: "produto",
          text: "Produtos",
          disabled: false
        }
      ],
      ordens: [
        { value: "id", text: "Código" },
        { value: "nome", text: "Nome" },
        { value: "uf", text: "UF" },
        { value: "logradouro", text: "Endereço" }
      ],
      valid: true,
      menu: false,
      menu1: false,
      empresaRules: [v => !!v || "Empresa é obrigatória"],
      cadRules: [
        v =>
          (!!v && v.length > 0) ||
          "Selecione os cadastros que aparecerão no relatório"
      ]
    };
  },
  methods: {
    reset() {
      this.filter = {};

      this.$refs.form ? this.$refs.form.reset() : "";
    },
    addHeadersFooters(doc) {
      const pageCount = doc.internal.getNumberOfPages();

      doc.setFont("helvetica", "italic");

      for (var i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        //cabeçalho
        doc.setFontSize(8);
        doc.textEx(
          this.filter.empresa.text || "ERRO NA EMPRESA",
          155,
          35,
          "right",
          "middle"
        );
        doc.setFontSize(12);
        doc.textEx(
          "Relatório de cadastros",
          doc.internal.pageSize.width / 2,
          20,
          "center",
          "middle"
        );
        doc.setFontSize(8);
        const date = new Date();
        doc.textEx(
          date.toLocaleDateString() + " - " + date.toLocaleTimeString(),
          doc.internal.pageSize.width - 120,
          35,
          "left",
          "middle"
        );

        //rodapé
        doc.textEx(
          this.usuarioStore.currentUsuario.nome,
          100,
          580,
          "right",
          "middle"
        );
        doc.text(
          String(i) + " de " + String(pageCount),
          doc.internal.pageSize.width - 70,
          580,
          "left",
          "bottom"
        );
      }
    },
    emit(type) {
      if (!this.$refs.form.validate()) return;

      const url = `${urlBD}/rel_cadastros?ordem=${this.filter.ordem ||
        ""}&cadastros=${this.filter.cadastros || ""}&data_type=${
        this.filter.data_type
      }&data_inicial=${this.filter.data_inicial || ""}&data_final=${this.filter
        .data_final || ""}`;

      axios
        .post(url)
        .then(res => {
          this.$toasted.global.defaultSuccess();

          if (type == "pdf") {
            this.emitPDF(res.data);
          } else {
            this.emitCSV(res.data);
          }
        })
        .catch(showError);
    },
    emitPDF(data) {
      var splitRegex = /\r\n|\r|\n/g;
      jsPDF.API.textEx = function(text, x, y, hAlign, vAlign) {
        var fontSize = this.internal.getFontSize() / this.internal.scaleFactor;

        // As defined in jsPDF source code
        var lineHeightProportion = 1.15;

        var splittedText = null;
        var lineCount = 1;
        if (
          vAlign === "middle" ||
          vAlign === "bottom" ||
          hAlign === "center" ||
          hAlign === "right"
        ) {
          splittedText =
            typeof text === "string" ? text.split(splitRegex) : text;

          lineCount = splittedText.length || 1;
        }

        // Align the top
        y += fontSize * (2 - lineHeightProportion);

        if (vAlign === "middle") y -= (lineCount / 2) * fontSize;
        else if (vAlign === "bottom") y -= lineCount * fontSize;

        if (hAlign === "center" || hAlign === "right") {
          var alignSize = fontSize;
          if (hAlign === "center") alignSize *= 0.5;

          if (lineCount > 1) {
            for (var iLine = 0; iLine < splittedText.length; iLine++) {
              this.text(
                splittedText[iLine],
                x - this.getStringUnitWidth(splittedText[iLine]) * alignSize,
                y
              );
              y += fontSize * lineHeightProportion;
            }
            return this;
          }
          x -= this.getStringUnitWidth(text) * alignSize;
        }

        this.text(text, x, y);
        return this;
      };

      var doc = new jsPDF("landscape", "pt", "a4"),
        pessoas_columns = [
          { title: "Código", dataKey: "id" },
          { title: "Nome", dataKey: "nome" },
          { title: "CPF", dataKey: "cpf" },
          { title: "CNPJ", dataKey: "cnpj" },
          { title: "Categoria", dataKey: "categoria" },
          { title: "Email", dataKey: "email" },
          { title: "Contato", dataKey: "contato" }
        ],
        usuarios_columns = [],
        produtos_columns = [];

      if (data.pessoas) {
        data.pessoas.map(pessoa => {
          if (pessoa.cpf) pessoa.cnpj = "";
          else pessoa.cpf = "";

          if (!pessoa.categoria) pessoa.categoria = "";

          return pessoa;
        });

        doc.autoTable(pessoas_columns, data.pessoas, {
          theme: "striped",
          headStyles: { fillColor: "#B2DFDB", textColor: "black" }
        });
      } else if (data.usuarios) {
        doc.autoTable(usuarios_columns, data.usuarios, {
          theme: "striped",
          headStyles: { fillColor: "#B2DFDB", textColor: "black" }
        });
      } else if (data.produtos) {
        doc.autoTable(produtos_columns, data.produtos, {
          theme: "striped",
          headStyles: { fillColor: "#B2DFDB", textColor: "black" }
        });
      }

      this.addHeadersFooters(doc);
      doc.save(
        "RelatorioDeCadastros_" +
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
          "RelatorioDeCadastros_" +
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

      if (data.pessoas) {
        data.pessoas.map(pessoa => {
          if (pessoa.cpf) pessoa.cnpj = "";
          else pessoa.cpf = "";

          if (!pessoa.categoria) pessoa.categoria = "";

          return pessoa;
        });

        console.log(data.pessoas)
        csvExporter.generateCsv(data.pessoas);
      } else if (data.usuarios) {
        csvExporter.generateCsv(data.usuarios);
      } else if (data.produtos) {
        csvExporter.generateCsv(data.produtos);
      }
    }
  },
  mounted() {
    loadEmpresas().then(_ => {
      if (this.empresaStore.empresas.length === 1) {
        this.filter.empresa = this.empresaStore.empresas[0].value;
      }
    });
  }
};
</script>