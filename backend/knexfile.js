const db = {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	database: process.env.DB_NAME,
	user: 'postgres',
	password: process.env.DB_PASS
}

module.exports = {
	client: 'postgresql',
	connection: db,
	pool: {
		min: 2,
		max: 100
	}
}

