module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation

    const save = async (req, res) => {
        const perfil = { ...req.body }
        if (req.params.id)
            perfil.id = req.params.id

        try {
            existsOrError(perfil.descricao, 'Informe uma descrição')

            const perfilDB = await req.knex('perfil').where({ descricao: perfil.descricao }).first()
            if (!perfil.id) {
                notExistsOrError(perfilDB, 'Perfil já cadastrado')
            }

        } catch (e) {
            return res.status(400).send(e.toString())
        }

        delete perfil.text
        delete perfil.value

        if (perfil.id) {
            req.knex('perfil')
                .update(perfil)
                .where({ id: perfil.id })
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
        } else {
            req.knex('perfil')
                .insert(perfil)
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
        }
    }

    const get = async (req, res) => {
        req.knex('perfil')
            .then(perfis => res.json(perfis))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getById = async (req, res) => {
        req.knex('perfil')
            .where({ id: req.params.id }).first()
            .then(perfil => res.json(perfil))
            .catch(e => res.status(500).send(e.toString()))
    }

    const remove = async (req, res) => {
        try {
            const usuario = await app.commonDb('usuarios').select('id').where({ id_perfil: req.params.id })
            notExistsOrError(usuario, 'Há usuários com este perfil')

            const perfil = await req.knex('perfil')
                .where({ id: req.params.id }).delete()
            existsOrError(perfil, 'Perfil não encontrado')

            res.status(204).send()
        } catch (msg) {
            res.status(400).send(msg.toString())
        }
    }

    return { save, get, getById, remove }
}