const { formatToBRL } = require('brazilian-values')
module.exports = app => {
    const { existsOrError, formatDate, parseNumber } = app.api.validation

    const save = async (req, res) => {
        const movim = { ...req.body }

        try {
            existsOrError(movim.id_empresa, 'Informe a empresa da movimentação')
            existsOrError(movim.valor, 'Informe a valor da movimentação')
            if (movim.valor === 'R$ 0,00') throw 'valor inválido'
            existsOrError(movim.dc, 'Informe o tipo da movimentação')

        } catch (e) {
            return res.status(400).send(e.toString())
        }

        delete movim.saldo_atual
        movim.valor = parseNumber(movim.valor)
        if (!movim.data_lancamento)
            movim.data_lancamento = new Date()

        app.db('conta_movimento')
            .insert(movim)
            .then(_ => res.status(204).send())
            .catch(e => res.status(500).send(e.toString()))
    }

    const get = async (req, res) => {
        app.db('conta_movimento')
            .then(movims => res.json(movims))
            .catch(e => res.status(500).send(e))
    }

    const getById = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await app.db('conta_movimento').count('id').where({ id_conta: req.params.id }).first()
        const count = parseInt(result.count)

        app.db('conta_movimento')
            .join('empresas', 'conta_movimento.id_empresa', 'empresas.id')
            // .join('conta', 'conta_movimento.id_conta', 'conta.id')
            .select(
                'conta_movimento.id',
                'empresas.nome as empresa',
                'conta_movimento.dc',
                'conta_movimento.origem',
                'conta_movimento.data_lancamento',
                'conta_movimento.valor'
            )
            .limit(limit).offset(page * limit - limit)
            .where((qb) => {
                qb.where('conta_movimento.id_conta', '=', req.params.id);
                if (req.query.data_inicial && req.query.data_final) { qb.whereBetween('conta_movimento.data_lancamento', [req.query.data_inicial, req.query.data_final]) }
            })
            .orderBy('data_lancamento')
            .then(movims => res.json({ data: movims, count, limit }))
            .catch(e => {
                console.log(e.toString())
                return res.status(500).send("Erro inesperado")
            })
    }

    const remove = async (req, res) => {
        try {
            const movim = await app.db('conta_movimento')
                .where({ id: req.params.id }).delete()
            existsOrError(movim, 'Movimento não encontrado')

            res.status(200).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getById, remove }
}