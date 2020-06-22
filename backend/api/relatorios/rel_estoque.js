const queries = require('../queries')
const moment = require('moment')

const { formatToBRL } = require('brazilian-values')

module.exports = app => {
    const { withEstoque } = app.api.produtos.produtos

    const getData = async (req, res) => {
        const relatorio = req.query.relatorio

        var inventario, entradas, saidas, movimento, stats

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
                    .orderBy(req.query.ordem = 'id' ? 'produtos.id' : '')
                    .orderBy(req.query.ordem = 'descricao' ? 'produtos.descricao' : '')
                    .orderBy(req.query.ordem = 'data' ? 'produtos.data_atualizado' : '')
                    .where(async qb => {
                        if (req.query.produto)
                            qb.where('produtos.id', req.query.produto)
                        if (req.query.pessoa)
                            qb.where('produtos.fornecedor', req.query.pessoa)
                        if (req.query.categoria)
                            qb.where('produtos.categoria', req.query.categoria)
                        if (req.query.marca)
                            qb.where('produtos.marca', req.query.marca)
                        if (req.query.unidade)
                            qb.where('produtos.unidade', req.query.unidade)

                        if (req.query.data_inicial && req.query.data_final)
                            qb.whereBetween('produtos.data_atualizado', [req.query.data_inicial, req.query.data_final])
                    })
                    .then(async produtos => await Promise.all(withEstoque(produtos)))

                stats = {
                    produtos: inventario.length,
                    ativos: inventario.filter(item => item.ativo).length,
                    inativos: inventario.filter(item => !item.ativo).length,
                    valorEstoque: await app.db.raw(queries.valorEstoque()).then(result => result.rows.map(item => item.total)[0])
                }
            } else if (relatorio == 'entradas') {
                entradas = await app.db('produto_movimento_estoque as pme')
                    .join('empresas', 'pme.id_empresa', 'empresas.id')
                    .join('produtos', 'pme.id_produto', 'produtos.id')
                    .leftJoin('unidades', 'produtos.unidade', 'unidades.id')
                    .leftJoin('categorias', 'produtos.categoria', 'categorias.id')
                    .leftJoin('marcas', 'produtos.marca', 'marcas.id')
                    .leftJoin('pessoas', 'produtos.fornecedor', 'pessoas.id')
                    .select(
                        'pme.*',
                        'empresas.nome as empresa',
                        'produtos.descricao as produto',
                        'unidades.descricao as unidade',
                        'categorias.descricao as categoria',
                        'marcas.nome as marca',
                    )
                    .orderBy(req.query.ordem = 'id' ? 'pme.id' : '')
                    .orderBy(req.query.ordem = 'descricao' ? 'produtos.descricao' : '')
                    .orderBy(req.query.ordem = 'data' ? 'pme.data_movimentacao' : '')
                    .where(qb => {
                        qb.where('pme.tipo_movimentacao', 0)
                        if (req.query.empresa)
                            qb.where('pme.id_empresa', req.query.empresa)
                        if (req.query.produto)
                            qb.where('pme.id_produto', req.query.produto)
                        if (req.query.pessoa)
                            qb.where('produtos.fornecedor', req.query.pessoa)
                        if (req.query.categoria)
                            qb.where('produtos.categoria', req.query.categoria)
                        if (req.query.marca)
                            qb.where('produtos.marca', req.query.marca)
                        if (req.query.unidade)
                            qb.where('produtos.unidade', req.query.unidade)

                        if (req.query.data_inicial && req.query.data_final)
                            qb.whereBetween('pme.data_movimentacao', [req.query.data_inicial, req.query.data_final])
                    })
                    .then(entradas => entradas.map(e => {
                        e.data_movimentacao = moment(e.data_movimentacao).format('DD/MM/YYYY')
                        return e
                    }))

                stats = {
                    quantidadeEntradas: entradas.length,
                    quantidadeMovimento: entradas.reduce((total, entrada) => total + Number(entrada.quantidade), 0),
                    valorEntradas: formatToBRL(entradas.reduce((total, entrada) => total + Number(entrada.total), 0))
                }
            } else if (relatorio == 'saidas') {
                saidas = await app.db('produto_movimento_estoque as pme')
                    .join('empresas', 'pme.id_empresa', 'empresas.id')
                    .join('produtos', 'pme.id_produto', 'produtos.id')
                    .leftJoin('unidades', 'produtos.unidade', 'unidades.id')
                    .leftJoin('categorias', 'produtos.categoria', 'categorias.id')
                    .leftJoin('marcas', 'produtos.marca', 'marcas.id')
                    .leftJoin('pessoas', 'produtos.fornecedor', 'pessoas.id')
                    .select(
                        'pme.*',
                        'empresas.nome as empresa',
                        'produtos.descricao as produto',
                        'unidades.descricao as unidade',
                        'categorias.descricao as categoria',
                        'marcas.nome as marca',
                    )
                    .orderBy(req.query.ordem = 'id' ? 'pme.id' : '')
                    .orderBy(req.query.ordem = 'descricao' ? 'produtos.descricao' : '')
                    .orderBy(req.query.ordem = 'data' ? 'pme.data_movimentacao' : '')
                    .where(qb => {
                        qb.where('pme.tipo_movimentacao', 1)
                        if (req.query.empresa)
                            qb.where('pme.id_empresa', req.query.empresa)
                        if (req.query.produto)
                            qb.where('pme.id_produto', req.query.produto)
                        if (req.query.pessoa)
                            qb.where('produtos.fornecedor', req.query.pessoa)
                        if (req.query.categoria)
                            qb.where('produtos.categoria', req.query.categoria)
                        if (req.query.marca)
                            qb.where('produtos.marca', req.query.marca)
                        if (req.query.unidade)
                            qb.where('produtos.unidade', req.query.unidade)

                        if (req.query.data_inicial && req.query.data_final)
                            qb.whereBetween('pme.data_movimentacao', [req.query.data_inicial, req.query.data_final])
                    })
                    .then(saidas => saidas.map(e => {
                        e.data_movimentacao = moment(e.data_movimentacao).format('DD/MM/YYYY')
                        return e
                    }))

                stats = {
                    quantidadeSaidas: saidas.length,
                    quantidadeMovimento: saidas.reduce((total, saida) => total + Number(saida.quantidade), 0),
                    valorSaidas: formatToBRL(saidas.reduce((total, saida) => total + Number(saida.total), 0))
                }
            } else {
                movimento = await app.db('produto_movimento_estoque as pme')
                    .join('empresas', 'pme.id_empresa', 'empresas.id')
                    .join('produtos', 'pme.id_produto', 'produtos.id')
                    .leftJoin('unidades', 'produtos.unidade', 'unidades.id')
                    .leftJoin('categorias', 'produtos.categoria', 'categorias.id')
                    .leftJoin('marcas', 'produtos.marca', 'marcas.id')
                    .leftJoin('pessoas', 'produtos.fornecedor', 'pessoas.id')
                    .select(
                        'pme.*',
                        'empresas.nome as empresa',
                        'produtos.descricao as produto',
                        'unidades.descricao as unidade',
                        'categorias.descricao as categoria',
                        'marcas.nome as marca',
                    )
                    .orderBy(req.query.ordem = 'id' ? 'pme.id' : '')
                    .orderBy(req.query.ordem = 'descricao' ? 'produtos.descricao' : '')
                    .orderBy(req.query.ordem = 'data' ? 'pme.data_movimentacao' : '')
                    .where(qb => {
                        if (req.query.empresa)
                            qb.where('pme.id_empresa', req.query.empresa)
                        if (req.query.produto)
                            qb.where('pme.id_produto', req.query.produto)
                        if (req.query.pessoa)
                            qb.where('produtos.fornecedor', req.query.pessoa)
                        if (req.query.categoria)
                            qb.where('produtos.categoria', req.query.categoria)
                        if (req.query.marca)
                            qb.where('produtos.marca', req.query.marca)
                        if (req.query.unidade)
                            qb.where('produtos.unidade', req.query.unidade)

                        if (req.query.data_inicial && req.query.data_final)
                            qb.whereBetween('pme.data_movimentacao', [req.query.data_inicial, req.query.data_final])
                    })
                    .then(movimento => movimento.map(e => {
                        e.data_movimentacao = moment(e.data_movimentacao).format('DD/MM/YYYY')
                        return e
                    }))

                stats = {
                    quantidadeMovimento: movimento.length,
                    quantidadeSaidas: movimento.reduce((total, entrada_saida) => entrada_saida.tipo_movimentacao == 1 ? total + Number(entrada_saida.quantidade) : total, 0),
                    quantidadeEntradas: movimento.reduce((total, entrada_saida) => entrada_saida.tipo_movimentacao == 0 ? total + Number(entrada_saida.quantidade) : total, 0),

                    valorSaidas: formatToBRL(movimento.reduce((total, entrada_saida) => entrada_saida.tipo_movimentacao == 1 ? total + Number(entrada_saida.total) : total, 0)),
                    valorEntradas: formatToBRL(movimento.reduce((total, entrada_saida) => entrada_saida.tipo_movimentacao == 0 ? total + Number(entrada_saida.total) : total, 0)),
                    saldo: formatToBRL(movimento.reduce((total, entrada_saida) => entrada_saida.tipo_movimentacao == 0 ? total + Number(entrada_saida.total) : total - Number(entrada_saida.total), 0))
                }
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