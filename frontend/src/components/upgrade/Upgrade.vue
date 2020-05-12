<template>
  <v-container fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle
          main="Upgrade de pacote"
          icon="fa fa-bolt"
          sub="Encontre a funcionalidade que você precisa por um preço justo!"
        />
      </v-flex>
      <v-layout class="my-5" row wrap align-start>
        <v-flex xs12 md3>
          <v-card class="transparent elevation-2">
            <v-card-title primary-title>
              <v-icon x-large class="mr-3 info--text">fa fa-star</v-icon>
              <h2>Starter</h2>
            </v-card-title>

            <v-card-text>
              R$ 59,90
              <br />Um plano excelente para ... blabla
            </v-card-text>
            <v-card-text>
              <h4>O que inclui?</h4>
            </v-card-text>
            <v-card-text>
              - inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="secondary" small flat>Quero esse!</v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
        <v-flex xs12 md3>
          <v-card class="transparent elevation-7 card-selected">
            <v-card-title primary-title>
              <v-icon x-large class="mr-3 primary--text">fa fa-building-o</v-icon>
              <h2>Professional</h2>
            </v-card-title>

            <v-card-text>
              R$ 119,90
              <br />Um plano excelente para ... blabla
            </v-card-text>
            <v-card-text>
              <h4>O que inclui?</h4>
            </v-card-text>
            <v-card-text>
              - inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="secondary" small flat>Quero esse!</v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
        <v-flex xs12 md3>
          <v-card class="transparent elevation-2">
            <v-card-title primary-title>
              <v-icon x-large class="mr-3 warning--text">fa fa-briefcase</v-icon>
              <h2>Gold</h2>
            </v-card-title>

            <v-card-text>
              R$ 199,90
              <br />Um plano excelente para ... blabla
            </v-card-text>
            <v-card-text>
              <h4>O que inclui?</h4>
            </v-card-text>
            <v-card-text>
              - inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="secondary" small flat>Quero esse!</v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
        <v-flex xs12 md3>
          <v-card class="transparent elevation-2">
            <v-card-title primary-title>
              <v-icon x-large class="mr-3 danger--text">fa fa-diamond</v-icon>
              <h2>Diamond</h2>
            </v-card-title>

            <v-card-text>
              R$ 249,90
              <br />Um plano excelente para ... blabla
            </v-card-text>
            <v-card-text>
              <h4>O que inclui?</h4>
            </v-card-text>
            <v-card-text>
              - inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />- inclui isso
              <br />
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="secondary" small flat>Quero esse!</v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "upgrade",
  components: {
    PageTitle: () => import("@/components/template/PageTitle")
  }
};
</script>

<style>
</style>