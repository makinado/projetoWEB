// const schedule = require('node-schedule')

// module.exports = app => {
//     schedule.scheduleJob('*/1 * * * *', async function () {
//         const events = await app.db('produtos').count('id').first()

//         const { Stat } = app.api.stat

//         const lastStat = await Stat.findOne({}, {},
//             { sort: { 'createdAt': -1 } })

//         const stat = new Stat({
//             usuarios: usuariosCount.count,
//             pessoas: pessoasCount.count,
//             produtos: produtosCount.count,
//             createdAt: new Date()
//         })

//         const changeUsuarios = !lastStat || stat.usuarios !== lastStat.usuarios
//         const changePessoas = !lastStat || stat.pessoas !== lastStat.pessoas
//         const changeProdutos = !lastStat || stat.produtos !== lastStat.produtos

//         if (changeUsuarios || changePessoas || changeProdutos) {
//             stat.save().then(() => console.log('[Stats] Estatíticas atualizadas!'))
//         }
//     })
// }