module.exports = app => {
    const { existsOrError, notExistsOrError, parseNumber } = app.api.validation

    const save = async (req, res) => {
        const metas = Object.values({ ...req.body }) // mantem o que vier como um vetor

        try {
            let meta_valores = []
            metas = metas.map(meta => {
                existsOrError(meta.id_empresa, 'Empresa do vendedor não informada')
                existsOrError(meta.id_pessoa, 'Vendedor não informado')
                existsOrError(meta.valor_total, 'Valor da meta não informado')

                if (meta.total === '0,00')
                    throw 'Valor da meta não informado'

                meta.total = parseFloat(parseNumber(meta.total, ","))

                delete meta.calcular

                // const metaDB = await app.db('meta_vendedor')
                //     .where({
                //         id_empresa: meta.id_empresa,
                //         id_pessoa: meta.id_pessoa,
                //         mes: meta.mes,
                //         ano: meta.ano,
                //     }).first()
                // if (!meta.id) {
                //     notExistsOrError(metaDB, 'Meta já cadastrada para essa empresa')
                // }

                return meta
            })

        } catch (e) {
            return res.status(400).send(e.toString())
        }

        metas.map(async meta => {
            if (meta.id) {
                app.db('meta_vendedor')
                    .update(meta)
                    .where({ id: meta.id })
                    .catch(e => console.log(e.toString()))
            } else {
                let id_meta = app.db('meta_vendedor')
                    .insert(meta).returning('id')
                    .catch(e => console.log(e.toString()))

                let newMeta = {
                    id_meta: id_meta[0],
                    mes: meta.mes,
                    ano: year,
                    valor: parseFloat(parseNumber(meta.valor, ',')),
                    percentual: parseFloat(parseNumber(meta.percentual, ','))
                }
            }
        })
    }

    const get = async (req, res) => {
        app.db({ m: 'meta_vendedor', e: 'empresas' })
            .select('m.id', 'm.id_empresa', 'm.mes', 'm.ano', 'm.valor', { id_empresa: 'e.id' }, { empresa: 'e.nome' })
            .whereRaw('?? = ??', ['e.id', 'm.id_empresa'])
            .then(metas => res.json(metas))
            .catch(e => res.status(500).send(e))
    }

    const getById = async (req, res) => {
        app.db({ m: 'meta_vendedor', e: 'empresas' })
            .select('m.id', 'm.id_empresa', 'm.mes', 'm.ano', 'm.valor', { id_empresa: 'e.id' }, { empresa: 'e.nome' })
            .whereRaw('?? = ??', ['e.id', 'm.id_empresa'])
            .where({ id_pessoa: req.params.id })
            .orderBy('ano')
            .orderBy('mes')
            .then(metas => res.json(metas))
            .catch(e => res.status(500).send(e))
    }

    const remove = async (req, res) => {
        try {
            const exclusao = await app.db('meta_vendedor')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'Meta não encontrada')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getById, remove }
}