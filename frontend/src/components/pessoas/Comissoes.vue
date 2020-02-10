<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="Comissões" icon="fa fa-money" sub="Gerencie as comissões dos vendedores" />
        <v-breadcrumbs
          :items="[{ text: 'Pessoas', to: '/pessoas' }, { text: 'comissões' }]"
          divider=">"
          large
        ></v-breadcrumbs>
        <v-card class="p-3">
          <GridComissoes />

          <v-dialog
            v-model="modalStore.pessoas.comissoes.deleteComissao"
            persistent
            max-width="500px"
            v-if="pessoaStore.comissao"
          >
            <v-card>
              <v-card-title>
                <span class="headline">Excluir comissao</span>
              </v-card-title>
              <v-card-text>Excluir comissao {{ pessoaStore.comissao.id }} ?</v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue darken-1"
                  flat
                  @click="modalStore.pessoas.comissoes.deleteComissao = false"
                >Fechar</v-btn>
                <v-btn color="blue darken-1" flat @click="remove()">Confirmar</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card>

        <!-- <AddComissao /> -->
        <AddPessoa />
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
  name: "comissões",
  computed: {
    ...mapState(["pessoaStore", "usuarioStore", "modalStore"])
  },
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    AddPessoa: () => import("@/components/pessoas/AddPessoa"),
    GridComissoes: () => import("./GridComissoes"),
    // AddComissao: () => import("./AddComissao"),
    Email: () => import("@/components/email/Email")
  },
  methods: {
    async loadComissoes() {
      const url = `${urlBD}/`;

      await axios
        .get(url)
        .then(res => {
          this.pessoaStore.comissões = res.data;
          this.pessoaStore.comissões = this.pessoaStore.comissões.map(
            comissao => {
              comissao.valor_total = formatToBRL(comissao.valor_total);
              return comissao;
            }
          );
        })
        .catch(showError);
    },
    remove() {
      const id = this.pessoaStore.comissao.id;
      const url = `${urlBD}/empresacomissões/${id}`;

      let data = new Date();
      const hora = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`;
      const log = {
        id_usuario: this.usuarioStore.currentUsuario.id,
        data: formatDate(data.toISOString().substr(0, 10)),
        hora,
        tipo: "EXCLUSÃO",
        tela: "comissões",
        detalhe: `comissao excluída: ${this.pessoaStore.comissao.id}-${this.pessoaStore.comissao.empresa}`
      };

      axios
        .all([
          axios.delete(url).catch(showError),
          axios.post(`${urlBD}/log`, log).catch(showError)
        ])
        .then(
          axios.spread((empresaRes, logRes) => {
            this.$toasted.global.defaultSuccess();

            this.loadComissoes();
            this.modalStore.pessoas.comissoes.deleteComissao = false;
          })
        )
        .catch(showError);
    }
  },
  mounted() {
    this.loadComissoes();
  }
};
</script>

<style>
</style>
