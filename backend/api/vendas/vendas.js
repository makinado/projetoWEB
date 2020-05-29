const { formatToBRL } = require('brazilian-values')

module.exports = app => {
    const { existsOrError, parseNumber, formatDate } = app.api.validation

    const save = async (req, res) => {
        const venda = { ...req.body }
        if (req.params.id) {
            venda.id = req.params.id
        }

        var produtosOK = true, financeiroOK = true

        try {
            existsOrError(venda.id_empresa, 'Informe a empresa da venda')
            existsOrError(venda.produtos, 'Informe os produtos da venda')
            venda.produtos.map(produto => {
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

            if (venda.tipo == 2) {
                existsOrError(venda.financeiro, 'Informe as parcelas da venda')

                venda.financeiro.map(parcela => {
                    try {
                        if (parcela.valor_parcela == "R$ 0,00")
                            throw `Valor zerado na parcela ${parcela.parcelas || ""}`
                        // existsOrError(parcela.documento_origem, `Documento não informado na parcela ${parcela.parcelas || ""}`)
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
            }
        } catch (e) {
            if (!produtosOK || !financeiroOK) return
            return res.status(400).send(e.toString())
        }
        if (!produtosOK || !financeiroOK) return

        if (venda.id_tabela_preco) {
            venda.perc_desconto = venda.id_tabela_preco.percentual
            venda.id_tabela_preco = venda.id_tabela_preco.value
        }
        var produtos = venda.produtos
        var financeiro = venda.financeiro
        delete venda.produtos
        delete venda.financeiro

        try {
            venda.valor_frete = parseNumber(venda.valor_frete || "0,00")
            venda.valor_seguro = parseNumber(venda.valor_seguro || "0,00")
            venda.outras_despesas = parseNumber(venda.outras_despesas || "0,00")
            venda.valor_desconto = parseNumber(venda.valor_desconto || "0,00")
            venda.perc_desconto = parseNumber(venda.perc_desconto || "0,00")
            venda.valor_produtos = parseNumber(venda.valor_produtos || "0,00")
            venda.valor_total = parseNumber(venda.valor_total || "0,00")
            venda.data_agendamento = venda.data_agendamento || null

            if (venda.id) {
                return app.db.transaction(async function (trx) {
                    return app.db('venda')
                        .update(venda)
                        .where({ id: venda.id })
                        .transacting(trx)
                        .then(async function () {
                            await app.db('produto_venda').where({ id_venda: venda.id }).delete().transacting(trx)
                            await app.db('produto_movimento_estoque').where({ id_movimentacao: venda.id }).delete().transacting(trx)

                            const movim_estoque = []
                            produtos = produtos.map(produto => {
                                const newProd = {
                                    id_venda: venda.id,
                                    id_empresa: venda.id_empresa,
                                    id_produto: produto.id,
                                    sequencia: produto.sequencia,

                                    quantidade: parseNumber(produto.quantidade || "0,00"),
                                    valor_venda: parseNumber(produto.valor_venda || "0,00"),
                                    valor_unitario: parseNumber(produto.valor_unitario || "0,00"),
                                    valor_desconto: parseNumber(produto.valor_desconto || "0,00"),
                                    perc_desconto: venda.perc_desconto,
                                    valor_total: parseNumber(produto.valor_total || "0,00"),
                                }

                                if (venda.tipo == 2) {
                                    movim_estoque.push({
                                        id_empresa: venda.id_empresa,
                                        id_produto: produto.id,
                                        tipo_movimentacao: 1,
                                        data_movimentacao: venda.data_criacao,
                                        origem: "VENDA",
                                        id_movimentacao: venda.id,
                                        quantidade: parseNumber(produto.quantidade || "0,00"),
                                        observacao: venda.observacao
                                    })
                                }

                                return newProd
                            })

                            if (venda.tipo == 2) {
                                await app.db('financeiro').where({ id_movimento_origem: venda.id }).delete().transacting(trx)
                                await app.db('conta_movimento').where({ id_movimento_origem: venda.id }).delete().transacting(trx)

                                financeiro = financeiro.map(parcela => {
                                    const newFinanc = {
                                        id_empresa: venda.id_empresa,
                                        id_pessoa: venda.id_pessoa,
                                        tipo_conta: 2,
                                        id_movimento_origem: venda.id,
                                        pago: parcela.pago,
                                        parcela: parcela.parcelas,
                                        observacao: venda.observacao,

                                        valor_parcela: parseNumber(parcela.valor_parcela || "0,00"),
                                        valor_pago: parcela.pago ? parseNumber(parcela.valor_pago) : 0,
                                        valor_total: venda.valor_total || "0,00",

                                        documento_origem: parcela.documento_origem,
                                        num_documento_origem: venda.nota_fiscal,

                                        documento_baixa: parcela.pago ? parcela.documento_baixa : null,
                                        num_documento_baixa: parcela.pago ? parcela.num_documento_baixa : null,
                                        id_conta: parcela.pago ? parcela.id_conta : null,

                                        data_criacao: new Date(),
                                        data_emissao: venda.data_emissao,
                                        data_vencimento: parcela.data,
                                        data_baixa: parcela.pago ? parcela.data_baixa : null
                                    }

                                    return newFinanc
                                })
                            }

                            return app.db.batchInsert('produto_venda', produtos)
                                .transacting(trx)
                                .then(function () {
                                    return app.db.batchInsert('produto_movimento_estoque', movim_estoque)
                                        .transacting(trx)
                                        .then(function () {
                                            if (financeiro)
                                                return app.db.batchInsert('financeiro', financeiro)
                                                    .returning('*')
                                                    .transacting(trx)
                                                    .then(function (financs) {
                                                        const movim_conta = []
                                                        financs.map(financ_updated => {
                                                            if (financ_updated.pago)
                                                                movim_conta.push({
                                                                    id_empresa: venda.id_empresa,
                                                                    id_conta: financ_updated.id_conta,
                                                                    id_movimento_origem: venda.id,
                                                                    id_movimento_financeiro: financ_updated.id,
                                                                    id_classificacao: financ_updated.classificacao,
                                                                    data_lancamento: new Date(),
                                                                    data_emissao: venda.data_baixa,
                                                                    id_documento: financ_updated.documento_baixa,
                                                                    num_documento: financ_updated.num_documento_baixa,
                                                                    observacao: venda.observacao,
                                                                    origem: "VENDA",
                                                                    dc: 'C',
                                                                    valor: financ_updated.valor_pago
                                                                })
                                                        })
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
                venda.data_criacao = new Date()
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

                                    quantidade: parseNumber(produto.quantidade || "0,00"),
                                    valor_venda: parseNumber(produto.valor_venda || "0,00"),
                                    valor_unitario: parseNumber(produto.valor_unitario || "0,00"),
                                    valor_desconto: parseNumber(produto.valor_desconto || "0,00"),
                                    perc_desconto: venda.perc_desconto,
                                    valor_total: parseNumber(produto.valor_total || "0,00"),
                                }

                                if (venda.tipo == 2) {
                                    movim_estoque.push({
                                        id_empresa: venda.id_empresa,
                                        id_produto: produto.id,
                                        tipo_movimentacao: 1,
                                        data_movimentacao: venda.data_criacao,
                                        origem: "VENDA",
                                        id_movimentacao: id[0],
                                        quantidade: parseNumber(produto.quantidade || "0,00"),
                                        observacao: venda.observacao
                                    })
                                }

                                return newProd
                            })

                            if (venda.tipo == 2) {
                                financeiro = financeiro.map(parcela => {
                                    const newFinanc = {
                                        id_empresa: venda.id_empresa,
                                        id_pessoa: venda.id_pessoa,
                                        tipo_conta: 2,
                                        id_movimento_origem: id[0],
                                        pago: parcela.pago,
                                        parcela: parcela.parcelas,
                                        observacao: venda.observacao,

                                        valor_parcela: parseNumber(parcela.valor_parcela || "0,00"),
                                        valor_pago: parcela.pago ? parseNumber(parcela.valor_pago) : 0,
                                        valor_total: venda.valor_total || "0,00",

                                        documento_origem: parcela.documento_origem,
                                        num_documento_origem: venda.nota_fiscal,

                                        documento_baixa: parcela.pago ? parcela.documento_baixa : null,
                                        num_documento_baixa: parcela.pago ? parcela.num_documento_baixa : null,
                                        id_conta: parcela.pago ? parcela.id_conta : null,

                                        data_criacao: new Date(),
                                        data_emissao: venda.data_emissao,
                                        data_vencimento: parcela.data,
                                        data_baixa: parcela.pago ? parcela.data_baixa : null
                                    }

                                    return newFinanc
                                })
                            }

                            return app.db.batchInsert('produto_venda', produtos)
                                .transacting(trx)
                                .then(function () {
                                    return app.db.batchInsert('produto_movimento_estoque', movim_estoque)
                                        .transacting(trx)
                                        .then(function () {
                                            if (financeiro)
                                                return app.db.batchInsert('financeiro', financeiro)
                                                    .returning('*')
                                                    .transacting(trx)
                                                    .then(function (financs) {
                                                        const movim_conta = []
                                                        financs.map(financ_updated => {
                                                            if (financ_updated.pago)
                                                                movim_conta.push({
                                                                    id_empresa: venda.id_empresa,
                                                                    id_conta: financ_updated.id_conta,
                                                                    id_movimento_origem: id[0],
                                                                    id_movimento_financeiro: financ_updated.id,
                                                                    id_classificacao: financ_updated.classificacao,
                                                                    data_lancamento: new Date(),
                                                                    data_emissao: venda.data_baixa,
                                                                    id_documento: financ_updated.documento_baixa,
                                                                    num_documento: financ_updated.num_documento_baixa,
                                                                    observacao: venda.observacao,
                                                                    origem: "VENDA",
                                                                    dc: 'C',
                                                                    valor: financ_updated.valor_pago
                                                                })
                                                        })
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

        const result = await app.db('venda').count('id').first()
        const count = parseInt(result.count)

        app.db('venda')
            .join('empresas', 'venda.id_empresa', 'empresas.id')
            .join('pessoas as cliente', 'venda.id_pessoa', 'cliente.id')
            .join('usuarios as vendedor', 'venda.id_vendedor', 'vendedor.id')
            .select(
                'venda.id',
                'id_empresa',
                'id_pessoa',
                'venda.tipo',
                'valor_total',
                'data_criacao',
                'empresas.nome as empresa',
                'cliente.nome as cliente',
                'vendedor.nome as vendedor',
            )
            .limit(limit).offset(page * limit - limit)
            .orderBy('venda.situacao')
            .where(async (qb) => {
                if (req.query.empresa) {
                    qb.where('venda.id_empresa', '=', req.query.empresa);
                }

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
                            qb.whereBetween('venda.data_emissao', [req.query.data_inicial, req.query.data_final])
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
                            qb.whereBetween('venda.data_emissao', [req.query.data_inicial, req.query.data_final])
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
            .then(pedido => res.json({
                data: pedido.map(item => {
                    item.tipo = item.tipo == 1 ? "ORÇAMENTO" : "VENDA"
                    return item
                }), count, limit
            }))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getById = async (req, res) => {
        app.db('venda')
            .where({ id: req.params.id })
            .first()
            .then(async venda => {
                venda.produtos = await app.db('produto_venda as pv')
                    .join('produtos as p', 'pv.id_produto', 'p.id')
                    .select(
                        'p.id',
                        'pv.sequencia',
                        'p.descricao',
                        'pv.quantidade',
                        'pv.valor_desconto',
                        'pv.valor_venda',
                        'pv.valor_unitario',
                        'pv.valor_total')
                    .where({ id_venda: venda.id })
                    .catch(e => res.status(500).send(e.toString()))
                venda.financeiro = await app.db('financeiro as f')
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
                    .where({ id_movimento_origem: venda.id })
                    .catch(e => res.status(500).send(e.toString()))
                res.json(venda)
            })
            .catch(e => res.status(500).send(e.toString()))
    }

    const getOrcamentos = async (req, res) => {
        app.db('venda')
            .join('empresas', 'venda.id_empresa', 'empresas.id')
            .join('pessoas as cliente', 'venda.id_pessoa', 'cliente.id')
            .join('usuarios as vendedor', 'venda.id_vendedor', 'vendedor.id')
            .select(
                'venda.id',
                'id_empresa',
                'id_pessoa',
                'venda.tipo',
                'valor_total',
                'venda.data_criacao',
                'empresas.nome as empresa',
                'cliente.nome as cliente',
                'vendedor.nome as vendedor',
            )
            .where({ 'venda.tipo': 1 })
            .orderBy('venda.data_criacao')
            .then(orcamentos => res.json(
                orcamentos.map(item => {
                    item.tipo = item.tipo == 1 ? "ORÇAMENTO" : "VENDA"
                    return item
                })
            ))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getVendas = async (req, res) => {
        app.db('venda')
            .join('empresas', 'venda.id_empresa', 'empresas.id')
            .join('pessoas as cliente', 'venda.id_pessoa', 'cliente.id')
            .join('usuarios as vendedor', 'venda.id_vendedor', 'vendedor.id')
            .select(
                'venda.id',
                'id_empresa',
                'id_pessoa',
                'venda.tipo',
                'valor_total',
                'venda.data_criacao',
                'empresas.nome as empresa',
                'cliente.nome as cliente',
                'vendedor.nome as vendedor',
            )
            .where({ 'venda.tipo': 2 })
            .orderBy('venda.data_criacao')
            .then(vendas => res.json(vendas))
            .catch(e => res.status(500).send(e.toString()))
    }

    const remove = async (req, res) => {
        try {
            return app.db.transaction(async function (trx) {
                return app.db('venda')
                    .where({ id: req.params.id }).delete()
                    .transacting(trx)
                    .then(function () {
                        return app.db('produto_venda')
                            .where({ id_venda: req.params.id }).delete()
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
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getOrcamentos, getVendas, getById, remove }
}