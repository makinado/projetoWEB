const schedule = require('node-schedule')

const knex = require('knex')
const { createConnectionConfig } = require('../../config/connectionManager')

module.exports = (app) => {
    schedule.scheduleJob('0 */4 * * *', async function () {
        let tenants = await app.commonDb('usuarios').select('nome_base')

        const connectionMap =
            tenants
                .map(tenant => {
                    return {
                        [tenant.nome_base]: knex(createConnectionConfig(tenant.nome_base))
                    }
                })
                .reduce((prev, next) => {
                    return Object.assign({}, prev, next);
                }, {});

        for (conn in connectionMap) {
            if (!conn) return

            const hoje = new Date()
            const amanha = new Date(hoje.setDate(hoje.getDate() + 1))

            try {
                const eventos = await conn('eventos_agenda').where({ data: new Date() }).orWhere({ data: amanha, avisar: true })

                conn.batchInsert('notificacoes', eventos.map(e => {
                    if (e.data == amanha && !e.avisar && concluido) return

                    return { titulo: e.descricao, conteudo: e.observacao, link: '/agenda' }
                }))
            } catch (e) {
            }
        }
    })
}