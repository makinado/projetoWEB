const { formatToBRL } = require('brazilian-values')

module.exports = app => {
    const { existsOrError, parseNumber, formatDate } = app.api.validation
    const { withEstoque } = app.api.produtos.produtos

    const save = async (req, res) => {
        const venda = { ...req.body }
        if (req.params.id) {
            venda.id = req.params.id
        }

        try {
            existsOrError(venda.id_empresa, 'Informe a empresa do orçamento')
            existsOrError(venda.pessoa, 'Informe o cliente do orçamento')

            if (venda.pessoa.value)
                venda.id_pessoa = venda.pessoa.value
            else
                venda.nome_pessoa = venda.pessoa
            delete venda.pessoa

            existsOrError(venda.produtos, 'Informe os produtos do orçamento')
        } catch (e) {
            return res.status(400).send(e.toString())
        }

        venda.situacao = venda.situacao ? venda.situacao : 'PENDENTE'
        var produtos = venda.produtos
        delete venda.produtos

        try {
            venda.valor_frete = parseNumber(venda.valor_frete || "0,00")
            venda.valor_seguro = parseNumber(venda.valor_seguro || "0,00")
            venda.outras_despesas = parseNumber(venda.outras_despesas || "0,00")
            venda.valor_desconto = parseNumber(venda.valor_desconto || "0,00")
            venda.valor_produtos = parseNumber(venda.valor_produtos || "0,00")
            venda.valor_total = parseNumber(venda.valor_total || "0,00")

            if (venda.id) {
                return app.db.transaction(async function (trx) {
                    return app.db('venda')
                        .update(venda)
                        .where({ id: venda.id })
                        .transacting(trx)
                        .then(async function () {
                            await app.db('produto_venda').where({ id_venda: venda.id }).delete()

                            produtos = produtos.map(produto => {
                                const newProd = {
                                    id_venda: venda.id,
                                    id_empresa: venda.id_empresa,
                                    id_produto: produto.id,

                                    quantidade: (parseNumber(produto.quantidade || "0,00")),
                                    valor_venda: (parseNumber(produto.valor_venda || "0,00")),
                                    valor_desconto: (parseNumber(produto.valor_desconto || "0,00")),
                                    valor_total: (parseNumber(produto.valor_total || "0,00")),
                                }

                                return newProd
                            })

                            return app.db.batchInsert('produto_venda', produtos)
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
                    return app.db('venda')
                        .insert(venda).returning('id')
                        .transacting(trx)
                        .then(function (id) {
                            produtos = produtos.map(produto => {
                                const newProd = {
                                    id_venda: id[0],
                                    id_empresa: venda.id_empresa,
                                    id_produto: produto.id,

                                    quantidade: (parseNumber(produto.quantidade || "0,00")),
                                    valor_venda: (parseNumber(produto.valor_venda || "0,00")),
                                    valor_desconto: (parseNumber(produto.valor_desconto || "0,00")),
                                    valor_total: (parseNumber(produto.valor_total || "0,00")),
                                }

                                return newProd
                            })

                            return app.db.batchInsert('produto_venda', produtos)
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

        const result = await app.db('venda').count('id').first()
        const count = parseInt(result.count)

        app.db('venda')
            .join('empresas', 'vendas.id_empresa', 'empresas.id')
            .join('pessoas', 'vendas.id_pessoa', 'pessoas.id')
            .select(
                'vendas.id',
                'id_empresa',
                'id_pessoa',
                'vendas.situacao',
                'data_agendamento',
                'valor_total',
                'empresas.nome as empresa',
                'pessoas.nome as pessoa'
            )
            .limit(limit).offset(page * limit - limit)
            .orderBy('vendas.situacao')
            .where(async (qb) => {
                if (req.query.tipo == 2) {
                    // pesquisa avançada
                    if (req.query.cliente) {
                        qb.where('vendas.id_pessoa', '=', req.query.cliente);
                    } else if (req.query.id) {
                        qb.orWhere('vendas.id', '=', req.query.id);
                    }
                    if (req.query.tipo_data == 1) {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('vendas.data_contato', [req.query.data_inicial, req.query.data_final])
                        }
                    } else {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('vendas.data_agendamento', [req.query.data_inicial, req.query.data_final])
                        }
                    }
                    if (req.query.pendentes) {
                        qb.where('vendas.situacao', 'PENDENTE');
                    }
                    if (req.query.concluidos) {
                        qb.where('vendas.situacao', 'CONCLUÍDOS');
                    }
                } else {
                    // pesquisa rapida
                    if (req.query.cliente) {
                        qb.where('vendas.id_pessoa', '=', req.query.cliente);
                    } else if (req.query.id) {
                        qb.orWhere('vendas.id', '=', req.query.id);
                    }
                    if (req.query.tipo_data == 1) {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('vendas.data_contato', [req.query.data_inicial, req.query.data_final])
                        }
                    } else {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('vendas.data_agendamento', [req.query.data_inicial, req.query.data_final])
                        }
                    }
                    if (req.query.concluidas) {
                        qb.where('vendas.situacao', 'PENDENTE');
                    }
                    if (req.query.concluidos) {
                        qb.where('vendas.situacao', 'CONCLUÍDOS');
                    }
                }
            })
            .then(pedido => res.json({ data: pedido, count, limit }))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getById = async (req, res) => {
        let venda = await app.db('venda')
            .leftJoin('pessoas', 'vendas.id_pessoa', 'pessoas.id')
            .select('*', 'pessoas.nome as pessoa')
            .where({ 'vendas.id': req.params.id })
            .first()
            .catch(e => res.status(500).send(e.toString()))

        venda.data_venda = venda.data_venda.toISOString().substr(0, 10)
        venda.data_lancamento = venda.data_lancamento.toISOString().substr(0, 10)

        const pedProds = await app.db('produto_venda').where({ id_venda: venda.id })
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

        venda.produtos = resultado
        res.json(venda)
    }

    const getTela = async (req, res) => {
        if (req.params.id) {
            var venda = await app.db('venda')
                .leftJoin('pessoas', 'vendas.id_pessoa', 'pessoas.id')
                .select(
                    'vendas.id',
                    'vendas.id_pessoa',
                    'vendas.id_empresa',
                    'vendas.situacao',
                    'vendas.data_contato',
                    'vendas.data_agendamento',
                    'vendas.observacao',
                    'vendas.id_venda_gerada',
                    'vendas.id_tabela_preco',
                    'vendas.valor_total',
                    'vendas.valor_frete',
                    'vendas.valor_seguro',
                    'vendas.valor_desconto',
                    'vendas.outras_despesas',
                    'vendas.valor_produtos',
                    'vendas.nome_pessoa',

                    'pessoas.nome as nome_pessoa'
                )
                .where({ 'vendas.id': req.params.id }).first()
                .catch(e => res.status(500).send(e.toString()))

            venda.pessoa = venda.id_pessoa ? { value: venda.id_pessoa, text: venda.nome_pessoa } : venda.nome_pessoa

            venda.data_contato = new Date(venda.data_contato).toISOString().substr(0, 10)
            venda.data_agendamento = new Date(venda.data_agendamento).toISOString().substr(0, 10)

            venda.produtos = await app.db('produto_venda')
                .join('produtos', 'produto_venda.id_produto', 'produtos.id')
                .select(
                    'produto_venda.id_produto as id',
                    'produto_venda.quantidade',
                    'produto_venda.valor_venda',
                    'produto_venda.valor_desconto',
                    'produto_venda.valor_total'
                )
                .where({ id_venda: venda.id })
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
            venda,
            pessoas,
            produtos,
        }

        res.json(tela)
    }

    const getBySituacao = async (req, res) => {
        if (req.params.situacao === '1') {
            try {
                let vendas = await app.db('venda')
                    .join('empresas', 'vendas.id_empresa', 'empresas.id')
                    .join('pessoas', 'vendas.id_pessoa', 'pessoas.id')
                    .select(
                        'vendas.id',
                        'id_empresa',
                        'id_pessoa',
                        'vendas.situacao',
                        'nota_fiscal',
                        'data_venda',
                        'valor_total',
                        'empresas.nome as empresa',
                        'pessoas.nome as pessoa'
                    )
                    .where('vendas.situacao', 'like', 'PENDENTE')
                    .catch(e => {
                        res.status(500).send('Erro no servidor')
                        console.log(e)
                    })

                vendas = vendas.map(async venda => {
                    venda.data_venda = venda.data_venda.toISOString().substr(0, 10)
                    return venda
                })
                const resultado = await Promise.all(vendas);

                res.json(resultado);
            } catch (e) {
                res.status(500).send(e.toString())
            }
        } else {
            try {
                let vendas = await app.db('venda')
                    .join('empresas', 'vendas.id_empresa', 'empresas.id')
                    .join('pessoas', 'vendas.id_pessoa', 'pessoas.id')
                    .select(
                        'vendas.id',
                        'id_empresa',
                        'id_pessoa',
                        'vendas.situacao',
                        'nota_fiscal',
                        'data_venda',
                        'valor_total',
                        'empresas.nome as empresa',
                        'pessoas.nome as pessoa'
                    )
                    .where('vendas.situacao', '=', 'CONCLUÍDO')
                    .catch(e => {
                        res.status(500).send('Erro no servidor')
                        console.log(e)
                    })

                vendas = vendas.map(async venda => {
                    venda.data_venda = venda.data_venda.toISOString().substr(0, 10)
                    return venda
                })
                const resultado = await Promise.all(vendas);

                res.json(resultado);
            } catch (e) {
                res.status(500).send(e.toString())
            }
        }
    }

    const remove = async (req, res) => {
        try {
            const venda = await app.db('venda')
                .where({ id: req.params.id }).delete()

            existsOrError(venda, 'Orçamento não encontrado')
            res.status(204).send()
        } catch (e) {
            return res.status(500).send()
        }
    }

    return { save, get, getById, getTela, getBySituacao, remove }
}