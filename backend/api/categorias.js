module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation

    const save = async (req, res) => {
        const categoria = { ...req.body }

        if (req.params.id)
            categoria.id = req.params.id

        try {
            existsOrError(categoria.tipo, 'Informe tipo da categoria')
            existsOrError(categoria.descricao, 'Informe uma descrição')

            const categoriaDB = await req.knex('categorias').where({ tipo: categoria.tipo, descricao: categoria.descricao }).first()
            if (!categoria.id) {
                notExistsOrError(categoriaDB, 'categoria já cadastrada')
            }

        } catch (e) {
            return res.status(400).send(e.toString())
        }

        delete categoria.value
        delete categoria.text

        if (categoria.id) {
            req.knex('categorias')
                .update(categoria)
                .where({ id: categoria.id })
                .then(_ => res.status(200).send())
                .catch(e => res.status(500).send(e.toString()))
        } else {
            const resProd = await req.knex('categorias')
                .insert(categoria).returning('id')
                .catch(e => res.status(500).send(e.toString()))

            res.status(200).json(resProd)
        }
    }

    const get = async (req, res) => {
        req.knex('categorias').select('id as value', 'descricao as text')
            .then(categorias => res.json(categorias))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getById = async (req, res) => {
        req.knex('categorias')
            .where({ id: req.params.id }).first()
            .then(categoria => res.json(categoria))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getPessoa = async (req, res) => {
        req.knex('categorias')
            .select('id', 'descricao', 'id as value', 'descricao as text')
            .where({ tipo: 1 })
            .then(categorias => res.status(200).send(categorias))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getProduto = async (req, res) => {
        req.knex('categorias')
            .select('id', 'descricao', 'id as value', 'descricao as text')
            .where({ tipo: 2 })
            .then(categorias => res.status(200).send(categorias))
            .catch(e => res.status(500).send(e.toString()))
    }

    const remove = async (req, res) => {
        try {
            const exclusao = await req.knex('categorias')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'Categoria não encontrada')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e)
        }
    }

    return { save, get, getById, getPessoa, getProduto, remove }
}