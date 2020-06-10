module.exports = app => {
    const getById = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await app.db('comissao').count('id_usuario').where({ id_usuario: req.params.id_usuario }).first()
        const count = parseInt(result.count)

        console.log(req.query)

        app.db('comissao')
            .join('usuarios', 'comissao.id_usuario', 'usuarios.id')
            .select('comissao.*', 'usuarios.nome as usuario')
            .limit(limit).offset(page * limit - limit)
            .where(qb => {
                if (!req.query.buscarTodos) {
                    qb.where('comissao.id_usuario', '=', req.params.id_usuario);
                }
                if (req.query.id_venda) {
                    qb.where('comissao.id_venda', '=', req.query.id_venda);
                }
                if (req.query.id_financeiro) {
                    qb.where('comissao.id_financeiro', '=', req.query.id_financeiro);
                }
                if (req.query.data_inicial && req.query.data_final) {
                    qb.whereBetween('comissao.data_comissao', [req.query.data_inicial, req.query.data_final])
                }
            })
            .orderBy(req.query.orderBy || 'data_comissao', req.query.desc || "asc")
            .then(comissoes => res.json({ data: comissoes, count, limit }))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getByVenda = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await app.db('comissao').count('id_venda').where({ id_usuario: req.params.id_usuario, id_venda: req.params.id_venda }).first()
        const count = parseInt(result.count)

        app.db('comissao')
            .limit(limit).offset(page * limit - limit)
            .where({ id_usuario: req.params.id_usuario, id_venda: req.params.id_venda })
            .orderBy('data_comissao')
            .then(comissoes => res.json({ data: comissoes, count, limit }))
            .catch(e => res.status(500).send(e))
    }

    return { getById, getByVenda }
}