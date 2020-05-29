const { formatToBRL } = require('brazilian-values')

module.exports = app => {
    const { existsOrError, parseNumber } = app.api.validation

    verificarCompra = async (dados) => {
        var msgs = []

        return (false, msgs)
    }

    const save = async (req, res) => {
        const compra = { ...req.body }
        if (req.params.id) {
            compra.id = req.params.id
        }

        var produtosOK = true, financeiroOK = true

        try {
            existsOrError(compra.id_empresa, 'Informe a empresa da compra')
            existsOrError(compra.id_pessoa, 'Informe o fornecedor da compra')

            //validar dados da nota
            existsOrError(compra.nota_fiscal, 'Informe o número da nota fiscal')
            existsOrError(compra.data_notafiscal, 'Informe a data da nota fiscal')
            existsOrError(compra.data_lancamento, 'Informe a data de lançamento')

            existsOrError(compra.produtos, 'Informe os produtos da compra')
            existsOrError(compra.financeiro, 'Informe a(s) parcela(s) da compra')


            compra.produtos.map(produto => {
                try {
                    existsOrError(produto.id, `Item ${produto.sequencia} não vinculado corretamente`)
                    if (produto.quantidade == "0,00")
                        throw `Item ${produto.sequencia} com quantidades zeradas`
                    if (produto.valor_unitario == "R$ 0,00")
                        throw `Item ${produto.sequencia} com valor unitário zerado`
                    if (produto.cfop == "?.000")
                        throw `Item ${produto.sequencia} com CFOP incorreto`
                } catch (e) {
                    produtosOK = false
                    return res.status(400).send(e)
                }
            })

            compra.financeiro.map(parcela => {
                try {
                    if (parcela.valor_parcela == "R$ 0,00")
                        throw `Valor zerado na parcela ${parcela.parcelas || ""}`
                    existsOrError(parcela.data_vencimento, `Data de vencimento não informada na parcela ${parcela.parcelas || ""}`)
                    existsOrError(parcela.documento_origem, `Documento não informado na parcela ${parcela.parcelas || ""}`)
                    if (parcela.pago) {
                        existsOrError(parcela.id_conta, `Conta de pagamento não informada na parcela ${parcela.parcelas || ""}`)
                        existsOrError(parcela.data_baixa, `Data do pagamento não preenchida na parcela ${parcela.parcelas || ""}`)
                        existsOrError(parcela.documento_baixa, `Forma de pagamento não preenchida na parcela ${parcela.parcelas || ""}`)
                    }
                } catch (e) {
                    financeiroOK = false
                    return res.status(400).send(e)
                }
            })
        } catch (e) {
            if (!produtosOK || !financeiroOK) return
            return res.status(400).send(e.toString())
        }

        if (!produtosOK || !financeiroOK) return
        if (req.query.verificar == 'true' && !compra.id) {
            verificarCompra(compra).then(result => {
                return
            })
        }

        var produtos = compra.produtos
        var financeiro = compra.financeiro
        var id_pedido = compra.id_pedido
        delete compra.id_pedido
        delete compra.produtos
        delete compra.financeiro

        try {
            compra.valor_frete = parseNumber(compra.valor_frete || "0,00")
            compra.valor_seguro = parseNumber(compra.valor_seguro || "0,00")
            compra.outras_despesas = parseNumber(compra.outras_despesas || "0,00")
            compra.valor_desconto = parseNumber(compra.valor_desconto || "0,00")
            compra.valor_produtos = parseNumber(compra.valor_produtos || "0,00")
            compra.valor_total = parseNumber(compra.valor_total || "0,00")

            compra.situacao = compra.situacao ? compra.situacao : 'CONCLUÍDA'

            if (!compra.id) {
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
                                    origem: "COMPRA",
                                    id_movimentacao: id[0],
                                    quantidade: parseNumber(produto.quantidade || "0,00"),
                                    observacao: compra.observacao
                                })

                                return newProd
                            })

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
                                    valor_pago: parcela.pago ? parseNumber(parcela.valor_pago || "0,00") : null,
                                    valor_total: compra.valor_total || "0,00",

                                    documento_origem: parcela.documento_origem,
                                    num_documento_origem: compra.nota_fiscal,

                                    documento_baixa: parcela.pago ? parcela.documento_baixa : null,
                                    num_documento_baixa: parcela.pago ? parcela.num_documento_baixa : null,
                                    id_conta: parcela.pago ? parcela.id_conta : null,

                                    data_criacao: new Date(),
                                    data_emissao: compra.data_notafiscal,
                                    data_vencimento: parcela.data_vencimento,
                                    data_baixa: parcela.pago ? parcela.data_baixa : null,
                                }

                                return newFinanc
                            })


                            return app.db.batchInsert('produto_compra', produtos)
                                .transacting(trx)
                                .then(function () {
                                    return app.db.batchInsert('produto_movimento_estoque', movim_estoque)
                                        .transacting(trx)
                                        .then(function () {
                                            return app.db('compra_pedido').update({ nota_fiscal: compra.nota_fiscal, situacao: 'CONCLUÍDO', id_compra: id[0] })
                                                .where({ id: id_pedido })
                                                .transacting(trx)
                                                .then(function () {
                                                    return app.db.batchInsert('financeiro', financeiro)
                                                        .returning('*')
                                                        .transacting(trx)
                                                        .then(function (financs) {
                                                            const movim_conta = []
                                                            financs.map(financ_updated => {
                                                                if (financ_updated.pago)
                                                                    movim_conta.push({
                                                                        id_empresa: compra.id_empresa,
                                                                        id_conta: financ_updated.id_conta,
                                                                        id_movimento_origem: id[0],
                                                                        id_movimento_financeiro: financ_updated.id,
                                                                        id_classificacao: financ_updated.classificacao,
                                                                        data_lancamento: new Date(),
                                                                        data_emissao: compra.data_notafiscal,
                                                                        id_documento: financ_updated.documento_baixa,
                                                                        num_documento: financ_updated.num_documento_baixa,
                                                                        observacao: compra.observacao,
                                                                        origem: "COMPRA",
                                                                        dc: 'D',
                                                                        valor: financ_updated.valor_pago
                                                                    })
                                                            })
                                                            return app.db.batchInsert('conta_movimento', movim_conta)
                                                                .transacting(trx)
                                                        })
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
            .orderBy(req.query.order || "compra.situacao", req.query.desc || "asc")
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
                compra.id_pedido = await app.db('compra_pedido').select('id').where({ id_compra: compra.id }).first()
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
                        'f.pago',
                        'f.observacao',
                        'f.documento_origem',
                        'f.data_vencimento',
                        'f.id_conta',
                        'f.data_baixa',
                        'f.documento_baixa',
                        'f.num_documento_baixa',
                        'f.valor_parcela',
                        'f.valor_acrescimo',
                        'f.valor_desconto',
                        'f.valor_pago',
                    )
                    .where({ id_movimento_origem: compra.id })
                    .catch(e => res.status(500).send(e.toString()))
                res.json(compra)
            })
            .catch(e => res.status(500).send(e.toString()))
    }

    const remove = async (req, res) => {

        try {
            return app.db.transaction(async function (trx) {
                return app.db('compra_pedido')
                    .update({ nota_fiscal: null, situacao: 'PENDENTE', id_compra: null })
                    .where({ id_compra: req.params.id })
                    .transacting(trx)
                    .then(function () {
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

                    })
                    .then(trx.commit)
                    .catch(trx.rollback);
            }).then(function (inserts) {
                res.status(204).send()
            }).catch(function (error) {
                console.log(error.toString())
                res.status(500).send(error.toString())
            });
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getById, remove }
}