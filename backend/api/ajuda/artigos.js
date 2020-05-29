const queries = require('./queries')

module.exports = app => {
    const { existsOrError } = app.api.validation

    const save = (req, res) => {
        const artigo = { ...req.body }
        if (req.params.id) artigo.id = req.params.id

        try {
            existsOrError(artigo.nome, 'Nome não informado')
            existsOrError(artigo.descricao, 'Descrição não informada')
            existsOrError(artigo.id_categoria, 'Categoria não informada')
            existsOrError(artigo.id_usuario, 'Autor não informado')
            existsOrError(artigo.conteudo, 'Conteúdo não informado')
        } catch (msg) {
            return res.status(400).send(msg)
        }

        if (artigo.id) {
            app.dbUsers('artigos')
                .update(artigo)
                .where({ id: artigo.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            app.dbUsers('artigos')
                .insert(artigo)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err.toString()))
        }
    }

    const remove = async (req, res) => {
        try {
            const rowsDeleted = await app.dbUsers('artigos')
                .where({ id: req.params.id }).delete()

            try {
                existsOrError(rowsDeleted, 'Artigo não foi encontrado.')
            } catch (msg) {
                return res.status(400).send(msg)
            }

            res.status(204).send()
        } catch (msg) {
            res.status(500).send(msg)
        }
    }

    const get = async (req, res) => {
        const page = req.query.page || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await app.dbUsers('artigos').count('id').first()
        const count = parseInt(result.count)

        app.dbUsers('artigos')
            .leftJoin('usuarios', 'artigos.id_usuario', 'usuarios.id')
            .select('artigos.id', 'artigos.nome', 'artigos.descricao', 'artigos.image_url', 'usuarios.nome as autor')
            .limit(limit).offset(page * limit - limit)
            .then(articles => res.json({ data: articles, count, limit }))
            .catch(err => { console.log(err); res.status(500).send(err) })
    }

    const getById = (req, res) => {
        app.dbUsers('artigos')
            .where({ id: req.params.id })
            .first()
            .then(artigo => {
                artigo.conteudo = artigo.conteudo.toString()
                return res.json(artigo)
            })
            .catch(err => res.status(500).send(err))
    }

    const getByCategory = async (req, res) => {
        const categoryId = req.params.id
        const page = req.query.page || 1
        const categories = await app.dbUsers.raw(queries.categoryWithChildren, categoryId)
        const ids = categories.rows.map(c => c.id)

        app.dbUsers({ a: 'articles', u: 'users' })
            .select('a.id', 'a.nome', 'a.descricao', 'a.image_url', { author: 'u.nome' })
            .limit(limit).offset(page * limit - limit)
            .whereRaw('?? = ??', ['u.id', 'a.userId'])
            .whereIn('categoryId', ids)
            .orderBy('a.id', 'desc')
            .then(articles => res.json(articles))
            .catch(err => res.status(500).send(err))
    }

    return { save, remove, get, getById, getByCategory }
}