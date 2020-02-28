
exports.up = function (knex) {
    return knex.schema.createTable('empresa', table => {
        table.increments('id').primary()
        table.string('cnpj', 25).notNull()
        table.string('nome').notNull()
        table.string('fantasia')

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

        table.string('remgime_tributario', 30)
        table.decimal('aliquota_simplesnacional', 10, 2)
        table.decimal('aliquota_pis', 10, 2)
        table.decimal('aliquota_cofins', 10, 2)
        table.decimal('aliquota_icms', 10, 2)
        table.decimal('aliquota_base_csll', 10, 2)
        table.decimal('aliquota_csll', 10, 2)
        table.decimal('aliquota_base_irpj', 10, 2)
        table.decimal('aliquota_irpj', 10, 2)

        table.string('email_envio_nfe', 100)
        table.string('email_envio_boleto', 100)
        table.string('email_envio_compra', 100)
        table.string('email_envio_venda', 100)
        table.string('provedor_email', 100)
        table.boolean('ssl', 100)
        table.string('endereco_servidor', 100)
        table.integer('porta')
        table.string('usuario', 100)
        table.string('senha', 100)

        table.timestamp('data_criado')
        table.timestamp('data_atualizado')
    })
};

exports.down = function (knex) {
    return knex.schema.dropTable('empresas')
};
