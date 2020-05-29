<template>
  <v-container fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle icon="fa fa-file-o" :main="article.nome" :sub="article.descricao" />
        <v-breadcrumbs
          :items="[{ text: 'Central de ajuda', to: '/centralAjuda' }, { text: article.nome }]"
          divider=">"
          large
        ></v-breadcrumbs>
        <div class="article-content" v-html="article.conteudo">
          <v-layout justify-end align-end>
            <v-tooltip bottom>
              <v-btn slot="activator" icon>
                <i class="fa fa-lg fa-pencil"></i>
              </v-btn>
              <span>Editar artigo</span>
            </v-tooltip>
          </v-layout>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
// import 'highlightjs/styles/dracula.css'
// import hljs from 'highlightjs/highlight.pack.js'
import { urlBD } from "@/global";
import axios from "axios";
import PageTitle from "../template/PageTitle";

export default {
  name: "ArticleById",
  components: { PageTitle },
  data: function() {
    return {
      article: {}
    };
  },
  mounted() {
    const url = `${urlBD}/artigos/${this.$route.params.id}`;
    axios.get(url).then(res => (this.article = res.data));
  },
  updated() {
    document.querySelectorAll(".article-content pre.ql-syntax").forEach(e => {
      hljs.highlightBlock(e);
    });
  }
};
</script>

<style>
.article-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 25px;
}

.article-content pre {
  padding: 20px;
  border-radius: 8px;
  font-size: 1.2rem;
  background-color: #1e1e1e;
  color: #fff;
}

.article-content img {
  max-width: 100%;
}

.article-content :last-child {
  margin-bottom: 0px;
}
</style>
