<template>
  <v-card v-bind="$attrs" :style="styles" v-on="$listeners">
    <Offset v-if="hasOffset" :inline="inline" :full-width="fullWidth" :offset="offset">
      <v-card
        v-if="!$slots.offset"
        :color="color"
        :class="`elevation-${elevation}`"
        class="v-card--material__header"
        dark
      >
        <slot v-if="!title && !text && !  icon" name="header" />
        <span v-else>
          <v-layout class="p-2" align-center>
            <v-icon class="mx-2" v-text="icon"></v-icon>
            <h4 class="title font-weight-light ml-2 my-1" v-text="title" />
            <p class="category font-weight-thin" v-text="text" />

            <v-spacer></v-spacer>

            <span v-for="a in actions" :key="a.icon">
              <v-tooltip v-if="!a.disabled" bottom>
                <v-btn slot="activator" class="p-1" icon @click="handleClick(a)">
                  <v-icon>{{ a.icon }}</v-icon>
                </v-btn>
                <span>{{ a.tooltip }}</span>
              </v-tooltip>
            </span>
          </v-layout>
        </span>
      </v-card>
      <slot v-else name="offset" />
    </Offset>

    <v-card-text>
      <slot />
    </v-card-text>

    <v-divider v-if="$slots.actions" class="mx-3" />

    <v-card-actions v-if="$slots.actions">
      <slot name="actions" />
    </v-card-actions>
  </v-card>
</template>

<script>
import { showError } from "@/global";

import { mapState } from "vuex";

export default {
  inheritAttrs: false,

  components: {
    Offset: () => import("../template/Offset")
  },
  props: {
    color: {
      type: String,
      default: "secondary"
    },
    elevation: {
      type: [Number, String],
      default: 10
    },
    inline: {
      type: Boolean,
      default: false
    },
    fullWidth: {
      type: Boolean,
      default: false
    },
    offset: {
      type: [Number, String],
      default: 24
    },
    title: {
      type: String,
      default: undefined
    },
    icon: {
      type: String,
      default: undefined
    },
    text: {
      type: String,
      default: undefined
    },
    actions: {
      type: Array,
      default: null
    }
  },
  computed: {
    hasOffset() {
      return (
        this.$slots.header || this.$slots.offset || this.title || this.text
      );
    },
    styles() {
      if (!this.hasOffset) return null;

      return {
        marginBottom: `${this.offset}px`,
        marginTop: `${this.offset}px`
      };
    },
    ...mapState([
      "pessoaStore",
      "usuarioStore",
      "empresaStore",
      "produtoStore",
      "comprasStore",
      "financeiroStore",
      "vendaStore"
    ]),
    empresa: {
      get() {
        return this.empresaStore.empresa;
      },
      set(value) {
        this.empresaStore.empresa = value;
      }
    },
    pessoa: {
      get() {
        return this.pessoaStore.pessoa;
      },
      set(value) {
        this.pessoaStore.pessoa = value;
      }
    },
    usuario: {
      get() {
        return this.usuarioStore.usuario;
      },
      set(value) {
        this.usuarioStore.usuario = value;
      }
    },
    produto: {
      get() {
        return this.produtoStore.produto;
      },
      set(value) {
        this.produtoStore.produto = value;
      }
    },
    pedido: {
      get() {
        return this.comprasStore.pedido;
      },
      set(value) {
        this.comprasStore.pedido = value;
      }
    },
    compra: {
      get() {
        return this.comprasStore.compra;
      },
      set(value) {
        this.comprasStore.compra = value;
      }
    },
    financ: {
      get() {
        return this.financeiroStore.financ;
      },
      set(value) {
        this.financeiroStore.financ = value;
      }
    },
    conta: {
      get() {
        return this.financeiroStore.conta;
      },
      set(value) {
        this.financeiroStore.conta = value;
      }
    },
    venda: {
      get() {
        return this.vendaStore.venda;
      },
      set(value) {
        this.vendaStore.venda = value;
      }
    },
    pdv: {
      get() {
        return this.vendaStore.pdv;
      },
      set(value) {
        this.vendaStore.pdv = value;
      }
    },
    empresaMeta: {
      get() {
        return this.empresaStore.meta;
      },
      set(value) {
        this.empresaStore.meta = value;
      }
    },
    usuarioMeta: {
      get() {
        return this.usuarioStore.meta;
      },
      set(value) {
        this.usuarioStore.meta = value;
      }
    }
  },
  methods: {
    handleClick(action) {
      // required significa que posso chamar o método do componente pai diretamente

      // console.log(action);

      if (action.required) {
        if (action.param) return this.$parent[action.method](action.param);
        return this.$parent[action.method]().then(() =>
          this.$toasted.global.defaultSuccess()
        );
      }

      if (this.$parent.itens_selecionados.length == 0)
        return showError("Nenhum item selecionado");
      if (!this.$parent[action.method] || !action.store)
        return showError("Método ou item não definidos");

      this[action.store] = this.$parent.itens_selecionados;
      this.$parent[action.method]();
    }
  }
};
</script>

<style lang="scss">
.v-card--material {
  &__header {
    &.v-card {
      border-radius: 4px;
    }
  }
}
</style>
