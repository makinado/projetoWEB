const { formatToBRL } = require('brazilian-values')

module.exports = app => {
    const { existsOrError, parseNumber, formatDate } = app.api.validation
    const { withEstoque } = app.api.produtos.produtos

    const save = async (req, res) => {
        const orcamento = { ...req.body }
        if (req.params.id) {
            orcamento.id = req.params.id
        }

        try {
            existsOrError(orcamento.id_empresa, 'Informe a empresa do orçamento')
            existsOrError(orcamento.pessoa, 'Informe o cliente do orçamento')

            if (orcamento.pessoa.value)
                orcamento.id_pessoa = orcamento.pessoa.value
            else
                orcamento.nome_pessoa = orcamento.pessoa
            delete orcamento.pessoa

            existsOrError(orcamento.produtos, 'Informe os produtos do orçamento')
        } catch (e) {
            return res.status(400).send(e.toString())
        }

        orcamento.situacao = orcamento.situacao ? orcamento.situacao : 'PENDENTE'
        var produtos = orcamento.produtos
        delete orcamento.produtos

        try {
            orcamento.valor_frete = parseNumber(orcamento.valor_frete || "0,00")
            orcamento.valor_seguro = parseNumber(orcamento.valor_seguro || "0,00")
            orcamento.outras_despesas = parseNumber(orcamento.outras_despesas || "0,00")
            orcamento.valor_desconto = parseNumber(orcamento.valor_desconto || "0,00")
            orcamento.valor_produtos = parseNumber(orcamento.valor_produtos || "0,00")
            orcamento.valor_total = parseNumber(orcamento.valor_total || "0,00")

            if (orcamento.id) {
                return app.db.transaction(async function (trx) {
                    return app.db('orcamentos')
                        .update(orcamento)
                        .where({ id: orcamento.id })
                        .transacting(trx)
                        .then(async function () {
                            await app.db('produto_orcamento').where({ id_orcamento: orcamento.id }).delete()

                            produtos = produtos.map(produto => {
                                const newProd = {
                                    id_orcamento: orcamento.id,
                                    id_empresa: orcamento.id_empresa,
                                    id_produto: produto.id,

                                    quantidade: (parseNumber(produto.quantidade || "0,00")),
                                    valor_venda: (parseNumber(produto.valor_venda || "0,00")),
                                    valor_desconto: (parseNumber(produto.valor_desconto || "0,00")),
                                    valor_total: (parseNumber(produto.valor_total || "0,00")),
                                }

                                return newProd
                            })

                            return app.db.batchInsert('produto_orcamento', produtos)
                                .transacting(trx)

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
                    return app.db('orcamentos')
                        .insert(orcamento).returning('id')
                        .transacting(trx)
                        .then(function (id) {
                            produtos = produtos.map(produto => {
                                const newProd = {
                                    id_orcamento: id[0],
                                    id_empresa: orcamento.id_empresa,
                                    id_produto: produto.id,

                                    quantidade: (parseNumber(produto.quantidade || "0,00")),
                                    valor_venda: (parseNumber(produto.valor_venda || "0,00")),
                                    valor_desconto: (parseNumber(produto.valor_desconto || "0,00")),
                                    valor_total: (parseNumber(produto.valor_total || "0,00")),
                                }

                                return newProd
                            })

                            return app.db.batchInsert('produto_orcamento', produtos)
                                .transacting(trx)

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

        const result = await app.db('orcamentos').count('id').first()
        const count = parseInt(result.count)

        app.db('orcamentos')
            .join('empresas', 'orcamentos.id_empresa', 'empresas.id')
            .join('pessoas', 'orcamentos.id_pessoa', 'pessoas.id')
            .select(
                'orcamentos.id',
                'id_empresa',
                'id_pessoa',
                'orcamentos.situacao',
                'data_agendamento',
                'valor_total',
                'empresas.nome as empresa',
                'pessoas.nome as pessoa'
            )
            .limit(limit).offset(page * limit - limit)
            .orderBy('orcamentos.situacao')
            .where(async (qb) => {
                if (req.query.tipo == 2) {
                    // pesquisa avançada
                    if (req.query.cliente) {
                        qb.where('orcamentos.id_pessoa', '=', req.query.cliente);
                    } else if (req.query.id) {
                        qb.orWhere('orcamentos.id', '=', req.query.id);
                    }
                    if (req.query.tipo_data == 1) {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('orcamentos.data_contato', [req.query.data_inicial, req.query.data_final])
                        }
                    } else {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('orcamentos.data_agendamento', [req.query.data_inicial, req.query.data_final])
                        }
                    }
                    if (req.query.pendentes) {
                        qb.where('orcamentos.situacao', 'PENDENTE');
                    }
                    if (req.query.concluidos) {
                        qb.where('orcamentos.situacao', 'CONCLUÍDOS');
                    }
                } else {
                    // pesquisa rapida
                    if (req.query.cliente) {
                        qb.where('orcamentos.id_pessoa', '=', req.query.cliente);
                    } else if (req.query.id) {
                        qb.orWhere('orcamentos.id', '=', req.query.id);
                    }
                    if (req.query.tipo_data == 1) {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('orcamentos.data_contato', [req.query.data_inicial, req.query.data_final])
                        }
                    } else {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('orcamentos.data_agendamento', [req.query.data_inicial, req.query.data_final])
                        }
                    }
                    if (req.query.concluidas) {
                        qb.where('orcamentos.situacao', 'PENDENTE');
                    }
                    if (req.query.concluidos) {
                        qb.where('orcamentos.situacao', 'CONCLUÍDOS');
                    }
                }
            })
            .then(pedido => res.json({ data: pedido, count, limit }))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getById = async (req, res) => {
        let orcamento = await app.db('orcamentos')
            .leftJoin('pessoas', 'orcamentos.id_pessoa', 'pessoas.id')
            .select('*', 'pessoas.nome as pessoa')
            .where({ 'orcamentos.id': req.params.id })
            .first()
            .catch(e => res.status(500).send(e.toString()))

        orcamento.data_orcamento = orcamento.data_orcamento.toISOString().substr(0, 10)
        orcamento.data_lancamento = orcamento.data_lancamento.toISOString().substr(0, 10)

        const pedProds = await app.db('produto_orcamento').where({ id_orcamento: orcamento.id })
            .then(produtos => {
                return produtos
            })
            .catch(e => res.status(500).send(e.toString()))


        let newPedProds = []
        newPedProds = pedProds.map(async pedProd => {
            let prod = await app.db('produtos').where({ id: pedProd.id_produto }).first()
                .then(produto => {
                    return produto
                })
                .catch(e => res.status(500).send(e.toString()))

            let newProd = {
                descricao: prod.descricao,
                id: pedProd.id_produto,
                quantidade: pedProd.quantidade,
                desconto: pedProd.valor_desconto || 0.00,
                valor_venda: pedProd.valor_venda,
                valor_total: pedProd.valor_total
            }

            return newProd
        })

        const resultado = await Promise.all(newPedProds);

        orcamento.produtos = resultado
        res.json(orcamento)
    }

    const getTela = async (req, res) => {
        if (req.params.id) {
            var orcamento = await app.db('orcamentos')
                .leftJoin('pessoas', 'orcamentos.id_pessoa', 'pessoas.id')
                .select(
                    'orcamentos.id',
                    'orcamentos.id_pessoa',
                    'orcamentos.id_empresa',
                    'orcamentos.situacao',
                    'orcamentos.data_contato',
                    'orcamentos.data_agendamento',
                    'orcamentos.observacao',
                    'orcamentos.id_venda_gerada',
                    'orcamentos.id_tabela_preco',
                    'orcamentos.valor_total',
                    'orcamentos.valor_frete',
                    'orcamentos.valor_seguro',
                    'orcamentos.valor_desconto',
                    'orcamentos.outras_despesas',
                    'orcamentos.valor_produtos',
                    'orcamentos.nome_pessoa',

                    'pessoas.nome as nome_pessoa'
                )
                .where({ 'orcamentos.id': req.params.id }).first()
                .catch(e => res.status(500).send(e.toString()))

            orcamento.pessoa = orcamento.id_pessoa ? { value: orcamento.id_pessoa, text: orcamento.nome_pessoa } : orcamento.nome_pessoa

            orcamento.data_contato = new Date(orcamento.data_contato).toISOString().substr(0, 10)
            orcamento.data_agendamento = new Date(orcamento.data_agendamento).toISOString().substr(0, 10)

            orcamento.produtos = await app.db('produto_orcamento')
                .join('produtos', 'produto_orcamento.id_produto', 'produtos.id')
                .select(
                    'produto_orcamento.id_produto as id',
                    'produto_orcamento.quantidade',
                    'produto_orcamento.valor_venda',
                    'produto_orcamento.valor_desconto',
                    'produto_orcamento.valor_total'
                )
                .where({ id_orcamento: orcamento.id })
        }

        var pessoas = await app.db('pessoas')
            .select('id as value', 'nome as text')
            .where({ cliente: true })
            .orderBy('nome')
        var produtos = await Promise.all(
            withEstoque(
                await app.db('produtos')
                    .leftJoin('produto_estoque', 'produto_estoque.id_produto', 'produtos.id')
                    .select(
                        'produtos.id as value',
                        'produtos.descricao as text',
                        'produtos.valor_venda',
                    )
                    .where({ situacao: true })
                    .orderBy('descricao')
            ))


        const tela = {
            orcamento,
            pessoas,
            produtos,
        }

        res.json(tela)
    }

    const getBySituacao = async (req, res) => {
        if (req.params.situacao === '1') {
            try {
                let orcamentos = await app.db('orcamentos')
                    .join('empresas', 'orcamentos.id_empresa', 'empresas.id')
                    .join('pessoas', 'orcamentos.id_pessoa', 'pessoas.id')
                    .select(
                        'orcamentos.id',
                        'id_empresa',
                        'id_pessoa',
                        'orcamentos.situacao',
                        'nota_fiscal',
                        'data_orcamento',
                        'valor_total',
                        'empresas.nome as empresa',
                        'pessoas.nome as pessoa'
                    )
                    .where('orcamentos.situacao', 'like', 'PENDENTE')
                    .catch(e => {
                        res.status(500).send('Erro no servidor')
                        console.log(e)
                    })

                orcamentos = orcamentos.map(async orcamento => {
                    orcamento.data_orcamento = orcamento.data_orcamento.toISOString().substr(0, 10)
                    return orcamento
                })
                const resultado = await Promise.all(orcamentos);

                res.json(resultado);
            } catch (e) {
                res.status(500).send(e.toString())
            }
        } else {
            try {
                let orcamentos = await app.db('orcamentos')
                    .join('empresas', 'orcamentos.id_empresa', 'empresas.id')
                    .join('pessoas', 'orcamentos.id_pessoa', 'pessoas.id')
                    .select(
                        'orcamentos.id',
                        'id_empresa',
                        'id_pessoa',
                        'orcamentos.situacao',
                        'nota_fiscal',
                        'data_orcamento',
                        'valor_total',
                        'empresas.nome as empresa',
                        'pessoas.nome as pessoa'
                    )
                    .where('orcamentos.situacao', '=', 'CONCLUÍDO')
                    .catch(e => {
                        res.status(500).send('Erro no servidor')
                        console.log(e)
                    })

                orcamentos = orcamentos.map(async orcamento => {
                    orcamento.data_orcamento = orcamento.data_orcamento.toISOString().substr(0, 10)
                    return orcamento
                })
                const resultado = await Promise.all(orcamentos);

                res.json(resultado);
            } catch (e) {
                res.status(500).send(e.toString())
            }
        }
    }

    const remove = async (req, res) => {
        try {
            const orcamento = await app.db('orcamentos')
                .where({ id: req.params.id }).delete()

            existsOrError(orcamento, 'Orçamento não encontrado')
            res.status(204).send()
        } catch (e) {
            return res.status(500).send()
        }
    }

    return { save, get, getById, getTela, getBySituacao, remove }
}