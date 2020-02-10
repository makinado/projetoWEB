<template>
  <v-menu
    :close-on-content-click="false"
    bottom
    left
    min-width="300"
    max-width="300"
    nudge-left="12"
    offset-x
    transition="slide-y-transition"
  >
    <v-btn slot="activator" class="v-btn-common" color="grey" dark fixed style="top: 96px;" top>
      <v-icon>fa fa-lg fa-cog</v-icon>
    </v-btn>
    <v-card>
      <v-container grid-list-xl>
        <v-layout wrap>
          <v-flex xs12>
            <div class="text-xs-center body-2 text-uppercase sidebar-filter">Cores</div>

            <v-layout justify-center>
              <v-avatar
                v-for="c in colors"
                :key="c"
                :class="[c === color ? 'color-active color-' + c : 'color-' + c]"
                size="30"
                @click="setColor(c)"
              />
            </v-layout>
            <v-divider class="mt-3" />
          </v-flex>
          <v-flex xs12>
            <div class="text-xs-center body-2 text-uppercase sidebar-filter">Imagens</div>
          </v-flex>
          <v-flex v-for="img in images" :key="img" xs3>
            <v-img
              :class="[image === img ? 'image-active' : '']"
              :src="img"
              height="120"
              @click.native="setImage(img)"
            />
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>
  </v-menu>
</template>

<script>
import { mapState } from "vuex";

export default {
  data: () => ({
    colors: ["primary", "info", "success", "warning", "danger"],
    images: [
      require("@/assets/sidebar_1.jpg"),
      require("@/assets/sidebar_2.jpg"),
      require("@/assets/sidebar_3.jpg"),
      require("@/assets/sidebar_4.jpg")
    ]
  }),

  computed: {
    ...mapState("app", ["color", "image"]),
    color() {
      return this.$store.state.app.color;
    }
  },
  methods: {
    setColor(color) {
      this.$store.state.app.color = color;
    },
    setImage(image) {
      this.$store.state.app.image = image;
    }
  }
};
</script>

<style lang="scss">
.v-avatar,
.v-responsive {
  cursor: pointer;
}
</style>
