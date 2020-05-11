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

        const data = new Date()
        movim.data_movimentacao = new Date(movim.data_movimentacao)
        movim.data_movimentacao.setDate(movim.data_movimentacao.getDate() + 1)
        movim.data_movimentacao.setHours(data.getHours())
        movim.data_movimentacao.setMinutes(data.getMinutes())
        movim.data_movimentacao.setSeconds(data.getSeconds())

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
                'produto_movimento_estoque.id_movimentacao',
                'produto_movimento_estoque.origem',
                'produto_movimento_estoque.data_movimentacao',
                'produto_movimento_estoque.quantidade',
                'produto_movimento_estoque.saldo',
                'produto_movimento_estoque.custo_medio',
                'produto_movimento_estoque.observacao'
            )
            .limit(limit).offset(page * limit - limit)
            .where((qb) => {
                qb.where('produto_movimento_estoque.id_produto', '=', req.params.id);
                if (req.query.data_inicial && req.query.data_final) { qb.whereBetween('produto_movimento_estoque.data_movimentacao', [req.query.data_inicial, req.query.data_final]) }
            })
            .orderBy(req.query.orderBy || 'data_movimentacao', req.query.desc || "asc")
            .then(async movims => {
                movims = await Promise.all(movims.map(async m => {
                    m.dados = null
                    if (m.origem == 'COMPRA' && m.id_movimentacao) {
                        m.dados = await app.db('compra')
                            .join('pessoas', 'compra.id_pessoa', 'pessoas.id')
                            .select(
                                'compra.id',
                                'compra.nota_fiscal',
                                'compra.data_lancamento',
                                'pessoas.nome as fornecedor'
                            )
                            .where({ 'compra.id': m.id_movimentacao }).first()
                    } else if (m.origem == 'VENDA' && m.id_movimentacao) {
                        m.dados = await app.db('venda')
                            .join('usuarios as vend', 'venda.id_vendedor', 'usuarios.id')
                            .join('pessoas as cli', 'venda.id_pessoa', 'pessoas.id')
                            .select(
                                'venda.id',
                                'venda.nota_fiscal',
                                'venda.data_criacao',
                                'cli.nome as cliente',
                                'vend.nome as vendedor'
                            )
                            .where({ 'venda.id': m.id_movimentacao }).first()
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

    const getEstoque = async (req, res) => {
        var estoque = await app.db('produto_estoque')
            .join('empresas', 'produto_estoque.id_empresa', 'empresas.id')
            .join('produtos', 'produto_estoque.id_produto', 'produtos.id')
            .leftJoin('unidades', 'produtos.unidade', 'unidades.id')
            .select('empresas.nome as empresa', 'produtos.descricao as produto', 'produtos.valor_custo_medio as valor_custo', 'unidades.sigla as unidade', 'quantidade')
            .where({ id_produto: req.params.id_produto })

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