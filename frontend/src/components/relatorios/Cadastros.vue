<template>
  <v-container fluid grid-list-xl>
    <v-layout wrap>
      <v-flex xs12>
        <PageTitle
          main="Relatório de cadastros"
          icon="fa fa-archive"
          sub="Gerencie os cadastros do sistema"
        />
      </v-flex>
      <v-flex xs12>
        <Card :color="color" title="Selecione as opções para a emissão do relatório">
          <v-form ref="form" v-model="valid">
            <v-layout row wrap>
              <v-flex xs12 md4>
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
                  @change="loadCategorias"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12 md2>
                <v-autocomplete
                  class="tag-input"
                  dense
                  chips
                  deletable-chips
                  :color="color"
                  label="Categoria"
                  v-model="filter.categoria"
                  :items="categoriaStore.categorias"
                  no-data-text="Filtro de categoria não permitido ou nada cadastrado"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12 md2>
                <v-autocomplete
                  class="tag-input"
                  dense
                  chips
                  deletable-chips
                  :color="color"
                  label="Marca"
                  v-model="filter.marca"
                  :items="produtoStore.marcas"
                  no-data-text="Filtro de marca não permitido ou nada cadastrado"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12 md2>
                <v-autocomplete
                  class="tag-input"
                  dense
                  chips
                  deletable-chips
                  :color="color"
                  label="Unidade"
                  v-model="filter.unidade"
                  :items="produtoStore.unidades"
                  no-data-text="Filtro de unidade não permitido ou nada cadastrado"
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
  name: "rel_cadastros",
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    Card: () => import("../material/Card")
  },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState([
      "usuarioStore",
      "empresaStore",
      "produtoStore",
      "categoriaStore"
    ]),
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
    nomeEmpresa: {
      get() {
        if (!this.empresaStore.currentEmpresa)
          return "Todas as empresas estão selecionadas";
        return this.empresaStore.currentEmpresas.find(
          e => e.value == this.empresaStore.currentEmpresa
        ).text;
      }
    }
  },
  watch: {
    "filter.cadastros"() {
      if (
        this.filter.cadastros.includes("cliente") ||
        this.filter.cadastros.includes("fornecedor") ||
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
        { value: "uf", text: "UF" }
      ],
      valid: true,
      categoriaVisible: true,
      menu: false,
      menu1: false,
      isLoading: false,
      empresaRules: [v => !!v || "Empresa é obrigatória"],
      cadRules: [
        v =>
          (!!v && v.length > 0) ||
          "Selecione os cadastros que aparecerão no relatório"
      ]
    };
  },
  methods: {
    async reset() {
      this.filter = {};

      this.$refs.form ? this.$refs.form.reset() : "";
    },
    loadCategorias() {
      if (
        this.filter.cadastros.includes("cliente") ||
        this.filter.cadastros.includes("fornecedor") ||
        this.filter.cadastros.includes("transportadora")
      ) {
        this.$store.dispatch("loadCategoriasPessoas");
      } else {
        this.categoriaStore.categorias = [];
        if (this.filter.cadastros.includes("produto")) {
          this.$store.dispatch("loadCategoriasProdutos");
          this.$store.dispatch("loadMarcas");
          this.$store.dispatch("loadUnidades");
        } else {
          this.categoriaStore.categorias = [];
          this.produtoStore.marcas = [];
          this.produtoStore.unidades = [];
        }
      }
    },

    async emit(type) {
      if (!this.$refs.form.validate() || !type) return;

      this.isLoading = true;

      const url = `${urlBD}/rel_cadastros?categoria=${this.filter.categoria ||
        ""}&marca=${this.filter.marca || ""}&unidade=${this.filter.unidade ||
        ""}&ordem=${this.filter.ordem || ""}&cadastros=${this.filter
        .cadastros || ""}&data_type=${this.filter.data_type}&data_inicial=${this
        .filter.data_inicial || ""}&data_final=${this.filter.data_final || ""}`;

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
        .catch(showError)
        .then(() => (this.isLoading = false));
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
            doc.internal.pageSize.width / 2 - 60,
            20
          );
          doc.setFontSize(8);
          const date = new Date();
          doc.text(
            date.toLocaleDateString() + " - " + date.toLocaleTimeString(),
            doc.internal.pageSize.width - 120,
            35
          );
          doc.line(20, 50, doc.internal.pageSize.width - 20, 50)

          //rodapé
          doc.text(this.usuarioStore.currentUsuario.nome, 40, 580);
          doc.text(
            String(i) + " de " + String(pageCount),
            doc.internal.pageSize.width - 70,
            580
          );
        }
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
        usuarios_columns = [
          { title: "Código", dataKey: "id" },
          { title: "Nome", dataKey: "nome" },
          { title: "E-mail", dataKey: "email" },
          { title: "Contato", dataKey: "contato" },
          { title: "Permissões", dataKey: "tipo" }
        ],
        produtos_columns = [
          { title: "Código", dataKey: "id" },
          { title: "Descrição", dataKey: "descricao" },
          { title: "Categoria", dataKey: "categoria" },
          { title: "Marca", dataKey: "marca" },
          { title: "Unidade", dataKey: "unidade" },
          { title: "Valor unitário", dataKey: "valor_unitario" },
          { title: "Valor venda", dataKey: "valor_venda" },
          { title: "Valor custo", dataKey: "valor_custo_medio" }
        ];

      doc.line(20, 50, doc.internal.pageSize.width - 20, 50)

      if (data.pessoas) {
        data.pessoas.map(pessoa => {
          if (pessoa.cpf) pessoa.cnpj = "";
          else pessoa.cpf = "";

          if (!pessoa.categoria) pessoa.categoria = "";

          return pessoa;
        });

        doc.autoTable(pessoas_columns, data.pessoas, {
          theme: "striped",
          margin: { top: 150 },
          headStyles: { fillColor: "#B2DFDB", textColor: "black" }
        });

        doc.addPage();
        doc.setFontSize(16);
        doc.text(`Total de clientes: ${data.stats.clientes}`, 40, 100);
        doc.text(`Total de fornecedores: ${data.stats.fornecedores}`, 40, 120);
        doc.text(
          `Total de transportadoras: ${data.stats.transportadoras}`,
          40,
          140
        );
        doc.text(
          `Total de pessoas ativas: ${data.stats.ativos}`,
          doc.internal.pageSize.width / 2 - 60,
          100
        );
        doc.text(
          `Total de pessoas inativas: ${data.stats.inativos}`,
          doc.internal.pageSize.width / 2 - 60,
          120
        );
        doc.text(
          `Total de pessoas em análise: ${data.stats.emAnalise}`,
          doc.internal.pageSize.width / 2 - 60,
          140
        );
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

      addHeadersFooters(doc);
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

        console.log(data.pessoas);
        csvExporter.generateCsv(data.pessoas);
      } else if (data.usuarios) {
        csvExporter.generateCsv(data.usuarios);
      } else if (data.produtos) {
        csvExporter.generateCsv(data.produtos);
      }
    }
  }
};
</script>