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

          <!-- <v-tab-item value="tab-1">
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
                      :items="usersOnline"
                      :rules="usuarioRules"
                      v-model="usuario"
                      no-data-text="Nenhum usuário online no momento"
                    >
                      <template slot="item" slot-scope="data">
                        <v-avatar class="mr-4" color="success" size="15"></v-avatar>
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
                        v-model="content"
                        class="ml-3"
                        placeholder="Digite aqui"
                      ></v-text-field>
                      <v-btn :color="color" class="mt-3" @click>
                        <v-icon>fa fa-lg fa-paper-plane</v-icon>
                      </v-btn>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-form>
            </v-container>
          </v-tab-item>-->

          <!-- <v-tab-item value="tab-2">
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
                      :items="empresaStore.currentEmpresas"
                      item-value="cnpj"
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
                        v-model="content"
                        class="ml-3"
                        placeholder="Digite aqui"
                      ></v-text-field>
                      <v-btn :color="color" class="mt-3" @click>
                        <v-icon>fa fa-lg fa-paper-plane</v-icon>
                      </v-btn>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-form>
            </v-container>
          </v-tab-item>-->

          <v-tab-item value="tab-3">
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
                      label="Seus chamados"
                      no-data-text="Nenhum chamado aberto"
                      :items="chats"
                      item-Text="name"
                      item-Value="name"
                      prepend-icon="fa fa-lg fa-plus-circle"
                      @click:prepend="dialog = true"
                      @change=""
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
                        v-model="content"
                        class="ml-3"
                        placeholder="Digite aqui"
                      ></v-text-field>
                      <v-btn :color="color" class="mt-3" @click>
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

    <v-dialog v-model="dialog" persistent max-width="500px" transition="dialog-transition">
      <v-card>
        <v-card-title class="headline">Criar novo chamado</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field label="Descrição curta" v-model="chatName"></v-text-field>
            <v-autocomplete
              label="Categoria"
              :items="categoriaStore.categoriasArtigos"
              clearable
              dense
              @focus="$store.dispatch('loadCategoriasArtigos')"
            ></v-autocomplete>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="blue" @click="dialog = false">Fechar</v-btn>
          <v-btn flat color="blue" @click="addChat">Continuar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-menu>
</template>

<script>
import { mapState, mapActions } from "vuex";
import axios from "axios";
import { urlBD, showError } from "@/global";

import modules from "../../config/store/modules";
export default {
  name: "Chat",
  components: {
    Message: () => import("./Message")
  },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["usuarioStore", "empresaStore", "categoriaStore"]),
    user: {
      get() {
        return this.usuarioStore.currentUsuario;
      }
    },
    chats: {
      get() {
        return Object.values(modules.chat.state.chats).map((item, index) => {
          item.text = item.name;
          item.value = item.index;

          return item;
        });
      }
    },
    messages: {
      get() {
        return this.chatMessages;
      }
    },
    username: {
      get() {
        return this.usuarioStore.currentUsuario.nome;
      }
    },
    onlineUsers: {
      get() {
        return this.$store.getters.onlineUsers;
      }
    },
    chatStore: {
      get() {
        return modules.chat;
      }
    }
  },
  props: ["id"],
  watch: {
    menu() {
      if (this.menu) {
        // this.$store.dispatch("loadUsuarios");
        this.$notification.requestPermission();
      }
    },
    watch: {
      "$route.params.id"(newId, oldId) {
        this.currentRef.off("child_added", this.onNewMessageAdded);
        this.loadChat();
      }
    }
  },
  data() {
    return {
      menu: false,
      dialog: false,
      content: "",
      chatMessages: [],
      chatName: "",
      currentRef: {},
      usuario: {},
      tabIndex: "tab-3",
      new_messages: 0,
      priv_valid: true,
      team_valid: true,
      supp_valid: true,
      empresaRules: [v => !!v || "Selecione a empresa para participar do chat"],
      usuarioRules: [v => !!v || "Selecione um usuário para conversar"]
    };
  },
  methods: {
    ...mapActions("chat", ["loadUserChats"]),
    loadChat() {
      this.loading = false;

      this.$refs.priv_form ? this.$refs.priv_form.reset() : "";
      this.$refs.team_form ? this.$refs.team_form.reset() : "";
      this.$refs.supp_form ? this.$refs.supp_form.reset() : "";

      if (this.id !== undefined) {
        this.chatMessages = [
          {
            id: 0,
            content:
              "Dica! não compartilhe seu login e/ou senha com outros usuários ;)",
            username: "Campag Informática"
          }
        ];
        let chatID = this.id;
        this.currentRef = firebase
          .database()
          .ref("messages")
          .child(chatID)
          .child("messages")
          .limitToLast(20);
        this.currentRef.on("child_added", this.onNewMessageAdded);
      }
    },
    async addChat() {
      if (!this.dialog) {
        this.dialog = true;
        return;
      }

      if (this.chatName == "") return;

      this.chatStore.actions
        .createChat(null, {
          chatName: this.chatName,
          user: this.user
        })
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.loadUserChats();
          this.dialog = false;
        });
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
    sendMessage() {
      if (this.content !== "") {
        this.$store.dispatch("sendMessage", {
          username: this.username,
          content: this.content,
          date: new Date().toString(),
          chatID: this.id
        });
        this.content = "";
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
  created() {
    this.loadUserChats();
  },
  mounted() {
    this.loadChat();
    this.$store.dispatch("loadOnlineUsers");
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