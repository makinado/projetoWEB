
exports.up = function (knex) {
    return knex.shema.createTable('produtos', table => {
        table.increments('id').primary()
        table.string('descricao', 100).notNull()
        table.string('img')
        table.boolean('situacao')
        table.integer('forneceodr').references('id')
            .inTable('pessoas')
        table.string('id_fornecedor', 50)
        table.decimal('estoque_max', 10, 2)
        table.decimal('estoque_min', 10, 2)
        table.string('categoria').references('id')
            .inTable('categorias')
        table.string('marca').references('id')
            .inTable('marcas')
        table.string('unidade').references('id')
            .inTable('unidades')

        table.decimal('valor_unitario', 10, 2)
        table.decimal('valor_venda', 10, 2)
        table.decimal('valor_custo_medio', 10, 2)
        table.decimal('valor_lucro_bruto', 10, 2)
        table.decimal('perc_margem_contribuicao', 10, 2)
        table.decimal('perc_comissao', 10, 2)
        table.decimal('valor_comissao', 10, 2)

        table.decimal('perc_ipi', 10, 2)
        table.string('origem')
        table.string('cest', 50)
        table.string('ncm', 50)

        table.timestamp('data_criado')
        table.timestamp('data_atualizado')
    })
};

exports.down = function (knex) {
    return knex.schema.dropTable('produtos')
};
