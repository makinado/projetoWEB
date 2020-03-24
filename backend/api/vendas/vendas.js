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
            existsOrError(venda.produtos, 'Informe os produtos da venda')
            var teste_produto = null
            for (let i = 0; i < venda.produtos.length; i++) {
                if (venda.produtos[i].quantidade == "0,00" || venda.produtos[i].valor_venda == "R$ 0,00") {
                    teste_produto = venda.produtos[i];
                    break;
                }
            }
            if (teste_produto) {
                return res.status(400).send(`Produto ${teste_produto.sequencia} com quantidade ou valor de venda zerado, verifique.`)
            }


            if (venda.tipo == 2) {
                existsOrError(venda.financeiro, 'Informe a(s) parcela(s) da venda')
                var teste_financeiro = null
                for (let i = 0; i < venda.financeiro.length; i++) {
                    if (venda.financeiro[i].pago &&
                        (!venda.financeiro[i].id_conta || !venda.financeiro[i].data_baixa || venda.financeiro[i].valor_pago == "R$ 0,00")) {
                        teste_financeiro = venda.financeiro[i];
                        break;
                    }
                }
                if (teste_financeiro) {
                    return res.status(400).send(`Parcela ${teste_financeiro.parcelas} com dados de pagamento incorretos, verifique`)
                }
            }
        } catch (e) {
            return res.status(400).send(e.toString())
        }

        if (venda.tabela_preco)
            venda.tabela_preco = venda.tabela_preco.value
        venda.data_criacao = new Date()

        var produtos = venda.produtos
        var financeiro = venda.financeiro
        delete venda.produtos
        delete venda.financeiro

        try {
            venda.valor_frete = parseNumber(venda.valor_frete || "0,00")
            venda.valor_seguro = parseNumber(venda.valor_seguro || "0,00")
            venda.outras_despesas = parseNumber(venda.outras_despesas || "0,00")
            venda.valor_desconto = parseNumber(venda.valor_desconto || "0,00")
            venda.valor_produtos = parseNumber(venda.valor_produtos || "0,00")
            venda.valor_total = parseNumber(venda.valor_total || "0,00")

            // venda.situacao = venda.situacao ? venda.situacao : 'CONCLUÍDA'

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
                            produtos = await produtos.map(produto => {
                                const newProd = {
                                    id_venda: venda.id,
                                    id_empresa: venda.id_empresa,
                                    id_produto: produto.id,
                                    sequencia: produto.sequencia,

                                    quantidade: (parseNumber(produto.quantidade || "0,00")),
                                    valor_venda: (parseNumber(produto.valor_venda || "0,00")),
                                    valor_desconto: (parseNumber(produto.valor_desconto || "0,00")),
                                    valor_total: (parseNumber(produto.valor_total || "0,00")),
                                }
                                if (venda.tipo == 2) {
                                    movim_estoque.push({
                                        id_empresa: venda.id_empresa,
                                        id_produto: produto.id,
                                        tipo_movimentacao: 1,
                                        data_movimentacao: venda.data_lancamento,
                                        id_movimentacao: venda.id,
                                        quantidade: parseNumber(produto.quantidade || "0,00"),
                                        observacao: venda.observacao
                                    })
                                }

                                return newProd
                            })

                            const movim_conta = []
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
                                        valor_pago: parseNumber(parcela.valor_pago || "0,00"),
                                        valor_total: venda.valor_total || "0,00",

                                        documento_origem: parcela.documento_origem,
                                        num_documento_origem: venda.nota_fiscal,

                                        data_criacao: new Date(),
                                        data_emissao: venda.data_emissao,
                                        data_vencimento: parcela.data
                                    }
                                    if (newFinanc.pago)
                                        movim_conta.push({
                                            id_empresa: venda.id_empresa,
                                            id_conta: parcela.id_conta,
                                            id_movimento_origem: venda.id,
                                            data_lancamento: new Date(),
                                            data_emissao: venda.data_emissao,
                                            id_documento: parcela.documento_origem,
                                            num_documento: venda.nota_fiscal,
                                            observacao: venda.observacao,
                                            origem: "GERADO",
                                            dc: 'C',
                                            valor: newFinanc.valor_pago
                                        })

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
                                    valor_desconto: parseNumber(produto.valor_desconto || "0,00"),
                                    valor_total: parseNumber(produto.valor_total || "0,00"),
                                }

                                if (venda.tipo == 2) {
                                    movim_estoque.push({
                                        id_empresa: venda.id_empresa,
                                        id_produto: produto.id,
                                        tipo_movimentacao: 1,
                                        data_movimentacao: venda.data_lancamento,
                                        id_movimentacao: id[0],
                                        quantidade: parseNumber(produto.quantidade || "0,00"),
                                        observacao: venda.observacao
                                    })
                                }

                                return newProd
                            })

                            const movim_conta = []
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
                                        valor_pago: parseNumber(parcela.valor_pago || "0,00"),
                                        valor_total: venda.valor_total || "0,00",

                                        documento_origem: parcela.documento_origem,
                                        num_documento_origem: venda.nota_fiscal,

                                        data_criacao: new Date(),
                                        data_emissao: venda.data_emissao,
                                        data_vencimento: parcela.data,
                                        data_baixa: parcela.data_baixa
                                    }
                                    if (newFinanc.pago)
                                        movim_conta.push({
                                            id_empresa: venda.id_empresa,
                                            id_conta: parcela.id_conta,
                                            id_movimento_origem: id[0],
                                            data_lancamento: new Date(),
                                            data_emissao: venda.data_baixa,
                                            id_documento: parcela.documento_origem,
                                            num_documento: venda.nota_fiscal,
                                            observacao: venda.observacao,
                                            origem: "GERADO",
                                            dc: 'C',
                                            valor: parseNumber(parcela.valor_pago)
                                        })

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
                        'pv.valor_total')
                    .where({ id_venda: venda.id })
                    .catch(e => res.status(500).send(e.toString()))
                venda.financeiro = await app.db('financeiro as f')
                    .select(
                        'f.id',
                        'f.parcela as parcelas',
                        'f.valor_parcela',
                        'f.pago',
                        'f.observacao',
                        'f.documento_origem',
                        'f.data_vencimento'
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
    }

    return { save, get, getOrcamentos, getVendas, getById, remove }
}