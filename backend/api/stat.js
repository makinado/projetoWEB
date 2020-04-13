module.exports = app => {
    const Stat = app.mongoose.model('Stat', {
        contasPagar: Number,
        contasReceber: Number,
        vendas: Number,
        createdAt: Date
    })

    const get = async (req, res) => {
        Stat.findOne({}, {}, { sort: { 'createdAt': -1 } })
            .then(stat => {
                const defaultStat = {
                    contasPagar: 0,
                    contasReceber: 0,
                    vendas: 0
                }
                res.json(stat || defaultStat)
            })
            .catch(e => { console.log(e); res.status(500).send(e) })
    }

    return { Stat, get }
}