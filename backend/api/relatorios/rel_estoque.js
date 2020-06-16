module.exports = app => {
    const { withEstoque } = app.api.produtos.produtos

    const getData = async (req, res) => {
        const relatorio = req.query.relatorio

        var inventario, entradas, saidas, movimento, stats

        // inventario, entrada, saida e movimento de estoque
        try {
            if (relatorio == 'inventario') {
                inventario = await app.db('produtos')
                    .leftJoin('unidades', 'produtos.unidade', 'unidades.id')
                    .leftJoin('categorias', 'produtos.categoria', 'categorias.id')
                    .leftJoin('marcas', 'produtos.marca', 'marcas.id')
                    .leftJoin('pessoas', 'produtos.fornecedor', 'pessoas.id')
                    .select(
                        'produtos.*',
                        'unidades.descricao as unidade',
                        'categorias.descricao as categoria',
                        'marcas.nome as marca',
                    )
                    .where(async qb => {
                        if (req.query.produto)
                            qb.where('produtos.id', req.query.produto)
                        if (req.query.data_inicial && req.query.data_final)
                            qb.whereBetween('produtos.data_atualizado', [req.query.data_inicial, req.query.data_final])
                    })
                    .then(async produtos => await Promise.all(withEstoque(produtos)))

                stats = {
                    produtos: await app.db('produtos').count('id').then(produtos => produtos[0].count),
                    ativos: await app.db('produtos').count('id').where({ ativo: true }).then(produtos => produtos[0].count),
                    inativos: await app.db('produtos').count('id').where({ ativo: false }).then(produtos => produtos[0].count),
                    valorEstoque: await app.db('produtos')
                }
            } else if (relatorio == 'entrada') {
                entradas = await app.db('produto_movimento_estoque as pme')
                    .leftJoin('empresas', 'pme.unidade', 'empresas.id_empresa')
                    .leftJoin('produtos', 'pme.categoria', 'produtos.id_produto')
                    .select(
                        'pme.id',
                        'pme.tipo_movimentacao',
                        'pme.data_movimentacao',
                        'pme.quantidade',
                        'pme.origem',
                        'pme.saldo',
                        'pme.custo_medio',
                        'empresas.nome as empresa',
                        'produtos.descricao as produto',
                    )
            } else if (relatorio == 'saida') {
            } else {
            }
        } catch (error) {
            console.log(error.toString())
            return res.status(500).send('Erro na geração do relatório')
        }

        res.json({
            inventario,
            entradas,
            saidas,
            movimento,
            stats
        })
    }

    return { getData }
}