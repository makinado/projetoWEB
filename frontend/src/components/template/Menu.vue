<template>
  <div id="menu">
    <v-navigation-drawer
      id="app-drawer"
      v-model="$store.state.drawerLeft"
      app
      dark
      floating
      persistent
      mobile-break-point="1500px"
    >
      <v-img :src="image" :gradient="sidebarOverlayGradiant" height="100%">
        <v-layout class="fill-height" tag="v-list" column>
          <a href="#" @click.left.exact="navigate('/',false)" @click.ctrl="navigate('/',true)">
            <v-list-tile avatar>
              <v-list-tile-avatar color="white">
                <v-img :src="logo" height="40" contain />
              </v-list-tile-avatar>
              <v-list-tile-title class="title text-light">CodeStudio</v-list-tile-title>
            </v-list-tile>
          </a>

          <v-divider />

          <v-list-tile avatar class="mb-3" to="/usuario">
            <v-list-tile-avatar :color="color" size="60">
              <img
                v-if="usuarioStore.currentUsuario.img"
                :src="`${urlBD}/${usuarioStore.currentUsuario.img}`"
                alt="Imagem de perfil"
                height="50"
              />
              <v-icon v-else class="text-light">fa fa-user fa-2x</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-title class="title text-light">{{ usuarioStore.currentUsuario.nome}}</v-list-tile-title>
          </v-list-tile>

          <v-list class="v-list">
            <v-list-tile>
              <v-list-tile-title>{{ data }}</v-list-tile-title>
            </v-list-tile>
          </v-list>

          <v-list dense>
            <v-list-tile :active-class="color" no-action to="/">
              <v-list-tile-action>
                <v-icon>{{ home.icon }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>{{ home.title }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-list-group v-if="perfil.cadastros" :key="cadastros.title" no-action>
              <template slot="activator">
                <v-list-tile>
                  <v-list-tile-action>
                    <v-icon>{{ cadastros.icon }}</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ cadastros.title }}</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>

              <v-list-tile
                v-for="item in cadastros.items"
                :key="item.title"
                :to="item.link"
                v-if="item.visible"
                :active-class="color"
              >
                <v-list-tile-action>
                  <v-icon>{{ item.icon }}</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list-group>

            <v-list-group v-if="perfil.compras" :key="compras.title" no-action>
              <template slot="activator">
                <v-list-tile>
                  <v-list-tile-action>
                    <v-icon>{{ compras.icon }}</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ compras.title }}</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>

              <v-list-tile
                v-for="item in compras.items"
                :key="item.title"
                :to="item.link"
                v-if="item.visible"
                :active-class="color"
              >
                <v-list-tile-action>
                  <v-icon>{{ item.icon }}</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list-group>

            <v-list-group v-if="perfil.vendas" :key="vendas.title" no-action>
              <template slot="activator">
                <v-list-tile>
                  <v-list-tile-action>
                    <v-icon>{{ vendas.icon }}</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ vendas.title }}</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>

              <v-list-tile
                v-for="item in vendas.items"
                :key="item.title"
                :to="item.link"
                v-if="item.visible"
                :active-class="color"
              >
                <v-list-tile-action>
                  <v-icon>{{ item.icon }}</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list-group>

            <v-list-group v-if="perfil.financeiro" :key="financeiro.title" no-action>
              <template slot="activator">
                <v-list-tile>
                  <v-list-tile-action>
                    <v-icon>{{ financeiro.icon }}</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ financeiro.title }}</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>

              <v-list-tile
                v-for="item in financeiro.items"
                :key="item.title"
                :to="item.link"
                v-if="item.visible"
                :active-class="color"
              >
                <v-list-tile-action>
                  <v-icon>{{ item.icon }}</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list-group>

            <v-list-group :key="fiscais.title" no-action>
              <template slot="activator">
                <v-list-tile>
                  <v-list-tile-action>
                    <v-icon>{{ fiscais.icon }}</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ fiscais.title }}</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>

              <v-list-tile
                v-for="item in fiscais.items"
                :key="item.title"
                :to="item.link"
                :active-class="color"
              >
                <v-list-tile-action>
                  <v-icon>{{ item.icon }}</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list-group>

            <v-list-group :key="relatorios.title" no-action>
              <template slot="activator">
                <v-list-tile>
                  <v-list-tile-action>
                    <v-icon>{{ relatorios.icon }}</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ relatorios.title }}</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>

              <v-list-tile
                v-for="item in relatorios.items"
                :key="item.title"
                :to="item.link"
                v-if="item.visible"
                :active-class="color"
              >
                <v-list-tile-action>
                  <v-icon>{{ item.icon }}</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list-group>

            <v-list-group :key="ferramentas.title" no-action>
              <template slot="activator">
                <v-list-tile>
                  <v-list-tile-action>
                    <v-icon>{{ ferramentas.icon }}</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ ferramentas.title }}</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>

              <v-list-tile
                v-for="item in ferramentas.items"
                :key="item.title"
                :to="item.link"
                :active-class="color"
              >
                <v-list-tile-action>
                  <v-icon>{{ item.icon }}</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list-group>

            <v-list-group :key="ajuda.title" no-action>
              <template slot="activator">
                <v-list-tile>
                  <v-list-tile-action>
                    <v-icon>{{ ajuda.icon }}</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ ajuda.title }}</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>

              <v-list-tile
                v-for="item in ajuda.items"
                :key="item.title"
                :to="item.link"
                :active-class="color"
              >
                <v-list-tile-action>
                  <v-icon>{{ item.icon }}</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list-group>

            <v-list-tile :active-class="color" no-action to="/config">
              <v-list-tile-action>
                <v-icon>{{ config.icon }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>{{ config.title }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>

          <v-list-tile
            :active-class="color"
            no-action
            class="v-list-item v-list__tile--buy"
            to="/upgrade"
          >
            <v-list-tile-action>
              <v-icon>fa fa-bolt</v-icon>
            </v-list-tile-action>
            <v-list-tile-title class="font-weight-light">Fazer upgrade de pacote</v-list-tile-title>
          </v-list-tile>
        </v-layout>
      </v-img>
    </v-navigation-drawer>

    <v-navigation-drawer
      :class="color"
      v-model="$store.state.drawerRight"
      app
      right
      floating
      mobile-break-point="1500px"
    >
      <v-layout class="fill-height" tag="v-list" column>
        <v-list-tile
          avatar
          @click.left.exact="[$store.state.drawerRight = false, navigate('/atividades',false)]"
          @click.ctrl="navigate('/atividades',true)"
          value="true"
        >
          <v-list-tile-avatar color="white">
            <v-icon>fa fa-lg fa-align-left</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-title class="title text-light">Atividade dos usuários</v-list-tile-title>
        </v-list-tile>

        <v-divider />

        <v-list-tile avatar v-for="(item, index) in atividadeStore.atividades" :key="index">
          <v-list-tile-avatar color="white">
            <v-img v-if="item.usuario.img" :src="`${urlBD}/${item.usuario.img}`" height="40" />
            <v-icon v-else class="text-light">fa fa-user fa-lg</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-title class="title text-light">
            <small>{{ item.hora }}</small>
            <br />
            {{ item.usuario.nome }} fez uma
            <br />
            {{ item.tipo }} na tela de
            <br />
            {{ item.tela }}
          </v-list-tile-title>
        </v-list-tile>

        <v-list-tile
          @click.left.exact="[$store.state.drawerRight = false, navigate('/atividades',false)]"
          @click.ctrl="navigate('/atividades',true)"
          value="true"
        >
          <v-layout justify-center wrap>
            <!-- <v-list-tile-title color="secondary" class="title text-light">Ver tudo</v-list-tile-title> -->
            <v-btn flat dark>
              <span>Ver tudo</span>
            </v-btn>
          </v-layout>
        </v-list-tile>
      </v-layout>
    </v-navigation-drawer>
  </div>
</template>

<script>
import { mapState } from "vuex";

import axios from "axios";
import { urlBD, showError } from "@/global";

export default {
  computed: {
    ...mapState("app", ["image", "color"]),
    ...mapState(["usuarioStore", "atividadeStore"])
  },
  data() {
    return {
      confirmar: false,
      logo: `${urlBD}/uploads/img/vue-logo.png`,
      urlBD: urlBD,
      sidebarOverlayGradiant: "rgba(27, 27, 27, 0.74),rgba(27, 27, 27, 0.74)",
      perfil: {},
      data: "",
      home: { title: "Home", icon: "fa fa-home", link: "/" },
      ferramentas: {
        title: "Ferramentas",
        icon: "fa fa-wrench",
        link: "/",
        items: [
          {
            title: "Agenda",
            icon: "fa fa-calendar",
            link: "/agenda"
          },
          {
            title: "Atividades",
            icon: "fa fa-align-left",
            link: "/atividades"
          }
        ]
      },
      config: {
        title: "Configurações",
        icon: "fa fa-cog",
        link: "/config"
      },
      cadastros: {
        title: "Cadastros",
        icon: "fa fa-archive",
        items: [
          {
            title: "Empresas",
            icon: "fa fa-building",
            link: "/empresas",
            visible: false
          },
          {
            title: "Usuários",
            icon: "fa fa-user-o",
            link: "/usuarios",
            visible: false
          },
          {
            title: "Pessoas",
            icon: "fa fa-users",
            link: "/pessoas",
            visible: false
          },
          {
            title: "Produtos",
            icon: "fa fa-archive",
            link: "/produtos",
            visible: false
          }
        ]
      },
      compras: {
        title: "Compras",
        icon: "fa fa-cart-arrow-down",
        items: [
          {
            title: "Pedidos",
            icon: "fa fa-file-o",
            link: "/pedidos",
            visible: false
          },
          {
            title: "Compras",
            icon: "fa fa-arrow-circle-down",
            link: "/importacoes",
            visible: false
          }
        ]
      },
      vendas: {
        title: "Vendas",
        icon: "fa fa-shopping-cart",
        items: [
          {
            title: "Orçamentos/Vendas",
            icon: "fa fa-file-text",
            link: "/vendas",
            visible: false
          },
          {
            title: "PDV",
            icon: "fa fa-tv",
            link: "/pdv",
            visible: false
          }
        ]
      },
      financeiro: {
        title: "Financeiro",
        icon: "fa fa-usd",
        items: [
          {
            title: "Financeiro",
            icon: "fa fa-usd",
            link: "/financeiro",
            visible: false
          },
          {
            title: "Contas",
            icon: "fa fa-bank",
            link: "/conta",
            visible: false
          }
        ]
      },
      fiscais: {
        title: "Fiscal",
        icon: "fa fa-file-text-o",
        items: [
          {
            title: "NF-e",
            icon: "fa fa-file-o",
            link: "/",
            visible: false
          },
          {
            title: "NFC-e",
            icon: "fa fa-files-o",
            link: "/",
            visible: false
          },
          {
            title: "SAT-e",
            icon: "fa fa-signal",
            link: "/",
            visible: false
          },
          {
            title: "MDF-e",
            icon: "fa fa-truck",
            link: "/",
            visible: false
          }
        ]
      },
      relatorios: {
        title: "Relatórios",
        icon: "fa fa-line-chart",
        items: [
          {
            title: "Cadastros",
            icon: "fa fa-archive ",
            link: "/rel_cadastros",
            visible: false
          },
          {
            title: "Compras",
            icon: "fa fa-cart-arrow-down",
            link: "/rel_compras",
            visible: false
          },
          {
            title: "Vendas",
            icon: "fa fa-shopping-cart",
            link: "/rel_vendas",
            visible: false
          },
          {
            title: "Estoque",
            icon: "fa fa-th",
            link: "/rel_estoque",
            visible: false
          },
          {
            title: "Financeiro",
            icon: "fa fa-usd",
            link: "/rel_financeiro",
            visible: false
          },
          {
            title: "Estatísticas",
            icon: "fa fa-line-chart",
            link: "/rel_estat",
            visible: false
          }
        ]
      },
      ajuda: {
        title: "Ajuda",
        icon: "fa fa-info",
        items: [
          {
            title: "Material de apoio",
            icon: "fa fa-book",
            link: "/materialApoio"
          },
          {
            title: "Dúvidas",
            icon: "fa fa-question",
            link: "/duvidas"
          }
        ]
      }
    };
  },
  methods: {
    navigate(path, newTab) {
      if (newTab) {
        const routeData = this.$router.resolve({ path: path });
        window.open(routeData.href, "_blank");
      } else {
        this.$router.push({ path: path });
      }
    },
    getData() {
      const dayName = new Array(
        "domingo",
        "segunda",
        "terça",
        "quarta",
        "quinta",
        "sexta",
        "sábado"
      );
      const monName = new Array(
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "Maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro"
      );

      const now = new Date();
      this.data =
        "Hoje é " +
        dayName[now.getDay()] +
        ", " +
        now.getDate() +
        " de " +
        monName[now.getMonth()] +
        " de " +
        now.getFullYear() +
        ".";
    },
    loadPerfil() {
      axios
        .get(`${urlBD}/perfis/${this.usuarioStore.currentUsuario.id_perfil}`)
        .then(res => {
          this.perfil = res.data;
          this.prepareMenu();
        })
        .catch(showError);
    },
    prepareMenu() {
      this.perfil.empresas
        ? (this.cadastros.items[0].visible = true)
        : (this.cadastros.items[0].visible = false);
      this.perfil.usuarios
        ? (this.cadastros.items[1].visible = true)
        : (this.cadastros.items[1].visible = false);
      this.perfil.pessoas
        ? (this.cadastros.items[2].visible = true)
        : (this.cadastros.items[2].visible = false);
      this.perfil.produtos
        ? (this.cadastros.items[3].visible = true)
        : (this.cadastros.items[3].visible = false);

      this.perfil.pedidos
        ? (this.compras.items[0].visible = true)
        : (this.compras.items[0].visible = false);
      this.perfil.nfe
        ? (this.compras.items[1].visible = true)
        : (this.compras.items[1].visible = false);

      this.perfil.orcamentos
        ? (this.vendas.items[0].visible = true)
        : (this.vendas.items[0].visible = false);
      this.perfil.pdv
        ? (this.vendas.items[1].visible = true)
        : (this.vendas.items[1].visible = false);

      this.perfil.financeiro
        ? (this.financeiro.items[0].visible = true)
        : (this.financeiro.items[0].visible = false);
      this.perfil.caixa
        ? (this.financeiro.items[1].visible = true)
        : (this.financeiro.items[1].visible = false);

      this.perfil.financeiro
        ? (this.financeiro.items[0].visible = true)
        : (this.financeiro.items[0].visible = false);
      this.perfil.caixa
        ? (this.financeiro.items[1].visible = true)
        : (this.financeiro.items[1].visible = false);

      this.perfil.rel_cadastros
        ? (this.relatorios.items[0].visible = true)
        : (this.relatorios.items[0].visible = false);
      this.perfil.rel_compras
        ? (this.relatorios.items[1].visible = true)
        : (this.relatorios.items[1].visible = false);
      this.perfil.rel_vendas
        ? (this.relatorios.items[2].visible = true)
        : (this.relatorios.items[2].visible = false);
      this.perfil.rel_financeiro
        ? (this.relatorios.items[3].visible = true)
        : (this.relatorios.items[3].visible = false);
      this.perfil.rel_estoque
        ? (this.relatorios.items[4].visible = true)
        : (this.relatorios.items[4].visible = false);
      this.perfil.rel_estat
        ? (this.relatorios.items[5].visible = true)
        : (this.relatorios.items[5].visible = false);
    }
  },
  created() {
    this.loadPerfil();
    this.getData();
  }
};
</script>

<style lang="scss">
#app-drawer {
  .v-list__tile {
    border-radius: 4px;

    &--buy {
      margin-top: auto;
      margin-bottom: 17px;
    }
  }

  a {
    text-decoration: none;
    color: white;
  }

  .v-image__image--contain {
    top: 9px;
    height: 60%;
  }

  div.v-responsive.v-image > div.v-responsive__content {
    overflow-y: auto;
  }
}
</style>
