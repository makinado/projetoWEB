module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation

    const save = async (req, res) => {
        const comissao = { ...req.body }
        if (req.params.id) {
            comissao.id_pessoa = req.params.id
        }

        try {
            existsOrError(comissao.data, 'Data não informada')
            existsOrError(comissao.perc_comissao, 'Percentual de comissão não informado')
            existsOrError(comissao.perc_representante, 'Percentual de representante não informado')
            existsOrError(comissao.perc_maxdesconto, 'Percentual máximo de desconto não informado')

            const comissaoDB = await app.db('pessoa_comissao')
                .where({data: comissao.data}).first()
            if (!comissao.id) {
                notExistsOrError(comissaoDB, 'comissao já cadastrada para essa empresa')
            }
        } catch (e) {
            return res.status(400).send(e.toString())
        }

        comissao.perc_comissao      = parseFloat(comissao.perc_comissao)
        comissao.perc_representante = parseFloat(comissao.perc_representante)
        comissao.perc_maxdesconto   = parseFloat(comissao.perc_maxdesconto)

        if (comissao.id_pessoa) {
            app.db('pessoa_comissao')
                .update(comissao)
                .where({ id_pessoa: comissao.id_pessoa })
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
        } else {
            app.db('pessoa_comissao')
                .insert(comissao)
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
        }
    }

    const get = async (req, res) => {
        app.db('pessoa_comissao')
            .where({id_pessoa: req.params.id})
            .then(comissoes => res.json(comissoes))
            .catch(e => res.status(500).send(e))
    }

    const getById = async (req, res) => {
        app.db('pessoa_comissao')
            .where({ id_pessoa: req.params.id })
            .orderBy('data')
            .then(comissaos => res.json(comissaos))
            .catch(e => res.status(500).send(e))
    }

    const remove = async (req, res) => {
        try {
            const exclusao = await app.db('pessoa_comissao')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'comissao não encontrada')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getById, remove }
}