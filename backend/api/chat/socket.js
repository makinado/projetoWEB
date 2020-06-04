const uuidv4 = require('uuid/v4')

module.exports = (io, app) => {
    function addUser(userList, user) {
        let newList = Object.assign({}, userList)
        newList[user.nome] = user

        return newList
    }

    function removeUser(userList, username) {
        let newList = Object.assign({}, userList)
        delete newList[username]
        return newList
    }

    exports = onlineUsersExport = {}
    let onlineUsers = {}

    io.on('connection', (socket) => {
        const emitOnlineUsers = () => {
            io.emit('onlineUsers', onlineUsers)
        }

        socket.on('login', user => {
            user.socketId = socket.id
            user.online = true
            onlineUsers = addUser(onlineUsers, user)
            onlineUsersExport = addUser(onlineUsersExport, user)
            socket.user = user

            emitOnlineUsers()
        })

        socket.on('logout', () => {
            // usuario fez logout do sistema
            if ("user" in socket) {
                onlineUsers = removeUser(onlineUsers, socket.user.nome)
                onlineUsersExport = removeUser(onlineUsersExport, socket.user.nome)

                emitOnlineUsers()
            }

        })

        socket.on('disconnect', param => {
            // usuario fechou o browser
            if ("user" in socket) {
                onlineUsers = removeUser(onlineUsers, socket.user.nome)
                onlineUsersExport = removeUser(onlineUsersExport, socket.user.nome)

                emitOnlineUsers()
            }

        })

        socket.on('join', async room => {
            socket.join(room)

            app.db('chat')
                .select('id_usuario_origem', 'id_chat', 'mensagem', 'data')
                .where({ id_chat: room })
                .then(async msgs => {
                    const resultado = await Promise.all(msgs.map(async msg => {
                        return {
                            user: {
                                id: msg.id_usuario_origem,
                                nome: await app.db('usuarios').select('nome').where({ id: msg.id_usuario_origem }).first().then(usuario => usuario ? usuario.nome : "")
                            },
                            id_chat: msg.id_chat,
                            content: msg.mensagem,
                            data: msg.data,
                        }
                    }))

                    socket.emit('join', resultado)
                })
        })

        socket.on('join private', (data) => {
            app.db('chat')
                .select('id_usuario_origem', 'id_chat', 'mensagem', 'data')
                .where({ id_usuario_destino: data.sender.id, id_usuario_origem: data.receiver.id })
                .orWhere({ id_usuario_destino: data.receiver.id, id_usuario_origem: data.sender.id })
                .then(async msgs => {
                    const resultado = await Promise.all(msgs.map(async msg => {
                        return {
                            user: {
                                id: msg.id_usuario_origem,
                                nome: await app.db('usuarios').select('nome').where({ id: msg.id_usuario_origem }).first().then(usuario => usuario.nome)
                            },
                            id_chat: msg.id_chat,
                            content: msg.mensagem,
                            data: msg.data,
                        }
                    }))

                    socket.emit('join', resultado)
                })
        })

        socket.on('private chat message', async msg => {
            const userReceiver = onlineUsers[msg.receiver.nome]

            const msg_bd = {
                id_usuario_origem: msg.user.id,
                id_usuario_destino: msg.receiver.id,
                id_chat: msg.id_chat,
                mensagem: msg.content,
                data: msg.data,
            }

            if (userReceiver) {
                await app.db('chat').insert(msg_bd)
                    .then(() => socket.to(userReceiver.socketId).broadcast.emit('privateChatMessage', msg))
            } else {
                app.db('chat').insert(msg_bd)
            }
        })

        socket.on('chat message', async msg => {
            const msg_bd = {
                id_usuario_origem: msg.user.id,
                id_usuario_destino: msg.user.id_dest,
                id_chat: msg.id_chat,
                mensagem: msg.content,
                data: msg.data,
            }

            await app.db('chat').insert(msg_bd)
                .then(() => socket.to(msg.id_chat).broadcast.emit('chatMessage', msg))
                .catch(e => {
                    msg.content = e.message
                    socket.emit('chatMessage', msg)
                })
        });
    });

}