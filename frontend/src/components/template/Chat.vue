<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :close-on-click="false"
    bottom
    left
    min-width="600"
    max-width="600"
    max-height="800"
    nudge-left="12"
    transition="slide-y-transition"
  >
    <v-btn
      slot="activator"
      class="v-btn-common"
      :color="color"
      dark
      fixed
      style="bottom: 0px;"
      bottom
      @click="[new_messages = 0]"
    >
      <v-badge v-if="new_messages" color="danger" left>
        <template v-slot:badge>
          <span>{{ new_messages }}</span>
        </template>
      </v-badge>
      <v-icon>fa fa-lg fa-comments</v-icon>
    </v-btn>
    <v-card>
      <v-toolbar dark dense flat :color="color">
        <v-toolbar-title class="white--text">Bem vindo ao chat!</v-toolbar-title>
        <!-- <small>Usuários - {{ connections }}</small> -->

        <v-spacer></v-spacer>

        <v-btn icon flat @click="menu = false">
          <v-icon>fa fa-lg fa-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-tabs
          v-model="tabIndex"
          :show-arrows="false"
          centered
          color="#FFFFFF"
          light
          icons-and-text
        >
          <v-tabs-slider :color="color"></v-tabs-slider>

          <v-tab href="#tab-1">
            PRIVADO
            <v-icon>fa fa-lg fa-user</v-icon>
          </v-tab>

          <v-tab href="#tab-2">
            EQUIPE
            <v-icon>fa fa-lg fa-users</v-icon>
          </v-tab>

          <v-tab href="#tab-3">
            SUPORTE
            <v-icon>fa fa-lg fa-phone</v-icon>
          </v-tab>

          <v-tab-item value="tab-2">
            <v-container grid-list-xl>
              <v-form ref="team_form" v-model="team_valid">
                <v-layout wrap justify-center>
                  <v-flex xs12>
                    <v-autocomplete
                      class="tag-input"
                      dense
                      chips
                      deletable-chips
                      :color="color"
                      label="Selecione a empresa"
                      v-model="message.id_chat"
                      :items="empresaStore.currentEmpresas"
                      item-value="cnpj"
                      @change="join"
                      :rules="empresaRules"
                    ></v-autocomplete>
                  </v-flex>
                  <v-flex xs12>
                    <div class="chat-container" ref="teamChatContainer">
                      <Message :messages="team_messages"></Message>
                    </div>
                  </v-flex>
                  <v-flex xs12>
                    <v-layout wrap justify-space-between>
                      <v-text-field
                        autofocus
                        v-model="message.content"
                        class="ml-3"
                        placeholder="Digite aqui"
                        @keyup.enter="send"
                      ></v-text-field>
                      <v-btn :color="color" class="mt-3" @click="send">
                        <v-icon>fa fa-lg fa-paper-plane</v-icon>
                      </v-btn>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-form>
            </v-container>
          </v-tab-item>

          <v-tab-item value="tab-3">
            <v-container grid-list-xl>
              <v-form ref="supp_form" v-model="supp_valid">
                <v-layout wrap justify-center>
                  <v-flex xs12>
                    <v-autocomplete
                      class="tag-input"
                      dense
                      chips
                      deletable-chips
                      :color="color"
                      label="Selecione a empresa"
                      v-model="message.id_chat"
                      :items="empresaStore.currentEmpresas"
                      item-value="cnpj"
                      @change="join"
                      :rules="empresaRules"
                    ></v-autocomplete>
                  </v-flex>
                  <v-flex xs12>
                    <div class="chat-container" ref="supportChatContainer">
                      <Message :messages="support_messages"></Message>
                    </div>
                  </v-flex>
                  <v-flex xs12>
                    <v-layout wrap justify-space-between>
                      <v-text-field
                        autofocus
                        v-model="message.content"
                        class="ml-3"
                        placeholder="Digite aqui"
                        @keyup.enter="send"
                      ></v-text-field>
                      <v-btn :color="color" class="mt-3" @click="send">
                        <v-icon>fa fa-lg fa-paper-plane</v-icon>
                      </v-btn>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-form>
            </v-container>
          </v-tab-item>
        </v-tabs>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";
