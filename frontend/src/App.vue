<template>
  <v-app id="inspire">
    <Toolbar v-if="TemplateVisible" />
    <Menu v-if="TemplateVisible" />
    <FullScreenLoading v-if="validatingToken && !TemplateVisible" />
    <Content v-else />
    <ThemeOptions v-if="TemplateVisible" />
    <Chat v-if="TemplateVisible" />

    <DialogLoading />
  </v-app>
</template>

<script>
import Toolbar from "./components/template/Toolbar";
import Menu from "./components/template/Menu";
import Content from "./components/template/Content";
import ThemeOptions from "./components/template/ThemeOptions";
import Chat from "./components/template/Chat";

import { urlBD, showError, usuarioKey, loadEmpresas } from "@/global";
import axios from "axios";
import { mapState } from "vuex";
export default {
  name: "App",
  components: {
    Toolbar,
    Menu,
    Content,
    ThemeOptions,
    Chat,
    FullScreenLoading: () => import("./components/template/FullScreenLoading"),
    DialogLoading: () => import("./components/template/DialogLoading")
  },
  computed: {
    ...mapState([
      "TemplateVisible",
      "usuarioStore",
      "empresaStore",
      "fullLoading",
      "dialogLoading"
    ])
  },
  data: function() {
    return {
      validatingToken: true
    };
  },
  methods: {
    async validateToken() {
      this.validatingToken = true;

      const usuarioStorage = localStorage.getItem(usuarioKey);
      const usuario = JSON.parse(usuarioStorage);
      this.$store.commit("setUsuario", null);

      if (!usuario) {
        this.validatingToken = false;
        if (this.$route.params.token)
          return this.$router.push({ path: "/reset" });
        else return this.$router.push({ path: "/auth" });
      }

      const res = await axios.post(`${urlBD}/validateToken`, usuario);

      if (res.data) {
        this.$store.commit("setUsuario", usuario);
        socket.emit("login", usuario);

        axios
          .get(
            `${urlBD}/usuarioEmpresas/${this.usuarioStore.currentUsuario.id}`
          )
          .then(res => {
            this.empresaStore.currentEmpresas = res.data;
            this.$store.commit(
              "setEmpresa",
              this.empresaStore.currentEmpresas[0]
            );
          });

        axios
          .get(`${urlBD}/perfis/${usuario.id_perfil}`)
          .then(res => {
            this.$store.commit("setPerfil", res.data);
          })
          .catch(showError);
      } else {
        localStorage.removeItem(usuarioKey);
        this.$router.push({ path: "/auth" });
      }

      this.validatingToken = false;
    }
  },
  created() {
    this.validateToken();
  }
};
</script>

<style lang="scss">
@import "@/styles/index.scss";

html {
  overflow-y: auto;
  overflow-x: hidden;
}

body {
  margin: 0;
}

.v-datatable thead th.column.sortable i {
  vertical-align: unset;
}
</style>