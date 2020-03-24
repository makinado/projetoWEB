<template>
  <div class="page-title">
    <h2>
      <v-icon v-if="icon">{{icon}}</v-icon>
      {{ main }}
    </h2>
    <h3>{{sub}}</h3>
    <v-divider class="mb-4"></v-divider>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "PageTitle",
  computed: mapState(["colorPrim"]),
  props: ["icon", "main", "sub"]
};
</script>

<style>
.page-title h1 {
  margin: 0;
}

.page-title h2 {
  color: #777;
  margin-top: 5px;
  font-size: 1.3rem;
}
</style>
