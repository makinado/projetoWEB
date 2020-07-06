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
                pessoaDB = await req.knex('pessoas').where({ cpf: pessoa.cpf }).first()
            } else if (pessoa.cnpj) {
                pessoaDB = await req.knex('pessoas').where({ cnpj: pessoa.cnpj }).first()
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
            req.knex('pessoas')
                .update(pessoa)
                .where({ id: pessoa.id })
                .then(_ => res.status(204).send())
                .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao salvar pessoa") })
        } else {
            req.knex('pessoas')
                .insert(pessoa)
                .then(_ => res.status(204).send())
                .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao salvar pessoa") })
        }
    }

    const get = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await req.knex('pessoas').count('id').first()
        const count = parseInt(result.count)


        req.knex('pessoas')
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
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar pessoas") })
    }

    const getById = async (req, res) => {
        req.knex('pessoas')
            .leftJoin('municipios', 'pessoas.id_cidade', 'municipios.cmun')
            .select('*', 'municipios.uf as uf', 'municipios.xmun as cidade')
            .where({ id: req.params.id }).first()
            .then(pessoa => res.json(pessoa))
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar pessoa") })
    }

    const getWithFinanceiro = async (req, res) => {
        req.knex('pessoas')
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
                res.json(await Promise.resolve(withFinanceiro(req, pessoa)))
            })
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar pessoas") })
    }

    withFinanceiro = async (req, pessoa) => {
        pessoa.financeiro = await req.knex('financeiro').select('id').where({ id_pessoa: pessoa.id, pago: false }).where('data_vencimento', '<', new Date())
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
        req.knex('pessoas')
            .select('id as value', 'nome as text', 'cpf', 'cnpj')
            .orderBy('nome')
            .then(pessoas => res.json(pessoas))
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar pessoas") })
    }

    const getByCategoria = async (req, res) => {
        req.knex('pessoas')
            .select('id', 'cpf', 'cnpj', 'nome', 'email', 'contato')
            .where({ categoria: req.params.id_categoria })
            .then(pessoas => res.json(pessoas))
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar pessoas") })
    }

    const getClientes = async (req, res) => {
        req.knex('pessoas')
            .select('id as value', 'nome as text', 'cpf', 'cnpj')
            .where({ cliente: true })
            .orderBy('nome')
            .then(pessoas => res.json(pessoas))
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar clientes") })
    }

    const getFornecs = async (req, res) => {
        req.knex('pessoas')
            .select('id as value', 'nome as text', 'cpf', 'cnpj')
            .where({ fornecedor: true })
            .orderBy('nome')
            .then(pessoas => res.json(pessoas))
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar fornecedores") })
    }

    const getTransps = async (req, res) => {
        req.knex('pessoas')
            .select('id as value', 'nome as text', 'cpf', 'cnpj')
            .where({ transportadora: true })
            .orderBy('nome')
            .then(pessoas => res.json(pessoas))
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar transportadoras") })
    }

    const remove = async (req, res) => {
        try {
            const financeiro = await req.knex('financeiro').where({ id_pessoa: req.params.id }).first()
            notExistsOrError(financeiro, 'Há movimentos financeiros associados a essa pessoa')

            const compras = await req.knex('compra').where({ id_pessoa: req.params.id }).first()
            notExistsOrError(compras, 'Há compras associadas a essa pessoa')

            const vendas = await req.knex('venda').where({ id_pessoa: req.params.id }).first()
            notExistsOrError(vendas, 'Há vendas associadas a essa pessoa')

            const exclusao = await req.knex('pessoas')
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
            const pessoaDB = await req.knex('pessoas').where({ nome: pessoa.nome }).first()

            notExistsOrError(pessoaDB, 'Pessoa já cadastrada')
        } catch (e) {
            return res.status(400).send(e)
        }

        if (req.url.includes('clientes'))
            pessoa.cliente = true
        else if (req.url.includes('fornecedores'))
            pessoa.fornecedor = true
        else if (req.url.includes('transportadoras')) pessoa.transportadora = true

        req.knex('pessoas')
            .insert(pessoa)
            .then(_ => res.status(204).send())
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao salvar pessoa") })
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