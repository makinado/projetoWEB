module.exports = app => {

    const save = async (req, res) => {
        const comissao = { ...req.body }
    }

    const get = async (req, res) => {
        app.db('usuario_comissoes')
            .join('usuarios', 'usuario_comissoes.id_usuario', 'usuarios.id')
            .select('usuario_comissoes.id', 'usuarios.nome as usuario', 'data', 'valor')
            .orderBy('usuarios.nome')
            .then(metas => res.json(metas))
            .catch(e => res.status(500).send(e.message))
    }

    const getById = async (req, res) => {
        app.db('usuario_comissoes')
            .join('usuarios', 'usuario_comissoes.id_usuario', 'usuarios.id')
            .select('usuario_comissoes.*', 'usuarios.nome as usuario')
            .where({ id_usuario: req.params.id })
            .orderBy('usuarios.nome')
            .then(async metas => {
                metas = await Promise.all(metas.map(async m => {
                    const valor_vendas = await app.db('venda').sum('valor_total').where({ id_vendedor: m.id_usuario })
                    m.concluido_valor = formatToBRL(valor_vendas.sum || 0)
                    m.concluido_porc = valor_vendas.sum || 0 * 100 / m.valor

                    m.valor = formatToBRL(m.valor)

                    return m
                }))

                res.json(metas)
            })
            .catch(e => { console.log(e); res.status(500).send(e.message) })
    }

    const remove = async (req, res) => {
        try {
            const exclusao = await app.db('usuario_comissoes')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'Meta não encontrada')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getById, remove }
}