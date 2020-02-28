
exports.up = function (knex, Promise) {
    return knex.schema.createTable('usuarios', table => {
        table.increments('id').primary()
        table.string('nome', 100).notNull()
        table.string('email', 100).unique()
        table.string('senha').notNull()
        table.string('contato', 30)
        table.string('img')
        table.string('id_perfil').references('id')
            .inTable('perfil')
            
        table.timestamp('data_criado')
        table.timestamp('data_atualizado')
    })
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('usuarios')
};
