const db = {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	database: process.env.DB_NAME,
	user: 'postgres',
	password: process.env.DB_PASS
}

const dbUsers = {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	database: process.env.DB_USERS,
	user: 'postgres',
	password: process.env.DB_PASS
}

module.exports = {
	db: {
		client: 'postgresql',
		connection: db,
		pool: {
			min: 2,
			max: 100
		}
	},
	dbUsers: {
		client: 'postgresql',
		connection: dbUsers,
		pool: {
			min: 2,
			max: 100
		}
	}
}

