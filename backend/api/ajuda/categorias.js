module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation

    const save = (req, res) => {
        const category = {
            id: req.body.id,
            nome: req.body.nome,
            id_parent: req.body.id_parent
        }

        if (req.params.id) category.id = req.params.id

        try {
            existsOrError(category.nome, 'Nome não informado')
        } catch (msg) {
            return res.status(400).send(msg)
        }

        if (category.id) {
            app.commonDb('categorias')
                .update(category)
                .where({ id: category.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            app.commonDb('categorias')
                .insert(category)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const remove = async (req, res) => {
        try {
            existsOrError(req.params.id, 'Código da Categoria não informado.')

            const subcategory = await app.commonDb('categorias')
                .where({ id_parent: req.params.id })
            notExistsOrError(subcategory, 'Categoria possui subcategorias.')

            const articles = await app.commonDb('artigos')
                .where({ id_categoria: req.params.id })
            notExistsOrError(articles, 'Categoria possui artigos.')

            const rowsDeleted = await app.commonDb('categorias')
                .where({ id: req.params.id }).del()
            existsOrError(rowsDeleted, 'Categoria não foi encontrada.')

            res.status(204).send()
        } catch (msg) {
            return res.status(400).send(msg.toString())
        }
    }

    const withPath = categorias => {
        const getParent = (categorias, id_parent) => {
            const parent = categorias.filter(parent => parent.id === id_parent)
            return parent.length ? parent[0] : null
        }

        const categoriesWithPath = categorias.map(categoria => {
            let path = categoria.nome
            let parent = getParent(categorias, categoria.id_parent)

            while (parent) {
                path = `${parent.nome} > ${path}`
                parent = getParent(categorias, parent.id_parent)
            }

            return { ...categoria, path }
        })

        categoriesWithPath.sort((a, b) => {
            if (a.path < b.path) return -1
            if (a.path > b.path) return 1
            return 0
        })

        return categoriesWithPath
    }

    const get = (req, res) => {
        app.commonDb('categorias')
            .then(categorias => res.json(withPath(categorias)))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.commonDb('categorias')
            .where({ id: req.params.id })
            .first()
            .then(category => res.json(category))
            .catch(err => res.status(500).send(err))
    }

    const toTree = (categorias, tree) => {
        if (!tree) tree = categorias.filter(c => !c.id_parent)
        tree = tree.map(parentNode => {
            const isChild = node => node.id_parent == parentNode.id
            parentNode.children = toTree(categorias, categorias.filter(isChild))
            return parentNode
        })
        return tree
    }

    const getTree = (req, res) => {
        app.commonDb('categorias')
            .then(categorias => res.json(toTree(categorias)))
            .catch(err => res.status(500).send(err))
    }

    return { save, remove, get, getById, getTree }
}