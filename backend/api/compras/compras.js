const { formatToBRL } = require('brazilian-values')

module.exports = app => {
    const { existsOrError, parseNumber, formatDate } = app.api.validation

    const save = async (req, res) => {
        const compra = { ...req.body }
        if (req.params.id) {
            compra.id = req.params.id
        }

        try {
            existsOrError(compra.id_empresa, 'Informe a empresa da compra')
            existsOrError(compra.id_pessoa, 'Informe o fornecedor da compra')

            //validar dados da nota
            existsOrError(compra.nota_fiscal, 'Informe o número da nota fiscal')
            existsOrError(compra.data_notafiscal, 'Informe a data da nota fiscal')
            existsOrError(compra.data_lancamento, 'Informe a data de lançamento')

            existsOrError(compra.produtos, 'Informe os produtos do compra')
            existsOrError(compra.financeiro, 'Informe a(s) parcela(s) da compra')
        } catch (e) {
            return res.status(400).send(e.toString())
        }


        var produtos = compra.produtos
        var financeiro = compra.financeiro
        delete compra.produtos
        delete compra.financeiro

        delete financeiro.menu
        delete financeiro.edit

        try {
            compra.valor_frete = parseNumber(compra.valor_frete || "0,00")
            compra.valor_seguro = parseNumber(compra.valor_seguro || "0,00")
            compra.outras_despesas = parseNumber(compra.outras_despesas || "0,00")
            compra.valor_desconto = parseNumber(compra.valor_desconto || "0,00")
            compra.valor_produtos = parseNumber(compra.valor_produtos || "0,00")
            compra.valor_total = parseNumber(compra.valor_total || "0,00")

            compra.situacao = compra.situacao ? compra.situacao : 'CONCLUÍDA'

            if (compra.id) {
                return app.db.transaction(async function (trx) {
                    return app.db('compra')
                        .update(compra)
                        .where({ id: compra.id })
                        .transacting(trx)
                        .then(async function () {
                            const movim_estoque = []

                            await app.db('produto_compra').where({ id_compra: compra.id }).delete()
                            await app.db('produto_movimento_estoque').where({ id_movimentacao: compra.id }).delete()
                            // await app.db('financeiro').where({ id_movimentacao: compra.id }).delete()

                            produtos = await produtos.map(produto => {
                                const newProd = {
                                    id_compra: compra.id,
                                    id_empresa: compra.id_empresa,
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
                                    id_empresa: compra.id_empresa,
                                    id_produto: produto.id,
                                    tipo_movimentacao: 0,
                                    data_movimentacao: compra.data_lancamento,
                                    id_movimentacao: compra.id,
                                    quantidade: parseNumber(produto.quantidade || "0,00"),
                                    observacao: compra.observacao
                                })

                                return newProd
                            })
                            await app.db('financeiro').where({ id_movimento_origem: compra.id }).delete()

                            financeiro = financeiro.map(parcela => {
                                const newFinanc = {
                                    id_empresa: compra.id_empresa,
                                    id_movimento_origem: compra.id,
                                    pago: parcela.pago,
                                    parcela: parcela.parcelas,
                                    observacao: compra.observacao,
                                    valor_parcela: parseNumber(parcela.valor || "0,00"),

                                    documento_origem: parcela.documento_origem,

                                    data_criacao: new Date(),
                                    data_emissao: compra.data_lancamento,
                                    data_vencimento: parcela.data
                                }

                                return newFinanc
                            })

                            return app.db.batchInsert('produto_compra', produtos)
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
                    return app.db('compra')
                        .insert(compra).returning('id')
                        .transacting(trx)
                        .then(function (id) {
                            const movim_estoque = []
                            produtos = produtos.map(produto => {
                                const newProd = {
                                    id_compra: id[0],
                                    id_empresa: compra.id_empresa,
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
                                    id_empresa: compra.id_empresa,
                                    id_produto: produto.id,
                                    tipo_movimentacao: 0,
                                    data_movimentacao: compra.data_lancamento,
                                    id_movimentacao: id[0],
                                    quantidade: parseNumber(produto.quantidade || "0,00"),
                                    observacao: compra.observacao
                                })

                                return newProd
                            })
                            financeiro = financeiro.map(parcela => {
                                const newFinanc = {
                                    id_empresa: compra.id_empresa,
                                    id_movimento_origem: id[0],
                                    pago: parcela.pago,
                                    parcela: parcela.parcelas,
                                    observacao: compra.observacao,
                                    valor_parcela: parseNumber(parcela.valor || "0,00"),

                                    documento_origem: parcela.documento_origem,

                                    data_criacao: new Date(),
                                    data_emissao: compra.data_lancamento,
                                    data_vencimento: parcela.data
                                }

                                return newFinanc
                            })

                            return app.db.batchInsert('produto_compra', produtos)
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

        const result = await app.db('compra').count('id').first()
        const count = parseInt(result.count)

        app.db('compra')
            .join('empresas', 'compra.id_empresa', 'empresas.id')
            .join('pessoas', 'compra.id_pessoa', 'pessoas.id')
            .select(
                'compra.id',
                'id_empresa',
                'id_pessoa',
                'compra.situacao',
                'nota_fiscal',
                'data_notafiscal',
                'data_lancamento',
                'valor_total',
                'empresas.nome as empresa',
                'pessoas.nome as pessoa',
                'importado',
                'xml'
            )
            .limit(limit).offset(page * limit - limit)
            .orderBy('compra.situacao')
            .where(async (qb) => {
                if (req.query.tipo == 2) {
                    // pesquisa avançada
                    if (req.query.fornecedor) {
                        qb.where('compra.id_pessoa', '=', req.query.fornecedor);
                    } else if (req.query.id) {
                        qb.orWhere('compra.id', '=', req.query.id);
                    } else if (req.query.documento) {
                        qb.orWhere('compra.nota_fiscal', '=', req.query.documento);
                    }
                    if (req.query.tipo_data == 1) {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('compra.data_notafiscal', [req.query.data_inicial, req.query.data_final])
                        }
                    } else {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('compra.data_lancamento', [req.query.data_inicial, req.query.data_final])
                        }
                    }
                    if (req.query.concluidas) {
                        qb.where('compra.situacao', 'CONCLUÍDA');
                    }
                    if (req.query.canceladas) {
                        qb.where('compra.situacao', 'CANCELADA');
                    }
                } else {
                    // pesquisa rapida
                    if (req.query.fornecedor) {
                        qb.where('compra.id_pessoa', '=', req.query.fornecedor);
                    } else if (req.query.id) {
                        qb.orWhere('compra.id', '=', req.query.id);
                    } else if (req.query.documento) {
                        qb.orWhere('compra.nota_fiscal', '=', req.query.documento);
                    }
                    if (req.query.tipo_data == 1) {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('compra.data_notafiscal', [req.query.data_inicial, req.query.data_final])
                        }
                    } else {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('compra.data_lancamento', [req.query.data_inicial, req.query.data_final])
                        }
                    }
                    if (req.query.concluidas) {
                        qb.where('compra.situacao', 'CONCLUÍDA');
                    }
                    if (req.query.canceladas) {
                        qb.where('compra.situacao', 'CANCELADA');
                    }
                }
            })
            .then(pedido => res.json({ data: pedido, count, limit }))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getById = async (req, res) => {
        compra = await app.db('compra')
            .catch(e => {
                res.status(500).send('Erro no servidor')
                console.log(e.toString())
            })
        compra.produtos = await app.db('produto_compra')
            .join('produtos', 'produto_compra.id_produto', 'produtos.id')
            .select(
                'produto_compra.id_produto as id',
                'produto_compra.sequencia',
                'produtos.descricao as descricao',
                'produto_compra.ncm',
                'produto_compra.cfop',
                'produto_compra.quantidade',
                'produto_compra.valor_unitario',
                'produto_compra.valor_desconto',
                'produto_compra.perc_custo_adicional',
                'produto_compra.valor_total'
            )
            .where({ id_compra: compra.id })

        res.json(compra)
    }

    const getTela = async (req, res) => {
        if (req.params.id) {
            var compra = await app.db('compra')
                .where({ 'compra.id': req.params.id }).first()
                .catch(e => res.status(500).send(e.toString()))

            if (compra) {
                compra.data_notafiscal = (new Date(compra.data_notafiscal).toISOString().substr(0, 10))
                compra.data_lancamento = (new Date(compra.data_lancamento).toISOString().substr(0, 10))
                compra.produtos = await app.db('produto_compra')
                    .join('produtos', 'produto_compra.id_produto', 'produtos.id')
                    .select(
                        'produto_compra.id_produto as id',
                        'produto_compra.sequencia',
                        'produto_compra.ncm',
                        'produto_compra.cfop',
                        'produto_compra.quantidade',
                        'produto_compra.valor_unitario',
                        'produto_compra.valor_desconto',
                        'produto_compra.perc_custo_adicional',
                        'produto_compra.valor_total'
                    )
                    .where({ id_compra: compra.id })
                compra.financeiro = await app.db('financeiro')
                    .select(
                        'pago',
                        'data_vencimento as data',
                        'parcela as parcelas',
                        'documento_origem',
                        'valor_parcela as valor'
                    )
                    .where({ id_movimento_origem: compra.id })

                compra.financeiro = compra.financeiro.map(parcela => {
                    parcela.data = parcela.data.toLocaleString().substr(0, 10)
                    return parcela
                })
            }
        }

        const produtos = await app.db('produtos')
            .select('id as value', 'descricao as text', 'valor_unitario', 'ncm')
            .where({ situacao: true })
            .then(produtos => {
                return produtos.map(produto => {
                    produto.text = produto.text.substr(0, 20) + (produto.text.length > 20 ? '...' : '')
                    return produto
                })
            })
            .catch(e => res.status(500).send(e.toString()))
        const pessoas = await app.db('pessoas')
            .select('id as value', 'nome as text', 'cpf', 'cnpj')
            .where({ situacao: 'Ativo', fornecedor: true })
            .catch(e => res.status(500).send(e.toString()))
        const documentos = await app.db('documentos')
            .select('id as value', 'nome as text')
            .catch(e => res.status(500).send(e.toString()))

        const tela = {
            compra,
            produtos,
            pessoas,
            documentos
        }

        res.json(tela)
    }

    const remove = async (req, res) => {
        return app.db.transaction(async function (trx) {
            return app.db('compra')
                .where({ id: req.params.id }).delete()
                .transacting(trx)
                .then(function () {
                    return app.db('produto_compra')
                        .where({ id_compra: req.params.id }).delete()
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

    return { save, get, getById, getTela, remove }
}