const { isCPF, isCNPJ, isCEP } = require('brazilian-values')
module.exports = app => {

    const { existsOrError, notExistsOrError } = app.api.validation

    const save = async (req, res) => {
        const pessoa = { ...req.body }

        if (req.params.id) {
            pessoa.id = req.params.id
        }

        try {
            existsOrError(pessoa.tipo, 'Tipo de pessoa inválido')
            if (pessoa.tipo === 'Física') {
                existsOrError(pessoa.cpf, 'CPF inválido')
                pessoa.cnpj = null
            } else {
                existsOrError(pessoa.cnpj, 'CNPJ inválido')
                pessoa.cpf = null
            }
            existsOrError(pessoa.nome, 'Nome inválido')
            existsOrError(pessoa.cep, 'CEP inválido')
            if (!pessoa.cliente && !pessoa.fornecedor && !pessoa.transportadora) {
                throw 'Informe se a pessoa é um cliente, fornecedor ou transportadora'
            }
            var pessoaDB
            if (pessoa.cpf) {
                pessoaDB = await app.db('pessoas').where({ cpf: pessoa.cpf }).first()
            } else if (pessoa.cnpj) {
                pessoaDB = await app.db('pessoas').where({ cnpj: pessoa.cnpj }).first()
            }

            if (!pessoa.id) {
                notExistsOrError(pessoaDB, `${pessoaDB ? pessoaDB.nome : "Pessoa"} já cadastrado(a)`)
            }

        } catch (e) {
            return res.status(400).send(e.toString())
        }

        delete pessoa.id_uf
        delete pessoa.uf
        delete pessoa.xuf
        delete pessoa.cmun
        delete pessoa.xmun
        delete pessoa.cidade

        if (pessoa.id) {
            return app.db.transaction(async function (trx) {
                return app.db('pessoas')
                    .update(pessoa)
                    .where({ id: pessoa.id })
                    .then(trx.commit)
                    .catch(trx.rollback);
            }).then(function (updates) {
                res.status(204).send()
            }).catch(function (error) {
                console.log(error.toString())
                res.status(500).send(error.toString())
            });
        } else {
            return app.db.transaction(async function (trx) {
                return app.db('pessoas')
                    .insert(pessoa).returning('id')
                    .then(trx.commit)
                    .catch(trx.rollback);
            }).then(function (inserts) {
                res.status(204).send()
            }).catch(function (error) {
                console.log(error.toString())
                res.status(500).send(error.toString())
            });
        }
    }

    const get = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await app.db('pessoas').count('id').first()
        const count = parseInt(result.count)

        app.db('pessoas')
            .select('id', 'nome', 'cpf', 'cnpj', 'email', 'contato')
            .limit(limit).offset(page * limit - limit)
            .orderBy(req.query.order || "nome", req.query.desc || "asc")
            .where((qb) => {
                if (req.query.tipo == 2) {
                    // pesquisa avançada
                    if (req.query.nome) {
                        qb.where('pessoas.nome', 'ilike', `%${req.query.nome}%`);
                    } else if (req.query.id) {
                        qb.orWhere('pessoas.id', '=', req.query.id);
                    } else if (req.query.cpf_cnpj) {
                        qb.orWhere('pessoas.cpf', 'ilike', `%${req.query.cpf_cnpj}%`);
                        qb.orWhere('pessoas.cnpj', 'ilike', `%${req.query.cpf_cnpj}%`);
                    }
                    if (req.query.categoria) {
                        qb.where('pessoas.categoria', '=', `${req.query.categoria}`);
                    }
                    if (req.query.email) {
                        qb.where('pessoas.email', 'ilike', `%${req.query.email}%`);
                    }
                    if (req.query.contato) {
                        qb.where('pessoas.contato', 'ilike', `%${req.query.contato}%`);
                    }
                    if (req.query.cliente) {
                        qb.where('pessoas.cliente', '=', true);
                    }
                    if (req.query.fornecedor) {
                        qb.where('pessoas.fornecedor', '=', true);
                    }
                    if (req.query.funcionario) {
                        qb.where('pessoas.funcionario', '=', true);
                    }
                    if (req.query.transportadora) {
                        qb.where('pessoas.transportadora', '=', true);
                    }
                } else {
                    // pesquisa rapida
                    if (req.query.nome) {
                        qb.where('pessoas.nome', 'ilike', `${req.query.nome}%`);
                    } else if (req.query.id) {
                        qb.orWhere('pessoas.id', '=', req.query.id);
                    } else if (req.query.cpf_cnpj) {
                        qb.orWhere('pessoas.cpf', 'ilike', `${req.query.cpf_cnpj}%`).orWhere('pessoas.cnpj', 'ilike', `${req.query.cpf_cnpj}%`);
                    }
                    if (req.query.categoria) {
                        qb.where('pessoas.categoria', '=', `${req.query.categoria}`);
                    }
                    if (req.query.email) {
                        qb.where('pessoas.email', 'ilike', `${req.query.email}%`);
                    }
                    if (req.query.contato) {
                        qb.where('pessoas.contato', 'ilike', `${req.query.contato}%`);
                    }
                    if (req.query.cliente) {
                        qb.where('pessoas.cliente', '=', true);
                    }
                    if (req.query.fornecedor) {
                        qb.where('pessoas.fornecedor', '=', true);
                    }
                    if (req.query.funcionario) {
                        qb.where('pessoas.funcionario', '=', true);
                    }
                    if (req.query.transportadora) {
                        qb.where('pessoas.transportadora', '=', true);
                    }
                }
            })
            .then(pessoas => res.json({ data: pessoas, count, limit }))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getById = async (req, res) => {
        app.db('pessoas')
            .leftJoin('municipios', 'pessoas.id_cidade', 'municipios.cmun')
            .select('*', 'municipios.uf as uf', 'municipios.xmun as cidade')
            .where({ id: req.params.id }).first()
            .then(pessoa => res.json(pessoa))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getWithFinanceiro = async (req, res) => {
        app.db('pessoas')
            .leftJoin('categorias', 'pessoas.categoria', 'categorias.id')
            .select(
                'pessoas.id',
                'pessoas.nome',
                'pessoas.cpf',
                'pessoas.cnpj',
                'pessoas.situacao',
                'pessoas.email',
                'pessoas.contato',
                'categorias.descricao as categoria'
            )
            .where({ 'pessoas.id': req.params.id }).first()
            .then(async pessoa => {
                res.json(await Promise.resolve(withFinanceiro(pessoa)))
            })
            .catch(e => { console.log(e); res.status(500).send(e.toString()) })
    }

    withFinanceiro = async pessoa => {
        pessoa.financeiro = await app.db('financeiro').select('id').where({ id_pessoa: pessoa.id, pago: false }).where('data_vencimento', '<', new Date())
            .then(situacao => {
                if (situacao.length === 0)
                    situacao = "OK"
                else if (situacao.length < 3)
                    situacao = `${situacao.length} conta(s) em atraso`
                else situacao = "Venda impossibilitada"

                return situacao
            })
            .catch(e => res.status(500).send(e.toString()))

        return pessoa
    }

    const getAll = async (req, res) => {
        app.db('pessoas')
            .select('id as value', 'nome as text', 'cpf', 'cnpj')
            .orderBy('nome')
            .then(pessoas => res.json(pessoas))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getByCategoria = async (req, res) => {
        app.db('pessoas')
            .select('id', 'cpf', 'cnpj', 'nome', 'email', 'contato')
            .where({ categoria: req.params.id_categoria })
            .then(pessoas => res.json(pessoas))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getClientes = async (req, res) => {
        app.db('pessoas')
            .select('id as value', 'nome as text', 'cpf', 'cnpj')
            .where({ cliente: true })
            .orderBy('nome')
            .then(pessoas => res.json(pessoas))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getFornecs = async (req, res) => {
        app.db('pessoas')
            .select('id as value', 'nome as text', 'cpf', 'cnpj')
            .where({ fornecedor: true })
            .orderBy('nome')
            .then(pessoas => res.json(pessoas))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getTransps = async (req, res) => {
        app.db('pessoas')
            .select('id as value', 'nome as text', 'cpf', 'cnpj')
            .where({ transportadora: true })
            .orderBy('nome')
            .then(pessoas => res.json(pessoas))
            .catch(e => res.status(500).send(e.toString()))
    }

    const remove = async (req, res) => {
        try {
            const exclusao = await app.db('pessoas')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'Pessoa não encontrada')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    const fastSave = async (req, res) => {
        const pessoa = { ...req.body }

        try {
            existsOrError(pessoa.nome, 'Nome é obrigatório')
            const pessoaDB = await app.db('pessoas').where({ nome: pessoa.nome }).first()

            notExistsOrError(pessoaDB, 'Pessoa já cadastrada')
        } catch (e) {
            return res.status(400).send(e)
        }

        if (req.url.includes('clientes'))
            pessoa.cliente = true
        else if (req.url.includes('fornecedores'))
            pessoa.fornecedor = true
        else if (req.url.includes('transportadoras')) pessoa.transportadora = true

        app.db('pessoas')
            .insert(pessoa)
            .then(_ => res.status(204).send())
            .catch(e => res.status(204).send(e))
    }


    return {
        save,
        get,
        getById,
        getWithFinanceiro,
        getByCategoria,
        getClientes,
        fastSave,
        getFornecs,
        getTransps,
        getAll,
        remove
    }
}