const { formatToBRL } = require('brazilian-values')

module.exports = app => {
    const { existsOrError, notExistsOrError, parseNumber } = app.api.validation

    const save = async (req, res) => {
        const documento = { ...req.body }
        if (req.params.id)
            documento.id = req.params.id

        try {
            existsOrError(documento.nome, 'Informe o nome do documento')

            const docDB = await req.knex('documentos').where({ nome: documento.nome }).first()
            if (!documento.id) {
                notExistsOrError(docDB, 'documento já cadastrada')
            }
        } catch (e) {
            return res.status(400).send(e)
        }

        delete documento.value
        delete documento.text

        documento.perc_custo = documento.perc_custo ? parseNumber(documento.perc_custo) : 0

        if (documento.id) {
            req.knex('documentos')
                .update(documento)
                .where({ id: documento.id })
                .then(_ => res.status(200).send())
                .catch(e => res.status(500).send(e.toString()))
        } else {
            req.knex('documentos')
                .insert(documento)
                .then(_ => res.status(200).send())
                .catch(e => res.status(500).send(e.toString()))
        }
    }

    const get = async (req, res) => {
        req.knex('documentos')
            .then(docs => res.json(docs))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getAll = async (req, res) => {
        req.knex('documentos')
            .select('id as value', 'nome as text')
            .then(docs => res.json(docs))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getById = async (req, res) => {
        req.knex('documentos')
            .where({ id: req.params.id })
            .first()
            .then(documento => res.json(documento))
            .catch(e => res.status(500).send(e.toString()))
    }

    const remove = async (req, res) => {
        try {
            const exclusao = await req.knex('documentos')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'documento não encontrada')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getAll, getById, remove }
}