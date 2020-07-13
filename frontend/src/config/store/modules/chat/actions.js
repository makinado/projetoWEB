import * as firebase from 'firebase'

import mainState from '../../state'
import { mapMutations } from 'vuex'

export default {
    sendMessage(state, payload) {
        let chatID = payload.chatID
        const message = {
            user: payload.username,
            content: payload.content,
            date: payload.date
        }
        firebase.database().ref('messages').child(chatID).child('messages').push(message)
            .then(
                (data) => {
                }
            )
            .catch(
                (error) => {
                    console.log(error)
                }
            )
    },
    loadUserChats(context) {
        let user = mainState.usuarioStore.currentUsuario
        firebase.database().ref('users').child(user.id).child('chats').orderByChild("timestamp").once("value", function (snapshot) {
            let chats = snapshot.val()
            if (chats == null) {
                chats = {}
            }

            for (let chatId in chats) {
                firebase.database().ref('chats').child(chatId).once('value', function (snapshot) {
                    chats[chatId].name = snapshot.val().name
                    context.commit('setChats', chats)
                })
            }
        })
    },
    async createChat(state, payload) {
        let time = new Date().valueOf();
        let status = "Aberto"

        let newPostKey = firebase
            .database()
            .ref()
            .child("chats")
            .push().key;


        let updates = {};
        updates["/chats/" + newPostKey] = { name: payload.chatName };
        updates["/chat_members/" + newPostKey + "/users/" + payload.user.id] = {
            timestamp: time,
            status
        };
        updates["users/" + payload.user.id + "/chats/" + newPostKey] = {
            timestamp: time,
            status
        };

        return firebase
            .database()
            .ref()
            .update(updates)
            .then(() => newPostKey)
            .catch(e => e)
    }
}