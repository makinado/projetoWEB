module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation

    const save = async (req, res) => {
        const classificacao = { ...req.body }

        if (req.params.id)
            classificacao.id = req.params.id

        try {
            existsOrError(classificacao.tipo, 'Informe tipo da classificacao')
            existsOrError(classificacao.descricao, 'Informe uma descrição')

            if (!classificacao.id) {
                if (!classificacao.id_pai) {
                    const classificacaoDB = await app.db('classificacao').where({ tipo: classificacao.tipo, descricao: classificacao.descricao }).first()
                    notExistsOrError(classificacaoDB, 'classificacao já cadastrada')
                } else {
                    const classificacaoDB = await app.db('classificacao').where({ tipo: classificacao.tipo, descricao: classificacao.descricao, id_pai: classificacao.id_pai }).first()
                    notExistsOrError(classificacaoDB, 'classificacao já cadastrada')
                }
            }

        } catch (e) {
            return res.status(400).send(e.toString())
        }

        delete classificacao.value
        delete classificacao.text
        delete classificacao.children

        if (classificacao.id) {
            app.db('classificacao')
                .update(classificacao)
                .where({ id: classificacao.id })
                .then(_ => res.status(200).send())
                .catch(e => res.status(500).send(e.toString()))
        } else {
            app.db('classificacao')
                .insert(classificacao)
                .then(_ => res.status(200).send())
                .catch(e => res.status(500).send(e.toString()))
        }
    }

    const getAll = async (req, res) => {
        app.db('classificacao')
            .select('id as value', 'descricao as text')
            .where(async (qb) => {
                if (req.query.tipo == 1)
                    qb.where('classificacao.tipo', '=', 1);
                else if (req.query.tipo == 2)
                    qb.where('classificacao.tipo', '=', 2);
            })
            .orderBy('descricao')
            .then(classificacoes => { res.json(classificacoes) })
            .catch(e => { console.log(e.toString()); res.status(500).send(e.toString()) })
    }

    const get = async (req, res) => {
        app.db('classificacao')
            .where(async (qb) => {
                if (req.query.tipo == 1)
                    qb.where('classificacao.tipo', '=', 1);
                if (req.query.tipo == 2)
                    qb.where('classificacao.tipo', '=', 2);
            })
            .orderBy('descricao')
            .then(classificacoes => res.json(classificacoes))
            .catch(e => { console.log(e.toString()); res.status(500).send(e.toString()) })
    }

    const toTree = (classificacoes, tree) => {
        if (!tree) tree = classificacoes.filter(c => !c.id_pai)
        tree = tree.map(parentNode => {
            const isChild = node => node.id_pai == parentNode.id

            parentNode.children = toTree(classificacoes, classificacoes.filter(isChild))
            return parentNode
        })
        return tree
    }

    const getById = async (req, res) => {
        app.db('classificacao')
            .where({ id: req.params.id }).first()
            .then(classificacao => res.json(classificacao))
            .catch(e => res.status(500).send(e.toString()))
    }

    const remove = async (req, res) => {
        try {
            app.db('classificacao').where({ id_pai: req.params.id }).delete()
            const exclusao = await app.db('classificacao')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'classificacao não encontrada')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    const getTree = (req, res) => {
        app.db('classificacao')
            .then(classificacao => res.json(toTree(classificacao)))
            .catch(err => res.status(500).send(err))
    }

    return { save, getAll, get, getById, getTree, remove }
}