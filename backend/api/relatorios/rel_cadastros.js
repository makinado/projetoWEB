module.exports = app => {
    const getData = async (req, res) => {
        console.log(req.query)

        var produtos, usuarios, pessoas

        if (req.query.cadastros.includes('cliente') ||
            req.query.cadastros.includes('fornecedor') ||
            req.query.cadastros.includes('vendedor') ||
            req.query.cadastros.includes('funcionario') ||
            req.query.cadastros.includes('transportadora')) {
            pessoas = await app.db('pessoas')
                .leftJoin('categorias', 'pessoas.categoria', 'categorias.id')
                .select('pessoas.*', 'categorias.descricao as categoria')
                .orderBy(req.query.ordem || "nome")
                .where((qb) => {
                    if (req.query.cadastros.includes('cliente')) {
                        qb.where('pessoas.cliente', '=', true);
                    }
                    if (req.query.cadastros.includes('fornecedor')) {
                        qb.orWhere('pessoas.fornecedor', '=', true);
                    }
                    if (req.query.cadastros.includes('vendedor')) {
                        qb.orWhere('pessoas.vendedor', '=', true);
                    }
                    if (req.query.cadastros.includes('funcionario')) {
                        qb.orWhere('pessoas.funcionario', '=', true);
                    }
                    if (req.query.cadastros.includes('transportadora')) {
                        qb.orWhere('pessoas.transportadora', '=', true);
                    }
                    if (req.query.data_inicial && req.query.data_final) {
                        if (req.query.data_type == 'data_criado') {
                            qb.whereBetween('pessoas.data_criado', [req.query.data_inicial, req.query.data_final])
                        } else {
                            qb.whereBetween('pessoas.data_atualizado', [req.query.data_inicial, req.query.data_final])
                        }
                    }
                })
        } else if (req.query.cadastros.includes('usuario')) {
            usuarios = await app.dbUsers('usuarios')
                .orderBy(req.query.ordem || "nome")
                .where((qb) => {
                    if (req.query.data_inicial && req.query.data_final) {
                        if (req.query.data_type == 'data_criado') {
                            qb.whereBetween('usuarios.data_criado', [req.query.data_inicial, req.query.data_final])
                        } else {
                            qb.whereBetween('usuarios.data_atualizado', [req.query.data_inicial, req.query.data_final])
                        }
                    }
                })
        } else if (req.query.cadastros.includes('produto')) {
            produtos = await app.db('produtos')
                .select('produtos.*')
                .orderBy(req.query.ordem == 'nome' ? 'descricao' : req.query.ordem || "descricao")
                .where((qb) => {
                    if (req.query.data_inicial && req.query.data_final) {
                        if (req.query.data_type == 'data_criado') {
                            qb.whereBetween('produtos.data_criado', [req.query.data_inicial, req.query.data_final])
                        } else {
                            qb.whereBetween('produtos.data_atualizado', [req.query.data_inicial, req.query.data_final])
                        }
                    }
                })
        }

        console.log('pessoas - ', pessoas, 'usuarios - ', usuarios, 'produtos - ', produtos)
        res.json({ pessoas, usuarios, produtos })
    }

    return { getData }
}