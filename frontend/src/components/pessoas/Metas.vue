<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="Metas" icon="fa fa-line-chart" sub="Gerencie as metas dos vendedores" />
        <v-breadcrumbs
          :items="[{ text: 'Pessoas', to: '/pessoas' }, { text: 'Metas' }]"
          divider=">"
          large
        ></v-breadcrumbs>
        <v-card class="p-3">
          <GridMetas />

          <v-dialog
            v-model="modalStore.empresas.metas.deleteMeta"
            persistent
            max-width="500px"
            v-if="empresaStore.meta"
          >
            <v-card>
              <v-card-title>
                <span class="headline">Excluir meta</span>
              </v-card-title>
              <v-card-text>Excluir meta {{ empresaStore.meta.id }} ?</v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue darken-1"
                  flat
                  @click="modalStore.empresas.metas.deleteMeta = false"
                >Fechar</v-btn>
                <v-btn color="blue darken-1" flat @click="remove()">Confirmar</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card>

        <AddMeta />
        <addPessoa />
        <Email />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";
import { urlBD, showError, formatDate } from "@/global";
import { mapState } from "vuex";

import { formatToBRL } from "brazilian-values";

export default {
  name: "Metas",
  computed: {
    ...mapState(["empresaStore", "usuarioStore", "modalStore"])
  },
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    AddPessoa: () => import("@/components/pessoas/AddPessoa"),
    GridMetas: () => import("./GridMetas"),
    AddMeta: () => import("./AddMeta"),
    Email: () => import("@/components/email/Email")
  },
  methods: {
    async loadMetas() {
      const url = `${urlBD}/empresaMetas/`;

      await axios
        .get(url)
        .then(res => {
          this.empresaStore.metas = res.data;
          this.empresaStore.metas = this.empresaStore.metas.map(meta => {
            meta.valor_total = formatToBRL(meta.valor_total);
            return meta;
          });
        })
        .catch(showError);
    },
    remove() {
      const id = this.empresaStore.meta.id;
      const url = `${urlBD}/empresaMetas/${id}`;

      let data = new Date();
      const hora = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`;
      const log = {
        id_usuario: this.usuarioStore.currentUsuario.id,
        data: formatDate(data.toISOString().substr(0, 10)),
        hora,
        tipo: "EXCLUSÃO",
        tela: "METAS",
        detalhe: `Meta excluída: ${this.empresaStore.meta.id}-${this.empresaStore.meta.empresa}`
      };

      axios
        .all([
          axios.delete(url).catch(showError),
          axios.post(`${urlBD}/log`, log).catch(showError)
        ])
        .then(
          axios.spread((empresaRes, logRes) => {
            this.$toasted.global.defaultSuccess();

            this.loadMetas();
            this.modalStore.empresas.metas.deleteMeta = false;
          })
        )
        .catch(showError);
    }
  },
  mounted() {
    this.loadMetas();
  }
};
</script>

<style>
</style>
