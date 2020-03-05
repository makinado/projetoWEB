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

            existsOrError(compra.produtos, 'Informe os produtos da compra')
            existsOrError(compra.financeiro, 'Informe a(s) parcela(s) da compra')

            var teste_produto = null
            for (let i = 0; i < compra.produtos.length; i++) {
                if (compra.produtos[i].quantidade == "0,00" || compra.produtos[i].valor_compra == "R$ 0,00") {
                    teste_produto = compra.produtos[i];
                    break;
                }
            }
            if (teste_produto) {
                return res.status(400).send(`Produto ${teste_produto.sequencia} com quantidade ou valor de compra zerado, verifique.`)
            }

            var teste_financeiro = null
            for (let i = 0; i < compra.financeiro.length; i++) {
                if (compra.financeiro[i].pago &&
                    (!compra.financeiro[i].id_conta || !compra.financeiro[i].data_baixa || compra.financeiro[i].valor_pago == "R$ 0,00")) {
                    teste_financeiro = compra.financeiro[i];
                    break;
                }
            }
            if (teste_financeiro) {
                return res.status(400).send(`Parcela ${teste_financeiro.parcelas} com dados de pagamento incorretos, verifique`)
            }
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
                            await app.db('produto_compra').where({ id_compra: compra.id }).delete()
                            await app.db('produto_movimento_estoque').where({ id_movimentacao: compra.id }).delete()

                            const movim_estoque = []
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
                            await app.db('conta_movimento').where({ id_movimento_origem: compra.id }).delete()

                            const movim_conta = []
                            financeiro = financeiro.map(parcela => {
                                const newFinanc = {
                                    id_empresa: compra.id_empresa,
                                    id_pessoa: compra.id_pessoa,
                                    tipo_conta: 1,
                                    id_movimento_origem: id[0],
                                    pago: parcela.pago,
                                    parcela: parcela.parcelas,
                                    observacao: compra.observacao,

                                    valor_parcela: parseNumber(parcela.valor_parcela || "0,00"),
                                    valor_pago: parseNumber(parcela.valor_pago || "0,00"),
                                    valor_total: compra.valor_total,

                                    documento_origem: parcela.documento_origem,
                                    num_documento_origem: compra.nota_fiscal,

                                    data_criacao: new Date(),
                                    data_emissao: compra.data_lancamento,
                                    data_vencimento: parcela.data
                                }
                                if (newFinanc.pago)
                                    movim_conta.push({
                                        id_empresa: compra.id_empresa,
                                        id_conta: parcela.id_conta,
                                        id_movimento_origem: compra.id,
                                        data_lancamento: new Date(),
                                        data_emissao: compra.data_lancamento,
                                        id_documento: parcela.documento_origem,
                                        num_documento: compra.nota_fiscal,
                                        observacao: compra.observacao,
                                        origem: "GERADO",
                                        dc: 'D',
                                        valor: parcela.valor_pago
                                    })

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
                                                .then(function () {
                                                    return app.db.batchInsert('conta_movimento', movim_conta)
                                                        .transacting(trx)
                                                })
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

                                    quantidade: parseNumber(produto.quantidade || "0,00"),
                                    valor_unitario: parseNumber(produto.valor_unitario || "0,00"),
                                    valor_desconto: parseNumber(produto.valor_desconto || "0,00"),
                                    valor_total: parseNumber(produto.valor_total || "0,00"),
                                    perc_custo_adicional: parseNumber(produto.perc_custo_adicional || "0,00"),
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

                            const movim_conta = []
                            financeiro = financeiro.map(parcela => {
                                const newFinanc = {
                                    id_empresa: compra.id_empresa,
                                    id_pessoa: compra.id_pessoa,
                                    tipo_conta: 1,
                                    id_movimento_origem: id[0],
                                    pago: parcela.pago,
                                    parcela: parcela.parcelas,
                                    observacao: compra.observacao,

                                    valor_parcela: parseNumber(parcela.valor_parcela || "0,00"),
                                    valor_pago: parseNumber(parcela.valor_pago || "0,00"),
                                    valor_total: compra.valor_total || "0,00",

                                    documento_origem: parcela.documento_origem,
                                    num_documento_origem: compra.nota_fiscal,

                                    data_criacao: new Date(),
                                    data_emissao: compra.data_lancamento,
                                    data_vencimento: parcela.data
                                }
                                if (newFinanc.pago)
                                    movim_conta.push({
                                        id_empresa: compra.id_empresa,
                                        id_conta: parcela.id_conta,
                                        id_movimento_origem: compra.id,
                                        data_lancamento: new Date(),
                                        data_emissao: compra.data_lancamento,
                                        id_documento: parcela.documento_origem,
                                        num_documento: compra.nota_fiscal,
                                        observacao: compra.observacao,
                                        origem: "GERADO",
                                        dc: 'D',
                                        valor: parseNumber(parcela.valor_pago)
                                    })

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
                                                .then(function () {
                                                    return app.db.batchInsert('conta_movimento', movim_conta)
                                                        .transacting(trx)
                                                })
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
                if (req.query.empresa) {
                    qb.where('compra.id_empresa', '=', req.query.empresa);
                }

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
        app.db('compra')
            .where({ id: req.params.id })
            .first()
            .then(async compra => {
                compra.produtos = await app.db('produto_compra as pc')
                    .join('produtos as p', 'pc.id_produto', 'p.id')
                    .select(
                        'p.id',
                        'pc.sequencia',
                        'p.descricao',
                        'pc.ncm',
                        'pc.cfop',
                        'pc.quantidade',
                        'pc.valor_desconto',
                        'pc.valor_unitario',
                        'pc.perc_custo_adicional',
                        'pc.valor_total')
                    .where({ id_compra: compra.id })
                    .catch(e => res.status(500).send(e.toString()))
                compra.financeiro = await app.db('financeiro as f')
                    .select(
                        'f.id',
                        'f.parcela as parcelas',
                        'f.valor_parcela',
                        'f.pago',
                        'f.observacao',
                        'f.documento_origem',
                        'f.data_vencimento'
                    )
                    .where({ id_movimento_origem: compra.id })
                    .catch(e => res.status(500).send(e.toString()))
                res.json(compra)
            })
            .catch(e => res.status(500).send(e.toString()))
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
                            return app.db('produto_movimento_estoque')
                                .where({ id_movimentacao: req.params.id }).delete()
                                .transacting(trx)
                                .then(function () {
                                    return app.db('financeiro')
                                        .where({ id_movimento_origem: req.params.id }).delete()
                                        .transacting(trx)
                                        .then(function () {
                                            return app.db('conta_movimento')
                                                .where({ id_movimento_origem: req.params.id }).delete()
                                                .transacting(trx)
                                        })

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