module.exports = app => {
    const getData = async (req, res) => {
        var produtos, usuarios, pessoas

        if (req.query.cadastros.includes('cliente') ||
            req.query.cadastros.includes('fornecedor') ||
            req.query.cadastros.includes('vendedor') ||
            req.query.cadastros.includes('funcionario') ||
            req.query.cadastros.includes('transportadora')) {
            pessoas = await app.db('pessoas')
                .leftJoin('categorias', 'pessoas.categoria', 'categorias.id')
                .leftJoin('municipios', 'pessoas.id_cidade', 'municipios.cmun')
                .select(
                    'pessoas.id',
                    'pessoas.nome',
                    'pessoas.fantasia',
                    'pessoas.cpf',
                    'pessoas.cnpj',
                    'pessoas.cep',
                    'municipios.xuf as uf',
                    'municipios.xmun as cidade',
                    'pessoas.bairro',
                    'pessoas.logradouro',
                    'pessoas.numero',
                    'pessoas.contato',
                    'pessoas.contato2',
                    'pessoas.email',
                    'pessoas.email2',
                    'pessoas.situacao',
                    'categorias.descricao as categoria',
                    'pessoas.inscricao_estadual',
                    'pessoas.inscricao_municipal',
                    'pessoas.data_criado',
                    'pessoas.data_atualizado',
                    'pessoas.observacao',
                )
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
                    if (req.query.categoria) {
                        qb.where('pessoas.categoria', '=', req.query.categoria)
                    }
                    if (req.query.data_inicial && req.query.data_final) {
                        if (req.query.data_type == 'data_criado') {
                            qb.whereBetween('pessoas.data_criado', [req.query.data_inicial, req.query.data_final])
                        } else {
                            qb.whereBetween('pessoas.data_atualizado', [req.query.data_inicial, req.query.data_final])
                        }
                    }
                })
            // pessoas.push(
            //     totais = {
            //         pessoas: await app.db('pessoas').count('id').first().then(c => c.count),
            //         clientes: await app.db('pessoas').count('id').where({ cliente: true }).first().then(c => c.count),
            //         fornecedores: await app.db('pessoas').count('id').where({ fornecedor: true }).first().then(c => c.count),
            //         vendedores: await app.db('pessoas').count('id').where({ vendedor: true }).first().then(c => c.count),
            //         funcionarios: await app.db('pessoas').count('id').where({ funcionario: true }).first().then(c => c.count),
            //         transportadoras: await app.db('pessoas').count('id').where({ transportadora: true }).first().then(c => c.count)
            //     }
            // )

        } else if (req.query.cadastros.includes('usuario')) {
            usuarios = await app.dbUsers('usuarios')
                .select('id', 'nome', 'email', 'contato', 'data_criado', 'data_atualizado', 'id_perfil', 'img')
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
            // usuarios.usuariosCount = await app.dbUsers('usuarios').count('id').first()

        } else if (req.query.cadastros.includes('produto')) {
            produtos = await app.db('produtos as p')
                .leftJoin('categorias', 'p.categoria', 'categorias.id')
                .leftJoin('marcas', 'p.marca', 'marcas.id')
                .leftJoin('unidades', 'p.unidade', 'unidades.id')
                .select(
                    'p.id',
                    'p.descricao',
                    app.db.raw('to_char(valor_unitario)'),
                    'categorias.descricao as categoria',
                    'marcas.nome as marca',
                    'unidades.sigla as unidade'
                )
                .orderBy(req.query.ordem == 'nome' ? 'descricao' : req.query.ordem || "descricao")
                .where((qb) => {
                    if (req.query.categoria) {
                        qb.where('produtos.categoria', '=', req.query.categoria)
                    }
                    if (req.query.marca) {
                        qb.where('produtos.marca', '=', req.query.marca)
                    }
                    if (req.query.unidade) {
                        qb.where('produtos.unidade', '=', req.query.unidade)
                    }
                    if (req.query.data_inicial && req.query.data_final) {
                        if (req.query.data_type == 'data_criado') {
                            qb.whereBetween('produtos.data_criado', [req.query.data_inicial, req.query.data_final])
                        } else {
                            qb.whereBetween('produtos.data_atualizado', [req.query.data_inicial, req.query.data_final])
                        }
                    }
                })
            // produtos.produtosCount = await app.db('produtos').count('id').first()
        }

        res.json({ pessoas, usuarios, produtos })
    }

    return { getData }
}