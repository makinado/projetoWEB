const queries = require('./queries')

module.exports = () => {
    const get = async (req, res) => {
        try {
            const contasPagar = await req.knex('financeiro').sum('valor_total').where({ tipo_conta: 1, pago: false }).whereBetween('financeiro.data_vencimento', [req.query.data_inicial, req.query.data_final])
            const contasReceber = await req.knex('financeiro').sum('valor_total').where({ tipo_conta: 2, pago: false }).whereBetween('financeiro.data_vencimento', [req.query.data_inicial, req.query.data_final])
            const vendas = await req.knex('venda').count('id').whereBetween('venda.data_criacao', [req.query.data_inicial, req.query.data_final]).groupBy('id', 'data_criacao')

            return res.json({
                contasPagar: contasPagar[0].sum || 0,
                contasReceber: contasReceber[0].sum || 0,
                vendas: vendas[0] ? vendas[0].count : 0,
            })

        } catch (e) {
            console.log(e.toString())
            return res.status(500).send('Erro ao buscar dados estatísticos')
        }
    }

    const getGraficoFluxoCaixa = async (req, res) => {
        req.query.view = req.query.view == 'year' ? 'month' : 'day'
        const limit = req.query.view == 'month' ? 12 : 31

        try {
            req.knex.raw(queries.chartFluxoCaixa({ view: req.query.view }))
                .then(contas => {

                    const entradas = []
                    for (let i = 0; i < limit; i++) {
                        entradas[i] = contas.rows.find(conta => conta.data_lanc == i && conta.dc == 'C') || { sum: 0 }
                    }

                    const saidas = []
                    for (let i = 0; i < limit; i++) {
                        saidas[i] = contas.rows.find(conta => conta.data_lanc == i && conta.dc == 'D') || { sum: 0 }
                    }

                    res.json([entradas, saidas])
                })
        } catch (e) {
            console.log(e)
            res.status(500).send("Não foi possivel buscar os dados do gráfico de fluxo de caixa")
        }
    }

    const getGraficoFinanceiro = async (req, res) => {
        req.query.view = req.query.view == 'year' ? 'month' : 'day'
        const limit = req.query.view == 'month' ? 12 : 31

        try {
            const graficoFinanceiro = [
                await req.knex
                    .raw(queries.chartFinanc({ view: req.query.view, empresa: req.query.empresa, tipo_conta: 2 }))
                    .then(contas => {
                        const filtered = []
                        for (let i = 0; i < limit; i++) {
                            filtered[i] = contas.rows.find(conta => conta.data_venc == i) || { sum: 0 }
                        }

                        return filtered
                    }),
                await req.knex
                    .raw(queries.chartFinanc({ view: req.query.view, empresa: req.query.empresa, tipo_conta: 1 }))
                    .then(contas => {
                        const filtered = []
                        for (let i = 0; i < limit; i++) {
                            filtered[i] = contas.rows.find(conta => conta.data_venc == i) || { sum: 0 }
                        }

                        return filtered
                    })
            ]

            res.json(graficoFinanceiro)
        } catch (e) {
            console.log(e)
            res.status(500).send("Não foi possivel buscar os dados do gráfico financeiro")
        }
    }

    const getGraficoPerformace = async (req, res) => {
        req.query.view = req.query.view == 'year' ? 'month' : 'day'
        const limit = req.query.view == 'month' ? 12 : 31
        try {
            const graficoPerformace = [
                await req.knex
                    .raw(queries.performanceVendas({ view: req.query.view }))
                    .then(vendas => {

                        const filtered = []
                        for (let i = 0; i < limit; i++) {
                            filtered[i] = vendas.rows.find(conta => conta.vardata == i) || { sum: 0 }
                        }

                        return filtered
                    }),
                await req.knex
                    .raw(queries.performanceCompras({ view: req.query.view }))
                    .then(compras => {
                        const filtered = []
                        for (let i = 0; i < limit; i++) {
                            filtered[i] = compras.rows.find(conta => conta.vardata == i) || { sum: 0 }
                        }

                        return filtered
                    }),
            ]

            res.json(graficoPerformace)
        } catch (e) {
            console.log(e)
            res.status(500).send("Não foi possivel buscar os dados do gráfico de performance")
        }
    }

    const getGraficoCadastros = async (req, res) => {
        try {
            const graficoCadastros = [
                await req.knex('pessoas').count('id').where({ cliente: true }).then(pessoas => pessoas[0].count),
                await req.knex('pessoas').count('id').where({ fornecedor: true }).then(pessoas => pessoas[0].count),
                await req.knex('pessoas').count('id').where({ transportadora: true }).then(pessoas => pessoas[0].count),
                await req.knex('usuarios').count('id').then(usuarios => usuarios[0].count),
                await req.knex('produtos').count('id').then(produtos => produtos[0].count)
            ]

            res.json(graficoCadastros)
        } catch (e) {
            console.log(e)
            res.status(500).send("Não foi possivel buscar os dados do gráfico de cadastros")
        }
    }

    const getGraficoClassificacoes = async (req, res) => {
        try {
            const graficoClassificacoes = [
            ]

            res.json(graficoClassificacoes)
        } catch (e) {
            console.log(e)
            res.status(500).send("Não foi possivel buscar os dados do gráfico de classificações das contas")
        }
    }

    const getCampeoes = async (req, res) => {
        try {
            const campeoes = {
                clientes: await req.knex.raw(queries.clientesCampeoes()).then(res => res.rows),
                produtos: await req.knex.raw(queries.produtosCampeoes()).then(res => res.rows),
                usuarios: await req.knex.raw(queries.usuariosCampeoes()).then(res => res.rows)
            }

            return res.json(campeoes)
        } catch (e) {
            console.log(e)
            res.status(500).send('Erro ao buscar os campeões')
        }
    }

    return {
        get,
        getGraficoFluxoCaixa,
        getGraficoCadastros,
        getGraficoFinanceiro,
        getGraficoPerformace,
        getGraficoClassificacoes,
        getCampeoes
    }
}