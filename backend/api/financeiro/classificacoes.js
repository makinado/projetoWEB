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
                    const classificacaoDB = await req.knex('classificacao').where({ tipo: classificacao.tipo, descricao: classificacao.descricao }).first()
                    notExistsOrError(classificacaoDB, 'classificacao já cadastrada')
                } else {
                    const classificacaoDB = await req.knex('classificacao').where({ tipo: classificacao.tipo, descricao: classificacao.descricao, id_pai: classificacao.id_pai }).first()
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
            req.knex('classificacao')
                .update(classificacao)
                .where({ id: classificacao.id })
                .then(_ => res.status(200).send())
                .catch(e => res.status(500).send(e.toString()))
        } else {
            req.knex('classificacao')
                .insert(classificacao)
                .then(_ => res.status(200).send())
                .catch(e => res.status(500).send(e.toString()))
        }
    }

    const withPath = classificacoes => {
        const getParent = (classificacoes, id_pai) => {
            const parent = classificacoes.filter(parent => parent.value === id_pai)
            return parent.length ? parent[0] : null
        }

        const classificacoesWithPath = classificacoes.map(classificacao => {
            let path = classificacao.text
            let parent = getParent(classificacoes, classificacao.id_pai)

            while (parent) {
                path = `${parent.text} > ${path}`
                parent = getParent(classificacoes, parent.id_pai)
            }

            return { ...classificacao, path }
        })

        classificacoesWithPath.sort((a, b) => {
            if (a.path < b.path) return -1
            if (a.path > b.path) return 1
            return 0
        })

        return classificacoesWithPath
    }

    const getAll = async (req, res) => {
        req.knex('classificacao')
            .select('id as value', 'descricao as text', 'id_pai')
            .where(async (qb) => {
                if (req.query.tipo == 1)
                    qb.where('classificacao.tipo', '=', 1);
                else if (req.query.tipo == 2)
                    qb.where('classificacao.tipo', '=', 2);
            })
            .orderBy('descricao')
            .then(classificacoes => res.json(withPath(classificacoes)))
            .catch(e => { console.log(e.toString()); res.status(500).send(e.toString()) })
    }

    const get = async (req, res) => {
        req.knex('classificacao')
            .where(async (qb) => {
                if (req.query.tipo == 1)
                    qb.where('classificacao.tipo', '=', 1);
                if (req.query.tipo == 2)
                    qb.where('classificacao.tipo', '=', 2);
            })
            .orderBy('descricao')
            .then(classificacoes => res.json((classificacoes)))
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
        req.knex('classificacao')
            .where({ id: req.params.id }).first()
            .then(classificacao => res.json(classificacao))
            .catch(e => res.status(500).send(e.toString()))
    }

    const remove = async (req, res) => {
        try {
            req.knex('classificacao').where({ id_pai: req.params.id }).delete()
            const exclusao = await req.knex('classificacao')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'classificacao não encontrada')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    const getTree = (req, res) => {
        req.knex('classificacao')
            .then(classificacao => res.json(toTree(classificacao)))
            .catch(err => res.status(500).send(err))
    }

    return { save, getAll, get, getById, getTree, remove }
}