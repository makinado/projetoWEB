module.exports = app => {
    const { existsOrError, notExistsOrError, parseNumber } = app.api.validation
    const { formatToBRL } = require('brazilian-values')

    const save = async (req, res) => {
        const comissao = { ...req.body }
        if (req.params.id) {
            comissao.id = req.params.id
        }

        try {
            existsOrError(comissao.tipo, 'Tipo da comissão não informado')
            existsOrError(comissao.id_usuario, 'Vendedor não informado')
            existsOrError(comissao.perc_comissao, 'Percentual de comissão não informado')

            if (comissao.perc_comissao == '0,00')
                throw 'Percentual de comissão não informado'

            comissao.perc_comissao = parseNumber(comissao.perc_comissao)
            comissao.data = new Date()
        } catch (e) {
            return res.status(400).send(e.toString())
        }

        comissao.perc_representante = parseNumber(comissao.perc_representante)
        delete comissao.usuario

        if (comissao.id)
            app.db('usuario_comissao')
                .update(comissao)
                .where({ id: comissao.id })
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
        else
            app.db('usuario_comissao')
                .insert(comissao)
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
    }

    const get = async (req, res) => {
        app.db('usuario_comissao')
            .join('usuarios', 'usuario_comissao.id_usuario', 'usuarios.id')
            .select('usuario_comissao.id', 'usuarios.nome as usuario', 'data', 'valor')
            .orderBy('usuarios.nome')
            .then(comissoes => res.json(comissoes))
            .catch(e => { console.log(e); res.status(500).send(e) })
    }

    const getById = async (req, res) => {
        app.db('usuario_comissao')
            .join('usuarios', 'usuario_comissao.id_usuario', 'usuarios.id')
            .select('usuario_comissao.*', 'usuarios.nome as usuario')
            .where({ id_usuario: req.params.id })
            .orderBy('usuarios.nome')
            .then(async comissoes => {
                comissoes = comissoes.map(c => {
                    c.perc_comissao = formatToBRL(c.perc_comissao || 0).replace('R$', '') + " %"

                    return c
                })

                res.json(comissoes)
            })
            .catch(e => { console.log(e); res.status(500).send(e.message) })
    }

    const remove = async (req, res) => {
        try {
            const exclusao = await app.db('usuario_comissao')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'comissao não encontrada')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getById, remove }
}