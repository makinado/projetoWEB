<template>
  <div class="articles-by-category">
    <ul class="transition-lazy-in-lazy-out">
      <li v-for="article in articles" :key="article.id">
        <ArticleItem :article="article" />
      </li>
    </ul>

    <div class="load-more">
      <v-btn
        v-if="loadMore"
        class="v-btn-common"
        :color="color"
        @click="loadArtigos"
      >Carregar Mais Artigos</v-btn>
    </div>
  </div>
</template>

<script>
import { urlBD } from "@/global";
import axios from "axios";
import PageTitle from "../template/PageTitle";
import { mapState } from "vuex";

export default {
  name: "ArticlesByCategory",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["modalStore", "artigoStore"]),
    params() {
      return {
        ...this.modalStore.artigos.add,
        ...this.artigoStore.filter
      };
    }
  },
  components: {
    ArticleItem: () => import("./ArtigoItem")
  },
  data: function() {
    return {
      category: {},
      articles: [],
      limit: 10,
      loadMore: true
    };
  },
  watch: {
    $route(to) {
      this.category.id = to.params.id;
      this.articles = [];
      this.page = 1;
      this.loadMore = true;

      this.$store.dispatch("loadCategoriasArtigos");
      this.loadArtigos();
    },
    params() {
      this.loadArtigos();
    }
  },
  methods: {
    loadArtigos() {
      const url = `${urlBD}/artigos?limit=${this.limit}&nome=${this.artigoStore
        .filter.nome || ""}&categoria=${this.artigoStore.filter.categoria ||
        ""}`;
      axios(url).then(res => {
        this.articles = res.data.data;
        this.limit += 10;
      });
    }
  },
  mounted() {
    this.loadArtigos();
  }
};
</script>

<style>
.articles-by-category ul {
  list-style-type: none;
  padding: 0px;
}

.articles-by-category .load-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 25px;
}
</style>
