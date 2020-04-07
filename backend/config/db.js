const config = require('../knexfile.js')
const db = require('knex')(config.db)
const dbUsers = require('knex')(config.dbUsers)

//knex.migrate.latest([config])
module.exports = { db, dbUsers }