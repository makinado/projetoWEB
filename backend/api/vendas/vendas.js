module.exports = app => {
    const { existsOrError, parseNumber, formatDate } = app.api.validation

    const save = async (req, res) => {
        const venda = { ...req.body }
        if (req.params.id) {
            venda.id = req.params.id
        }

        var produtosOK = true, financeiroOK = true

        try {
            existsOrError(venda.id_empresa, 'Informe a empresa da venda')
            existsOrError(venda.tipo, 'Informe o tipo venda ou orçamento')
            existsOrError(venda.id_pessoa, 'Informe o cliente da venda')
            existsOrError(venda.vendedores, 'Informe pelo menos um vendedor')
            existsOrError(venda.produtos, 'Informe os produtos da venda')

            venda.produtos.map(produto => {
                try {
                    existsOrError(produto.id, `Item ${produto.sequencia} não vinculado corretamente`)
                    if (produto.quantidade == "0,00")
                        throw `Item ${produto.sequencia} com quantidades zeradas`
                    if (produto.valor_unitario == "R$ 0,00")
                        throw `Item ${produto.sequencia} com valor unitário zerado`
                    if (produto.cfop == "?.000")
                        throw `Item ${produto.sequencia} com CFOP incorreto`
                } catch (e) {
                    produtosOK = false
                    return res.status(400).send(e)
                }
            })

            if (venda.tipo == 2) {
                existsOrError(venda.financeiro, 'Informe as parcelas da venda')

                venda.financeiro.map(parcela => {
                    try {
                        if (parcela.valor_parcela == "R$ 0,00")
                            throw `Valor zerado na parcela ${parcela.parcelas || ""}`
                        // existsOrError(parcela.documento_origem, `Documento não informado na parcela ${parcela.parcelas || ""}`)
                        if (parcela.pago) {
                            existsOrError(parcela.id_conta, `Conta de pagamento não informada na parcela ${parcela.parcelas || ""}`)
                            existsOrError(parcela.data_baixa, `Data do pagamento não preenchida na parcela ${parcela.parcelas || ""}`)
                            existsOrError(parcela.documento_baixa, `Forma de pagamento não preenchida na parcela ${parcela.parcelas || ""}`)
                        }
                    } catch (e) {
                        financeiroOK = false
                        return res.status(400).send(e)
                    }
                })
            }
        } catch (e) {
            if (!produtosOK || !financeiroOK) return
            return res.status(400).send(e.toString())
        }
        if (!produtosOK || !financeiroOK) return

        if (venda.id_tabela_preco) {
            venda.perc_desconto = venda.id_tabela_preco.percentual
            venda.id_tabela_preco = venda.id_tabela_preco.value
        }

        var vendedores = venda.vendedores
        var produtos = venda.produtos
        var financeiro = venda.financeiro
        delete venda.vendedores
        delete venda.produtos
        delete venda.financeiro

        venda.valor_frete = parseNumber(venda.valor_frete || "0,00")
        venda.valor_seguro = parseNumber(venda.valor_seguro || "0,00")
        venda.outras_despesas = parseNumber(venda.outras_despesas || "0,00")
        venda.valor_desconto = parseNumber(venda.valor_desconto || "0,00")
        venda.perc_desconto = parseNumber(venda.perc_desconto || "0,00")
        venda.valor_produtos = parseNumber(venda.valor_produtos || "0,00")
        venda.valor_total = parseNumber(venda.valor_total || "0,00")
        venda.data_agendamento = venda.data_agendamento || null

        if (venda.id) {
            return req.knex.transaction(async function (trx) {
                return req.knex('venda')
                    .update(venda)
                    .where({ id: venda.id })
                    .transacting(trx)
                    .then(async function () {
                        await req.knex('produto_venda').where({ id_venda: venda.id }).delete().transacting(trx)
                        await req.knex('produto_movimento_estoque').where({ id_movimentacao: venda.id }).delete().transacting(trx)
                        await req.knex('vendedores').where({ id_venda: venda.id }).delete().transacting(trx)

                        vendedores = vendedores.map(vend => { return { id_usuario: vend, id_venda: venda.id } })

                        const movim_estoque = []
                        produtos = produtos.map(produto => {
                            const newProd = {
                                id_venda: venda.id,
                                id_empresa: venda.id_empresa,
                                id_produto: produto.id,
                                sequencia: produto.sequencia,

                                quantidade: parseNumber(produto.quantidade || "0,00"),
                                valor_venda: parseNumber(produto.valor_venda || "0,00"),
                                valor_unitario: parseNumber(produto.valor_unitario || "0,00"),
                                valor_desconto: parseNumber(produto.valor_desconto || "0,00"),
                                perc_desconto: venda.perc_desconto,
                                valor_total: parseNumber(produto.valor_total || "0,00"),

                                perc_comissao: produto.perc_comissao || "0.00"
                            }

                            if (venda.tipo == 2) {
                                movim_estoque.push({
                                    id_empresa: venda.id_empresa,
                                    id_produto: produto.id,
                                    tipo_movimentacao: 1,
                                    data_movimentacao: venda.data_criacao,
                                    origem: "VENDA",
                                    id_movimentacao: venda.id,
                                    quantidade: parseNumber(produto.quantidade || "0,00"),
                                    observacao: venda.observacao
                                })
                            }

                            return newProd
                        })

                        if (venda.tipo == 2) {
                            await req.knex('financeiro').where({ id_movimento_origem: venda.id }).delete().transacting(trx)
                            await req.knex('conta_movimento').where({ id_movimento_origem: venda.id }).delete().transacting(trx)
                            await req.knex('usuario_vendas').where({ id_venda: venda.id }).delete().transacting(trx)

                            financeiro = financeiro.map(parcela => {
                                const newFinanc = {
                                    id_empresa: venda.id_empresa,
                                    id_pessoa: venda.id_pessoa,
                                    tipo_conta: 2,
                                    id_movimento_origem: venda.id,
                                    pago: parcela.pago,
                                    parcela: parcela.parcelas,
                                    observacao: venda.observacao,

                                    valor_parcela: parseNumber(parcela.valor_parcela || "0,00"),
                                    valor_pago: parcela.pago ? parseNumber(parcela.valor_pago) : 0,
                                    valor_total: venda.valor_total || "0,00",

                                    documento_origem: parcela.documento_origem,
                                    num_documento_origem: venda.nota_fiscal,

                                    documento_baixa: parcela.pago ? parcela.documento_baixa : null,
                                    num_documento_baixa: parcela.pago ? parcela.num_documento_baixa : null,
                                    id_conta: parcela.pago ? parcela.id_conta : null,

                                    data_criacao: venda.data_criacao,
                                    data_emissao: venda.data_emissao,
                                    data_vencimento: parcela.data_vencimento,
                                    data_baixa: parcela.pago ? parcela.data_baixa : null
                                }

                                return newFinanc
                            })
                        }

                        return req.knex.batchInsert('produto_venda', produtos)
                            .transacting(trx)
                            .then(function () {
                                return req.knex.batchInsert('produto_movimento_estoque', movim_estoque)
                                    .transacting(trx)
                                    .then(function () {
                                        if (financeiro)
                                            return req.knex.batchInsert('financeiro', financeiro)
                                                .returning('*')
                                                .transacting(trx)
                                                .then(async function (financs) {
                                                    financs.map(financ_updated => {
                                                        if (financ_updated.pago)
                                                            movim_conta.push({
                                                                id_empresa: venda.id_empresa,
                                                                id_conta: financ_updated.id_conta,
                                                                id_movimento_origem: venda.id,
                                                                id_movimento_financeiro: financ_updated.id,
                                                                id_classificacao: financ_updated.classificacao,
                                                                data_lancamento: new Date(),
                                                                data_emissao: venda.data_baixa,
                                                                id_documento: financ_updated.documento_baixa,
                                                                num_documento: financ_updated.num_documento_baixa,
                                                                observacao: venda.observacao,
                                                                origem: "VENDA",
                                                                dc: 'C',
                                                                valor: financ_updated.valor_pago
                                                            })
                                                    })

                                                    return req.knex.batchInsert('usuario_vendas', vendedores)
                                                        .transacting(trx)
                                                        .then(function () {
                                                            return req.knex.batchInsert('conta_movimento', movim_conta)
                                                                .transacting(trx)
                                                                .then(function () {
                                                                    if (venda.tipo == 2)
                                                                        return req.knex.raw(`select calcula_comissao_faturamento(${venda.id}::integer, ${venda.valor_total}::float, '${venda.data_criacao}'::date)`)
                                                                            .transacting(trx)
                                                                })
                                                        })
                                                })
                                    })
                            })

                    })
                    .then(trx.commit)
                    .catch(trx.rollback);
            }).then(function (inserts) {
                res.status(204).send()
            }).catch(function (error) {
                console.log(error.toString())
                res.status(500).send("Erro ao salvar venda")
            });

        } else {
            req.knex.transaction(async function (trx) {
                return req.knex('venda')
                    .insert(venda).returning('id')
                    .transacting(trx)
                    .then(async function (id) {
                        vendedores = vendedores.map(vend => { return { id_usuario: vend, id_venda: id[0] } })

                        const movim_estoque = []
                        produtos = produtos.map((produto) => {
                            const newProd = {
                                id_venda: id[0],
                                id_empresa: venda.id_empresa,
                                id_produto: produto.id,
                                sequencia: produto.sequencia,

                                quantidade: parseNumber(produto.quantidade || "0,00"),
                                valor_venda: parseNumber(produto.valor_venda || "0,00"),
                                valor_unitario: parseNumber(produto.valor_unitario || "0,00"),
                                valor_desconto: parseNumber(produto.valor_desconto || "0,00"),
                                valor_total: parseNumber(produto.valor_total || "0,00"),

                                perc_comissao: produto.perc_comissao || "0.00"
                            }

                            if (venda.tipo == 2) {
                                movim_estoque.push({
                                    id_empresa: venda.id_empresa,
                                    id_produto: produto.id,
                                    tipo_movimentacao: 1,
                                    data_movimentacao: venda.data_criacao,
                                    origem: "VENDA",
                                    id_movimentacao: id[0],
                                    quantidade: parseNumber(produto.quantidade || "0,00"),
                                    observacao: venda.observacao
                                })
                            }

                            return newProd
                        })

                        if (venda.tipo == 2) {
                            financeiro = financeiro.map(parcela => {
                                const newFinanc = {
                                    id_empresa: venda.id_empresa,
                                    id_pessoa: venda.id_pessoa,
                                    tipo_conta: 2,
                                    id_movimento_origem: id[0],
                                    pago: parcela.pago,
                                    parcela: parcela.parcelas,
                                    observacao: venda.observacao,

                                    valor_parcela: parseNumber(parcela.valor_parcela || "0,00"),
                                    valor_pago: parcela.pago ? parseNumber(parcela.valor_pago) : 0,
                                    valor_total: venda.valor_total || "0,00",

                                    documento_origem: parcela.documento_origem,
                                    num_documento_origem: venda.nota_fiscal,

                                    documento_baixa: parcela.pago ? parcela.documento_baixa : null,
                                    num_documento_baixa: parcela.pago ? parcela.num_documento_baixa : null,
                                    id_conta: parcela.pago ? parcela.id_conta : null,

                                    data_criacao: venda.data_criacao,
                                    data_emissao: venda.data_emissao,
                                    data_vencimento: parcela.data_vencimento,
                                    data_baixa: parcela.pago ? parcela.data_baixa : null
                                }

                                return newFinanc
                            })
                        }

                        return req.knex.batchInsert('produto_venda', produtos)
                            .transacting(trx)
                            .then(function () {
                                return req.knex.batchInsert('usuario_vendas', vendedores)
                                    .transacting(trx)
                                    .then(function () {
                                        return req.knex.batchInsert('produto_movimento_estoque', movim_estoque)
                                            .transacting(trx)
                                            .then(function () {
                                                if (financeiro)
                                                    return req.knex.batchInsert('financeiro', financeiro)
                                                        .returning('*')
                                                        .transacting(trx)
                                                        .then(async function (financs) {
                                                            const movim_conta = []
                                                            financs.map(async financ_updated => {
                                                                if (financ_updated.pago) {
                                                                    movim_conta.push({
                                                                        id_empresa: venda.id_empresa,
                                                                        id_conta: financ_updated.id_conta,
                                                                        id_movimento_origem: id[0],
                                                                        id_movimento_financeiro: financ_updated.id,
                                                                        id_classificacao: financ_updated.classificacao,
                                                                        data_lancamento: new Date(),
                                                                        data_emissao: venda.data_baixa,
                                                                        id_documento: financ_updated.documento_baixa,
                                                                        num_documento: financ_updated.num_documento_baixa,
                                                                        observacao: venda.observacao,
                                                                        origem: "VENDA",
                                                                        dc: 'C',
                                                                        valor: financ_updated.valor_pago
                                                                    })
                                                                }
                                                            })

                                                            return req.knex.batchInsert('conta_movimento', movim_conta)
                                                                .transacting(trx)
                                                                .then(function () {
                                                                    if (venda.tipo == 2)
                                                                        return req.knex.raw(`select calcula_comissao_faturamento(${id[0]}::integer, ${venda.valor_total}::float, '${venda.data_criacao}'::date)`)
                                                                            .transacting(trx)
                                                                })
                                                        })
                                            })
                                    })
                            })

                    })
                    .then(trx.commit)
                    .catch(trx.rollback);
            }).then(async function (inserts) {
                res.status(204).send()
            }).catch(function (error) {
                console.log(error.toString())
                res.status(500).send("Erro ao salvar venda")
            });
        }
    }

    const get = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await req.knex('venda').count('id').first()
        const count = parseInt(result.count)

        req.knex('venda')
            .join('empresas', 'venda.id_empresa', 'empresas.id')
            .join('pessoas as cliente', 'venda.id_pessoa', 'cliente.id')
            .select(
                'venda.id',
                'id_empresa',
                'id_pessoa',
                'venda.tipo',
                'valor_total',
                'data_criacao',
                'empresas.nome as empresa',
                'cliente.nome as cliente',
            )
            .limit(limit).offset(page * limit - limit)
            .orderBy('venda.situacao')
            .where(async (qb) => {
                if (req.query.empresa)
                    qb.where('venda.id_empresa', '=', req.query.empresa);
                if (req.query.fornecedor)
                    qb.where('venda.id_pessoa', '=', req.query.fornecedor);
                else if (req.query.id)
                    qb.orWhere('venda.id', '=', req.query.id);
                else if (req.query.documento)
                    qb.orWhere('venda.nota_fiscal', '=', req.query.documento);
                if (req.query.tipo_data == 1) {
                    if (req.query.data_inicial && req.query.data_final) {
                        qb.whereBetween('venda.data_contato', [req.query.data_inicial, req.query.data_final])
                    }
                } else if (req.query.tipo_data == 2) {
                    if (req.query.data_inicial && req.query.data_final) {
                        qb.whereBetween('venda.data_agendamento', [req.query.data_inicial, req.query.data_final])
                    }
                } else {
                    if (req.query.data_inicial && req.query.data_final) {
                        qb.whereBetween('venda.data_criacao', [req.query.data_inicial, req.query.data_final])
                    }
                }
                if (req.query.concluidas) {
                    qb.where('venda.situacao', 'CONCLUÍDA');
                }
                if (req.query.canceladas) {
                    qb.where('venda.situacao', 'CANCELADA');
                }
            })
            .then(async vendas => {
                return res.json({
                    data: await Promise.all(vendas.map(async item => {
                        item.tipo = item.tipo == 1 ? "ORÇAMENTO" : "VENDA"
                        item.vendedores = await req.knex('usuario_vendas')
                            .join('usuarios', 'usuario_vendas.id_usuario', 'usuarios.id')
                            .select('usuarios.nome as usuario')
                            .where({ id_venda: item.id })

                        return item
                    })), count, limit
                })
            }

            )
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar vendas") })
    }

    const getById = async (req, res) => {
        req.knex('venda')
            .where({ id: req.params.id })
            .first()
            .then(async venda => {
                venda.vendedores = await req.knex('usuario_vendas')
                    .join('usuarios', 'usuario_vendas.id_usuario', 'usuarios.id')
                    .select('usuarios.nome as usuario')
                    .where({ id_venda: venda.id })
                venda.produtos = await req.knex('produto_venda as pv')
                    .join('produtos as p', 'pv.id_produto', 'p.id')
                    .select(
                        'p.id',
                        'pv.sequencia',
                        'p.descricao',
                        'pv.quantidade',
                        'pv.valor_desconto',
                        'pv.valor_venda',
                        'pv.valor_unitario',
                        'pv.valor_total')
                    .where({ id_venda: venda.id })
                    .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar produtos da venda") })
                venda.financeiro = await req.knex('financeiro as f')
                    .select(
                        'f.id',
                        'f.parcela as parcelas',
                        'f.pago',
                        'f.observacao',
                        'f.documento_origem',
                        'f.data_vencimento',
                        'f.id_conta',
                        'f.data_baixa',
                        'f.documento_baixa',
                        'f.num_documento_baixa',
                        'f.valor_parcela',
                        'f.valor_acrescimo',
                        'f.valor_desconto',
                        'f.valor_pago',
                    )
                    .where({ id_movimento_origem: venda.id })
                    .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar dados financeiros da venda") })
                res.json(venda)
            })
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar venda") })
    }

    const getOrcamentos = async (req, res) => {
        req.knex('venda')
            .join('empresas', 'venda.id_empresa', 'empresas.id')
            .join('pessoas as cliente', 'venda.id_pessoa', 'cliente.id')
            .select(
                'venda.id',
                'id_empresa',
                'id_pessoa',
                'venda.tipo',
                'valor_total',
                'venda.data_criacao',
                'empresas.nome as empresa',
                'cliente.nome as cliente',
            )
            .where({ 'venda.tipo': 1 })
            .orderBy('venda.data_criacao')
            .then(orcamentos => res.json(
                orcamentos.map(async item => {
                    item.tipo = item.tipo == 1 ? "ORÇAMENTO" : "VENDA"
                    item.vendedores = await req.knex('usuario_vendas')
                        .join('usuarios', 'usuario_vendas.id_usuario', 'usuarios.id')
                        .select('usuarios.nome as usuario')
                        .where({ id_venda: item.id })

                    return item
                })
            ))
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar orçamentos") })
    }

    const getVendas = async (req, res) => {
        req.knex('venda')
            .join('empresas', 'venda.id_empresa', 'empresas.id')
            .join('pessoas as cliente', 'venda.id_pessoa', 'cliente.id')
            .select(
                'venda.id',
                'id_empresa',
                'id_pessoa',
                'venda.tipo',
                'valor_total',
                'venda.data_criacao',
                'empresas.nome as empresa',
                'cliente.nome as cliente',
            )
            .where({ 'venda.tipo': 2 })
            .orderBy('venda.data_criacao')
            .then(vendas => res.json(
                vendas.map(async item => {
                    item.tipo = item.tipo == 1 ? "ORÇAMENTO" : "VENDA"
                    item.vendedores = await req.knex('usuario_vendas')
                        .join('usuarios', 'usuario_vendas.id_usuario', 'usuarios.id')
                        .select('usuarios.nome as usuario')
                        .where({ id_venda: item.id })

                    return item
                })))
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar vendas") })
    }

    const remove = async (req, res) => {
        await req.knex.transaction(async function (trx) {
            return req.knex('venda')
                .where({ id: req.params.id }).delete()
                .transacting(trx)
                .then(function () {
                    return req.knex('financeiro')
                        .where({ id_movimento_origem: req.params.id }).delete()
                        .transacting(trx)
                        .then(function () {
                            return req.knex('produto_movimento_estoque')
                                .where({ id_movimentacao: req.params.id }).delete()
                                .transacting(trx)
                                .then(function () {
                                    return req.knex('conta_movimento')
                                        .where({ id_movimento_origem: req.params.id }).delete()
                                        .transacting(trx)
                                })
                        })

                })
                .then(trx.commit)
                .catch(trx.rollback)
        }).then(function (inserts) {
            res.status(204).send()
        }).catch(function (error) {
            console.log(error.toString())
            res.status(500).send("Erro ao excluir a venda")
        });
    }

    return { save, get, getOrcamentos, getVendas, getById, remove }
}