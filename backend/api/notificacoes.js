module.exports = app => {
    const { existsOrError, parseNumber, formatDate } = app.api.validation

    const get = async (req, res) => {
        req.knex('notificacoes')
            .then(notificacoes =>
                res.json(
                    notificacoes.map(n => {
                        remove(n.id)
                        return n
                    })))
            .catch(e => res.status(500).send(e))
    }

    const remove = async (id) => {
        if (!id) return

        await req.knex('notificacoes').where({ id: id }).delete()
    }

    return { get }
}