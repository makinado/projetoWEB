module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation

    const save = async (req, res) => {
        const produtoCategoria = { ...req.body }
        if (req.params.id)
            produtoCategoria.id = req.params.id

        try {
            existsOrError(produtoCategoria.descricao, 'Informe o percentual de frete do produtoCategoria')
            
            const produtoCategoriaDB = await app.db('produtoCategorias').where({ descricao: produtoCategoria.descricao }).first()
            if (!produtoCategoria.id) {
                notExistsOrError(produtoCategoriaDB, 'ProdutoCategoria já cadastrado')
            }

            existsOrError(produtoCategoria.percSeguro, 'Informe o percentual de seguro do produtoCategoria')
        } catch (e) {
            return res.status(400).send(e)
        }

        delete produtoCategoria.value
        delete produtoCategoria.text

        if (produtoCategoria.id) {
            app.db('produtoCategorias')
                .update(produtoCategoria)
                .where({ id: produtoCategoria.id })
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e))
        } else {
            app.db('produtoCategorias')
                .insert(produtoCategoria)
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e))
        }
    }

    const get = async (req, res) => {
        app.db('produtoCategorias')
            .select('id', 'descricao', 'valorUnitario', 'marca', 'localizacaoEstoque')
            .then(produtoCategorias => res.json(produtoCategorias))
            .catch(e => res.status(500).send(e))
    }

    const getById = async (req, res) => {
        app.db('produtoCategorias')
            .select('id', 'descricao', 'valorUnitario', 'marca', 'localizacaoEstoque')
            .where({ id: req.params.id })
            .first()
            .then(produtoCategoria => res.json(produtoCategoria))
            .catch(e => res.status(500).send(e))
    }

    const getByDesc = async (req, res) => {
        app.db('produtoCategorias')
            .select('id', 'descricao', 'valorUnitario', 'marca', 'localizacaoEstoque')
            .where({ nome: req.params.nome })
            .first()
            .then(produtoCategoria => res.json(produtoCategoria))
            .catch(e => res.status(500).send(e))
    }

    const remove = async (req, res) => {
        try {
            const exclusao = await app.db('produtoCategorias')
                .where({ id: req.params.id })
            existsOrError(exclusao, 'produtoCategoria não encontrada')
        } catch (e) {
            return res.status(400).send(e)
        }
    }

    return { save, get, getById, getByDesc, remove }
}