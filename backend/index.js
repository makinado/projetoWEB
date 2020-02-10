var app = require('express')();
var http = require('http').createServer(app);
const io = require('socket.io')(http)

const consign = require('consign')
const compression = require('compression')
const mongoose = require('mongoose')

const db = require('./config/db')
const dbUsers = require('./config/dbUsers')

app.db = db
app.dbUsers = dbUsers
app.mongoose = mongoose
app.use(compression())

consign()
    .include('./config/passport.js')
    .then('./config/middlewares.js')
    .then('./api/validation.js')
    .then('./api')
    .then('./config/routes.js')
    .into(app)

io.on('connection', (socket) => {
    console.log('a user connected');

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
                            nome: await app.dbUsers('usuarios').select('nome').where({ id: msg.id_usuario_origem }).first().then(usuario => usuario.nome)
                        },
                        id_chat: msg.id_chat,
                        content: msg.mensagem,
                        data: msg.data,
                    }
                }))

                socket.emit('join', resultado)
            })
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
            .then(() => socket.to(msg.id_chat).broadcast.emit('chat message', msg))
            .catch(e => {
                msg.content = e.message
                socket.emit('chat message', msg)
            })
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });
});

http.listen(3000, function () {
    console.log('api online na porta 3000');
});