import { urlBD, showError, loadEmpresas } from "@/global";

export default {
  name: "Chat",
  components: {
    Message: () => import("./Message")
  },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["usuarioStore", "empresaStore"]),
    user() {
      return {
        id: this.usuarioStore.currentUsuario.id,
        nome: this.usuarioStore.currentUsuario.nome
      };
    }
  },
  data() {
    return {
      message: {},
      team_messages: [],
      support_messages: [],
      info: [],
      menu: false,
      tabIndex: "tab-2",
      connections: 0,
      new_messages: 0,
      priv_valid: true,
      team_valid: true,
      supp_valid: true,
      empresaRules: [v => !!v || "Selecione a empresa para participar do chat"]
    };
  },
  props: ["id"],
  methods: {
    reset() {
      this.tabIndex = "tab-2";
      this.message = {};
      this.support_messages = [];
      this.team_messages = [];

      this.support_messages.push({
        content: "Tire suas dúvidas com o nosso suporte online",
        user: { id: "", nome: "NOME_EMPRESA" }
      });
      this.team_messages.push({
        content:
          "Dica! não compartilhe seu login e/ou senha com outros usuários ;)",
        user: { id: "", nome: "NOME_EMPRESA" }
      });

      this.$refs.priv_form ? this.$refs.priv_form.reset() : "";
      this.$refs.team_form ? this.$refs.team_form.reset() : "";
      this.$refs.supp_form ? this.$refs.supp_form.reset() : "";
    },
    join() {
      if (!this.message.id_chat) return;

      socket.emit("join", this.message.id_chat);
    },
    send() {
      if (this.tabIndex == "tab-1" && !this.$refs.priv_form.validate()) return;
      if (this.tabIndex == "tab-2" && !this.$refs.team_form.validate()) return;
      if (this.tabIndex == "tab-3" && !this.$refs.supp_form.validate()) return;

      if (!this.message.content) return;

      const new_message = {
        user: this.user,
        content: this.message.content,
        data: new Date().toLocaleString().substr(0, 18),
        id_chat: this.message.id_chat
      };
      this.team_messages.push(new_message);

      socket.emit("chat message", new_message);
      this.message.content = "";
      this.scrollToEnd();
    },
    scrollToEnd() {
      this.$nextTick(() => {
        var container1 = this.$refs.teamChatContainer;
        var container2 = this.$refs.supportChatContainer;
        if (container1) container1.scrollTop = container1.scrollHeight;
        if (container2) container2.scrollTop = container2.scrollHeight;
      });
    },
    playSound(sound) {
      if (sound) {
        var audio = new Audio(sound);
        audio.play();
      }
    },
    notify() {
      if (!this.menu) {
        this.new_messages = ++this.new_messages;
        this.playSound(
          "http://soundbible.com/mp3/Elevator Ding-SoundBible.com-685385892.mp3"
        );
      } else {
        this.scrollToEnd();
      }
    }
  },
  created() {
    socket.on("chat message", msg => {
      this.team_messages.push(msg);
      this.notify();
    });

    socket.on("join", msgs => {
      this.team_messages = msgs;
      this.notify();
    });

    this.reset();
  }
};
</script>

<style>
.chat-container {
  box-sizing: border-box;
  height: calc(60vh - 9.5rem);
  overflow-y: auto;
  padding: 10px;
  background-color: #f2f2f2;
}
.message {
  margin-bottom: 3px;
}
.message.own {
  text-align: right;
}
.message.own .content {
  background-color: lightskyblue;
  margin-left: auto;
  margin-right: 0;
}
.chat-container .username {
  font-size: 15px;
  font-weight: bold;
}
.chat-container .content {
  padding: 8px;
  background-color: lightgreen;
  border-radius: 10px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 2px 1px -1px rgba(0, 0, 0, 0.12);
  max-width: 50%;
  word-wrap: break-word;
}
@media (max-width: 480px) {
  .chat-container .content {
    max-width: 60%;
  }
}
</style>