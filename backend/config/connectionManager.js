function createConnectionConfig(nomeBase) {
    return {
        client: process.env.DB_CLIENT,
        connection: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            database: nomeBase || process.env.DB_DATABASE,
            password: process.env.DB_PASSWORD
        },
        pool: { min: 2, max: 20 }
    };
}

module.exports = { createConnectionConfig }