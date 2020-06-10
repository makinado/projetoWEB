const queries = require('./queries')

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

            req.query.view = req.query.view == 'year' ? 'month' : 'day'
            const limit = req.query.view == 'month' ? 12 : 31

            const graficoFinanceiro = [
                await app.db
                    .raw(queries.chartFinanc({ view: req.query.view, tipo_conta: 2 }))
                    .then(contas => {
                        const filtered = []
                        for (let i = 0; i < limit; i++) {
                            filtered[i] = contas.rows.find(conta => conta.data_venc == i) || { sum: 0 }
                        }

                        return filtered
                    }),
                await app.db
                    .raw(queries.chartFinanc({ view: req.query.view, tipo_conta: 1 }))
                    .then(contas => {
                        const filtered = []
                        for (let i = 0; i < limit; i++) {
                            filtered[i] = contas.rows.find(conta => conta.data_venc == i) || { sum: 0 }
                        }

                        return filtered
                    })
            ]

            const graficoVendas = [
                await app.db
                    .raw(queries.chartVenda({ view: req.query.view }))
                    .then(vendas => {
                        const filtered = []
                        for (let i = 0; i < limit; i++) {
                            filtered[i] = vendas.rows.find(conta => conta.data_criacao == i) || { sum: 0 }
                        }

                        return filtered
                    })
            ]

            return res.json({
                contasPagar: contasPagar[0].sum || 0,
                contasReceber: contasReceber[0].sum || 0,
                vendas: vendas[0] ? vendas[0].count : 0,
                graficoCadastros,
                graficoFinanceiro,
                graficoVendas
            })

        } catch (e) {
            console.log(e.toString())
            return res.status(500).send('Erro ao buscar gráfico financeiro')
        }
    }

    return { get }
}