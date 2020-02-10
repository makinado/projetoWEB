<template>
  <div class="usuario-banner">
    <div class="usuario-img">
      <b-img :src="usuarioStore.currentUsuario.img"></b-img>
      <span>{{usuarioStore.currentUsuario.nome}}</span>
    </div>
    <div class="usuario-theme">
      <b-img fluid-grow src="http://placeimg.com/1200/300/nature"></b-img>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "Banner",
  computed: mapState(["usuarioStore"])
};
</script>

<style>
.usuario-banner {
  margin: 0;
  display: grid;
  grid-template-rows: 300px;
  grid-template-columns: 250px 1fr;
  grid-template-areas: 
  "img theme";
}

.usuario-img {
  grid-area: img;
  background-color: #424242;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.usuario-theme {
  grid-area: theme;
  background-color: #ccc;
  
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.usuario-img span {
  color: #fff;
}

</style>
