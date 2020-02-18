module.exports = app => {
    const { existsOrError, notExistsOrError, parseNumber } = app.api.validation

    const save = async (req, res) => {
        const meta = { ...req.body }
        if (req.params.id) {
            meta.id = req.params.id
        }

        try {
            existsOrError(meta.id_empresa, 'Informe a empresa da meta')
            existsOrError(meta.tipo_receita_despesa, 'Informe a tipo da meta')
            existsOrError(meta.data, 'Informe a data da meta')
            existsOrError(meta.valor_total, 'Informe a valor total da meta')

            if (meta.valor_total === '0,00')
                throw 'O valor da meta não pode ser 0,00'

            meta.valor_total = parseFloat(parseNumber(meta.valor_total))

            const metaBD = await app.db('meta_empresa')
                .where({ id_empresa: meta.id_empresa, tipo_receita_despesa: meta.tipo_receita_despesa, valor_total: meta.valor_total }).first()
            if (!meta.id) {
                notExistsOrError(metaBD, 'Meta já cadastrada')
            }
        } catch (e) {
            return res.status(400).send(e.toString())
        }

        const metaAnual = meta.metaAnual
        delete meta.metaAnual

        const data = new Date().toISOString().substr(0, 10)
        const [year, month, day] = data.split('-')

        meta.data += '-' + day

        if (meta.id) {
            app.db('meta_empresa')
                .update(meta)
                .where({ id: meta.id })
                .then(async _ => {
                    await app.db('meta_empresa_valores').where({ id_meta: meta.id }).delete()

                    metaAnual.map(metaAnual => {
                        let newMeta = {
                            id_meta: meta.id,
                            mes: metaAnual.mes,
                            ano: year,
                            valor: parseFloat(parseNumber(metaAnual.valor)),
                            percentual: parseFloat(parseNumber(metaAnual.percentual))
                        }

                        app.db('meta_empresa_valores')
                            .insert(newMeta)
                            .catch(e => console.log(e.toString()))
                    })
                    res.status(204).send()
                })
                .catch(e => res.status(500).send(e.toString()))
        } else {
            const id_meta = await app.db('meta_empresa')
                .insert(meta).returning('id')
                .catch(e => res.status(500).send(e.toString()))

            metaAnual.map(meta => {
                let newMeta = {
                    id_meta: id_meta[0],
                    mes: meta.mes,
                    ano: year,
                    valor: parseFloat(parseNumber(meta.valor)),
                    percentual: parseFloat(parseNumber(meta.percentual))
                }

                app.db('meta_empresa_valores')
                    .insert(newMeta)
                    .catch(e => console.log(e.toString()))
            })
            res.status(204).send()
        }
    }


    const get = async (req, res) => {
        let metas = await app.db('meta_empresa').select('id', 'id_empresa', 'tipo_receita_despesa', 'valor_total')
            .catch(e => res.status(500).send(e.toString()))

        metas = metas.map(async meta => {
            meta.empresa = await app.db('empresas').select('nome').where({ id: meta.id_empresa }).first();
            meta.empresa = meta.empresa.nome
            return meta;
        })

        const result = await Promise.all(metas)

        res.json(result)
    }

    const getById = async (req, res) => {
        app.db('meta_empresa')
            .where({ id: req.params.id })
            .first()
            .then(empresaMeta => res.json(empresaMeta))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getTelaMetas = async (req, res) => {
        if (req.params.id) {
            const meta = await app.db('meta_empresa')
                .where({ id: req.params.id }).first()
                .catch(e => res.status(500).send(e.toString()))
            const pessoas = await app.db('pessoas').select('id', 'nome').where({ vendedor: true })
                .catch(e => res.status(500).send(e.toString()))

            meta.metaAnual = await app.db('meta_empresa_valores')
                .where({ id_meta: meta.id })
                .catch(e => res.status(500).send(e.toString()))

            const tela = {
                meta,
                pessoas
            }


            res.json(tela)
        } else {
            const pessoas = await app.db('pessoas').select('id', 'nome').where({ vendedor: true })
                .catch(e => res.status(500).send(e.toString()))

            const tela = {
                pessoas
            }

            res.json(tela)
        }
    }

    const remove = async (req, res) => {
        try {
            const exclusao = await app.db('meta_empresa')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'Meta não encontrada')

            res.status(204).send()
        } catch (e) {
            console.log(e.toString())
            return res.status(500).send("Erro durante a exclusão")
        }
    }

    return { save, get, getById, getTelaMetas, remove }
}