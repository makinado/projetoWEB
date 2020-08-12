<template>
  <v-container fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle
          main="Relatório de vendas"
          icon="fa fa-shopping-cart"
          sub="Emita relatórios das vendas"
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
                <v-text-field
                  class="mt-3"
                  clearable
                  :color="color"
                  label="Nota fiscal"
                  v-model="filter.nf"
                  :disabled="isOrc"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-autocomplete
                  class="tag-input"
                  dense
                  chips
                  deletable-chips
                  :color="color"
                  label="Cliente"
                  v-model="filter.cliente"
                  :items="pessoaStore.clientes"
                  @focus="$store.dispatch('loadClientes')"
                ></v-autocomplete>
              </v-flex>
              <v-flex xs12 md4>
                <v-autocomplete
                  class="tag-input"
                  dense
                  chips
                  deletable-chips
                  :color="color"
                  label="Vendedor"
                  v-model="filter.vendedor"
                  :items="usuarioStore.currentUsuarios"
                  @focus="$store.dispatch('loadUsuarios')"
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
                    label="Data da venda"
                    :color="color"
                    value="data_criacao"
                    :disabled="isVendedor || isOrc"
                  ></v-radio>
                  <v-radio
                    label="Data agendamento"
                    :color="color"
                    value="data_agendamento"
                    :disabled="isVendedor || isVenda"
                  ></v-radio>
                  <v-radio
                    label="Data contato"
                    :color="color"
                    value="data_contato"
                    :disabled="isVendedor || isVenda"
                  ></v-radio>
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
                      label="Data inicial"
                      prepend-icon="event"
                      readonly
                      v-on="on"
                      :rules="[dataRules]"
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
                      :rules="[dataRules]"
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
                  :disabled="isVendedor"
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
  name: "rel_vendas",
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
      valid: true,
      isVenda: false,
      isVendedor: false,
      isOrc: false,
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
        { header: "Vendas" },
        {
          group: "Vendas",
          value: "vendas",
          text: "Vendas faturadas",
          disabled: false,
        },
        // {
        //   group: "Vendas",
        //   value: "nfs",
        //   text: "Notas fiscais",
        //   disabled: false,
        // },
        { header: "Orçamentos" },
        {
          group: "Orçamentos",
          value: "orcamento",
          text: "Orçamentos",
          disabled: false,
        },
        { header: "Vendedores" },
        {
          group: "Vendedores",
          value: "vendedores",
          text: "Vendedores",
          disabled: false,
        },
      ],
      tipoRules: [(v) => !!v || "Tipo de relatório obrigatório"],
    };
  },
  methods: {
    async reset() {
      this.$refs.form ? this.$refs.form.reset() : "";

      this.isVenda = this.isVendedor = this.isOrc = false;

      this.filter = {
        empresa: this.empresaStore.currentEmpresa,
      };
    },
    dataRules(v) {
      if (this.filter.incluirProdutos && !v) return "Datas são obrigatórias";

      return true;
    },
    loadFiltros() {
      if (this.filter.relatorio == "vendas" || this.filter.relatorio == "nfs") {
        this.isVenda = true;
        this.isVendedor = false;
        this.isOrc = false;
      } else if (this.filter.relatorio == "orcamento") {
        this.isVenda = false;
        this.isVendedor = false;
        this.isOrc = true;
      } else if (this.filter.relatorio == "vendedores") {
        this.isVenda = false;
        this.isVendedor = true;
        this.isOrc = false;
      }
    },
    emit(type) {
      if (!this.$refs.form.validate()) return;

      this.isLoading = true;

      const url = `${urlBD}/rel_vendas?relatorio=${
        this.filter.relatorio || ""
      }&empresa=${this.filter.empresa || ""}&nf=${
        this.filter.nf || ""
      }&cliente=${this.filter.cliente || ""}&vendedor=${
        this.filter.vendedor || ""
      }&ordem=${this.filter.ordem || ""}&data_type=${
        this.filter.data_type || ""
      }&data_inicial=${this.filter.data_inicial || ""}&data_final=${
        this.filter.data_final || ""
      }&incluirProdutos=${this.filter.incluirProdutos || ""}`;

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
        vendas_columns = [
          { title: "Codigo", dataKey: "id" },
          { title: "Cliente", dataKey: "cliente" },
          { title: "Nota fiscal", dataKey: "nota_fiscal" },
          { title: "Data da venda", dataKey: "data_criacao" },
          { title: "Vlr dos produtos", dataKey: "valor_produtos" },
          { title: "Vlr descontos", dataKey: "valor_descontos" },
          { title: "Vlr Total", dataKey: "valor_total" },
        ],
        orcamentos_columns = [
          { title: "Codigo", dataKey: "id" },
          { title: "Cliente", dataKey: "cliente" },
          { title: "Data de contato", dataKey: "data_contato" },
          { title: "Data agendamento", dataKey: "data_agendamento" },
          { title: "Vlr dos produtos", dataKey: "valor_produtos" },
          { title: "Vlr descontos", dataKey: "valor_descontos" },
          { title: "Vlr Total", dataKey: "valor_total" },
        ],
        vendedores_columns = [
          { title: "Código | Nota fiscal", dataKey: "id" },
          { title: "Vendedor", dataKey: "vendedor" },
          { title: "Cliente", dataKey: "cliente" },
          { title: "Data da venda", dataKey: "data_comissao" },
          { title: "Data de pagamento", dataKey: "data_baixa" },
          { title: "Base com.", dataKey: "base_comissao" },
          { title: "Perc com.", dataKey: "perc_comissao" },
          { title: "Valor com.", dataKey: "valor_comissao" },
        ],
        produtos_venda_columns = [
          { title: "Produto", dataKey: "produto" },
          { title: "Quantidade", dataKey: "quantidade" },
          { title: "Vlr venda", dataKey: "valor_venda" },
          { title: "Vlr descontos", dataKey: "valor_descontos" },
          { title: "Vlr Total", dataKey: "valor_total" },
        ];

      var title = "";

      if (data.vendas) {
        title = "Relatório de vendas";

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
            { title: "Total de vendas", dataKey: "totalVendas" },
            { title: "Valor total dos produtos", dataKey: "valorProdutos" },
            { title: "Valor total dos descontos", dataKey: "valorDescontos" },
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
          doc.autoTable(vendas_columns, data.vendas, {
            theme: "striped",
            margin: { top: 90 },
            headStyles: { fillColor: "#B2EBF2", textColor: "black" },
          });
        } else {
          data.vendas.forEach((venda) => {
            const produtosVenda = data.produtos.filter((prods) =>
              prods.filter((prod) => (prod.id_venda = venda.id))
            );

            doc.autoTable(vendas_columns, [venda], {
              theme: "striped",
              margin: { top: 90 },
              headStyles: { fillColor: "#B2EBF2", textColor: "black" },
            });
            doc.autoTable(produtos_venda_columns, produtosVenda[0], {
              theme: "striped",
              margin: { top: 90 },
              headStyles: { fillColor: "#FFCDD2", textColor: "black" },
            });
          });
        }

        addHeadersFooters(doc, title);
        doc.output("dataurlnewwindow");
      } else if (data.vendedores) {
        title = "Relatório de vendedores";

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
            { title: "Total de comissões", dataKey: "quantidade" },
            { title: "Valor total das comissões", dataKey: "valorComissoes" },
            { title: "Valor total", dataKey: "valorTotal" },
          ],
          [data.stats],
          {
            theme: "striped",
            margin: { top: 90 },
            headStyles: { fillColor: "#B2DFDB", textColor: "black" },
          }
        );

        let i = 0;
        let lista = [];
        while (i < data.vendedores.length) {
          const vendedor = data.vendedores[i].vendedor;
          while (
            data.vendedores[i] &&
            vendedor === data.vendedores[i].vendedor
          ) {
            lista.push(data.vendedores[i]);
            i++;
          }

          doc.autoTable(vendedores_columns, lista, {
            theme: "striped",
            margin: { top: 90 },
            headStyles: { fillColor: "#B2EBF2", textColor: "black" },
          });
          lista = [];
        }

        addHeadersFooters(doc, title);
        doc.output("dataurlnewwindow");
      } else if (data.orcamentos) {
        title = "Relatório de orçamentos";

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
            { title: "Total de orçamentos", dataKey: "totalOrcamentos" },
            { title: "Valor total dos produtos", dataKey: "valorProdutos" },
            { title: "Valor total dos descontos", dataKey: "valorDescontos" },
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
          doc.autoTable(orcamentos_columns, data.orcamentos, {
            theme: "striped",
            margin: { top: 90 },
            headStyles: { fillColor: "#B2EBF2", textColor: "black" },
          });
        } else {
          data.orcamentos.forEach((venda) => {
            const produtosVenda = data.produtos.filter((prods) =>
              prods.filter((prod) => (prod.id_venda = venda.id))
            );

            doc.autoTable(orcamentos_columns, [venda], {
              theme: "striped",
              margin: { top: 90 },
              headStyles: { fillColor: "#B2EBF2", textColor: "black" },
            });
            doc.autoTable(produtos_venda_columns, produtosVenda[0], {
              theme: "striped",
              margin: { top: 90 },
              headStyles: { fillColor: "#FFCDD2", textColor: "black" },
            });
          });
        }

        addHeadersFooters(doc, title);
        doc.output("dataurlnewwindow");
      }
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

      if (data.vendas) csvExporter.generateCsv(data.vendas);
      else if (data.orcamentos) csvExporter.generateCsv(data.orcamentos);
      else if (data.vendedores) csvExporter.generateCsv(data.vendedores);
    },
  },
  mounted() {
    this.reset();
  },
};
</script>