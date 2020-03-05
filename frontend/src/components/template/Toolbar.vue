<template>
  <v-toolbar dense flat app extended extension-height="5">
    <v-toolbar-side-icon @click="$store.state.drawerLeft = !$store.state.drawerLeft"></v-toolbar-side-icon>

    <v-flex xs12 md4 class="ml-4 mt-4">
      <SelectEmpresa />
    </v-flex>

    <v-spacer></v-spacer>

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
      <v-badge slot="activator" color="danger" left overlap>
        <v-span v-if="notificacoes.lenght > 0" slot="badge" dark small>{{ notificacoes.lenght }}</v-span>
        <v-btn icon>
          <v-icon>fa fa-lg fa-bell</v-icon>
        </v-btn>
      </v-badge>
      <v-list>
        <v-list-tile v-for="(item, index) in notificacoes" :key="index" @click>
          <v-list-tile-title>{{ item.title }}</v-list-tile-title>
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
        <v-list-tile
          v-for="(item, index) in items"
          :key="index"
          @click="clickEvent(item.title, item.link)"
        >
          <v-list-tile-action>
            <v-btn icon color="primary">
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
    <v-progress-linear
      v-if="isLoading"
      slot="extension"
      color="primary"
      :indeterminate="true"
      height="3"
    />
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
      title: null,
      items: [
        { icon: "fa fa-lg fa-user", title: "Perfil", link: "/usuario" },
        { icon: "fa fa-lg fa-cog", title: "Configurações", link: "/" },
        { icon: "fa fa-lg fa-sign-out", title: "Sair", link: "" }
      ]
    };
  },
  methods: {
    clickEvent(title, link) {
      if (title != "Sair") {
        this.navigate(link);
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
    logout() {
      localStorage.removeItem(usuarioKey);
      socket.emit("logout", this.usuarioStore.currentUsuario);
      this.$store.commit("setUsuario", null);

      this.$router.push({ path: "/auth" });
    }
  }
};
</script>

<style>
</style>
