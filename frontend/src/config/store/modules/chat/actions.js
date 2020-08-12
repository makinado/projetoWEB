import * as firebase from 'firebase'

import mainState from '../../state'
import { mapMutations } from 'vuex'

export default {
    sendMessage(payload) {
        console.log(payload)
        let chatID = payload.chatID
        const message = {
            user: payload.username,
            content: payload.content,
            date: payload.date
        }

        console.log(chatID)

        firebase.database().ref('messages').child(chatID).child('messages').push(message)
            .then(
                // (data) => {
                // }
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

        let newPostKey = firebase
            .database()
            .ref()
            .child("chats")
            .push().key;

        delete Object.assign(payload, { ['name']: payload['chatName'] })['chatName'];

        let updates = {};
        if (payload.users) {
            payload.users.forEach(user => {
                updates["/chat_members/" + newPostKey + "/users/" + user] = {
                    timestamp: time
                };

                updates["users/" + user + "/chats/" + newPostKey] = {
                    timestamp: time
                }
            });

            delete payload.users
        } else {
            updates["/chat_members/" + newPostKey + "/users/" + payload.user.id] = {
                timestamp: time
            };

            updates["users/" + payload.user.id + "/chats/" + newPostKey] = {
                timestamp: time
            };
        }
        updates["/chats/" + newPostKey] = payload;

        return firebase
            .database()
            .ref()
            .update(updates)
            .then(() => newPostKey)
            .catch(e => e)
    },
    async editChat(state, payload) {
        console.log(payload)
        delete Object.assign(payload, { ['name']: payload['chatName'] })['chatName'];
        let updates = {};
        updates["/chats/" + payload.key] = payload;

        return firebase
            .database()
            .ref()
            .update(updates)
            .catch(e => e)
    },
    async deleteChat(state, id) {
        return firebase
            .database()
            .ref('/chat_members/' + id)
            .remove()
            .then(() => firebase
                .database()
                .ref('/chats/' + id)
                .remove()
                .then(() => firebase
                    .database()
                    .ref('/messeges/' + id)
                    .remove()
                )
            )
    }
}