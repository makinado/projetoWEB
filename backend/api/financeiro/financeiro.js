const { formatToBRL } = require('brazilian-values')

module.exports = app => {
    const { existsOrError, notExistsOrError, parseNumber } = app.api.validation

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
                financ.data_baixa = financ.data_baixa ? financ.data_baixa : null
                financ.valor_parcela = parseNumber(financ.valor)
                financ.valor_desconto = parseNumber(financ.valor_desconto || "0,00")
                financ.valor_acrescimo = parseNumber(financ.valor_acrescimo || "0,00")
                financ.valor_pago = financ.pago ? parseNumber(financ.valor_pago) : 0
                financ.valor_total = parseNumber(financ.valor_total)

                delete financ.edit
                delete financ.menu
                delete financ.menu1
                delete financ.data
                delete financ.dataNotFormated
                delete financ.saldo_atual
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
                                    id_movimento_financeiro: financ.id,
                                    id_movimento_origem: financ.id_movimento_origem,
                                    data_lancamento: new Date(),
                                    data_emissao: financ.data_emissao,
                                    id_classificacao: financ.classificacao,
                                    id_documento: financ.documento_baixa || null,
                                    num_documento: financ.num_documento_baixa || null,
                                    observacao: financ.observacao,
                                    origem: "FINANCEIRO",
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
                                    id_movimento_financeiro: id[0],
                                    id_movimento_origem: financ.id_movimento_origem,
                                    data_lancamento: new Date(),
                                    data_emissao: financ.data_emissao,
                                    id_classificacao: financ.classificacao,
                                    id_documento: financ.documento_baixa || null,
                                    num_documento: financ.num_documento_baixa || null,
                                    observacao: financ.observacao,
                                    origem: "FINANCEIRO",
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

        var promises = pagamento.map(financ => {
            return app.db.transaction(async function (trx) {
                return app.db('financeiro')
                    .update(financ).returning('*')
                    .where({ id: financ.id })
                    .transacting(trx)
                    .then(async (financ_updated) => {
                        const movim_conta = {
                            id_empresa: financ.id_empresa,
                            id_conta: financ.id_conta,
                            id_movimento_financeiro: financ.id,
                            id_movimento_origem: financ_updated.id_movimento_origem,
                            data_lancamento: new Date(),
                            data_emissao: financ_updated.data_emissao,
                            id_classificacao: financ_updated.classificacao,
                            id_documento: financ.documento_baixa,
                            num_documento: financ.num_documento_baixa,
                            observacao: financ_updated.observacao,
                            origem: "FINANCEIRO",
                            dc: financ.tipo_conta == 1 ? 'D' : 'C',
                            valor: financ.valor_pago
                        }
                        return app.db('conta_movimento').insert(movim_conta).transacting(trx)
                    })
                    .then(trx.commit)
                    .catch(trx.rollback);
            })
        })

        Promise.all(promises)
            .then(function (results) { return res.status(204).send() })
            .catch(function (e) { return res.status(500).send('Erro ao efetuar o pagamento') })
    }

    const get = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await app.db('financeiro').count('id').first()
        const count = parseInt(result.count)

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
                'data_vencimento',
                'data_baixa',
                'valor_parcela',
                'valor_pago',
                'documentos.nome as documento_origem',
                'num_documento_origem'
            )
            .limit(limit).offset(page * limit - limit)
            .orderBy(req.query.order || "tipo_conta", req.query.desc || "asc")
            .where((qb) => {
                if (req.query.empresa) {
                    qb.where('financeiro.id_empresa', '=', req.query.empresa);
                }

                if (req.query.pessoa) {
                    qb.where('financeiro.id_pessoa', '=', req.query.pessoa);
                } else if (req.query.id) {
                    qb.orWhere('financeiro.id', '=', req.query.id);
                } else if (req.query.documento) {
                    qb.orWhere('financeiro.documento_origem', '=', req.query.documento);
                }

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
            })
            .then(contas => {
                contas = contas.map(conta => {
                    conta.tipo_conta = conta.tipo_conta === 1 ? "PAGAR" : "RECEBER";
                    conta.pago = conta.pago ? "CONCLUÍDA" : "PENDENTE";

                    return conta
                })
                res.json({ data: contas, count, limit })
            })
            .catch(e => res.status(500).send(e.toString()))
    }

    const getById = async (req, res) => {
        app.db('financeiro')
            .where({ id: req.params.id })
            .first()
            .then(financ => res.json(financ))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getConta = async (req, res) => {
        app.db('financeiro')
            .join('empresas', 'financeiro.id_empresa', 'empresas.id')
            .join('pessoas', 'financeiro.id_pessoa', 'pessoas.id')
            .leftJoin('documentos as doc_origem', 'financeiro.documento_origem', 'doc_origem.id')
            .leftJoin('documentos as doc_baixa', 'financeiro.documento_baixa', 'doc_baixa.id')
            .leftJoin('classificacao', 'financeiro.classificacao', 'classificacao.id')
            .leftJoin('conta', 'financeiro.id_conta', 'conta.id')
            .select(
                'financeiro.id',
                'financeiro.tipo_conta',
                'financeiro.pago',
                'num_documento_origem',
                'num_documento_baixa',
                'data_criacao',
                'data_emissao',
                'data_vencimento',
                'data_baixa',
                'valor_parcela',
                'valor_pago',
                'valor_acrescimo',
                'valor_desconto',
                'valor_total',
                'pago',
                'empresas.nome as empresa',
                'pessoas.nome as pessoa',
                'doc_origem.nome as documento_origem',
                'doc_baixa.nome as documento_baixa',
                'classificacao.descricao as classificacao',
                'conta.nome as conta',
            )
            .where({ 'financeiro.id': req.params.id })
            .first()
            .then(financ => res.json(financ))
            .catch(e => { console.log(e); res.status(500).send(e.toString()) })
    }

    const remove = async (req, res) => {

        try {
            const origem = await app.db('financeiro').select('id_movimento_origem', 'pago').where({ id: req.params.id }).first()
            if (origem.id_movimento_origem) throw 'Há movimentos associados a este registro'
            if (origem.pago) throw 'Não é possível exluir uma conta paga'
        } catch (e) {
            return res.status(400).send(e)
        }

        app.db.transaction(async function (trx) {
            return app.db('financeiro')
                .where({ id: req.params.id }).delete()
                .transacting(trx)
                .then(function () {
                    return app.db('conta_movimento')
                        .where({ id_movimento_financeiro: req.params.id }).delete()
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
                .where({ id_movimento_financeiro: req.params.id }).delete()
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

    return { save, save_pagamento, get, getById, getConta, remove, remove_pagamento }
}