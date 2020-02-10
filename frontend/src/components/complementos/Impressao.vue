<template>
  <v-dialog
    v-model="modalStore.complementos.impressao.visible"
    v-if="modalStore.complementos.impressao.visible"
    lazy
    max-width="900px"
  >
    <div ref="content">
      <v-card>
        <v-card-title class="headline">{{ modalStore.complementos.impressao.title }}</v-card-title>
        <v-card-text>
          <v-card>
            <v-layout justify-center>
              <v-flex xs12 md6>
                <v-img
                  src="https://picsum.photos/id/341/300/200"
                  class="white--text mr-2"
                  height="200px"
                  gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                  @click="downloadPDF()"
                >
                  <v-card-title class="fill-height align-end">
                    <span>
                      <v-icon color="white">fa fa-2x fa-file-pdf-o</v-icon>
                      <v-spacer></v-spacer>
                      <h3>Gerar PDF</h3>
                    </span>
                  </v-card-title>
                </v-img>
              </v-flex>
              <v-flex xs12 md6>
                <v-img
                  src="https://picsum.photos/id/366/300/200"
                  class="white--text"
                  height="200px"
                  gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                >
                  <v-card-title class="fill-height align-end">
                    <span>
                      <v-icon color="white">fa fa-2x fa-envelope</v-icon>
                      <v-spacer></v-spacer>
                      <h3>Enviar por E-mail</h3>
                    </span>
                  </v-card-title>
                </v-img>
              </v-flex>
            </v-layout>
          </v-card>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            flat
            @click="modalStore.complementos.impressao.visible = false"
          >Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-dialog>
</template>

<script>
import { mapState } from "vuex";

import jsPDF from "jspdf";
import "jspdf-autotable";

export default {
  name: "Impressao",
  computed: mapState(["modalStore"]),
  data() {
    return {
      items: [
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" },
        { nome: "Andrielly Luiza", total: "R$ 35,25" }
      ]
    };
  },
  methods: {
    addHeadersFooters(doc) {
      const pageCount = doc.internal.getNumberOfPages();

      doc.setFont("helvetica", "italic");

      for (var i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        //cabeçalho
        doc.setFontSize(8);
        doc.text(this.filter.empresa.text || "ERRO NA EMPRESA", 40, 20);
        doc.setFontSize(12);
        doc.text(
          "Relatório de cadastros",
          doc.internal.pageSize.width / 2 - 60,
          20
        );
        doc.setFontSize(8);
        doc.text(String(pageCount), doc.internal.pageSize.width - 45, 20);

        //rodapé
        doc.text(new Date().toLocaleDateString(), 40, 820);
        doc.text(
          String(i) + " de " + String(pageCount),
          doc.internal.pageSize.width / 2,
          820
        );
        doc.text(
          this.usuarioStore.currentUsuario.nome,
          doc.internal.pageSize.width - 100,
          820
        );
      }
    },
    downloadPDF() {
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

      var doc = new jsPDF("p", "pt"),
        columns = [
          { title: "Nome", dataKey: "nome" },
          { title: "Total a pagar", dataKey: "total" }
        ],
        otherColumns = [
          { title: "Nome", dataKey: "nome" },
          { title: "Total a pagar", dataKey: "total" }
        ],
        margins = {
          top: 80,
          bottom: 60,
          left: 40,
          width: 522
        };

      doc.textEx("Example text", 100, 20, "right", "middle");

      for (let i = 0; i < this.items.length; i++) {
        doc.autoTable(columns, [this.items[i]], {
          theme: "striped",
          headStyles: { fillColor: "#B2DFDB", textColor: "black" },
          bodyStyles: { minCellHeight: 100 }
          // didDrawCell: data => {
          //   if (data.column.index === 0) {
          //     data.column.colspan = 5;
          //     doc.text(
          //       "textooooooooooooooooooooooooooooooooooooooooooooooooooooooo",
          //       data.cursor.x + 10,
          //       data.cursor.y + 30
          //     );
          //   }
          // }
        });
      }

      // this.addHeadersFooters(doc);
      doc.save("test.pdf");
    }
  }
};
</script>

<style>
</style>
