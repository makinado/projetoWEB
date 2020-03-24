<template>
  <v-card flat>
    <v-card-text>
      <v-form v-model="valid" ref="form">
        <v-layout row wrap>
          <v-flex xs12 md6>
            <v-autocomplete
              ref="cliente"
              class="tag-input"
              chips
              dense
              deletable-chips
              no-data-text="Nenhum cliente cadastrado"
              prepend-icon="fa fa-lg fa-plus-circle"
              @click:prepend="[pessoaStore.pessoa = null, modalStore.pessoas.visible = true]"
              label="Cliente"
              :items="pessoaStore.clientes"
              v-model="venda.id_pessoa"
              @change="loadCliente"
            ></v-autocomplete>
          </v-flex>
          <v-flex xs12 md6> 
            <v-autocomplete
              class="tag-input"
              chips
              dense
              deletable-chips
              no-data-text="Nenhum vendedor cadastrado"
              prepend-icon="fa fa-lg fa-plus-circle"
              @click:prepend="[usuarioStore.usuario = null, modalStore.usuarios.visible = true]"
              label="Vendedor"
              :items="usuarioStore.currentUsuarios"
              v-model="venda.id_vendedor"
              :rules="vendRules"
            ></v-autocomplete>
          </v-flex>
          <v-flex xs12>
            <v-text-field
              v-model="venda.cpf_cnpj"
              label="CPF/CNPJ"
              v-mask="['###.###.###-##', '##.###.###/####-##']"
              clearable
            ></v-text-field>
          </v-flex>
        </v-layout>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "pdv-cliente",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["pessoaStore", "usuarioStore", "vendaStore", "modalStore"]),
    venda: {
      get() {
        return this.vendaStore.pdv;
      }
    }
  },
  data() {
    return {
      valid: true,
      vendRules: [v => !!v || "Vendedor obrigatório"]
    };
  },
  methods: {
    loadCliente() {
      if (this.venda.id_pessoa) {
        const cliente = this.pessoaStore.clientes.find(
          cliente => cliente.value == this.venda.id_pessoa
        );
        this.venda.cpf_cnpj = cliente.cpf ? cliente.cpf : cliente.cnpj;
      } else delete this.venda.cpf_cnpj;
    }
  },
  mounted() {
    this.$store.dispatch("loadClientes");
    this.$store.dispatch("loadUsuarios");

    this.$refs.cliente.focus();
    this.venda.id_vendedor = this.usuarioStore.currentUsuario.id;
  }
};
</script>

<style>
</style>