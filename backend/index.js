var app = require('express')()
var http = require('http').createServer(app)
const io = require('socket.io')(http)

require('dotenv').config()

require('./api/chat/socket')(io, app)
const consign = require('consign')

app.commonDb = require('./knexfile')

consign()
    .include('./config/passport.js')
    .then('./config/middlewares.js')
    .then('./api/validation.js')
    .then('./api')
    .then('./config/routes.js')
    .into(app)

const PORT = process.env.PORT || 3000

http.listen(PORT, function () {
    console.log('api online na porta ' + PORT)
})
