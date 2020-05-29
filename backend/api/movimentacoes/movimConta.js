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
                'conta_movimento.id_movimento_origem',
                'conta_movimento.id_movimento_financeiro',
                'conta_movimento.origem',
                'conta_movimento.data_lancamento',
                'conta_movimento.valor',
                'conta_movimento.observacao'
            )
            .limit(limit).offset(page * limit - limit)
            .where((qb) => {
                qb.where('conta_movimento.id_conta', '=', req.params.id);
                if (req.query.data_inicial && req.query.data_final) { qb.whereBetween('conta_movimento.data_lancamento', [req.query.data_inicial, req.query.data_final]) }
            })
            .orderBy('data_lancamento')
            .then(async movims => {
                movims = await Promise.all(movims.map(async m => {
                    m.dados = null
                    if (m.origem == 'COMPRA' && m.id_movimento_origem) {
                        m.dados = await app.db('compra')
                            .join('pessoas', 'compra.id_pessoa', 'pessoas.id')
                            .select(
                                'compra.id',
                                'compra.nota_fiscal',
                                'compra.data_lancamento',
                                'pessoas.nome as fornecedor'
                            )
                            .where({ 'compra.id': m.id_movimento_origem }).first()
                    } else if (m.origem == 'VENDA' && m.id_movimento_origem) {
                        m.dados = await app.db('venda')
                            .join('usuarios', 'venda.id_vendedor', 'usuarios.id')
                            .join('pessoas', 'venda.id_pessoa', 'pessoas.id')
                            .select(
                                'venda.id',
                                'venda.nota_fiscal',
                                'venda.data_criacao',
                                'pessoas.nome as cliente',
                                'usuarios.nome as vendedor'
                            )
                            .where({ 'venda.id': m.id_movimento_origem }).first()
                    } else if (m.origem == 'FINANCEIRO' && m.id_movimento_financeiro) {
                        m.dados = await app.db('financeiro')
                            .join('pessoas', 'financeiro.id_pessoa', 'pessoas.id')
                            .join('documentos', 'financeiro.documento_origem', 'documentos.id')
                            .select(
                                'financeiro.id',
                                'documentos.nome as documento_origem',
                                'financeiro.num_documento_origem',
                                'financeiro.data_baixa',
                                'financeiro.valor_pago',
                                'financeiro.valor_total',
                                'pessoas.nome as pessoa',
                            )
                            .where({ 'financeiro.id': m.id_movimento_financeiro }).first()
                    }
                    return m
                }))

                res.json({ data: movims, count, limit })
            })
            .catch(e => {
                console.log(e.toString())
                return res.status(500).send()
            })
    }

    const remove = async (req, res) => {

        try {
            const origem = await app.db('conta_movimento')
                .where({ id: req.params.id }).first()
            if (origem.id_movimento_origem || origem.id_movimento_financeiro) throw 'Há movimentos associados a este registro'
        } catch (e) {
            return res.status(400).send(e)
        }

        try {
            const movim = await app.db('conta_movimento')
                .where({ id: req.params.id }).delete()
            existsOrError(movim, 'Movimento não encontrado')

            res.status(200).send()
        } catch (e) {
            return res.status(500).send(e.toString())
        }
    }

    return { save, get, getById, remove }
}