
exports.up = function (knex, Promise) {
    return knex.schema.createTable('unidades', table => {
        table.increments('id').primary()
        table.string('sigla', 5).notNull()
        table.string('descricao').notNull()
    })
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('unidades')
};
