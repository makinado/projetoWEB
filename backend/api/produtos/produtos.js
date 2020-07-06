const { formatToBRL } = require('brazilian-values')

module.exports = app => {
    const { existsOrError, notExistsOrError, parseNumber } = app.api.validation

    const save = async (req, res) => {
        const produto = { ...req.body }

        if (req.params.id)
            produto.id = req.params.id

        try {
            existsOrError(produto.descricao, 'Informe uma descrição')
            existsOrError(produto.valor_unitario, 'Informe o valor unitário do produto')

            const produtoDB = await req.knex('produtos').select('id').where({ descricao: produto.descricao }).first()
            if (!produto.id) {
                notExistsOrError(produtoDB, 'Produto já cadastrado')
            }
            // if (produto.ncm) {
            //     const ncm = await req.knex('ncm').where({ ncm: produto.ncm }).first()
            //     existsOrError(ncm, "NCM inválido")
            // }
            // if (produto.cest) {
            //     const cest = await req.knex('ncm_cest').where({ cest: produto.cest }).first()
            //     existsOrError(cest, "CEST inválido")
            // }

        } catch (e) {
            return res.status(400).send(e.toString())
        }

        const grupos = produto.grupos
        delete produto.grupos
        delete produto.grupos_tributacao
        delete produto.qtdEstoque

        produto.estoque_min = parseNumber(produto.estoque_min || '0,00', ',')
        produto.estoque_max = parseNumber(produto.estoque_max || '0,00', ',')

        produto.valor_venda = parseNumber(produto.valor_venda || '0,00', ',')
        produto.valor_unitario = parseNumber(produto.valor_unitario || '0,00', ',')
        produto.valor_custo_medio = parseNumber(produto.valor_custo_medio || '0,00', ',')
        produto.perc_margem_contribuicao = parseNumber(produto.perc_margem_contribuicao || '0,00', ',')
        produto.valor_lucro_bruto = parseNumber(produto.valor_lucro_bruto || '0,00', ',')
        produto.perc_comissao = parseNumber(produto.perc_comissao || '0,00', ',')
        produto.valor_comissao = parseNumber(produto.valor_comissao || '0,00', ',')

        produto.perc_reducao_icms = parseNumber(produto.perc_reducao_icms || '0,00', ',')
        produto.perc_ipi = parseNumber(produto.perc_ipi || '0,00', ',')

        if (produto.id) {
            return req.knex.transaction(async function (trx) {
                return req.knex('produtos')
                    .update(produto)
                    .transacting(trx)
                    .where({ id: produto.id })
                    .then(async _ => {
                        // if (vinculacao) {
                        //     vinculaProduto({ id_produto_empresa: id[0], ...vinculacao })
                        // }
                        if (grupos) {
                            await req.knex('produto_grupos_tributacao').where({ id_produto: produto.id }).delete()

                            grupos.forEach(grupo => {
                                let grupoDB = {
                                    id_grupo: grupo.id,
                                    id_produto: produto.id
                                }

                                return grupoDB
                            });

                            return req.knex.batchInsert('produto_grupos_tributacao', grupos)
                                .transacting(trx)
                        }
                    })
                    .then(trx.commit)
                    .catch(trx.rollback);
            }).then(function (inserts) {
                res.status(204).send()
            }).catch(function (error) {
                console.log(error.toString())
                res.status(500).send("Erro ao salvar produto")
            });
        } else {
            return req.knex.transaction(function (trx) {
                return req.knex('produtos')
                    .insert(produto).returning('id')
                    .transacting(trx)
                    .then(id => {
                        if (grupos) {
                            grupos.forEach(grupo => {
                                let grupoDB = {
                                    id_grupo: grupo.id,
                                    id_produto: id[0]
                                }

                                return grupoDB
                            });

                            return req.knex.batchInsert('produto_grupos_tributacao', grupos)
                                .transacting(trx)
                        }
                    })
                    .then(trx.commit)
                    .catch(trx.rollback);
            }).then(function (inserts) {
                res.status(204).send()
            }).catch(function (error) {
                console.log(error.toString())
                res.status(500).send("Erro ao salvar produto")
            });
        }
    }

    const get = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await req.knex('produtos').count('id').first()
        const count = parseInt(result.count)

        req.knex('produtos')
            .leftJoin('categorias', 'produtos.categoria', 'categorias.id')
            .leftJoin('marcas', 'produtos.marca', 'marcas.id')
            .select('produtos.id', 'produtos.descricao', 'categorias.descricao as categoria', 'marcas.nome as marca', 'valor_venda')
            .limit(limit).offset(page * limit - limit)
            .orderBy(req.query.order || "descricao", req.query.desc || "asc")
            .where(async (qb) => {
                if (req.query.tipo == 2) {
                    // pesquisa avançada
                    if (req.query.descricao) {
                        qb.where('produtos.descricao', 'ilike', `%${req.query.descricao}%`);
                    } else if (req.query.id) {
                        qb.orWhere('produtos.id', '=', req.query.id);
                    }
                    if (req.query.categoria) {
                        qb.where('produtos.categoria', '=', req.query.categoria);
                    }
                    if (req.query.marca) {
                        qb.where('produtos.marca', '=', req.query.marca);
                    }
                    if (req.query.unidade) {
                        qb.where('produtos.unidade', '=', req.query.unidade);
                    }
                    if (req.query.estoque_min) {
                        const subquery = req.knex('produto_estoque').sum('quantidade').whereRaw('produto_estoque.id_produto = produtos.id')
                        qb.where('produtos.estoque_min', '>=', subquery)
                    }
                    if (req.query.estoque_max) {
                        const subquery = req.knex('produto_estoque').sum('quantidade').whereRaw('produto_estoque.id_produto = produtos.id')
                        qb.where('produtos.estoque_max', '<=', subquery)
                    }
                } else {
                    // pesquisa rapida
                    if (req.query.descricao) {
                        qb.where('produtos.descricao', 'ilike', `${req.query.descricao}%`);
                    } else if (req.query.id) {
                        qb.orWhere('produtos.id', '=', req.query.id);
                    }
                    if (req.query.categoria) {
                        qb.where('produtos.categoria', '=', req.query.categoria);
                    }
                    if (req.query.marca) {
                        qb.where('produtos.marca', '=', req.query.marca);
                    }
                    if (req.query.unidade) {
                        qb.where('produtos.unidade', '=', req.query.unidade);
                    }
                    if (req.query.estoque_min) {
                        const subquery = req.knex('produto_estoque').sum('quantidade').whereRaw('produto_estoque.id_produto = produtos.id')
                        qb.where('produtos.estoque_min', '>=', subquery)
                    }
                    if (req.query.estoque_max) {
                        const subquery = req.knex('produto_estoque').sum('quantidade').whereRaw('produto_estoque.id_produto = produtos.id')
                        qb.where('produtos.estoque_max', '<=', subquery)
                    }
                }
            })
            .then(async produtos => {
                res.json({ data: await Promise.all(withEstoque(req, produtos)), count, limit })
            })
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar produtos") })
    }

    withEstoque = (req, produtos) => {
        const produtosWithEstoque = produtos.map(async produto => {
            produto.qtdEstoque = await req.knex('produto_estoque').sum('quantidade').where({ id_produto: produto.id || produto.value })
                .then(estoque => estoque[0].sum)

            return produto
        })

        return produtosWithEstoque
    }

    const getById = async (req, res) => {
        req.knex('produtos')
            .where({ id: req.params.id }).first()
            .then(async produto => {
                produto.qtdEstoque = await req.knex('produto_estoque').sum('quantidade').where({ id_produto: produto.id })
                    .then(estoque => Number(estoque[0].sum))
                produto.grupos_tributacao = await req.knex('produto_grupos_tributacao')
                    .select('id_grupo').where({ id_produto: produto.id }).then(grupos => grupos.map(e => e.id_grupo))


                res.json(produto)
            })
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar produto") })
    }

    const getAll = async (req, res) => {
        req.knex('produtos')
            .select('id as value', 'descricao as text', 'perc_comissao', 'valor_unitario', 'valor_venda')
            .orderBy('descricao')
            .then(async produtos => {
                produtos = produtos.map(produto => {
                    produto.valor_unitario = formatToBRL(produto.valor_unitario)
                    produto.valor_venda = formatToBRL(produto.valor_venda)

                    return produto
                })
                res.json(await Promise.all(withEstoque(req, produtos)))
            })
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar produtos") })
    }

    const remove = async (req, res) => {
        try {
            const movimento = await req.knex('produto_movimento_estoque').select('id_produto').where({ id_produto: req.params.id }).first()
            if (movimento.id_produto) throw 'Há movimentos de estoque associados a este produto'

            const exclusao = await req.knex('produtos')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'produto não encontrado')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    const fastSave = async (req, res) => {
        const produto = { ...req.body }

        try {
            existsOrError(produto.descricao, 'Descrição é obrigatória')
            const produtoDB = await req.knex('produtos').where({ descricao: produto.descricao }).first()

            notExistsOrError(produtoDB, 'produto já cadastrado')
        } catch (e) {
            return res.status(400).send(e)
        }

        req.knex('produtos')
            .insert(produto)
            .then(_ => res.status(204).send())
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao salvar produto") })
    }

    return { save, get, getById, getAll, remove, withEstoque, fastSave }
}