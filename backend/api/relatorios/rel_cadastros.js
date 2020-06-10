module.exports = app => {

    const getData = async (req, res) => {
        var produtos, usuarios, pessoas, stats

        try {
            if (req.query.cadastros.includes('cliente') || req.query.cadastros.includes('fornecedor') || req.query.cadastros.includes('transportadora')) {
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
                        if (req.query.cadastros.includes('transportadora')) {
                            qb.orWhere('pessoas.transportadora', '=', true);
                        }
                        if (req.query.categoria) {
                            qb.where('pessoas.categoria', '=', req.query.categoria)
                        }
                        if (req.query.sexo) {
                            qb.where('pessoas.sexo', '=', req.query.sexo)
                        }
                        if (req.query.data_inicial && req.query.data_final) {
                            if (req.query.data_type == 'data_criado') {
                                qb.whereBetween('pessoas.data_criado', [req.query.data_inicial, req.query.data_final])
                            } else {
                                qb.whereBetween('pessoas.data_atualizado', [req.query.data_inicial, req.query.data_final])
                            }
                        }
                    })

                stats = {
                    clientes: await app.db('pessoas').count('id').where({ cliente: true }).then(pessoas => pessoas[0].count),
                    fornecedores: await app.db('pessoas').count('id').where({ fornecedor: true }).then(pessoas => pessoas[0].count),
                    transportadoras: await app.db('pessoas').count('id').where({ transportadora: true }).then(pessoas => pessoas[0].count),
                    ativos: await app.db('pessoas').count('id').where({ situacao: 'Ativo' }).then(pessoas => pessoas[0].count),
                    inativos: await app.db('pessoas').count('id').where({ situacao: 'Inativo' }).then(pessoas => pessoas[0].count),
                    emAnalise: await app.db('pessoas').count('id').where({ situacao: 'Em análise' }).then(pessoas => pessoas[0].count),
                }
            } else if (req.query.cadastros.includes('usuario')) {
                usuarios = await app.db('venda')
                    .select('usuarios.id', 'usuarios.nome', 'usuarios.email', 'usuarios.contato', 'usuarios.data_criado', 'usuarios.data_atualizado', 'usuarios.img')
                    .sum('venda.valor_total as valor_vendas')
                    .sum('comissao.valor_comissao as valor_comissoes')
                    .leftJoin('usuario_vendas', 'venda.id', 'usuario_vendas.id_venda')
                    .leftJoin('usuarios', 'usuarios.id', 'usuario_vendas.id_usuario')
                    .leftJoin('comissao', 'usuarios.id', 'comissao.id_usuario')
                    .groupBy('usuarios.id')
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
                stats = {
                    usuarios: await app.db('usuarios').count('id').then(usuarios => usuarios[0].count),
                }
            } else if (req.query.cadastros.includes('produto')) {
                produtos = await app.db('produtos as p')
                    .leftJoin('categorias', 'p.categoria', 'categorias.id')
                    .leftJoin('marcas', 'p.marca', 'marcas.id')
                    .leftJoin('unidades', 'p.unidade', 'unidades.id')
                    .select(
                        'p.*',
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

                stats = {
                    produtos: await app.db('produtos').count('id').then(produtos => produtos[0].count),
                    ativos: await app.db('produtos').count('id').where({ ativo: true }).then(produtos => produtos[0].count),
                    inativos: await app.db('produtos').count('id').where({ ativo: false }).then(produtos => produtos[0].count),
                }
            }

        } catch (error) {
            console.log(error.toString())
            return res.status(500).send('Erro na geração do relatório')
        }

        res.json({ pessoas, usuarios, produtos, stats })
    }

    return { getData }
}