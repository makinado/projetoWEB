
exports.up = function (knex) {
    return knex.schema.createTable('usuario_empresa', table => {
        table.integer('id_usuario').references('id').inTable('usuarios')
        table.integer('id_empresa').references('id').inTable('empresas')
    })
};

exports.down = function (knex) {
    return knex.schema.dropTable('usuario_empresa')
};
