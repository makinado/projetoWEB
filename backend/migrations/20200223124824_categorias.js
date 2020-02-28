
exports.up = function (knex, Promise) {
    return knex.schema.createTable('categorias', table => {
        table.increments('id').primary()
        table.string('descricao')
        table.integer('tipo')
    })
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('categorias')
};
