var app = require('express')();
var http = require('http').createServer(app);
const io = require('socket.io')(http)

require('dotenv').config()

const compression = require('compression')
require('./api/chat/socket')(io, app);
const consign = require('consign')
const mongoose = require('mongoose')

const { dbUsers, db } = require('./config/db')

app.dbUsers = dbUsers
app.db = db

app.mongoose = mongoose
app.use(compression())

consign()
    .include('./config/passport.js')
    .then('./config/middlewares.js')
    .then('./api/validation.js')
    .then('./api')
    .then('./config/routes.js')
    .into(app)

const PORT = process.env.PORT || 3000

http.listen(PORT, function () {
    console.log('api online na porta ' + PORT);
});
