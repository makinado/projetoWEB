const { formatToBRL } = require('brazilian-values')
module.exports = app => {
    const { existsOrError, formatDate, parseNumber } = app.api.validation

    const save = async (req, res) => {
        const movim = { ...req.body }

        try {
            existsOrError(movim.id_empresa, 'Informe a empresa da movimentação')
            existsOrError(movim.id_produto, 'Informe o produto da movimentação')
            existsOrError(movim.quantidade, 'Informe a quantidade da movimentação')
            if (movim.quantidade === '0,00') throw 'Quantidade inválida'
            existsOrError(movim.origem, 'Informe a origem da movimentação')
            existsOrError(movim.data_movimentacao, 'Informe a data da movimentação')

        } catch (e) {
            return res.status(400).send(e.toString())
        }

        movim.quantidade = parseNumber(movim.quantidade)

        app.db('produto_movimento_estoque')
            .insert(movim)
            .then(_ => res.status(204).send())
            .catch(e => res.status(500).send(e.toString()))
    }

    const get = async (req, res) => {
        app.db('produto_movimento_estoque')
            .then(movims => res.json(movims))
            .catch(e => res.status(500).send(e))
    }

    const getById = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await app.db('produto_movimento_estoque').count('id').where({ id_produto: req.params.id }).first()
        const count = parseInt(result.count)

        app.db('produto_movimento_estoque')
            .join('empresas', 'produto_movimento_estoque.id_empresa', 'empresas.id')
            .select(
                'produto_movimento_estoque.id',
                'empresas.nome as empresa',
                'produto_movimento_estoque.tipo_movimentacao',
                'produto_movimento_estoque.origem',
                'produto_movimento_estoque.data_movimentacao',
                'produto_movimento_estoque.quantidade',
                'produto_movimento_estoque.saldo',
                'produto_movimento_estoque.custo_medio'
            )
            .limit(limit).offset(page * limit - limit)
            .where((qb) => {
                qb.where('produto_movimento_estoque.id_produto', '=', req.params.id);
                if (req.query.data_inicial && req.query.data_final) { qb.whereBetween('produto_movimento_estoque.data_movimentacao', [req.query.data_inicial, req.query.data_final]) }
            })
            .orderBy('data_movimentacao')
            .then(movims => res.json({ data: movims, count, limit }))
            .catch(e => {
                console.log(e.toString())
                return res.status(500).send("Erro inesperado")
            })
    }

    const getEstoque = async (req, res) => {
        let estoque = await app.db('produto_estoque')
            .join('empresas', 'produto_estoque.id_empresa', 'empresas.id')
            .join('produtos', 'produto_estoque.id_produto', 'produtos.id')
            .select('empresas.nome as empresa', 'produtos.descricao as produto', 'produtos.valor_custo_medio as valor_custo', 'produtos.unidade as unidade', 'quantidade')
            .where({ id_produto: req.params.id_produto })


        estoque = estoque.map(async estoque => {
            const unidade = await app.db('unidades').select('sigla').where({ id: estoque.unidade }).first()
            estoque.unidade = unidade ? unidade.sigla : ""

            return estoque
        })

        const resultado = await Promise.all(estoque)
        res.json(resultado)
    }

    const remove = async (req, res) => {
        try {
            const movim = await app.db('produto_movimento_estoque')
                .where({ id: req.params.id }).delete()
            existsOrError(movim, 'Movimento não encontrado')

            res.status(200).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getById, getEstoque, remove }
}