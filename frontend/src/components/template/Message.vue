<template>
  <div>
    <div
      class="message"
      v-for="(message,index) in messages"
      v-bind:key="index"
      :class="{own: message.user.id == user.id}"
    >
      <div
        class="username"
        v-if="index>0 && messages[index-1].user.id != message.user.id"
      >{{message.user.nome}}</div>
      <div class="username" v-if="index == 0">{{message.user.nome}}</div>

      <div style="margin-top: 5px"></div>
      <div class="content">
        <div v-html="message.content"></div>
        <!-- <small v-html="message.data.substr(11, 8)"></small> -->
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: ["messages"],
  computed: {
    ...mapState(["usuarioStore"]),
    user() {
      return {
        id: this.usuarioStore.currentUsuario.id,
        nome: this.usuarioStore.currentUsuario.nome
      };
    }
  }
};
</script>

<style>
span.emoji {
  font-size: 20px;
  vertical-align: middle;
  line-height: 2;
}
</style>