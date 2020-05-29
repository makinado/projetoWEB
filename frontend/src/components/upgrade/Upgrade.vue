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
          <v-card class="card-upgrade elevation-2">
            <v-card-title primary-title>
              <i class="mr-3 fa fa-3x fa-star icon-blue"></i>
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
          <v-card class="card-upgrade elevation-7">
            <v-card-title primary-title>
              <i class="mr-3 fa fa-3x fa-building-o icon-green"></i>
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
          <v-card class="card-upgrade elevation-2">
            <v-card-title primary-title>
              <i class="mr-3 fa fa-3x fa-briefcase icon-gold"></i>
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
          <v-card class="card-upgrade elevation-2">
            <v-card-title primary-title>
              <i class="mr-3 fa fa-3x fa-diamond icon-diamond"></i>
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
.card-upgrade {
  position: relative;
  display: block;
  flex: 1 1 0px;
  transition: transform 500ms;
  transition-property: transform;
}

.card-upgrade:focus,
.card-upgrade:hover {
  cursor: pointer;

  transform: scale(1.1);
  z-index: 5;
}

@keyframes fadeInUp {
  from {
    transform: translate3d(0, 40px, 0);
  }

  to {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}

.animated {
  animation-duration: 1s;
  animation-fill-mode: both;
  -webkit-animation-duration: 1s;
  -webkit-animation-fill-mode: both;
}

.animatedFadeInUp {
  opacity: 0;
}

.fadeInUp {
  opacity: 0;
  animation-name: fadeInUp;
  -webkit-animation-name: fadeInUp;
}

.icon-blue {
  color: #2f80ed;
  display: block;
  background: -webkit-linear-gradient(#2f80ed, #56ccf2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.icon-green {
  color: #38ef7d;
  display: block;
  background: -webkit-linear-gradient(#38ef7d, #11998e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.icon-gold {
  color: #cac531;
  display: block;
  background: -webkit-linear-gradient(#cac531, #f3f9a7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.icon-diamond {
  color: #9c47fc;
  display: block;
  background: -webkit-linear-gradient(#9c47fc, #356ad2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>