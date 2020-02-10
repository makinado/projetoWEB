module.exports = app => {
    const { existsOrError, notExistsOrError, parseNumber } = app.api.validation
    const { vinculaProduto } = app.api.compras.importacoes

    const save = async (req, res) => {
        const produto = { ...req.body }

        if (req.params.id)
            produto.id = req.params.id

        try {
            existsOrError(produto.descricao, 'Informe uma descrição')
            existsOrError(produto.valor_unitario, 'Informe o valor unitário do produto')

            const produtoDB = await app.db('produtos').select('id').where({ descricao: produto.descricao }).first()
            if (!produto.id) {
                notExistsOrError(produtoDB, 'Produto já cadastrado')
            }
            if (produto.ncm) {
                const ncm = await app.db('ncm').where({ ncm: produto.ncm }).first()
                existsOrError(ncm, "NCM inválido")
            }
            if (produto.cest) {
                const cest = await app.db('ncm_cest').where({ cest: produto.cest }).first()
                existsOrError(cest, "CEST inválido")
            }

        } catch (e) {
            return res.status(400).send(e.toString())
        }

        const grupos = produto.grupos
        delete produto.grupos
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
            return app.db.transaction(async function (trx) {
                return app.db('produtos')
                    .update(produto)
                    .transacting(trx)
                    .where({ id: produto.id })
                    .then(async _ => {
                        // if (vinculacao) {
                        //     vinculaProduto({ id_produto_empresa: id[0], ...vinculacao })
                        // }
                        if (grupos) {
                            await app.db('produto_grupos_tributacao').where({ id_produto: produto.id }).delete()

                            grupos.forEach(grupo => {
                                let grupoDB = {
                                    id_grupo: grupo.id,
                                    id_produto: produto.id
                                }

                                return grupoDB
                            });

                            return app.db.batchInsert('produto_grupos_tributacao', grupos)
                                .transacting(trx)
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
            return app.db.transaction(function (trx) {
                return app.db('produtos')
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

                            return app.db.batchInsert('produto_grupos_tributacao', grupos)
                                .transacting(trx)
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
    }

    const get = async (req, res) => {
        app.db('produtos')
            .select('id', 'descricao', 'valor_unitario', 'valor_venda')
            .orderBy('descricao')
            .then(produtos => res.json(produtos))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getWithEstoque = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await app.db('produtos').count('id').first()
        const count = parseInt(result.count)

        app.db('produtos')
            .leftJoin('categorias', 'produtos.categoria', 'categorias.id')
            .leftJoin('marcas', 'produtos.marca', 'marcas.id')
            .select('produtos.id', 'produtos.descricao', 'categorias.descricao as categoria', 'marcas.nome as marca', 'valor_venda')
            .limit(limit).offset(page * limit - limit)
            .orderBy('descricao')
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
                        const subquery = app.db('produto_estoque').sum('quantidade').whereRaw('produto_estoque.id_produto = produtos.id')
                        qb.where('produtos.estoque_min', '>=', subquery)
                    }
                    if (req.query.estoque_max) {
                        const subquery = app.db('produto_estoque').sum('quantidade').whereRaw('produto_estoque.id_produto = produtos.id')
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
                        const subquery = app.db('produto_estoque').sum('quantidade').whereRaw('produto_estoque.id_produto = produtos.id')
                        qb.where('produtos.estoque_min', '>=', subquery)
                    }
                    if (req.query.estoque_max) {
                        const subquery = app.db('produto_estoque').sum('quantidade').whereRaw('produto_estoque.id_produto = produtos.id')
                        qb.where('produtos.estoque_max', '<=', subquery)
                    }
                }
            })
            .then(async produtos => {
                res.json({ data: await Promise.all(withEstoque(produtos)), count, limit })
            })
            .catch(e => res.status(500).send(e.toString()))
    }

    withEstoque = produtos => {
        const produtosWithEstoque = produtos.map(async produto => {
            produto.qtdEstoque = await app.db('produto_estoque').sum('quantidade').where({ id_produto: produto.id || produto.value })
                .then(estoque => estoque[0].sum)

            return produto
        })

        return produtosWithEstoque
    }

    const getById = async (req, res) => {
        app.db('produtos')
            .where({ id: req.params.id }).first()
            .then(async produto => {
                produto.qtdEstoque = await app.db('produto_estoque').sum('quantidade').where({ id_produto: produto.id })
                    .then(estoque => {
                        estoque = estoque[0].sum
                        return estoque
                    })
                    .catch(e => res.status(500).send(e.toString()))
                res.json(produto);
            })
            .catch(e => res.status(500).send(e))
    }

    const getTelaProduto = async (req, res) => {
        if (req.params.id) {
            var produto = await app.db('produtos')
                .where({ id: req.params.id }).first()
                .catch(e => res.status(500).send(e))
            if (produto) {
                produto.qtdEstoque = await app.db('produto_estoque').sum('quantidade').where({ id_produto: produto.id })
                    .then(estoque => {
                        estoque = estoque[0].sum
                        return estoque
                    })
                    .catch(e => res.status(500).send(e.toString()))
            }
            var grupos_produto = await app.db('produto_grupos_tributacao')
                .join('grupos_tributacao', 'produto_grupos_tributacao.id_grupo', 'grupos_tributacao.id')
                .select('id_grupo as id', 'id_produto', 'grupos_tributacao.descricao as descricao', 'grupos_tributacao.uf as uf', 'grupos_tributacao.cfop as cfop')
                .where({ id_produto: produto.id })
        }

        const categorias = await app.db('categorias').select('id as value', 'descricao as text').where({ tipo: 2 })
        const unidades = await app.db('unidades').select('id as value', 'descricao as text')
        const marcas = await app.db('marcas').select('id as value', 'nome as text')
        const pessoas = await app.db('pessoas').select('id as value', 'nome as text', 'cpf', 'cnpj').where({ fornecedor: true })
        const grupos = await app.db('grupos_tributacao').select('id', 'descricao', 'uf', 'cfop')


        const tela = {
            produto,
            categorias,
            unidades,
            marcas,
            pessoas,
            grupos,
            grupos_produto
        }

        res.json(tela)
    }

    const getByCategoria = async (req, res) => {
        let produtos = await app.db('produtos')
            .select('id', 'descricao', 'valor_unitario', 'valor_venda')
            .where({ categoria: req.params.id_categoria })
            .catch(e => {
                res.status(500).send('Erro no servidor')
                console.log(e)
            })

        produtos = produtos.map(async produto => {
            produto.qtdEstoque = await app.db('produto_estoque').sum('quantidade').where({ id_produto: produto.id })
                .then(estoque => {
                    estoque = estoque[0].sum
                    return estoque
                })
                .catch(e => res.status(500).send(e.toString()))
            return produto
        })

        const resultado = await Promise.all(produtos);

        res.json(resultado);
    }

    const remove = async (req, res) => {
        try {
            const exclusao = await app.db('produtos')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'produto não encontrado')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getById, getWithEstoque, getTelaProduto, getByCategoria, remove, withEstoque }
}