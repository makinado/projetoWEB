const { formatToBRL } = require('brazilian-values')

module.exports = app => {
    const { existsOrError, parseNumber } = app.api.validation

    const save = async (req, res) => {
        const pedido = { ...req.body }
        if (req.params.id) {
            pedido.id = req.params.id
        }

        try {
            existsOrError(pedido.id_empresa, 'Informe a empresa da pedido')
            existsOrError(pedido.id_pessoa, 'Informe o fornecedor do pedido')
            existsOrError(pedido.data_pedido, 'Informe a data do pedido')
            existsOrError(pedido.produtos, 'Informe os produtos do pedido')
        } catch (e) {
            return res.status(400).send(e.toString())
        }

        pedido.situacao = pedido.situacao ? pedido.situacao : 'PENDENTE'
        var produtos = pedido.produtos
        delete pedido.produtos

        let somaProd = 0
        produtos.map(produto => {
            produto.valor_unitario = parseNumber(produto.valor_unitario || "0,00")
            produto.valor_total = parseNumber(produto.valor_total || "0,00")
            produto.quantidade = parseNumber(produto.quantidade || "0,00")
            produto.desconto = parseNumber(produto.desconto || "0,00")

            somaProd += produto.valor_unitario * produto.quantidade - produto.desconto
        })
        pedido.valor_produtos = somaProd

        pedido.valor_frete = parseNumber(pedido.valor_frete || "0,00")
        pedido.valor_seguro = parseNumber(pedido.valor_seguro || "0,00")
        pedido.outras_despesas = parseNumber(pedido.outras_despesas || "0,00")
        pedido.valor_desconto = parseNumber(pedido.valor_desconto || "0,00")

        pedido.valor_total = 0
        pedido.valor_total += somaProd + pedido.valor_frete + pedido.valor_seguro + pedido.outras_despesas - pedido.valor_desconto

        if (pedido.id) {
            return app.db.transaction(async function (trx) {
                return app.db('compra_pedido')
                    .update(pedido)
                    .where({ id: pedido.id })
                    .transacting(trx)
                    .then(async function () {
                        await app.db('produto_pedido_compra').where({ id_pedido: pedido.id }).delete()

                        produtos = produtos.map(produto => {
                            let newProd = {
                                id_pedido: pedido.id,
                                id_empresa: pedido.id_empresa,
                                id_produto: produto.id,
                                data_pedido: pedido.data_pedido,
                                valor_desconto: produto.desconto || 0,
                                quantidade: produto.quantidade || 0,
                                valor_unitario: produto.valor_unitario,
                                valor_total: produto.valor_unitario * produto.quantidade - produto.desconto
                            }

                            return newProd
                        })

                        return app.db.batchInsert('produto_pedido_compra', produtos)
                            .transacting(trx)
                    })
                    .then(trx.commit)
                    .catch(trx.rollback);
            })
                .then(function (inserts) {
                    res.status(204).send()
                })
                .catch(function (error) {
                    console.log(error.toString())
                    res.status(500).send(error.toString())
                });
        } else {
            return app.db.transaction(async function (trx) {
                return app.db('compra_pedido')
                    .insert(pedido).returning('id')
                    .transacting(trx)
                    .then(function (id) {
                        produtos = produtos.map(produto => {
                            const newProd = {
                                id_pedido: id[0],
                                id_empresa: pedido.id_empresa,
                                id_produto: produto.id,
                                data_pedido: pedido.data_pedido,
                                valor_desconto: produto.desconto || 0,
                                quantidade: produto.quantidade || 0,
                                valor_unitario: produto.valor_unitario,
                                valor_total: produto.valor_unitario * produto.quantidade - produto.desconto
                            }

                            return newProd
                        })

                        return app.db.batchInsert('produto_pedido_compra', produtos)
                            .transacting(trx)
                    })
                    .then(trx.commit)
                    .catch(trx.rollback);
            })
                .then(function (inserts) {
                    res.status(204).send()
                })
                .catch(function (error) {
                    console.log(error.toString())
                    res.status(500).send(error.toString())
                });
        }
    }

    const get = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await app.db('compra_pedido').count('id').first()
        const count = parseInt(result.count)

        app.db('compra_pedido')
            .join('empresas', 'compra_pedido.id_empresa', 'empresas.id')
            .join('pessoas', 'compra_pedido.id_pessoa', 'pessoas.id')
            .select(
                'compra_pedido.id',
                'id_empresa',
                'id_pessoa',
                'compra_pedido.situacao',
                'nota_fiscal',
                'data_pedido',
                'valor_total',
                'empresas.nome as empresa',
                'pessoas.nome as pessoa'
            )
            .limit(limit).offset(page * limit - limit)
            .orderBy('compra_pedido.situacao')
            .where(async (qb) => {
                if (req.query.tipo == 2) {
                    // pesquisa avançada
                    if (req.query.fornecedor) {
                        qb.where('compra_pedido.id_pessoa', '=', req.query.fornecedor);
                    } else if (req.query.id) {
                        qb.orWhere('compra_pedido.id', '=', req.query.id);
                    } else if (req.query.documento) {
                        qb.orWhere('compra_pedido.nota_fiscal', '=', req.query.documento);
                    }
                    if (req.query.tipo_data == 1) {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('compra_pedido.data_pedido', [req.query.data_inicial, req.query.data_final])
                        }
                    } else {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('compra_pedido.data_lancamento', [req.query.data_inicial, req.query.data_final])
                        }
                    }
                    if (req.query.pendentes) {
                        qb.where('compra_pedido.situacao', 'PENDENTE');
                    }
                    if (req.query.concluidos) {
                        qb.where('compra_pedido.situacao', 'CONCLUIDO');
                    }
                } else {
                    // pesquisa rapida
                    if (req.query.fornecedor) {
                        qb.where('compra_pedido.id_pessoa', '=', req.query.fornecedor);
                    } else if (req.query.id) {
                        qb.orWhere('compra_pedido.id', '=', req.query.id);
                    } else if (req.query.documento) {
                        qb.orWhere('compra_pedido.nota_fiscal', '=', req.query.documento);
                    }
                    if (req.query.tipo_data == 1) {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('compra_pedido.data_pedido', [req.query.data_inicial, req.query.data_final])
                        }
                    } else {
                        if (req.query.data_inicial && req.query.data_final) {
                            qb.whereBetween('compra_pedido.data_lancamento', [req.query.data_inicial, req.query.data_final])
                        }
                    }
                    if (req.query.pendentes) {
                        qb.where('compra_pedido.situacao', 'PENDENTE');
                    }
                    if (req.query.concluidos) {
                        qb.where('compra_pedido.situacao', 'CONCLUIDO');
                    }
                }
            })
            .then(pedido => res.json({ data: pedido, count, limit }))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getById = async (req, res) => {
        let pedido = await app.db('compra_pedido')
            .where({ id: req.params.id })
            .first()
            .catch(e => res.status(500).send(e.toString()))

        pedido.data_pedido = pedido.data_pedido.toISOString().substr(0, 10)
        pedido.data_lancamento = pedido.data_lancamento.toISOString().substr(0, 10)

        const pedProds = await app.db('produto_pedido_compra').where({ id_pedido: pedido.id })
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
                valor_unitario: pedProd.valor_unitario,
                valor_total: pedProd.valor_total
            }

            return newProd
        })

        const resultado = await Promise.all(newPedProds);

        pedido.produtos = resultado
        res.json(pedido)
    }

    const getTelaPedido = async (req, res) => {
        if (req.params.id) {
            var pedido = await app.db('compra_pedido')
                .where({ id: req.params.id }).first()
                .catch(e => res.status(500).send(e))

            if (pedido) {
                pedido.data_pedido = pedido.data_pedido.toISOString().substr(0, 10)
                pedido.data_lancamento = pedido.data_lancamento.toISOString().substr(0, 10)

                pedido.produtos = await app.db('produto_pedido_compra')
                    .join('produtos', 'produto_pedido_compra.id_produto', 'produtos.id')
                    .select(
                        'produto_pedido_compra.id_produto as id',
                        'produtos.descricao as descricao',
                        'produto_pedido_compra.quantidade',
                        'produto_pedido_compra.valor_unitario',
                        'produto_pedido_compra.valor_desconto',
                        'produto_pedido_compra.valor_total'
                    )
                    .where({ id_pedido: pedido.id })
            }
        }

        var pessoas = await app.db('pessoas').select('id as value', 'nome as text').where({ fornecedor: true }).orderBy('nome')
            .catch(e => res.status(500).send(e.toString()))
        var produtos = await app.db('produtos').select('id as value', 'descricao as text', 'valor_unitario').where({ situacao: true }).orderBy('descricao')
            .catch(e => res.status(500).send(e.toString()))

        var tela = {
            pedido,
            pessoas,
            produtos
        }

        res.json(tela)
    }

    const getBySituacao = async (req, res) => {
        if (req.params.situacao === '1') {
            try {
                let pedidos = await app.db('compra_pedido')
                    .join('empresas', 'compra_pedido.id_empresa', 'empresas.id')
                    .join('pessoas', 'compra_pedido.id_pessoa', 'pessoas.id')
                    .select(
                        'compra_pedido.id',
                        'id_empresa',
                        'id_pessoa',
                        'compra_pedido.situacao',
                        'nota_fiscal',
                        'data_pedido',
                        'valor_total',
                        'empresas.nome as empresa',
                        'pessoas.nome as pessoa'
                    )
                    .where('compra_pedido.situacao', 'like', 'PENDENTE')
                    .catch(e => {
                        res.status(500).send('Erro no servidor')
                        console.log(e)
                    })

                pedidos = pedidos.map(async pedido => {
                    pedido.data_pedido = pedido.data_pedido.toISOString().substr(0, 10)
                    return pedido
                })
                const resultado = await Promise.all(pedidos);

                res.json(resultado);
            } catch (e) {
                res.status(500).send(e.toString())
            }
        } else {
            try {
                let pedidos = await app.db('compra_pedido')
                    .join('empresas', 'compra_pedido.id_empresa', 'empresas.id')
                    .join('pessoas', 'compra_pedido.id_pessoa', 'pessoas.id')
                    .select(
                        'compra_pedido.id',
                        'id_empresa',
                        'id_pessoa',
                        'compra_pedido.situacao',
                        'nota_fiscal',
                        'data_pedido',
                        'valor_total',
                        'empresas.nome as empresa',
                        'pessoas.nome as pessoa'
                    )
                    .where('compra_pedido.situacao', '=', 'CONCLUÍDO')
                    .catch(e => {
                        res.status(500).send('Erro no servidor')
                        console.log(e)
                    })

                pedidos = pedidos.map(async pedido => {
                    pedido.data_pedido = pedido.data_pedido.toISOString().substr(0, 10)
                    return pedido
                })
                const resultado = await Promise.all(pedidos);

                res.json(resultado);
            } catch (e) {
                res.status(500).send(e.toString())
            }
        }
    }

    const remove = async (req, res) => {
        try {
            const pedido = await app.db('compra_pedido')
                .where({ id: req.params.id }).delete()

            existsOrError(pedido, 'pedido não encontrado')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getById, getTelaPedido, getBySituacao, remove }
}