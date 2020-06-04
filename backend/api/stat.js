module.exports = app => {
    const get = async (req, res) => {
        try {
            const contasPagar = await app.db('financeiro').sum('valor_total').where({ tipo_conta: 1, pago: false }).whereBetween('financeiro.data_vencimento', [req.query.data_inicial, req.query.data_final])
            const contasReceber = await app.db('financeiro').sum('valor_total').where({ tipo_conta: 2, pago: false }).whereBetween('financeiro.data_vencimento', [req.query.data_inicial, req.query.data_final])
            const vendas = await app.db('venda').count('id').having('data_criacao', '>', req.query.data_inicial).having('data_criacao', '<', req.query.data_final).groupBy('id', 'data_criacao')

            const graficoCadastros = [
                [
                    await app.db('pessoas').count('id').where({ cliente: true }).then(pessoas => pessoas[0].count),
                    await app.db('pessoas').count('id').where({ fornecedor: true }).then(pessoas => pessoas[0].count),
                    await app.db('pessoas').count('id').where({ transportadora: true }).then(pessoas => pessoas[0].count),
                    await app.db('usuarios').count('id').then(usuarios => usuarios[0].count),
                    await app.db('produtos').count('id').then(produtos => produtos[0].count)
                ]
            ]

            // if (req.query.view == 'year') {
            //     req.query.view = 'month'
            // } else {
            //     req.query.view = 'day'
            // }

            // const graficoFinanceiro = [
            //     await app.db('financeiro')
            //         .sum('valor_total')
            //         .where({ tipo_conta: 1 })
            //         .groupByRaw(`date_trunc('${req.query.view || 'month'}', financeiro.data_criacao)`)
            //         .then(contas => contas.map(conta => conta.sum)),
            //     await app.db('financeiro')
            //         .sum('valor_total')
            //         .where({ tipo_conta: 2 })
            //         .groupByRaw(`date_trunc('${req.query.view || 'month'}', financeiro.data_criacao)`)
            //         .then(contas => contas.map(conta => conta.sum))
            // ]

            // console.log(graficoFinanceiro)

            const response = {
                contasPagar: contasPagar[0].sum || 0,
                contasReceber: contasReceber[0].sum || 0,
                vendas: vendas[0] ? vendas[0].count : 0,
                graficoCadastros,
            }

            // console.log(response)

            return res.json(response)

        } catch (e) {
            return res.status(500).send(e.toString())
        }
    }

    return { get }
}