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

        if (!req.headers.client_base) {
            res.status(400).send('Informe a base de dados');
            return;
        }
        try {
            var conn = connectionsMap[req.headers.client_base]
            if (!conn) {
                connectionsMap[req.headers.client_base] = knex(createConnectionConfig(req.headers.client_base))
                conn = connectionsMap[req.headers.client_base]
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