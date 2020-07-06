const knex = require('knex')

module.exports = knex({
	client: process.env.DB_CLIENT,
	debug: false,
	connection: {
		user: process.env.DB_USER,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		database: process.env.DB_DATABASE,
		password: process.env.DB_PASSWORD
	},
	pool: { min: 2, max: 20 }
});