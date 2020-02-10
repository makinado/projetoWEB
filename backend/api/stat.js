module.exports = app => {
    const Stat = app.mongoose.model('Stat', {
        usuarios: Number,
        pessoas: Number,
        produtos: Number,
        createdAt: Date
    })

    const get = (req, res) => {
        Stat.findOne({}, {}, { sort: { 'createdAt' : -1 } })
            .then(stat => {
                const defaultStat = {
                    usuarios: 0,
                    pessoas: 0,
                    produtos: 0
                }
                res.json(stat || defaultStat)
            })
    }

    return { Stat, get }
}