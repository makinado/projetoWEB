<template>
  <v-container fill-height fluid grid-list-xl>
    <AddBackup />

    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle main="Backup e restauração" icon="fa fa-cloud" sub="Gerencie seus backups" />
        <v-card class="p-3">
          <GridBackup />
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "Backup",
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    GridBackup: () => import("./GridBackup"),
    AddBackup: () => import("./AddBackup")
  }
};
</script>