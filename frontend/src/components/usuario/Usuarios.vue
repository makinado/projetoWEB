<template>
  <v-container fill-height fluid grid-list-xl>
    <AddUsuario />
    <AddMeta />
    <AddComissao />
    <Email />

    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="Usuários" icon="fa fa-user" sub="Gerencie os usuários do sistema" />
        <v-card class="p-3">
          <GridUsuarios />
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "Usuarios",
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    GridUsuarios: () => import("./GridUsuarios"),
    AddUsuario: () => import("./AddUsuario"),
    AddMeta: () => import("./AddMeta"),
    AddComissao: () => import("./AddComissao"),
    Email: () => import("@/components/email/Email")
  }
};
</script>

<style>
</style>
