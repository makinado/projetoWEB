module.exports = app => {
    const { existsOrError, notExistsOrError, parseNumber } = app.api.validation
    const { formatToBRL } = require('brazilian-values')

    const save = async (req, res) => {
        const meta = { ...req.body }
        if (req.params.id) {
            meta.id = req.params.id
        }

        try {
            existsOrError(meta.id_usuario, 'Vendedor não informado')
            existsOrError(meta.valor, 'Valor da meta não informado')

            if (meta.valor == '0,00')
                throw 'Valor da meta não informado'

            meta.valor = parseNumber(meta.valor)

            const metaBD = await req.knex('usuario_metas')
                .where({ id_usuario: meta.id_usuario, data: new Date(meta.data), valor: meta.valor }).first()
            if (!meta.id) {
                notExistsOrError(metaBD, 'Meta com mesma data e valor já cadastrada para este usuário')
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
        delete meta.usuario
        delete meta.nome
        delete meta.concluido_porc

        if (meta.id)
            req.knex('usuario_metas')
                .update(meta)
                .where({ id: meta.id })
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
        else
            req.knex('usuario_metas')
                .insert(meta)
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
    }

    const get = async (req, res) => {
        req.knex('usuario_metas')
            .join('usuarios', 'usuario_metas.id_usuario', 'usuarios.id')
            .select('usuario_metas.id', 'usuarios.nome as usuario', 'data', 'valor')
            .orderBy('usuarios.nome')
            .then(metas => res.json(metas))
            .catch(e => res.status(500).send(e.message))
    }

    const getById = async (req, res) => {
        req.knex('usuario_metas')
            .join('usuarios', 'usuario_metas.id_usuario', 'usuarios.id')
            .select('usuario_metas.*', 'usuarios.nome as usuario')
            .where({ id_usuario: req.params.id })
            .orderBy('usuarios.nome')
            .then(async metas => {
                metas = await Promise.all(metas.map(async m => {
                    const valor_vendas = await req.knex('venda')
                        .join('usuario_vendas', 'usuario_vendas.id_venda', 'venda.id')
                        .sum('venda.valor_total')
                        .groupBy('id_usuario')
                        .where({ 'usuario_vendas.id_usuario': m.id_usuario })
                    m.concluido_valor = valor_vendas[0] ? valor_vendas[0].sum : 0
                    m.concluido_porc = valor_vendas[0] ? parseNumber(valor_vendas[0].sum || "0,00", '.') * 100 / parseNumber(m.valor, '.') : 0

                    m.valor = formatToBRL(m.valor)

                    return m
                }))

                res.json(metas)
            })
            .catch(e => { console.log(e); res.status(500).send(e) })
    }

    const remove = async (req, res) => {
        try {
            const exclusao = await req.knex('usuario_metas')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'Meta não encontrada')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getById, remove }
}