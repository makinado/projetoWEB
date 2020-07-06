module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation

    const save = async (req, res) => {
        const marca = { ...req.body }
        if (req.params.id)
            marca.id = req.params.id

        try {
            existsOrError(marca.nome, 'Informe o nome da marca')

            const marcaDB = await req.knex('marcas').where({ nome: marca.nome }).first()
            if (!marca.id) {
                notExistsOrError(marcaDB, 'marca já cadastrada')
            }
        } catch (e) {
            return res.status(400).send(e)
        }

        delete marca.value
        delete marca.text

        if (marca.id) {
            req.knex('marcas')
                .update(marca)
                .where({ id: marca.id })
                .then(_ => res.status(200).send())
                .catch(e => res.status(500).send(e.toString()))
        } else {
            req.knex('marcas')
                .insert(marca)
                .then(_ => res.status(200).send())
                .catch(e => res.status(500).send(e.toString()))
        }
    }

    const get = async (req, res) => {
        req.knex('marcas')
            .then(marcas => res.json(marcas))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getAll = async (req, res) => {
        req.knex('marcas')
            .select('id as value', 'nome as text')
            .then(marcas => res.json(marcas))
            .catch(e => res.status(500).send(e.toString()))
    }

    const remove = async (req, res) => {
        try {
            const exclusao = await req.knex('marcas')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'marca não encontrada')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getAll, remove }
}