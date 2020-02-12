var app = require('express')();
var http = require('http').createServer(app);
const io = require('socket.io')(http)

const compression = require('compression')
require('./api/chat/socket')(io, app);
const consign = require('consign')
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

const PORT = process.env.port || 3000

http.listen(PORT, function () {
    console.log('api online na porta ' + PORT);
});
