const schedule = require('node-schedule')

module.exports = (app) => {
    schedule.scheduleJob('0 */4 * * *', async function () {
    // schedule.scheduleJob('*/1 * * * *', async function () {
        if (!app.db) return

        const hoje = new Date()
        const amanha = new Date(hoje.setDate(hoje.getDate() + 1))

        const eventos = await app.db('eventos_agenda').where({ data: new Date() }).orWhere({ data: amanha, avisar: true })

        app.db.batchInsert('notificacoes', eventos.map(e => {
            if (e.data == amanha && !e.avisar && concluido) return

            return { titulo: e.descricao, conteudo: e.observacao, link: '/agenda' }
        })).then(() => console.log('eventos adicionados em notificacoes'))
    })
}