<template>
  <v-toolbar dense flat app extended extension-height="5">
    <v-toolbar-side-icon @click="$store.state.drawerLeft = !$store.state.drawerLeft"></v-toolbar-side-icon>

    <v-flex xs12 md3 class="ml-4 mt-4">
      <SelectEmpresa />
    </v-flex>

    <v-spacer></v-spacer>

    <v-menu
      :close-on-content-click="true"
      bottom
      left
      min-width="300"
      max-width="500"
      nudge-left="12"
      offset-x
      transition="slide-y-transition"
    >
      <v-btn icon slot="activator">
        <v-badge v-if="notificacoes.length > 0" color="danger" left>
          <template v-slot:badge>
            <small>{{ notificacoes.length }}</small>
          </template>
        </v-badge>
        <v-icon>fa fa-lg fa-bell</v-icon>
      </v-btn>

      <v-toolbar :color="color" dark dense>
        <v-layout row wrap justify-center>
          <span>Central de notificações</span>
        </v-layout>
      </v-toolbar>
      <v-list>
        <v-layout row wrap justify-center>
          <span class="my-3" v-if="notificacoes.length == 0">Nenhuma nova notificação</span>
        </v-layout>
        <v-list-tile
          class="my-2"
          v-for="(item, index) in notificacoes"
          :key="index"
          @click="clickEvent(item)"
        >
          <v-list-tile-action>
            <v-btn icon :color="cores[index]" dark>
              <v-icon>fa fa-lg fa-bell</v-icon>
            </v-btn>
          </v-list-tile-action>
          <v-layout column>
            <v-list-tile-title>{{ item.titulo }}</v-list-tile-title>
            <small class="overline">{{ item.conteudo }}</small>
          </v-layout>
        </v-list-tile>
      </v-list>
    </v-menu>

    <v-menu
      :close-on-content-click="true"
      bottom
      left
      min-width="300"
      max-width="300"
      nudge-left="12"
      offset-x
      transition="slide-y-transition"
    >
      <v-btn slot="activator" icon>
        <v-icon>fa fa-lg fa-user</v-icon>
      </v-btn>
      <v-list>
        <v-list-tile v-for="(item, index) in items" :key="index" @click="clickEvent(item)">
          <v-list-tile-action>
            <v-btn icon :color="color">
              <v-icon>{{item.icon}}</v-icon>
            </v-btn>
          </v-list-tile-action>
          <v-list-tile-title>{{ item.title }}</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>

    <v-btn class="mr-4" icon @click="clickDrawerRight">
      <v-icon>fa fa-lg fa-align-left</v-icon>
    </v-btn>

    <v-progress-linear v-if="isLoading" slot="extension" :color="color" indeterminate height="3" />
  </v-toolbar>
</template>

<script>
import { mapState } from "vuex";
import { usuarioKey } from "@/global";

export default {
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["isLoading", "notificacoes", "usuarioStore", "empresaStore"])
  },
  components: {
    SelectEmpresa: () => import("../empresas/SelectEmpresa")
  },
  data() {
    return {
      cores: ["danger", "success", "info", "warning"],
      items: [
        { icon: "fa fa-lg fa-user", title: "Perfil", link: "/usuario" },
        { icon: "fa fa-lg fa-cog", title: "Configurações", link: "/" },
        { icon: "fa fa-lg fa-sign-out", title: "Sair", link: "" }
      ]
    };
  },
  methods: {
    clickEvent(item) {
      if (item.title != "Sair") {
        this.notificacoes = this.notificacoes.filter(n => n.id != item.id);
        this.navigate(item.link);
      } else {
        this.logout();
      }
    },
    clickDrawerRight() {
      this.$store.state.drawerRight = !this.$store.state.drawerRight;
      if (this.$store.state.drawerRight) this.$store.dispatch("loadAtividades");
    },
    navigate(path, newTab) {
      if (newTab) {
        const routeData = this.$router.resolve({ path: path });
        window.open(routeData.href, "_blank");
      } else {
        this.$router.push({ path: path });
      }
    },
    notify() {
      // https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification#Parameters
      this.$notification.show(
        "Hello World",
        {
          body: "This is an example!"
        },
        {}
      );
    },
    logout() {
      localStorage.removeItem(usuarioKey);
      this.$socket.emit("logout", this.usuarioStore.currentUsuario);
      this.$store.commit("setUsuario", null);

      this.$router.push({ path: "/auth" });
    }
  }
};
</script>

<style>
</style>
