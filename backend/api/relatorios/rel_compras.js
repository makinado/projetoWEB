const moment = require('moment')

const { formatToBRL } = require('brazilian-values')

module.exports = app => {
    const getData = async (req, res) => {
        var pedidos, produtos = [], compras, analiseCompra, stats, ordem

        switch (req.query.ordem) {
            case 'id':
                ordem = 'id'
                break;
            case 'nota_fiscal':
                ordem = 'nota_fiscal'
                break;
            case 'data':
                ordem = 'data_notafiscal'
                break;
        }

        try {
            if (req.query.relatorio == 'pedidos') {
                pedidos = await req.knex('compra_pedido')
                    .join('pessoas', 'compra_pedido.id_pessoa', 'pessoas.id')
                    .join('empresas', 'compra_pedido.id_empresa', 'empresas.id')
                    .select('compra_pedido.*', 'pessoas.nome as fornecedor', 'empresas.nome as empresa')
                    .orderBy(`compra_pedido.${ordem || 'id'}`)
                    .where((qb) => {
                        if (req.query.situacao && req.query.situacao != 'todos')
                            qb.where('compra_pedido.situacao', '=', req.query.situacao.toUpperCase())
                        if (req.query.fornecedor)
                            qb.where('compra_pedido.id_pessoa', "=", req.query.fornecedor);
                        if (req.query.empresa)
                            qb.where('compra_pedido.id_empresa', "=", req.query.empresa);
                        if (req.query.nf)
                            qb.where('compra_pedido.nota_fiscal', "=", req.query.nf);
                        if (req.query.data_inicial && req.query.data_final)
                            if (req.query.data_type == 'data_lancamento')
                                qb.whereBetween('compra_pedido.data_lancamento', [req.query.data_inicial, req.query.data_final])
                            else
                                qb.whereBetween('compra_pedido.data_pedido', [req.query.data_inicial, req.query.data_final])
                    })
                    .then(pedidos => pedidos.map(ped => {
                        ped.data_pedido = moment(ped.data_pedido).format('DD/MM/YYYY')
                        ped.data_lancamento = moment(ped.data_lancamento).format('DD/MM/YYYY')

                        return ped
                    }))

                if (req.query.incluirProdutos)
                    produtos = await Promise.all(pedidos.map(async ped => {
                        return await req.knex('produto_pedido_compra')
                            .join('produtos', 'produto_pedido_compra.id_produto', 'produtos.id')
                            .select('produto_pedido_compra.*', 'produtos.descricao as produto')
                            .where({ id_pedido: ped.id })
                    }))

                stats = {
                    pendentes: pedidos.filter(ped => ped.situacao == "PENDENTE").length,
                    concluidos: pedidos.filter(ped => ped.situacao == "CONLUÍDO").length,
                    totalPedidos: pedidos.length,
                    valorTotal: formatToBRL(pedidos.reduce((total, item) => total + Number(item.valor_total), 0))
                }
            } else if (req.query.relatorio == 'compras') {
                compras = await req.knex('compra')
                    .join('pessoas', 'compra.id_pessoa', 'pessoas.id')
                    .join('empresas', 'compra.id_empresa', 'empresas.id')
                    .select('compra.*', 'pessoas.nome as fornecedor', 'empresas.nome as empresa')
                    .orderBy(`compra.${ordem || 'id'}`)
                    .where((qb) => {
                        if (req.query.fornecedor)
                            qb.where('compra.id_pessoa', "=", req.query.fornecedor);
                        if (req.query.empresa)
                            qb.where('compra.id_empresa', "=", req.query.empresa);
                        if (req.query.nf)
                            qb.where('compra.nota_fiscal', "=", req.query.nf);
                        if (req.query.data_inicial && req.query.data_final)
                            if (req.query.data_type == 'data_lancamento')
                                qb.whereBetween('compra.data_lancamento', [req.query.data_inicial, req.query.data_final])
                            else
                                qb.whereBetween('compra.data_notafiscal', [req.query.data_inicial, req.query.data_final])
                    })
                    .then(compras => compras.map(ped => {
                        ped.data_notafiscal = moment(ped.data_notafiscal).format('DD/MM/YYYY')
                        ped.data_lancamento = moment(ped.data_lancamento).format('DD/MM/YYYY')

                        return ped
                    }))

                if (req.query.incluirProdutos)
                    produtos = await Promise.all(compras.map(async compra => {
                        return await req.knex('produto_compra')
                            .join('produtos', 'produto_compra.id_produto', 'produtos.id')
                            .select('produto_compra.*', 'produtos.descricao as produto')
                            .where({ id_compra: compra.id })
                    }))

                stats = {
                    quantidade: compras.length,
                    valorTotal: formatToBRL(compras.reduce((total, item) => total + Number(item.valor_total), 0))
                }
            } else if (req.query.relatorio == 'analise de compra') { }
        } catch (error) {
            console.log(error.toString())
            return res.status(500).send('Erro na geração do relatório')
        }

        return res.json({ pedidos, produtos, compras, analiseCompra, stats })
    }

    return { getData }
}