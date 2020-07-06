module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation

    const save = async (req, res) => {
        const unidade = { ...req.body }

        if (req.params.id)
            unidade.id = req.params.id

        try {
            existsOrError(unidade.sigla, 'Informe a unidades')
            existsOrError(unidade.descricao, 'Informe a unidades')

            const unidadeDB = await req.knex('unidades').where({ sigla: unidade.sigla }).first()
            if (!unidade.id) {
                notExistsOrError(unidadeDB, 'Unidade já cadastrada')
            }
        } catch (e) {
            return res.status(400).send(e.toString())
        }

        delete unidade.value
        delete unidade.text

        if (unidade.id) {
            req.knex('unidades')
                .update(unidade)
                .where({ id: unidade.id })
                .then(_ => res.status(200).send())
                .catch(e => res.status(500).send(e.toString()))
        } else {
            req.knex('unidades')
                .insert(unidade)
                .then(_ => res.status(200).send())
                .catch(e => res.status(500).send(e.toString()))
        }
    }

    const get = async (req, res) => {
        req.knex('unidades')
            .then(unidades => res.json(unidades))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getAll = async (req, res) => {
        req.knex('unidades')
            .select('id as value', 'descricao as text')
            .then(unidades => res.json(unidades))
            .catch(e => res.status(500).send(e.toString()))
    }

    const remove = async (req, res) => {
        try {
            const exclusao = await req.knex('unidades')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'unidade não encontrada')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e)
        }
    }

    return { save, get, getAll, remove }
}