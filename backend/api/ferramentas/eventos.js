module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation

    const save = async (req, res) => {
        const evento = { ...req.body }

        if (req.params.id)
            evento.id = req.params.id

        try {
            existsOrError(evento.descricao, 'Informe uma descrição')
            existsOrError(evento.data, 'Informe uma data')
            existsOrError(evento.tipo, 'Informe o tipo do evento')
            if (evento.tipo === 'Hora') {
                existsOrError(evento.hora, 'Informe a hora do evento')
            }

            if (evento.hora) {
                const eventoDB = await app.db('eventos_agenda').where({ descricao: evento.descricao, data: evento.data, hora: evento.hora }).first()
                if (!evento.id) {
                    notExistsOrError(eventoDB, 'evento já cadastrado')
                }
            } else {
                const eventoDB = await app.db('eventos_agenda').where({ descricao: evento.descricao, data: evento.data }).first()
                if (!evento.id) {
                    notExistsOrError(eventoDB, 'evento já cadastrado')
                }
            }

        } catch (e) {
            return res.status(400).send(e.toString())
        }

        if (evento.id) {
            app.db('eventos_agenda')
                .update(evento)
                .where({ id: evento.id })
                .then(_ => res.status(200).send())
                .catch(e => res.status(500).send(e.toString()))
        } else {
            const resProd = await app.db('eventos_agenda')
                .insert(evento).returning('id')
                .catch(e => res.status(500).send(e.toString()))

            res.status(200).json(resProd)
        }
    }

    const get = async (req, res) => {
        let eventos = await app.db('eventos_agenda')
            .catch(e => res.status(500).send(e.toString()))

        eventos = eventos.map(evento => {
            evento.data = evento.data.toISOString().substr(0, 10)
            return evento
        })

        const resultado = await Promise.all(eventos);

        res.json(resultado);
    }

    const getById = async (req, res) => {
        let evento = await app.db('eventos_agenda')
            .where({ id: req.params.id }).first()
            .catch(e => res.status(500).send(e))

        try {
            evento.data = evento.data.toISOString().substr(0, 10)
            res.json(evento);
        } catch (e) {
            res.status(500).send(e.toString())
        }

    }

    const remove = async (req, res) => {
        try {
            const exclusao = await app.db('eventos_agenda')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'evento não encontrado')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getById, remove }
}