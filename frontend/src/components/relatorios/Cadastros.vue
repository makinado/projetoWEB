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
                  @change="loadFiltros"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12 md2>
                <v-autocomplete
                  class="tag-input"
                  dense
                  chips
                  deletable-chips
                  :color="color"
                  label="Sexo"
                  v-model="filter.sexo"
                  :items="filter.sexos"
                  no-data-text="Filtro de sexo não permitido"
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
              <v-flex xs12 md2>
                <v-autocomplete
                  dense
                  clearable
                  :color="color"
                  label="Ordenar por"
                  v-model="filter.ordem"
                  :items="ordens"
                ></v-autocomplete>
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
    nomeEmpresa() {
      if (!this.empresaStore.currentEmpresa)
        return "Todas as empresas estão selecionadas";
      return this.empresaStore.currentEmpresas.find(
        emp => emp.value == this.empresaStore.currentEmpresa
      ).text;
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
        { value: "nome", text: "Nome/Descrição" }
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
    loadFiltros() {
      if (
        this.filter.cadastros.includes("cliente") ||
        this.filter.cadastros.includes("fornecedor") ||
        this.filter.cadastros.includes("transportadora")
      ) {
        this.$store.dispatch("loadCategoriasPessoas");
        this.filter.sexos = ["Masculino", "Feminino"];
      } else {
        this.categoriaStore.categorias = [];
        this.filter.sexos = [];
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
        ""}&sexo=${this.filter.sexo || ""}&marca=${this.filter.marca ||
        ""}&unidade=${this.filter.unidade || ""}&ordem=${this.filter.ordem ||
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
            date.toLocaleDateString() + " - " + date.toLocaleTimeString(),
            doc.internal.pageSize.width - 120,
            35
          );
          doc.line(20, 50, doc.internal.pageSize.width - 20, 50);

          // rodapé
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
          { title: "CPF/CNPJ", dataKey: "cpf_cnpj" },
          { title: "Categoria", dataKey: "categoria" },
          { title: "Email", dataKey: "email" },
          { title: "Contato", dataKey: "contato" }
        ],
        usuarios_columns = [
          { title: "Código", dataKey: "id" },
          { title: "Nome", dataKey: "nome" },
          { title: "E-mail", dataKey: "email" },
          { title: "Contato", dataKey: "contato" },
          { title: "Vendas", dataKey: "valor_vendas" },
          { title: "Comissões", dataKey: "valor_comissoes" }
        ],
        produtos_columns = [
          { title: "Codigo", dataKey: "id" },
          { title: "Descrição", dataKey: "descricao" },
          { title: "Categoria", dataKey: "categoria" },
          { title: "Marca", dataKey: "marca" },
          { title: "Unid", dataKey: "unidade" },
          { title: "Vlr unit.", dataKey: "valor_unitario" },
          { title: "Vlr venda", dataKey: "valor_venda" },
          { title: "Vlr custo", dataKey: "valor_custo_medio" }
        ];

      if (data.pessoas) {
        data.pessoas.map(pessoa => {
          if (pessoa.cpf) pessoa.cpf_cnpj = pessoa.cpf;
          else pessoa.cpf_cnpj = pessoa.cnpj;

          if (!pessoa.categoria) pessoa.categoria = "";

          return pessoa;
        });

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
            { title: "Clientes", dataKey: "clientes" },
            { title: "Fornecedores", dataKey: "fornecedores" },
            { title: "Transportadoras", dataKey: "transportadoras" },
            { title: "Ativos", dataKey: "ativos" },
            { title: "Inativos", dataKey: "inativos" },
            { title: "Em análise", dataKey: "emAnalise" }
          ],
          [data.stats],
          {
            theme: "striped",
            margin: { top: 90 },
            headStyles: { fillColor: "#B2DFDB", textColor: "black" }
          }
        );
        doc.autoTable(pessoas_columns, data.pessoas, {
          theme: "striped",
          headStyles: { fillColor: "#B2DFDB", textColor: "black" }
        });
      } else if (data.usuarios) {
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
          [{ title: "Usuários", dataKey: "usuarios" }],
          [data.stats],
          {
            theme: "striped",
            margin: { top: 90 },
            headStyles: { fillColor: "#B2DFDB", textColor: "black" }
          }
        );
        doc.autoTable(usuarios_columns, data.usuarios, {
          theme: "striped",
          headStyles: { fillColor: "#B2DFDB", textColor: "black" }
        });
      } else if (data.produtos) {
        data.produtos.map(produto => {
          if (!produto.valor_venda) produto.valor_venda = "0.00";
          if (!produto.valor_unitario) produto.valor_unitario = "0.00";
          if (!produto.valor_custo_medio) produto.valor_custo_medio = "0.00";

          return produto;
        });

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
        doc.autoTable(produtos_columns, data.produtos, {
          theme: "striped",
          margin: { top: 90 },
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