const { formatToBRL } = require('brazilian-values')

module.exports = app => {
    const { existsOrError, parseNumber, formatDate } = app.api.validation

    const save = async (req, res) => {
        const venda = { ...req.body }
        if (req.params.id) {
            venda.id = req.params.id
        }

        try {
            existsOrError(venda.id_empresa, 'Informe a empresa da venda')
            existsOrError(venda.id_pessoa, 'Informe o fornecedor da venda')

            //validar dados da nota
            existsOrError(venda.nota_fiscal, 'Informe o número da nota fiscal')
            existsOrError(venda.data_notafiscal, 'Informe a data da nota fiscal')
            existsOrError(venda.data_lancamento, 'Informe a data de lançamento')

            existsOrError(venda.produtos, 'Informe os produtos do venda')
            existsOrError(venda.financeiro, 'Informe a(s) parcela(s) da venda')
        } catch (e) {
            return res.status(400).send(e.toString())
        }


        var produtos = venda.produtos
        var financeiro = venda.financeiro
        delete venda.produtos
        delete venda.financeiro

        delete financeiro.menu
        delete financeiro.edit

        try {
            venda.valor_frete = parseNumber(venda.valor_frete || "0,00")
            venda.valor_seguro = parseNumber(venda.valor_seguro || "0,00")
            venda.outras_despesas = parseNumber(venda.outras_despesas || "0,00")
            venda.valor_desconto = parseNumber(venda.valor_desconto || "0,00")
            venda.valor_produtos = parseNumber(venda.valor_produtos || "0,00")
            venda.valor_total = parseNumber(venda.valor_total || "0,00")

            venda.situacao = venda.situacao ? venda.situacao : 'CONCLUÍDA'

            if (venda.id) {
                return app.db.transaction(async function (trx) {
                    return app.db('venda')
                        .update(venda)
                        .where({ id: venda.id })
                        .transacting(trx)
                        .then(async function () {
                            const movim_estoque = []

                            await app.db('produto_venda').where({ id_venda: venda.id }).delete()
                            await app.db('produto_movimento_estoque').where({ id_movimentacao: venda.id }).delete()
                            // await app.db('financeiro').where({ id_movimentacao: venda.id }).delete()

                            produtos = await produtos.map(produto => {
                                const newProd = {
                                    id_venda: venda.id,
                                    id_empresa: venda.id_empresa,
                                    id_produto: produto.id,
                                    sequencia: produto.sequencia,
                                    cfop: produto.cfop,
                                    ncm: produto.ncm,

                                    quantidade: (parseNumber(produto.quantidade || "0,00")),
                                    valor_unitario: (parseNumber(produto.valor_unitario || "0,00")),
                                    valor_desconto: (parseNumber(produto.valor_desconto || "0,00")),
                                    valor_total: (parseNumber(produto.valor_total || "0,00")),
                                    perc_custo_adicional: (parseNumber(produto.perc_custo_adicional || "0,00"))
                                }

                                movim_estoque.push({
                                    id_empresa: venda.id_empresa,
                                    id_produto: produto.id,
                                    tipo_movimentacao: 0,
                                    data_movimentacao: venda.data_lancamento,
                                    id_movimentacao: venda.id,
                                    quantidade: parseNumber(produto.quantidade || "0,00"),
                                    observacao: venda.observacao
                                })

                                return newProd
                            })
                            await app.db('financeiro').where({ id_movimento_origem: venda.id }).delete()

                            financeiro = financeiro.map(parcela => {
                                const newFinanc = {
                                    id_empresa: venda.id_empresa,
                                    id_movimento_origem: venda.id,
                                    pago: parcela.pago,
                                    parcela: parcela.parcelas,
                                    observacao: venda.observacao,
                                    valor_parcela: parseNumber(parcela.valor || "0,00"),

                                    documento_origem: parcela.documento_origem,

                                    data_criacao: new Date(),
                                    data_emissao: venda.data_lancamento,
                                    data_vencimento: parcela.data
                                }

                                return newFinanc
                            })

                            return app.db.batchInsert('produto_venda', produtos)
                                .transacting(trx)
                                .then(function () {
                                    return app.db.batchInsert('produto_movimento_estoque', movim_estoque)
                                        .transacting(trx)
                                        .then(function () {
                                            return app.db.batchInsert('financeiro', financeiro)
                                                .transacting(trx)
                                        })
                                })

                        })
                        .then(trx.commit)
                        .catch(trx.rollback);
                }).then(function (inserts) {
                    res.status(204).send()
                }).catch(function (error) {
                    console.log(error.toString())
                    res.status(500).send(error.toString())
                });

            } else {
                return app.db.transaction(async function (trx) {
                    return app.db('venda')
                        .insert(venda).returning('id')
                        .transacting(trx)
                        .then(function (id) {
                            const movim_estoque = []
                            produtos = produtos.map(produto => {
                                const newProd = {
                                    id_venda: id[0],
                                    id_empresa: venda.id_empresa,
                                    id_produto: produto.id,
                                    sequencia: produto.sequencia,
                                    cfop: produto.cfop,
                                    ncm: produto.ncm,

                                    quantidade: (parseNumber(produto.quantidade || "0,00")),
                                    valor_unitario: (parseNumber(produto.valor_unitario || "0,00")),
                                    valor_desconto: (parseNumber(produto.valor_desconto || "0,00")),
                                    valor_total: (parseNumber(produto.valor_total || "0,00")),
                                    perc_custo_adicional: (parseNumber(produto.perc_custo_adicional || "0,00"))
                                }

                                movim_estoque.push({
                                    id_empresa: venda.id_empresa,
                                    id_produto: produto.id,
                                    tipo_movimentacao: 0,
                                    data_movimentacao: venda.data_lancamento,
                                    id_movimentacao: id[0],
                                    quantidade: parseNumber(produto.quantidade || "0,00"),
                                    observacao: venda.observacao
                                })

                                return newProd
                            })
                            financeiro = financeiro.map(parcela => {
                                const newFinanc = {
                                    id_empresa: venda.id_empresa,
                                    id_movimento_origem: id[0],
                                    pago: parcela.pago,
                                    parcela: parcela.parcelas,
                                    observacao: venda.observacao,
                                    valor_parcela: parseNumber(parcela.valor || "0,00"),

                                    documento_origem: parcela.documento_origem,

                                    data_criacao: new Date(),
                                    data_emissao: venda.data_lancamento,
                                    data_vencimento: parcela.data
                                }

                                return newFinanc
                            })

                            return app.db.batchInsert('produto_venda', produtos)
                                .transacting(trx)
                                .then(function () {
                                    return app.db.batchInsert('produto_movimento_estoque', movim_estoque)
                                        .transacting(trx)
                                        .then(function () {
                                            return app.db.batchInsert('financeiro', financeiro)
                                                .transacting(trx)
                                        })
                                })

                        })
                        .then(trx.commit)
                        .catch(trx.rollback);
                }).then(function (inserts) {
                    res.status(204).send()
                }).catch(function (error) {
                    console.log(error.toString())
                    res.status(500).send(error.toString())
                });
            }
        } catch (e) {
            res.status(500).send(e.toString())
        }
    }

    const get = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await app.db('venda').count('id').first()
        const count = parseInt(result.count)

        app.db('venda')
            .join('empresas', 'venda.id_empresa', 'empresas.id')
            .join('pessoas as cliente', 'venda.id_pessoa', 'cliente.id')
            .join('pessoas as vendedor', 'venda.id_vendedor', 'vendedor.id')
            .select(
                'venda.id',
                'venda.situacao',
                'nota_fiscal',
                'data_emissao',
                'empresas.nome as empresa',
                'cliente.nome as cliente',
                'vendedor.nome as vendedor'
            )
            .limit(limit).offset(page * limit - limit)
            .orderBy('venda.situacao')
            .where(async (qb) => {
                if (req.query.tipo == 2) {
                    // pesquisa avançada
                    if (req.query.fornecedor) {
                        qb.where('venda.id_pessoa', '=', req.query.fornecedor);
                    } else if (req.query.id) {
                        qb.orWhere('venda.id', '=', req.query.id);
                    } else if (req.query.documento) {
                        qb.orWhere('venda.nota_fiscal', '=', req.query.documento);
                    }
                    if (req.query.tipo_data == 1) {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('venda.data_notafiscal', [req.query.data_inicial, req.query.data_final])
                        }
                    } else {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('venda.data_lancamento', [req.query.data_inicial, req.query.data_final])
                        }
                    }
                    if (req.query.concluidas) {
                        qb.where('venda.situacao', 'CONCLUÍDA');
                    }
                    if (req.query.canceladas) {
                        qb.where('venda.situacao', 'CANCELADA');
                    }
                } else {
                    // pesquisa rapida
                    if (req.query.fornecedor) {
                        qb.where('venda.id_pessoa', '=', req.query.fornecedor);
                    } else if (req.query.id) {
                        qb.orWhere('venda.id', '=', req.query.id);
                    } else if (req.query.documento) {
                        qb.orWhere('venda.nota_fiscal', '=', req.query.documento);
                    }
                    if (req.query.tipo_data == 1) {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('venda.data_notafiscal', [req.query.data_inicial, req.query.data_final])
                        }
                    } else {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('venda.data_lancamento', [req.query.data_inicial, req.query.data_final])
                        }
                    }
                    if (req.query.concluidas) {
                        qb.where('venda.situacao', 'CONCLUÍDA');
                    }
                    if (req.query.canceladas) {
                        qb.where('venda.situacao', 'CANCELADA');
                    }
                }
            })
            .then(pedido => res.json({ data: pedido, count, limit }))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getById = async (req, res) => {
        venda = await app.db('venda')
            .catch(e => {
                res.status(500).send('Erro no servidor')
                console.log(e.toString())
            })
        venda.produtos = await app.db('produto_venda')
            .join('produtos', 'produto_venda.id_produto', 'produtos.id')
            .select(
                'produto_venda.id_produto as id',
                'produto_venda.sequencia',
                'produtos.descricao as descricao',
                'produto_venda.ncm',
                'produto_venda.cfop',
                'produto_venda.quantidade',
                'produto_venda.valor_unitario',
                'produto_venda.valor_desconto',
                'produto_venda.perc_custo_adicional',
                'produto_venda.valor_total'
            )
            .where({ id_venda: venda.id })

        res.json(venda)
    }

    const remove = async (req, res) => {
        return app.db.transaction(async function (trx) {
            return app.db('venda')
                .where({ id: req.params.id }).delete()
                .transacting(trx)
                .then(function () {
                    return app.db('produto_venda')
                        .where({ id_venda: req.params.id }).delete()
                        .transacting(trx)
                        .then(function () {
                            return app.db('financeiro')
                                .where({ id_movimento_origem: req.params.id }).delete()
                                .transacting(trx)
                                .then(function () {
                                    return app.db('produto_movimento_estoque')
                                        .where({ id_movimentacao: req.params.id }).delete()
                                        .transacting(trx)
                                })
                        })
                })
                .then(trx.commit)
                .catch(trx.rollback);
        }).then(function (inserts) {
            res.status(204).send()
        }).catch(function (error) {
            console.log(error.toString())
            res.status(500).send(error.toString())
        });
    }

    return { save, get, getById, remove }
}