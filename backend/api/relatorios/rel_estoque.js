module.exports = app => {
    const { withEstoque } = app.api.produtos.produtos

    const getData = async (req, res) => {
        const relatorio = req.query.relatorio

        var inventario, entradas, saidas, movimento, stats

        // inventario, entrada, saida e movimento de estoque
        if (relatorio == 'inventario') {
            inventario = await app.db('produtos')
                .leftJoin('unidades', 'produtos.unidade', 'unidades.id')
                .leftJoin('categorias', 'produtos.categoria', 'categorias.id')
                .leftJoin('marcas', 'produtos.marca', 'marcas.id')
                .select(
                    'produtos.id',
                    'produtos.descricao',
                    'valor_unitario',
                    'valor_venda',
                    'valor_custo_medio',
                    'perc_margem_contribuicao',
                    'unidades.descricao as unidade',
                    'categorias.descricao as categoria',
                    'marcas.nome as marca',
                )
                .where(async qb => {
                    if (req.query.produto)
                        qb.where('produtos.id', req.query.produto)
                })
                .catch(e => console.log(e))
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

        inventario = await Promise.all(withEstoque(inventario))

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