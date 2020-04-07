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
    <v-card v-if="menu">
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

          <v-tab-item value="tab-1">
            <v-container grid-list-xl>
              <v-form ref="priv_form" v-model="priv_valid">
                <v-layout wrap justify-center>
                  <v-flex xs12>
                    <v-autocomplete
                      class="tag-input"
                      dense
                      chips
                      deletable-chips
                      :color="color"
                      label="Selecione um usuário"
                      v-model="message.receiver"
                      :items="usuarios"
                      item-value="id"
                      item-text="nome"
                      return-object
                      @change="joinPrivate"
                      :rules="usuarioRules"
                    >
                      <template slot="item" slot-scope="data">
                        <v-avatar v-if="data.item.online" class="mr-4" color="success" size="15"></v-avatar>
                        <v-avatar v-else class="mr-4" color="danger" size="15"></v-avatar>
                        {{ data.item.nome }}
                      </template>
                    </v-autocomplete>
                  </v-flex>
                  <v-flex xs12>
                    <div class="chat-container" ref="privChatContainer">
                      <Message :messages="messages"></Message>
                    </div>
                  </v-flex>
                  <v-flex xs12>
                    <v-layout wrap justify-space-between>
                      <v-text-field
                        autofocus
                        v-model="message.content"
                        class="ml-3"
                        placeholder="Digite aqui"
                        @keyup.enter="sendPrivateMessage"
                      ></v-text-field>
                      <v-btn :color="color" class="mt-3" @click="sendPrivateMessage">
                        <v-icon>fa fa-lg fa-paper-plane</v-icon>
                      </v-btn>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-form>
            </v-container>
          </v-tab-item>

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
                      <Message :messages="messages"></Message>
                    </div>
                  </v-flex>
                  <v-flex xs12>
                    <v-layout wrap justify-space-between>
                      <v-text-field
                        autofocus
                        v-model="message.content"
                        class="ml-3"
                        placeholder="Digite aqui"
                        @keyup.enter="sendMessage"
                      ></v-text-field>
                      <v-btn :color="color" class="mt-3" @click="sendMessage">
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
import { urlBD, showError } from "@/global";
export default {
  name: "Chat",
  components: {
    Message: () => import("./Message")
  },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["usuarioStore", "empresaStore"]),
    user: {
      get() {
        return this.usuarioStore.currentUsuario;
      }
    }
  },
  watch: {
    menu() {
      if (this.menu) {
        this.$notification.requestPermission();
        this.loadUsuariosChat();
      }
    },
    tabIndex() {
      if (this.message.receiver && this.tabIndex == "tab-1") this.joinPrivate();
      else if (this.message.id_chat && this.tabIndex == "tab-2") this.join();
      else
        this.messages = [
          {
            content:
              "Dica! não compartilhe seu login e/ou senha com outros usuários ;)",
            user: { id: "", nome: "NOME_EMPRESA" }
          }
        ];
    }
  },
  data() {
    return {
      message: {},
      messages: [],
      usuarios: [],
      info: [],
      menu: false,
      tabIndex: "tab-2",
      connections: 0,
      new_messages: 0,
      priv_valid: true,
      team_valid: true,
      supp_valid: true,
      empresaRules: [v => !!v || "Selecione a empresa para participar do chat"],
      usuarioRules: [v => !!v || "Selecione um usuário para conversar"]
    };
  },
  methods: {
    reset() {
      this.tabIndex = "tab-2";
      this.message = {};
      this.messages = [];
      this.messages.push({
        content:
          "Dica! não compartilhe seu login e/ou senha com outros usuários ;)",
        user: { id: "", nome: "NOME_EMPRESA" }
      });
      this.$refs.priv_form ? this.$refs.priv_form.reset() : "";
      this.$refs.team_form ? this.$refs.team_form.reset() : "";
      this.$refs.supp_form ? this.$refs.supp_form.reset() : "";
    },
    loadUsuariosChat() {
      this.$store.dispatch("loadUsuarios");

      this.usuarios = this.usuarioStore.currentUsuarios.map(u => {
        return { id: u.value, nome: u.text };
      });

      this.usuarios.map(u => {
        if (u.id == this.usuarioStore.currentUsuario.id) u.disabled = true;
        if (u.nome in this.usuarioStore.usuariosOnline) u.online = true;
        return u;
      });
    },
    joinPrivate() {
      if (!this.message.receiver) return;

      this.$socket.emit("join private", {
        receiver: {
          id: this.message.receiver.id,
          nome: this.message.receiver.nome
        },
        sender: {
          id: this.usuarioStore.currentUsuario.id,
          nome: this.usuarioStore.currentUsuario.nome
        }
      });
    },
    join() {
      if (!this.message.id_chat) return;
      this.$socket.emit("join", this.message.id_chat);
    },
    sendPrivateMessage() {
      if (!this.message.content || this.$refs.team_form.validate()) return;

      const new_message = {
        user: {
          id: this.usuarioStore.currentUsuario.id,
          nome: this.usuarioStore.currentUsuario.nome
        },
        receiver: {
          id: this.message.receiver.id,
          nome: this.message.receiver.nome
        },
        content: this.message.content,
        data: new Date().toLocaleString().substr(0, 18),
        id_chat: this.message.id_chat
      };

      this.messages.push(new_message);
      this.$socket.emit("private chat message", new_message);
      this.message.content = "";
      this.scrollToEnd();
    },
    sendMessage() {
      if (!this.message.content || !this.$refs.team_form.validate()) return;

      const new_message = {
        user: {
          id: this.usuarioStore.currentUsuario.id,
          nome: this.usuarioStore.currentUsuario.nome,
          email: this.usuarioStore.currentUsuario.email
        },
        content: this.message.content,
        data: new Date().toLocaleString().substr(0, 18),
        id_chat: this.message.id_chat
      };
      this.messages.push(new_message);
      this.$socket.emit("chat message", new_message);
      this.message.content = "";
      this.scrollToEnd();
    },
    scrollToEnd(container) {
      this.$nextTick(() => {
        if (this.tabIndex == "tab-1") {
          var container = this.$refs.privChatContainer;
          container.scrollTop = container.scrollHeight;
        } else if (this.tabIndex == "tab-2") {
          const container = this.$refs.teamChatContainer;
          container.scrollTop = container.scrollHeight;
        } else {
          const container = this.$refs.supportChatContainer;
          container.scrollTop = container.scrollHeight;
        }
      });
    },
    playSound(sound) {
      if (sound) {
        var audio = new Audio(sound);
        audio.play();
      }
    },
    notify(msg) {
      if (this.menu) this.scrollToEnd();
      else {
        this.new_messages = ++this.new_messages;
        this.$notification.show(msg.user.nome, {
          body: msg.content
        });
      }
    }
  },
  mounted() {
    this.reset();
    this.loadUsuariosChat();
  },
  sockets: {
    chatMessage(msg) {
      this.messages.push(msg);
      this.notify(msg);
    },
    privateChatMessage(msg) {
      this.messages.push(msg);
      this.notify(msg);
    },
    onlineUsers(data) {
      this.usuarioStore.usuariosOnline = data;

      this.loadUsuariosChat();
    },
    join(msgs) {
      this.messages = msgs;
      this.scrollToEnd();
    }
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
  font-size: 16px;
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
.chat-container .data {
  font-size: 11px;
}
@media (max-width: 480px) {
  .chat-container .content {
    max-width: 60%;
  }
}
</style>