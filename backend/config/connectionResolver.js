const { createConnectionConfig } = require('./connectionManager');

const knex = require('knex')
const knextancy = require('knextancy')

let connectionsMap
module.exports = async function resolve(req, res, next) {
    if (req.url == '/signup' || req.url == '/signin' || req.url == '/validateToken' || req.url == '/recoverPassword' || req.url == '/notificacoes')
        return next()

    if (!req.headers.client_base) {
        res.status(400).send('Informe a base de dados');
        return;
    }
    knextancy.middleware(knex(createConnectionConfig(req.headers.client_base)), { header: 'client_base' })
    next()
}