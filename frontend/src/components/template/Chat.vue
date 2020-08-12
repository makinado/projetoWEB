<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :close-on-click="false"
    min-width="600"
    max-width="600"
    max-height="900"
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

          <!-- <v-tab href="#tab-1">
            PRIVADO
            <v-icon>fa fa-lg fa-user</v-icon>
          </v-tab>-->

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

          <v-tab-item value="tab-2">
            <v-container grid-list-xl>
              <v-layout wrap justify-center>
                <v-flex xs12>
                  <v-autocomplete
                    class="tag-input"
                    v-model="chat"
                    dense
                    chips
                    deletable-chips
                    :color="color"
                    label="Selecione um grupo para participar"
                    no-data-text="Nenhum grupo encontrado"
                    :items="loadedChats"
                    item-value="key"
                    item-text="name"
                    prepend-icon="fa fa-lg fa-plus-circle"
                    return-object
                    @click:prepend="dialogTeam = true"
                    @change="enterChat(chat)"
                    @focus="loadRecentChats"
                    :loading="loading"
                  >
                    <template slot="item" slot-scope="data">
                      {{ data.item.name }}
                      <v-layout row wrap justify-end>
                        <v-tooltip bottom>
                          <v-btn
                            slot="activator"
                            small
                            color="warning"
                            icon
                            @click="editChat(data.item)"
                          >
                            <v-icon>fa fa-pencil</v-icon>
                          </v-btn>
                          <span>Editar nome do grupo</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                          <v-btn
                            slot="activator"
                            small
                            color="error"
                            icon
                            dark
                            @click="deleteChat(data.item)"
                          >
                            <v-icon>fa fa-trash</v-icon>
                          </v-btn>
                          <span>Excluir grupo</span>
                        </v-tooltip>
                      </v-layout>
                    </template>
                  </v-autocomplete>
                </v-flex>

                <v-flex xs12>
                  <div class="chat-container team" ref="empresaChatContainer">
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
                      @keyup.enter="sendMessage"
                    ></v-text-field>
                    <v-btn :color="color" class="mt-3" @click="sendMessage">
                      <v-icon>fa fa-lg fa-paper-plane</v-icon>
                    </v-btn>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-container>
          </v-tab-item>

          <v-tab-item value="tab-3">
            <v-container grid-list-xl>
              <v-radio-group v-model="radios" :mandatory="false" @change="loadRecentChats">
                <v-layout row wrap>
                  <v-radio :color="color" value label="Mostrar todos"></v-radio>
                  <v-radio :color="color" value="Aberto" label="Abertos"></v-radio>
                  <v-radio :color="color" value="Em andamento" label="Em andamento"></v-radio>
                  <v-radio :color="color" value="Fechado" label="Fechados"></v-radio>
                </v-layout>
              </v-radio-group>
              <v-layout wrap justify-center>
                <v-flex xs12>
                  <v-autocomplete
                    class="tag-input"
                    v-model="chat"
                    dense
                    chips
                    deletable-chips
                    :color="color"
                    label="Seus chamados"
                    no-data-text="Nenhum chamado encontrado"
                    :items="loadedChats"
                    item-value="key"
                    item-text="name"
                    prepend-icon="fa fa-lg fa-plus-circle"
                    return-object
                    @click:prepend="dialog = true"
                    @change="enterChat(chat)"
                    @focus="loadRecentChats"
                    :loading="loading"
                  >
                    <template slot="item" slot-scope="data">
                      <v-tooltip bottom>
                        <template slot="activator">
                          <v-avatar class="mr-4" :color="getColor(data.item.status)" size="15"></v-avatar>
                          {{ data.item.name }}
                        </template>

                        <span>Chamado {{ data.item.status }}</span>
                      </v-tooltip>
                    </template>
                  </v-autocomplete>
                </v-flex>

                <v-flex xs12>
                  <div class="chat-container support" ref="supportChatContainer">
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
                      @keyup.enter="sendMessage"
                      :disabled="statusChat"
                    ></v-text-field>
                    <v-btn :color="color" class="mt-3" @click="sendMessage" :disabled="statusChat">
                      <v-icon>fa fa-lg fa-paper-plane</v-icon>
                    </v-btn>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-container>
          </v-tab-item>
        </v-tabs>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialog" persistent max-width="500px" transition="dialog-transition">
      <v-card>
        <v-card-title class="headline">Abrir novo chamado</v-card-title>
        <v-card-text>
          <v-container grid-list-xl>
            <v-form>
              <v-text-field label="Descrição curta" v-model="newChat.chatName"></v-text-field>
              <v-autocomplete
                v-model="newChat.category"
                label="Categoria"
                :items="categoriaStore.categoriasArtigos"
                item-value="text"
                clearable
                dense
                @focus="$store.dispatch('loadCategoriasArtigos')"
              ></v-autocomplete>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="blue" @click="dialog = false">Fechar</v-btn>
          <v-btn flat color="blue" @click="addChat">Continuar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogTeam" persistent max-width="800px" transition="dialog-transition">
      <v-card>
        <v-card-title
          class="headline"
        >{{ newChat.key ? 'Editar nome do grupo' : 'Criar novo grupo'}}</v-card-title>
        <v-card-text>
          <v-container grid-list-xl>
            <v-form>
              <v-text-field label="Nome" v-model="newChat.chatName"></v-text-field>
              <v-autocomplete
                class="tag-input"
                v-model="newChat.users"
                label="Usuários"
                :items="usuarioStore.currentUsuarios"
                deletable-chips
                chips
                multiple
                dense
                @focus="$store.dispatch('loadUsuarios')"
                :disabled="newChat.key ? true : false"
              ></v-autocomplete>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="blue" @click="dialogTeam = false">Fechar</v-btn>
          <v-btn flat color="blue" @click="newChat.key ? editChat() : addChat(true)">Continuar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmaExclusao" persistent max-width="500px" v-if="id">
      <v-card>
        <v-card-title>
          <span class="headline">Excluir grupo</span>
        </v-card-title>

        <v-card-text>Excluir {{ chat.name }}?</v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="[confirmaExclusao = false]">Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="deleteChat()">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-menu>
