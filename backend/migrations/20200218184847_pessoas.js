
exports.up = function (knex) {
    return knex.schema.createTable('pessoas', table => {
        table.increments('id').primary()
        table.string('nome', 100).notNull()
        table.string('fantasia', 100)
        table.string('tipo', 20)
        table.string('cpf', 25)
        table.string('cnpj', 25)
        table.string('situacao', 10).notNull()
        table.string('categoria').references('id')
            .inTable('categorias')

        table.boolean('cliente').defaultTo(false)
        table.boolean('fornecedor').defaultTo(false)
        table.boolean('transpotadora').defaultTo(false)

        table.string('cep', 20)
        table.string('id_cidade').references('id')
            .inTable('mucicipios')
        table.string('bairro', 100)
        table.string('logradouro', 100)
        table.integer('numero')
        table.string('complemento')
        table.string('email', 100)
        table.string('email2', 100)
        table.string('contato', 30)
        table.string('contato2', 30)

        table.timestamp('data_criado')
        table.timestamp('data_atualizado')
    })
};

exports.down = function (knex) {
    return knex.schema.dropTable('pessoas')
};
