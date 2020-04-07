<template>
  <div>
    <v-layout :class="!isMobile? 'column': ''" justify-space-between align-center>
      <v-flex xs12 v-for="item in items" :key="item.text">
        <v-tooltip bottom>
          <v-btn
            slot="activator"
            :color="item.color"
            icon
            dark
            @click.prevent="handleAction(item.action)"
          >
            <v-icon>{{item.icon}}</v-icon>
          </v-btn>
          <span v-if="item.shortcut">{{item.shortcut + ' | ' +item.text}}</span>
          <span v-else>{{item.text}}</span>
        </v-tooltip>
      </v-flex>
    </v-layout>

    <SelectPendentes />
    <Devolucoes />
    <Sangria />
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "pdv-opcoes",
  computed: { ...mapState("app", ["color"]), ...mapState(["modalStore"]) },
  props: {
    isMobile: {
      type: Boolean,
      default: false
    }
  },
  components: {
    SelectPendentes: () => import("./SelectPendentes"),
    Devolucoes: () => import("./Devolucoes"),
    Sangria: () => import("./Sangria")
  },
  data() {
    return {
      items: [
        {
          icon: "fa fa-lg fa-file-text",
          text: "Vendas pendentes",
          color: "warning",
          action: "pendentes",
          shortcut: "F2"
        },
        {
          icon: "fa fa-lg fa-arrow-up",
          text: "Devoluções",
          color: "primary",
          action: "devolucoes",
          shortcut: "F4"
        },
        {
          icon: "fa fa-lg fa-money",
          text: "Suprimentos e Sangria",
          color: "danger",
          action: "sangria",
          shortcut: "F7"
        },
        {
          icon: "fa fa-lg fa-print",
          text: "Imprimir",
          color: "blue",
          shortcut: "F8"
        },
        {
          icon: "fa fa-lg fa-cog",
          text: "Configurações",
          color: "secondary"
        }
      ]
    };
  },
  methods: {
    handleAction(store) {
      this.modalStore.vendas.pdv[store] = true;
    }
  }
};
</script>

<style>
</style>