</template>

<script>
import { mapState, mapActions } from "vuex";
import axios from "axios";
import { urlBD, showError } from "@/global";

import * as firebase from "firebase";

import modules from "../../config/store/modules";
export default {
  name: "Chat",
  components: {
    Message: () => import("./Message")
  },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["usuarioStore", "empresaStore", "categoriaStore"]),
    statusChat: {
      get() {
        if (!this.chat) return true;
        if (this.chat.status != "Aberto" || this.chat.status != "Em andamento")
          return true;

        return false;
      }
    },
    cnpjEmpresa: {
      get() {
        return this.empresaStore.currentEmpresas.find(
          e => e.value == this.empresaStore.currentEmpresa
        ).cnpj;
      }
    },
    nomeEmpresa: {
      get() {
        return this.empresaStore.currentEmpresas.find(
          e => e.value == this.empresaStore.currentEmpresa
        ).nome;
      }
    },
    user: {
      get() {
        return this.usuarioStore.currentUsuario;
      }
    },
    chats: {
      get() {
        return this.loadedChats;
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
    },
    onNewMessageAdded() {
      const that = this;
      let onNewMessageAdded = function(snapshot, newMessage = true) {
        let message = snapshot.val();
        message.key = snapshot.key;
        /*eslint-disable */
        var urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
        /*eslint-enable */
        message.content = message.content
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
        message.content = message.content.replace(
          urlPattern,
          "<a href='$1'>$1</a>"
        );
        if (!newMessage) {
          that.chatMessages.unshift(that.processMessage(message));
          that.scrollTo();
        } else {
          that.chatMessages.push(that.processMessage(message));
          that.scrollToEnd();
        }
      };
      return onNewMessageAdded;
    }
  },
  watch: {
    menu() {
      if (this.menu) {
        // this.$store.dispatch("loadUsuarios");
        this.$notification.requestPermission();
      }
    },
    "$route.params.id"(newId, oldId) {
      this.currentRef.off("child_added", this.onNewMessageAdded);
    },
    tabIndex() {
      this.loadedChats = [];
    }
  },
  data() {
    return {
      id: null,
      loading: false,
      radios: "",
      menu: false,
      dialog: false,
      dialogTeam: false,
      confirmaExclusao: false,
      content: "",
      chatMessages: [],
      newChat: {},
      loadedChats: [],
      currentRef: {},
      chat: {},
      tabIndex: "tab-2",
      new_messages: 0,
      totalChatHeight: 0
    };
  },
  methods: {
    getColor(item) {
      if (item === "Aberto") return "green";
      else if (item === "Fechado") return "red";
      else return "blue";
    },
    ...mapActions("chat", ["loadUserChats"]),
    enterChat(chat) {
      if (!chat || chat.userCount == null) {
        this.chatMessages = [];
        return;
      }

      let chatId = chat.key;
      let time = new Date().valueOf();

      let updates = {};
      updates["/chat_members/" + chatId + "/users/" + this.user.id] = {
        timestamp: time
      };
      updates["users/" + this.user.id + "/chats/" + chatId] = {
        timestamp: time
      };

      let that = this;
      firebase
        .database()
        .ref()
        .update(updates)
        .then(() => {
          that.id = chatId;
          this.loadChat(chatId);
        });
    },
    async addChat(isEnterprise) {
      if (!this.newChat) return;

      this.chatStore.actions
        .createChat(null, {
          chatName: this.newChat.chatName,
          isEnterprise: true,
          users: this.newChat.users,
          user: this.user,
          cnpjEmpresa: this.cnpjEmpresa,
          status: "Aberto"
        })
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.loadRecentChats();
          this.dialogTeam = false;
        });
      if (isEnterprise) {
      } else {
        this.chatStore.actions
          .createChat(null, {
            chatName: this.newChat.chatName,
            category: this.newChat.category,
            user: this.user,
            cnpjEmpresa: this.cnpjEmpresa,
            status: "Aberto"
          })
          .then(() => {
            this.$toasted.global.defaultSuccess();
            this.loadRecentChats();
            this.dialog = false;
          });
      }
    },
    scrollTo() {
      this.$nextTick(() => {
        let currentHeight = this.$refs.supportChatContainer.scrollHeight;
        let difference = currentHeight - this.totalChatHeight;
        var container = this.$refs.supportChatContainer;
        container.scrollTop = difference;
      });
    },
    scrollToEnd() {
      this.$nextTick(() => {
        if (this.tabIndex == "tab-1") {
          const container = this.$refs.privChatContainer;
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
    loadRecentChats(lastKey) {
      this.loading = true;
      let that = this;
      firebase
        .database()
        .ref("chats")
        .orderByKey()
        .limitToLast(20)
        .once("value", function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
            let chat = childSnapshot.val();
            chat.key = childSnapshot.key;
            that.getUserCountForChat(chat);
            that.loadedChats.unshift(chat);
          });

          if (that.tabIndex == "tab-2") {
            that.loadedChats = that.loadedChats.filter(chat => {
              return chat.isEnterprise;
            });
          } else if (that.tabIndex == "tab-3") {
            that.loadedChats = that.loadedChats.filter(chat => {
              if (chat.isEnterprise) return;

              if (that.radios != "") return chat.status == that.radios;
            });
          }
        })
        .finally(() => (this.loading = false));
    },
    getUserCountForChat(chat) {
      let that = this;
      firebase
        .database()
        .ref("chat_members")
        .child(chat.key)
        .child("users")
        .once("value", function(snapshot) {
          that.$set(chat, "userCount", snapshot.numChildren());
        });
    },
    loadChat(id) {
      if (!id) return;

      this.chatMessages = [];
      this.currentRef = firebase
        .database()
        .ref("messages")
        .child(this.id)
        .child("messages")
        .limitToLast(20);
      this.currentRef.on("child_added", this.onNewMessageAdded);

      if (this.chatMessages.length == 0 && this.tabIndex == "tab-3") {
        this.chatMessages.push({
          user: "Campag informática",
          content: `
            Bem-vindo ao suporte, fique a vontade para tirar suas dúvidas com um de nossos atendentes! :D
            `
        });
      } else if (this.chatMessages.length == 0 && this.tabIndex == "tab-2") {
        this.chatMessages.push({
          user: "Campag informática",
          content: `
            Bem-vindo ao chat da equipe, lembre-se de não compartilhar senhas pela sua segurança! :D
            `
        });
      }
    },
    processMessage(message) {
      /*eslint-disable */
      var imageRegex = /([^\s\']+).(?:jpg|jpeg|gif|png)/i;
      /*eslint-enable */
      if (imageRegex.test(message.content)) {
        message.image = imageRegex.exec(message.content)[0];
      }
      var emojiRegex = /([\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{2934}-\u{1f18e}])/gu;
      if (emojiRegex.test(message.content)) {
        message.content = message.content.replace(
          emojiRegex,
          '<span class="emoji">$1</span>'
        );
      }
      return message;
    },
    sendMessage() {
      if (this.content !== "") {
        this.chatStore.actions.sendMessage({
          username: this.username,
          content: this.content,
          date: new Date().toString(),
          chatID: this.id
        });
        this.content = "";
      }
    },
    editChat(chat) {
      if (!this.dialogTeam) {
        this.dialogTeam = true;
        this.newChat = {
          ...chat,
          chatName: chat.name
        };
        return;
      }

      this.chatStore.actions
        .editChat(null, this.newChat)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.dialogTeam = false;
        })
        .catch(showError);
    },
    deleteChat(chat) {
      if (!this.confirmaExclusao) {
        return (this.confirmaExclusao = true);
      }

      this.chatStore.actions
        .deleteChat(null, this.id)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.confirmaExclusao = false;

          this.loadedChats = [];
          this.chatMessages = [];
          this.content = ""
        })
        .catch(showError);
    }
  },
  mounted() {
    this.$store.dispatch("loadOnlineUsers");
  }
};
</script>

<style>
.chat-container {
  box-sizing: border-box;

  overflow-y: auto;
  padding: 10px;
  background-color: #f2f2f2;
}
.team {
  height: calc(70vh - 9.5rem);
}
.support {
  height: calc(62vh - 9.5rem);
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