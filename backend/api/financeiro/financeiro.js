const { formatToBRL } = require('brazilian-values')

module.exports = app => {
    const { existsOrError, parseNumber } = app.api.validation

    const save = async (req, res) => {
        var financeiro = Object.values({ ...req.body })

        try {
            existsOrError(financeiro, 'Nenhuma parcela adicionada')
            financeiro.map(financ => {
                try {
                    existsOrError(financ.id_empresa, 'Empresa da conta não informada')
                    existsOrError(financ.id_pessoa, 'Pessoa não informada')
                    existsOrError(financ.tipo_conta, 'Tipo de conta não informada')
                    existsOrError(financ.data_vencimento, 'Data de vencimento da conta não informada')

                    if (financ.pago) {
                        existsOrError(financ.id_conta, 'Conta para pagamento não informada')
                        existsOrError(financ.data_baixa, 'Data do pagamento não informada')
                        if (financ.valor_pago == "R$ 0,00") throw "Valor do pagamento não informado"
                    }
                } catch (e) {
                    return res.status(400).send(e.toString())
                }

                financ.data_criacao = financ.data_criacao ? financ.data_criacao : new Date()
                financ.valor_parcela = parseNumber(financ.valor)
                financ.valor_desconto = parseNumber(financ.valor_desconto || "0,00")
                financ.valor_acrescimo = parseNumber(financ.valor_acrescimo || "0,00")
                financ.valor_pago = parseNumber(financ.valor_pago || "0,00")
                financ.valor_total = parseNumber(financ.valor_total)

                delete financ.edit
                delete financ.menu
                delete financ.menu1
                delete financ.data
                delete financ.dataNotFormated
                delete financ.valor

                return financ
            })
        } catch (e) {
            return res.status(400).send(e.toString())
        }

        financeiro.forEach(financ => {
            if (financ.id) {
                return app.db.transaction(async function (trx) {
                    return app.db('financeiro')
                        .update(financ)
                        .where({ id: financ.id })
                        .then(async () => {
                            if (financ.pago) {
                                await app.db('conta_movimento').where({ id_movimento_origem: financ.id }).delete()
                                const movim_conta = {
                                    id_empresa: financ.id_empresa,
                                    id_conta: financ.id_conta,
                                    id_movimento_origem: financ.id,
                                    data_lancamento: new Date(),
                                    data_emissao: financ.data_emissao,
                                    id_classificacao: financ.classificacao,
                                    id_documento: financ.documento_baixa,
                                    num_documento: financ.num_documento_baixa,
                                    observacao: financ.observacao,
                                    origem: "GERADO",
                                    dc: financ.tipo_conta == 1 ? 'D' : 'C',
                                    valor: financ.valor_pago
                                }
                                return app.db('conta_movimento').insert(movim_conta).transacting(trx)
                            }
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
                    return app.db('financeiro')
                        .insert(financ).returning('id')
                        .then(id => {
                            if (financ.pago) {
                                const movim_conta = {
                                    id_empresa: financ.id_empresa,
                                    id_conta: financ.id_conta,
                                    id_movimento_origem: id[0],
                                    data_lancamento: new Date(),
                                    data_emissao: financ.data_emissao,
                                    id_classificacao: financ.classificacao,
                                    id_documento: financ.documento_baixa,
                                    num_documento: financ.num_documento_baixa,
                                    observacao: financ.observacao,
                                    origem: "GERADO",
                                    dc: financ.tipo_conta == 1 ? 'D' : 'C',
                                    valor: financ.valor_pago
                                }
                                return app.db('conta_movimento').insert(movim_conta).transacting(trx)
                            }
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
        })
    }

    const save_pagamento = async (req, res) => {
        var pagamento = Object.values({ ...req.body })

        pagamento = pagamento.map(pag => {
            try {
                existsOrError(pag.id, 'Parcela à ser paga não informada')
                existsOrError(pag.id_conta, 'Conta para pagamento não informada')
                existsOrError(pag.data_baixa, 'Data do pagamento não informada')
                existsOrError(pag.documento_baixa, 'Data do pagamento não informada')
                if (pag.valor_pago == "R$ 0,00") throw "Valor do pagamento não informado"

            } catch (e) {
                return res.status(400).send(e.toString())
            }

            pag.valor_acrescimo = parseNumber(pag.valor_acrescimo || "0,00")
            pag.valor_desconto = parseNumber(pag.valor_desconto || "0,00")
            pag.valor_pago = parseNumber(pag.valor_pago || "0,00")

            pag.pago = true

            return pag
        })

        pagamento.forEach(financ => {
            return app.db.transaction(async function (trx) {
                return app.db('financeiro')
                    .update(financ)
                    .where({ id: financ.id })
                    .then(async () => {
                        const movim_conta = {
                            id_empresa: financ.id_empresa,
                            id_conta: financ.id_conta,
                            id_movimento_origem: financ.id,
                            data_lancamento: new Date(),
                            data_emissao: financ.data_emissao,
                            id_classificacao: financ.classificacao,
                            id_documento: financ.documento_baixa,
                            num_documento: financ.num_documento_baixa,
                            observacao: financ.observacao,
                            origem: "GERADO",
                            dc: financ.tipo_conta == 1 ? 'D' : 'C',
                            valor: financ.valor_pago
                        }
                        return app.db('conta_movimento').insert(movim_conta).transacting(trx)
                    })
                    .then(trx.commit)
                    .catch(trx.rollback);
            })
        })

        return res.status(204).send()
    }

    const get = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await app.db('financeiro').count('id').first()
        const count = parseInt(result.count)

        console.log()

        app.db('financeiro')
            .join('empresas', 'financeiro.id_empresa', 'empresas.id')
            .leftJoin('pessoas', 'financeiro.id_pessoa', 'pessoas.id')
            .leftJoin('documentos', 'financeiro.documento_origem', 'documentos.id')
            .select(
                'financeiro.id',
                'empresas.nome as empresa',
                'pessoas.nome as pessoa',
                'tipo_conta',
                'pago',
                'financeiro.data_vencimento',
                'financeiro.data_baixa',
                'financeiro.valor_parcela',
                'financeiro.valor_pago',
                'documentos.nome as documento_origem'
            )
            .limit(limit).offset(page * limit - limit)
            .orderBy('tipo_conta', 'pago')
            .where((qb) => {
                if (req.query.tipo == 2) {
                    // pesquisa avançada
                    if (req.query.pessoa) {
                        qb.where('financeiro.id_pessoa', '=', req.query.pessoa);
                    } else if (req.query.id) {
                        qb.orWhere('financeiro.id', '=', req.query.id);
                    } else if (req.query.documento) {
                        qb.orWhere('financeiro.documento_origem', '=', req.query.documento);
                    }
                    // 1 - data_criacao, 2 - data_emissao, 3 - data_vencimento, 4 - data_baixa
                    if (req.query.tipo_data == 1) {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('financeiro.data_criacao', [req.query.data_inicial, req.query.data_final])
                        }
                    } else if (req.query.tipo_data == 2) {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('financeiro.data_emissao', [req.query.data_inicial, req.query.data_final])
                        }
                    } else if (req.query.tipo_data == 4) {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('financeiro.data_baixa', [req.query.data_inicial, req.query.data_final])
                        }
                    } else {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('financeiro.data_vencimento', [req.query.data_inicial, req.query.data_final])
                        }
                    }
                    if (req.query.pagar) {
                        qb.where('financeiro.tipo_conta', '=', 1);
                    }
                    if (req.query.receber) {
                        qb.where('financeiro.tipo_conta', '=', 2);
                    }
                    if (req.query.pendentes) {
                        qb.where('financeiro.pago', '=', false);
                    }
                    if (req.query.concluidos) {
                        qb.where('financeiro.pago', '=', true);
                    }
                } else {
                    // pesquisa rapida
                    if (req.query.pessoa) {
                        qb.where('financeiro.id_pessoa', '=', req.query.pessoa);
                    } else if (req.query.id) {
                        qb.orWhere('financeiro.id', '=', req.query.id);
                    } else if (req.query.documento) {
                        qb.orWhere('financeiro.documento_origem', '=', req.query.documento);
                    }
                    // 1 - data_criacao, 2 - data_emissao, 3 - data_vencimento, 4 - data_baixa
                    if (req.query.tipo_data == 1) {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('financeiro.data_criacao', [req.query.data_inicial, req.query.data_final])
                        }
                    } else if (req.query.tipo_data == 2) {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('financeiro.data_emissao', [req.query.data_inicial, req.query.data_final])
                        }
                    } else if (req.query.tipo_data == 4) {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('financeiro.data_baixa', [req.query.data_inicial, req.query.data_final])
                        }
                    } else {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('financeiro.data_vencimento', [req.query.data_inicial, req.query.data_final])
                        }
                    }
                    if (req.query.pagar) {
                        qb.where('financeiro.tipo_conta', '=', 1);
                    }
                    if (req.query.receber) {
                        qb.where('financeiro.tipo_conta', '=', 2);
                    }
                    if (req.query.pendentes) {
                        qb.where('financeiro.pago', '=', false);
                    }
                    if (req.query.concluidos) {
                        qb.where('financeiro.pago', '=', true);
                    }
                }
            })
            .then(contas => {
                contas = contas.map(conta => {
                    conta.pessoa = conta.pessoa.substr(0, 20) + (conta.pessoa.length > 20 ? '...' : '');
                    return conta
                })
                res.json({ data: contas, count, limit })
            })
            .catch(e => res.status(500).send(e.toString()))
    }

    const getById = async (req, res) => {
        app.db('financeiro')
            .join('empresas', 'financeiro.id_empresa', 'empresas.id')
            .join('pessoas', 'financeiro.id_pessoa', 'pessoas.id')
            .leftJoin('documentos as d1', 'financeiro.documento_origem', 'd1.id')
            .leftJoin('documentos as d2', 'financeiro.documento_baixa', 'd2.id')
            .leftJoin('classificacao', 'financeiro.classificacao', 'classificacao.id')
            .leftJoin('conta', 'financeiro.id_conta', 'conta.id')
            .select(
                'financeiro.id',
                'empresas.nome as empresa',
                'pessoas.nome as pessoa',
                'financeiro.tipo_conta',
                'financeiro.pago',
                'd1.nome as documento_origem',
                'financeiro.num_documento_origem',
                'd2.nome as documento_baixa',
                'financeiro.num_documento_baixa',
                'classificacao.descricao as classificacao',
                'financeiro.data_criacao',
                'financeiro.data_vencimento',
                'financeiro.data_baixa',
                'financeiro.data_emissao',
                'financeiro.parcela',
                'financeiro.observacao',
                'financeiro.valor_acrescimo',
                'financeiro.valor_desconto',
                'financeiro.valor_parcela',
                'financeiro.valor_pago',
                'financeiro.valor_total',
                'conta.nome as conta'
            )
            .where({ 'financeiro.id': req.params.id }).first()
            .then(financ => {
                financ.data_criacao = new Date(financ.data_criacao).toISOString().substr(0, 10)
                financ.data_emissao = new Date(financ.data_emissao).toISOString().substr(0, 10)
                financ.data_vencimento = new Date(financ.data_vencimento).toISOString().substr(0, 10)
                financ.data_baixa = new Date(financ.data_baixa).toISOString().substr(0, 10)

                financ.valor_acrescimo = formatToBRL(financ.valor_acrescimo)
                financ.valor_desconto = formatToBRL(financ.valor_desconto)
                financ.valor_parcela = formatToBRL(financ.valor_parcela)
                financ.valor_pago = formatToBRL(financ.valor_pago)
                financ.valor_total = formatToBRL(financ.valor_total)

                res.json(financ)
            })
            .catch(e => res.status(500).send(e.toString()))
    }

    const getTela = async (req, res) => {
        if (req.params.id) {
            var financ = await app.db('financeiro')
                .where({ id: req.params.id }).first()
                .catch(e => res.status(500).send(e))

            if (financ) {
                financ.data_criacao = new Date(financ.data_criacao).toISOString().substr(0, 10)
                financ.data_emissao = new Date(financ.data_emissao).toISOString().substr(0, 10)
                financ.data_vencimento = new Date(financ.data_vencimento).toISOString().substr(0, 10)
                financ.data_baixa = new Date(financ.data_baixa).toISOString().substr(0, 10)

                financ.valor_acrescimo = formatToBRL(financ.valor_acrescimo)
                financ.valor_desconto = formatToBRL(financ.valor_desconto)
                financ.valor_parcela = formatToBRL(financ.valor_parcela)
                financ.valor_pago = formatToBRL(financ.valor_pago)
                financ.valor_total = formatToBRL(financ.valor_total)
            }

            var classificacoes = await app.db('classificacao').select('id as value', 'descricao as text').orderBy('descricao')
        }

        var pessoas = await app.db('pessoas').select('id as value', 'nome as text', 'cliente', 'fornecedor')
            .where(function () {
                this.where({ cliente: true, situacao: 'Ativo' }).orWhere({ fornecedor: true, situacao: 'Ativo' })
            })
            .orderBy('nome')
        var documentos = await app.db('documentos').select('id as value', 'nome as text').orderBy('nome')
        var contas = await app.db('conta').select('id as value', 'nome as text').orderBy('nome')

        const tela = {
            financ,
            pessoas,
            classificacoes,
            documentos,
            contas
        }

        res.json(tela)
    }

    const getBySituacao = async (req, res) => {
    }

    const remove = async (req, res) => {
        app.db.transaction(async function (trx) {
            return app.db('financeiro')
                .where({ id: req.params.id }).delete()
                .transacting(trx)
                .then(function () {
                    return app.db('conta_movimento')
                        .where({ id_movimento_origem: req.params.id }).delete()
                        .transacting(trx)
                        .then(trx.commit)
                        .catch(trx.rollback);
                }).then(function (inserts) {
                    res.status(204).send()
                }).catch(function (error) {
                    console.log(error.toString())
                    res.status(500).send(error.toString())
                });
        })
    }

    const remove_pagamento = async (req, res) => {
        const financ = {
            data_baixa: null,
            pago: false,
            valor_acrescimo: null,
            valor_desconto: null,
            valor_pago: null,
            documento_baixa: null,
            num_documento_baixa: null,
            id_conta: null,
        }

        app.db.transaction(async function (trx) {
            return app.db('conta_movimento')
                .where({ id_movimento_origem: req.params.id }).delete()
                .transacting(trx)
                .then(function () {
                    return app.db('financeiro')
                        .update(financ)
                        .where({ id: req.params.id })
                        .transacting(trx)
                        .then(trx.commit)
                        .catch(trx.rollback);
                }).then(function (inserts) {
                    res.status(204).send()
                }).catch(function (error) {
                    console.log(error.toString())
                    res.status(500).send(error.toString())
                });
        })
    }

    return { save, save_pagamento, get, getById, getTela, getBySituacao, remove, remove_pagamento }
}