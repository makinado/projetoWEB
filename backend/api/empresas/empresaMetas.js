module.exports = app => {
    const { existsOrError, notExistsOrError, parseNumber } = app.api.validation
    const { formatToBRL } = require('brazilian-values')

    const save = async (req, res) => {
        const meta = { ...req.body }
        if (req.params.id) {
            meta.id = req.params.id
        }

        try {
            existsOrError(meta.id_empresa, 'Informe a empresa da meta')
            existsOrError(meta.nome, 'Informe um nome pra meta')
            existsOrError(meta.tipo_receita_despesa, 'Informe a tipo da meta')
            existsOrError(meta.data, 'Informe a data da meta')
            existsOrError(meta.valor, 'Informe a valor total da meta')

            meta.valor = parseNumber(meta.valor)

            if (meta.valor === '0,00')
                throw 'O valor da meta não pode ser 0,00'

            const metaBD = await app.db('empresa_metas')
                .where({ id_empresa: meta.id_empresa, tipo_receita_despesa: meta.tipo_receita_despesa, data: new Date(meta.data), valor: meta.valor }).first()
            if (!meta.id) {
                notExistsOrError(metaBD, 'Meta com mesma data e valor já cadastrada para esta empresa')
            }
        } catch (e) {
            return res.status(400).send(e.toString())
        }

        meta.janeiro = parseNumber(meta.janeiro)
        meta.fevereiro = parseNumber(meta.fevereiro)
        meta.marco = parseNumber(meta.marco)
        meta.abril = parseNumber(meta.abril)
        meta.maio = parseNumber(meta.maio)
        meta.junho = parseNumber(meta.junho)
        meta.julho = parseNumber(meta.julho)
        meta.agosto = parseNumber(meta.agosto)
        meta.setembro = parseNumber(meta.setembro)
        meta.outubro = parseNumber(meta.outubro)
        meta.novembro = parseNumber(meta.novembro)
        meta.dezembro = parseNumber(meta.dezembro)

        delete meta.concluido_valor
        delete meta.concluido_porc

        if (meta.id)
            app.db('empresa_metas')
                .update(meta)
                .where({ id: meta.id })
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
        else
            app.db('empresa_metas')
                .insert(meta)
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
    }


    const get = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await app.db('empresa_metas').count('id').first()
        const count = parseInt(result.count)

        app.db('empresa_metas')
            .join('empresas', 'empresa_metas.id_empresa', 'empresas.id')
            .select('empresa_metas.id', 'empresa_metas.nome', 'empresas.nome as empresa', 'tipo_receita_despesa', 'data', 'valor')
            .limit(limit).offset(page * limit - limit)
            .orderBy(req.query.order || "empresa_metas.nome", req.query.desc || "asc")
            .where((qb) => {
                if (req.query.nome) {
                    qb.where('empresa_metas.nome', 'ilike', `%${req.query.nome}%`);
                } else if (req.query.id) {
                    qb.orWhere('empresa_metas.id', '=', req.query.id);
                }
            })
            .then(async metas => {
                metas = await Promise.all(metas.map(async m => {
                    if (m.tipo_receita_despesa == 'RECEITA') {
                        const valor_receitas = await app.db('venda').sum('valor_total')
                        m.concluido_valor = valor_receitas[0] ? valor_receitas[0].sum || 0 : 0
                        m.concluido_porc = parseNumber(m.concluido_valor || "0,00", '.') * 100 / parseNumber(m.valor, '.')

                    } else {
                        const valor_despesas = await app.db('financeiro')
                            .sum('valor_total')
                            .having('tipo_conta', '=', 1).having('pago', '=', true)
                            .groupBy('tipo_conta', 'pago')
                        m.concluido_valor = valor_despesas[0] ? valor_despesas[0].sum || 0 : 0
                        m.concluido_porc = parseNumber(m.concluido_valor || "0,00", '.') * 100 / parseNumber(m.valor, '.')
                    }
                    return m
                }))

                res.json({ data: metas, count, limit })
            })
            .catch(e => res.status(500).send(e.message))
    }

    const getById = async (req, res) => {
        app.db('empresa_metas')
            .where({ id: req.params.id }).first()
            .then(metas => res.json(metas))
            .catch(e => res.status(500).send(e))
    }

    const remove = async (req, res) => {
        try {
            const exclusao = await app.db('empresa_metas')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'Meta não encontrada')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getById, remove }
}