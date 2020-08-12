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
                  @change="loadFiltros"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12 md4>
                <v-autocomplete
                  class="tag-input"
                  dense
                  chips
                  deletable-chips
                  :color="color"
                  label="Empresa"
                  placeholder="Todas as empresas selecionadas"
                  v-model="filter.empresa"
                  :items="empresaStore.currentEmpresas"
                  @focus="$store.dispatch('loadEmpresas')"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12 md4>
                <v-autocomplete
                  class="tag-input"
                  dense
                  chips
                  deletable-chips
                  :color="color"
                  label="Fornecedor"
                  v-model="filter.fornecedor"
                  :items="pessoaStore.fornecedores"
                  @focus="$store.dispatch('loadFornecs')"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field
                  class="mt-3"
                  clearable
                  :color="color"
                  label="Nota fiscal"
                  v-model="filter.nf"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-autocomplete
                  class="tag-input"
                  dense
                  chips
                  deletable-chips
                  :color="color"
                  label="Situação"
                  v-model="filter.situacao"
                  :items="['pendente', 'concluído', 'todos']"
                  :disabled="isCompra"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12 md4>
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
                  <v-radio
                    label="Data da nota fiscal"
                    :color="color"
                    value="data_notafiscal"
                    :disabled="isPedido"
                  ></v-radio>
                  <v-radio
                    label="Data do pedido"
                    :color="color"
                    value="data_pedido"
                    :disabled="isCompra"
                  ></v-radio>
                  <v-radio label="Data de lançamento" :color="color" value="data_lancamento"></v-radio>
                </v-radio-group>
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
                      :rules="[dataRules]"
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
                      :rules="[dataRules]"
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

              <v-flex xs12>
                <v-switch
                  label="Incluir produtos no relatório"
                  :color="color"
                  v-model="filter.incluirProdutos"
                ></v-switch>
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
    ...mapState(["usuarioStore", "empresaStore", "pessoaStore"]),
    computedDateFormatted: {
      get() {
        return formatDate(this.filter.data_inicial);
      },
      set(value) {
        this.filter.data_inicial = value;
      },
    },
    computedDateFormatted1: {
      get() {
        return formatDate(this.filter.data_final);
      },
      set(value) {
        this.filter.data_final = value;
      },
    },
    nomeEmpresa() {
      if (!this.filter.empresa) return "Todas as empresas estão selecionadas";
      return this.empresaStore.currentEmpresas.find(
        (emp) => emp.value == this.filter.empresa
      ).text;
    },
  },
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    Card: () => import("../material/Card"),
  },
  data() {
    return {
      isPedido: false,
      isCompra: false,
      valid: true,
      menu: false,
      menu1: false,
      isLoading: false,
      filter: {},
      ordens: [
        { value: "id", text: "Código" },
        { value: "nota_fiscal", text: "Nota fiscal" },
        { value: "data", text: "Data" },
      ],
      relatorios: [
        { header: "Pedidos" },
        {
          group: "Pedidos",
          value: "pedidos",
          text: "Pedidos",
          disabled: false,
        },
        { header: "Compras" },
        {
          group: "Compras",
          value: "compras",
          text: "Compras",
          disabled: false,
        },
        {
          group: "Compras",
          value: "analise de compra",
          text: "Análise de compra",
          disabled: false,
        },
      ],
      tipoRules: [(v) => !!v || "Tipo de relatório obrigatório"],
    };
  },
  methods: {
    async reset() {
      this.$refs.form ? this.$refs.form.reset() : "";

      this.isPedido = this.isCompra = false;

      this.filter = {
        empresa: this.empresaStore.currentEmpresa,
        situacao: "todos",
      };
    },
    dataRules(v) {
      if (this.filter.incluirProdutos && !v) return "Datas são obrigatórias";

      return true;
    },
    loadFiltros() {
      if (this.filter.relatorio == "pedidos") {
        this.isPedido = true;
        this.isCompra = false;
      } else {
        this.isPedido = false;
        this.isCompra = true;
      }
    },
    emit(type) {
      if (!this.$refs.form.validate()) return;

      this.isLoading = true;
      const url = `${urlBD}/rel_compras?relatorio=${
        this.filter.relatorio || ""
      }&fornecedor=${this.filter.fornecedor || ""}&empresa=${
        this.filter.empresa || ""
      }&nf=${this.filter.nf || ""}&incluirProdutos=${
        this.filter.incluirProdutos || ""
      }&situacao=${this.filter.situacao || ""}&data_inicial=${
        this.filter.data_inicial || ""
      }&data_final=${this.filter.data_final || ""}&ordem=${this.filter.ordem}`;

      axios
        .get(url)
        .then((res) => {
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
      const addHeadersFooters = (doc, title) => {
        const pageCount = doc.internal.getNumberOfPages();

        doc.setFont("helvetica", "italic");

        for (var i = 1; i <= pageCount; i++) {
          doc.setPage(i);

          //cabeçalho
          doc.setFontSize(8);
          doc.text(this.nomeEmpresa, 40, 35);
          doc.setFontSize(12);
          doc.text(
            title,
            doc.internal.pageSize.width / 2 -
              (doc.getStringUnitWidth(title) * doc.internal.getFontSize()) / 2,
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
        pedidos_columns = [
          { title: "Codigo", dataKey: "id" },
          { title: "Fornecedor", dataKey: "fornecedor" },
          { title: "Nota fiscal", dataKey: "nota_fiscal" },
          { title: "Situação", dataKey: "situacao" },
          { title: "Data ped.", dataKey: "data_pedido" },
          { title: "Vlr dos produtos", dataKey: "valor_produtos" },
          { title: "Vlr descontos", dataKey: "valor_descontos" },
          { title: "Vlr Total", dataKey: "valor_total" },
        ],
        produtos_pedido_columns = [
          { title: "Produto", dataKey: "produto" },
          { title: "Quantidade", dataKey: "quantidade" },
          { title: "Vlr Unit.", dataKey: "valor_unitario" },
          { title: "Vlr descontos", dataKey: "valor_descontos" },
          { title: "Vlr Total", dataKey: "valor_total" },
        ],
        produtos_compra_columns = [
          { title: "Produto", dataKey: "produto" },
          { title: "Quantidade", dataKey: "quantidade" },
          { title: "Vlr Unit.", dataKey: "valor_unitario" },
          { title: "Vlr descontos", dataKey: "valor_descontos" },
          { title: "Vlr Total", dataKey: "valor_total" },
        ],
        nf_columns = [
          { title: "Codigo", dataKey: "id" },
          { title: "Fornecedor", dataKey: "fornecedor" },
          { title: "Nota fiscal", dataKey: "nota_fiscal" },
          { title: "Data NF", dataKey: "data_notafiscal" },
          { title: "Vlr dos produtos", dataKey: "valor_produtos" },
          { title: "Vlr descontos", dataKey: "valor_descontos" },
          { title: "Vlr Total", dataKey: "valor_total" },
        ];

      var title = "";
      if (data.pedidos) {
        title = "Relatório de pedidos";

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
            { title: "Pedidos", dataKey: "pendentes" },
            { title: "Pedidos concluídos", dataKey: "concluidos" },
            {
              title: "Total de pedidos",
              dataKey: "totalPedidos",
            },
            {
              title: "Valor total",
              dataKey: "valorTotal",
            },
          ],
          [data.stats],
          {
            theme: "striped",
            margin: { top: 90 },
            headStyles: { fillColor: "#B2DFDB", textColor: "black" },
          }
        );

        if (!this.filter.incluirProdutos) {
          doc.autoTable(pedidos_columns, data.pedidos, {
            theme: "striped",
            margin: { top: 90 },
            headStyles: { fillColor: "#B2EBF2", textColor: "black" },
          });
        } else {
          data.pedidos.forEach((ped) => {
            const produtosPedido = data.produtos.filter((prods) =>
              prods.filter((prod) => (prod.id_pedido = ped.id))
            );

            doc.autoTable(pedidos_columns, [ped], {
              theme: "striped",
              margin: { top: 90 },
              headStyles: { fillColor: "#B2EBF2", textColor: "black" },
            });
            doc.autoTable(produtos_pedido_columns, produtosPedido[0], {
              theme: "striped",
              margin: { top: 90 },
              headStyles: { fillColor: "#FFCDD2", textColor: "black" },
            });
          });
        }

        addHeadersFooters(doc, title);
        doc.output("dataurlnewwindow");
      } else if (data.compras) {
        title = "Relatório de notas fiscais";

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
            { title: "Total de compras", dataKey: "quantidade" },
            {
              title: "Valor total",
              dataKey: "valorTotal",
            },
          ],
          [data.stats],
          {
            theme: "striped",
            margin: { top: 90 },
            headStyles: { fillColor: "#B2DFDB", textColor: "black" },
          }
        );

        if (!this.filter.incluirProdutos) {
          doc.autoTable(nf_columns, data.compras, {
            theme: "striped",
            margin: { top: 90 },
            headStyles: { fillColor: "#B2EBF2", textColor: "black" },
          });
        } else {
          data.compras.forEach((compra) => {
            const produtosCompra = data.produtos.filter((prods) =>
              prods.filter((prod) => (prod.id_compra = compra.id))
            );

            doc.autoTable(nf_columns, [compra], {
              theme: "striped",
              margin: { top: 90 },
              headStyles: { fillColor: "#B2EBF2", textColor: "black" },
            });
            doc.autoTable(produtos_compra_columns, produtosCompra[0], {
              theme: "striped",
              margin: { top: 90 },
              headStyles: { fillColor: "#FFCDD2", textColor: "black" },
            });
          });
        }

        addHeadersFooters(doc, title);
        doc.output("dataurlnewwindow");
      } else showError("Erro na geração do relatório");
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
          new Date().toLocaleDateString().split("/").join(""),
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
        // headers: ['id', 'Nome', ''] //<-- Won't work with useKeysAsHeaders present!
      };

      const csvExporter = new ExportToCsv(options);

      if (data.pedidos) {
        csvExporter.generateCsv(data.pedidos);
      } else if (data.compras) {
        csvExporter.generateCsv(data.compras);
      }
    },
  },
  mounted() {
    this.reset();
  },
};
</script>