const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const compression = require('compression')

const { createConnectionConfig } = require('./connectionManager');

const knex = require('knex')

module.exports = app => {
    app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }))
    app.use(bodyParser.json({ limit: '50mb' }))
    app.use(cors())
    app.use('/uploads', express.static('uploads'))

    // app.use(require('../config/connectionResolver'))

    //midleware para base de dados
    let connectionsMap = {}
    app.use(async (req, res, next) => {
        if (req.url == '/signupFunc' || req.url == '/signinFunc' || req.url == '/signup' || req.url == '/signin' || req.url == '/validateToken' || req.url == '/recoverPassword')
            return next()

        if (!req.headers.user || req.headers.user.nome_base) {
            res.status(400).send('Nenhum usuário logado');
            return;
        }
        const user = JSON.parse(req.headers.user)
        try {
            var conn = connectionsMap[user.nome_base]
            if (!conn) {
                connectionsMap[user.nome_base] = knex(createConnectionConfig(user.nome_base))
                conn = connectionsMap[user.nome_base]
            }

            req.knex = conn
            next()
        } catch (e) {
            console.log(e)
            throw "Erro ao conectar com a base de dados"
        }
    })

    app.use(compression())
}