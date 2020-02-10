const { formatToBRL } = require('brazilian-values')

module.exports = app => {
    const { existsOrError, notExistsOrError, parseNumber } = app.api.validation

    const save = async (req, res) => {
        const documento = { ...req.body }
        if (req.params.id)
            documento.id = req.params.id

        try {
            existsOrError(documento.nome, 'Informe o nome do documento')

            const docDB = await app.db('documentos').where({ nome: documento.nome }).first()
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
            app.db('documentos')
                .update(documento)
                .where({ id: documento.id })
                .then(_ => res.status(200).send())
                .catch(e => res.status(500).send(e.toString()))
        } else {
            app.db('documentos')
                .insert(documento)
                .then(_ => res.status(200).send())
                .catch(e => res.status(500).send(e.toString()))
        }
    }

    const get = async (req, res) => {
        app.db('documentos')
            .then(documentos => {
                documentos = documentos.map(doc => {
                    doc.perc_custo = formatToBRL(doc.perc_custo).replace('R$ ', "") + " %"

                    return doc
                })
                res.json(documentos)
            })
            .catch(e => res.status(500).send(e.toString()))
    }

    const getById = async (req, res) => {
        app.db('documentos')
            .where({ id: req.params.id })
            .first()
            .then(documento => res.json(documento))
            .catch(e => res.status(500).send(e.toString()))
    }

    const remove = async (req, res) => {
        try {
            const exclusao = await app.db('documentos')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'documento não encontrada')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getById, remove }
}