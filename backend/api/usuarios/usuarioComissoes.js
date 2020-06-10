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
            existsOrError(comissao.ordem, 'Ordem do vendedor não informada')
            existsOrError(comissao.perc_comissao_vista, 'Percentual de comissão não informado')

            if (comissao.perc_comissao_vista == '0,00')
                throw 'Percentual de comissão não informado'

            const comissaoDB = await app.db('usuario_comissao').select('id').where({ tipo: comissao.tipo, id_usuario: comissao.id_usuario, ordem: comissao.ordem, ativa: true }).first()
            if (!comissao.id) {
                notExistsOrError(comissaoDB, 'Já existe uma comissão ativa com estes dados')
            }
        } catch (e) {
            return res.status(400).send(e.toString())
        }

        const desativarComissao = await app.db('usuario_comissao').select('id_usuario', 'tipo').where({ id_usuario: comissao.id_usuario, ativa: true }).whereNot({ tipo: comissao.tipo }).first()
        if (desativarComissao) {
            await app.db('usuario_comissao').update({ ativa: false }).where({ id_usuario: desativarComissao.id_usuario, tipo: desativarComissao.tipo, ativa: true })
        }

        comissao.perc_comissao_vista = parseNumber(comissao.perc_comissao_vista)
        comissao.perc_comissao_prazo = parseNumber(comissao.perc_comissao_prazo)
        comissao.data = new Date()
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
            .select('usuario_comissao.id', 'usuarios.nome as usuario', 'data', 'perc_comissao_vista', 'valor')
            .orderBy('usuarios.nome')
            .then(comissoes => res.json(comissoes))
            .catch(e => { console.log(e); res.status(500).send(e) })
    }

    const getById = async (req, res) => {
        app.db('usuario_comissao')
            .join('usuarios', 'usuario_comissao.id_usuario', 'usuarios.id')
            .select('usuario_comissao.*', 'usuarios.nome as usuario')
            .where({ id_usuario: req.params.id })
            .orderBy(req.query.order || 'data', req.query.desc || "asc")
            .then(async comissoes => {
                comissoes = comissoes.map(c => {
                    c.perc_comissao_vista = formatToBRL(c.perc_comissao_vista || 0).replace('R$', '') + " %"

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