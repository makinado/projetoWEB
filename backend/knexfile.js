const { hostDev } = require('./.env')

const db = {
	host: hostDev,
	port: 5432,
	database: 'CampagWEB',
	user: 'postgres',
	password: 'postgres'
}

module.exports = {
	client: 'postgresql',
	connection: db,
	pool: {
		min: 2,
		max: 10
	},
};
