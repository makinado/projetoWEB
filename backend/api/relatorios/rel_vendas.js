const moment = require('moment')

const { formatToBRL } = require('brazilian-values')

module.exports = app => {

    const getData = async (req, res) => {
        var vendas, produtos = [], nfs, orcamentos, vendedores, stats, ordem

        switch (req.query.ordem) {
            case 'id':
                if (req.query.relatorio == 'vendedores')
                    ordem = 'comissao.id_venda'
                else ordem = 'id'
                break
            case 'nota_fiscal':
                if (req.query.relatorio == 'vendedores')
                    ordem = 'venda.nota_fiscal'
                else
                    ordem = 'nota_fiscal'
                break
            case 'data':
                if (req.query.relatorio == 'vendedores')
                    ordem = 'comissao.data_comissao'
                else
                    ordem = 'data_criacao'
                break
        }

        try {
            if (req.query.relatorio == 'vendas') {
                vendas = await req.knex('venda')
                    .join('pessoas as cliente', 'venda.id_pessoa', 'cliente.id')
                    .join('empresas', 'venda.id_empresa', 'empresas.id')
                    .join('usuario_vendas', 'venda.id', 'usuario_vendas.id_venda')
                    .join('usuarios', 'usuario_vendas.id_usuario', 'usuarios.id')
                    .leftJoin('pessoas as transportadora', 'venda.id_transportadora', 'transportadora.id')
                    .select('venda.*', 'empresas.nome as empresa', 'cliente.nome as cliente', 'transportadora.nome as transportadora', 'usuarios.nome as usuario')
                    .orderBy(`venda.${ordem || 'id'}`)
                    .where((qb) => {
                        qb.where('venda.tipo', 2)
                        if (req.query.vendedor)
                            qb.where('usuario_vendas.id_usuario', req.query.vendedor)
                        if (req.query.cliente)
                            qb.where('venda.id_pessoa', req.query.cliente)
                        if (req.query.empresa)
                            qb.where('venda.id_empresa', req.query.empresa)
                        if (req.query.nf)
                            qb.where('venda.nota_fiscal', req.query.nf)
                        if (req.query.data_inicial && req.query.data_final)
                            qb.whereBetween('venda.data_criacao', [req.query.data_inicial, req.query.data_final])
                    })
                    .then(vendas => vendas.map(venda => {
                        venda.data_criacao = moment(venda.data_criacao).format('DD/MM/YYYY')
                        venda.data_emissao = moment(venda.data_emissao).format('DD/MM/YYYY')
                        venda.data_contato = moment(venda.data_contato).format('DD/MM/YYYY')
                        venda.data_agendamento = moment(venda.data_agendamento).format('DD/MM/YYYY')

                        return venda
                    }))

                if (req.query.incluirProdutos)
                    produtos = await Promise.all(vendas.map(async venda => {
                        return await req.knex('produto_venda')
                            .join('produtos', 'produto_venda.id_produto', 'produtos.id')
                            .select('produto_venda.*', 'produtos.descricao as produto')
                            .where({ id_venda: venda.id })
                    }))

                console.log(vendas)

                stats = {
                    totalVendas: vendas.length,
                    valorProdutos: formatToBRL(vendas.reduce((total, item) => total + Number(item.valor_produtos), 0)),
                    valorDescontos: formatToBRL(vendas.reduce((total, item) => total + Number(item.valor_descontos), 0) || 0),
                    valorTotal: formatToBRL(vendas.reduce((total, item) => total + Number(item.valor_total), 0))
                }
            } else if (req.query.relatorio == 'vendedores') {
                vendedores = await req.knex('comissao')
                    .join('venda', 'comissao.id_venda', 'venda.id')
                    .leftJoin('financeiro', 'comissao.id_financeiro', 'financeiro.id')
                    .join('usuarios', 'comissao.id_usuario', 'usuarios.id')
                    .join('pessoas', 'venda.id_pessoa', 'pessoas.id')
                    .select('comissao.*', 'usuarios.nome as vendedor', 'pessoas.nome as cliente', 'venda.valor_total', 'venda.nota_fiscal', 'financeiro.valor_parcela', 'financeiro.data_baixa')
                    .orderBy('comissao.id_usuario', `${ordem || 'comissao.id_venda'}`)
                    .where(qb => {
                        if (req.query.vendedor)
                            qb.where('comissao.id_usuario', req.query.vendedor)
                        if (req.query.cliente)
                            qb.where('venda.id_pessoa', req.query.cliente)
                        if (req.query.empresa)
                            qb.where('venda.id_empresa', req.query.empresa)
                        if (req.query.nf)
                            qb.where('venda.nota_fiscal', req.query.nf)
                        if (req.query.data_inicial && req.query.data_final)
                            qb.whereBetween('comissao.data_comissao', [req.query.data_inicial, req.query.data_final])
                    })
                    .then(comissoes => comissoes.map(comissao => {
                        comissao.id = `${comissao.id_venda} | ${comissao.nota_fiscal || 'S/N'}`
                        comissao.data_baixa = comissao.data_baixa ? moment(comissao.data_baixa).format('DD/MM/YYYY') : ""
                        comissao.data_comissao = moment(comissao.data_comissao).format('DD/MM/YYYY')

                        return comissao
                    }))

                stats = {
                    valorTotal: formatToBRL(vendedores.reduce((total, item) => total + Number(item.valor_total), 0)),
                    valorComissoes: formatToBRL(vendedores.reduce((total, item) => total + Number(item.valor_comissao), 0)),
                    quantidade: vendedores.length
                }
            } else if (req.query.relatorio == 'orcamento') {
                orcamentos = await req.knex('venda')
                    .join('pessoas as cliente', 'venda.id_pessoa', 'cliente.id')
                    .join('empresas', 'venda.id_empresa', 'empresas.id')
                    .join('usuario_vendas', 'venda.id', 'usuario_vendas.id_venda')
                    .join('usuarios', 'usuario_vendas.id_usuario', 'usuarios.id')
                    .leftJoin('pessoas as transportadora', 'venda.id_transportadora', 'transportadora.id')
                    .select('venda.*', 'empresas.nome as empresa', 'cliente.nome as cliente', 'transportadora.nome as transportadora', 'usuarios.nome as usuario')
                    .orderBy(`venda.${ordem || 'id'}`)
                    .where((qb) => {
                        qb.where('venda.tipo', 1)
                        if (req.query.vendedor)
                            qb.where('usuario_vendas.id_usuario', req.query.vendedor)
                        if (req.query.cliente)
                            qb.where('venda.id_pessoa', "=", req.query.cliente)
                        if (req.query.empresa)
                            qb.where('venda.id_empresa', "=", req.query.empresa)
                        if (req.query.data_inicial && req.query.data_final)
                            if (req.query.data_type == 'data_criacao')
                                qb.whereBetween('venda.data_criacao', [req.query.data_inicial, req.query.data_final])
                            else if (req.query.data_type == 'data_contato')
                                qb.whereBetween('venda.data_contato', [req.query.data_inicial, req.query.data_final])
                            else
                                qb.whereBetween('venda.data_agendamento', [req.query.data_inicial, req.query.data_final])
                    })
                    .then(orcamentos => orcamentos.map(item => {
                        item.data_criacao = moment(item.data_criacao).format('DD/MM/YYYY')
                        item.data_emissao = moment(item.data_emissao).format('DD/MM/YYYY')
                        item.data_contato = moment(item.data_contato).format('DD/MM/YYYY')
                        item.data_agendamento = moment(item.data_agendamento).format('DD/MM/YYYY')

                        return item
                    }))

                if (req.query.incluirProdutos)
                    produtos = await Promise.all(orcamentos.map(async venda => {
                        return await req.knex('produto_venda')
                            .join('produtos', 'produto_venda.id_produto', 'produtos.id')
                            .select('produto_venda.*', 'produtos.descricao as produto')
                            .where({ id_venda: venda.id })
                    }))

                stats = {
                    totalOrcamentos: orcamentos.length,
                    valorProdutos: formatToBRL(orcamentos.reduce((total, item) => total + Number(item.valor_produtos), 0)),
                    valorDescontos: formatToBRL(orcamentos.reduce((total, item) => total + Number(item.valor_descontos), 0) || 0),
                    valorTotal: formatToBRL(orcamentos.reduce((total, item) => total + Number(item.valor_total), 0))
                }
            }
        } catch (error) {
            console.log(error.toString())
            return res.status(500).send('Erro na geração do relatório')
        }

        return res.json({ vendas, produtos, nfs, orcamentos, vendedores, stats })
    }

    return { getData }
}