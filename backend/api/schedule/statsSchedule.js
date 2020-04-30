const schedule = require('node-schedule')

module.exports = app => {
    // schedule.scheduleJob('*/1 * * * *', async function () {
    //     const contasPagar = await app.db('financeiro').sum('valor_total').where({ tipo_conta: 1, data_vencimento: new Date() })
    //     const contasReceber = await app.db('financeiro').sum('valor_total').where({ tipo_conta: 2, data_vencimento: new Date() })
    //     const vendas = await app.db('venda').count('id').having('data_criacao', '=', new Date()).groupBy('id', 'data_criacao')

    //     const { Stat } = app.api.stat

    //     const lastStat = await Stat.findOne({}, {},
    //         { sort: { 'createdAt': -1 } })

    //     const stat = new Stat({
    //         contasPagar: contasPagar[0].sum,
    //         contasReceber: contasReceber[0].sum,
    //         vendas: vendas[0] ? vendas[0].count : 0,
    //         createdAt: new Date()
    //     })

    //     const changecontasPagar = !lastStat || stat.contasPagar !== lastStat.contasPagar
    //     const changecontasReceber = !lastStat || stat.contasReceber !== lastStat.contasReceber
    //     const changeVendas = !lastStat || stat.vendas !== lastStat.vendas

    //     if (changecontasPagar || changecontasReceber || changeVendas) {
    //         stat.save().then(() => console.log('[Stats] Estatíticas atualizadas!'))
    //     }
    // })
}