const config = require('../knexfileUsers.js')
const knex = require('knex')(config)

//knex.migrate.latest([config])
module.exports = knex