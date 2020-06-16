const { isCNPJ } = require('brazilian-values')
module.exports = app => {
    const { existsOrError, notExistsOrError, parseNumber } = app.api.validation

    const save = async (req, res) => {
        const empresa = { ...req.body }
        if (req.params.id) {
            empresa.id = req.params.id
        }

        try {
            existsOrError(empresa.cnpj, 'Informe o cnpj da empresa')
            if (!isCNPJ(empresa.cnpj))
                throw 'cnpj inválido'
            const empresaDB = await app.db('empresas').where({ cnpj: empresa.cnpj }).first()
            if (!empresa.id) {
                notExistsOrError(empresaDB, 'Empresa já cadastrada')
            }
            existsOrError(empresa.nome, 'Informe o nome da empresa')
            if (!empresa.email && !empresa.email2) {
                throw 'Informe um e-mail'
            } else {
                if (!empresa.email.includes('@') || !empresa.email.includes('.') || empresa.email.length < 4) {
                    throw 'e-mail inválido'
                }
            }
            if (!empresa.contato && !empresa.contato2) {
                throw 'Informe um contato'
            } else {
                if (empresa.contato.length < 13) {
                    throw 'contato inválido'
                }
            }
            existsOrError(empresa.cep, 'Informe o cep da empresa')
            if (empresa.cep.length < 9) {
                throw 'cep inválido'
            }
            existsOrError(empresa.numero, 'Informe o número do endereço')
            existsOrError(empresa.inscricao_estadual, 'Informe a inscrição estadual da empresa')
            existsOrError(empresa.regime_tributario, 'Informe o regime tributário da empresa')

        } catch (e) {
            return res.status(400).send(e.toString())
        }

        delete empresa.id_uf
        delete empresa.uf
        delete empresa.xuf
        delete empresa.cmun
        delete empresa.xmun
        delete empresa.cidade

        if (empresa.regime_tributario === 'Simples nacional') {
            empresa.aliquota_simplesnacional ? empresa.aliquota_simplesnacional = parseFloat(parseNumber(empresa.aliquota_simplesnacional, ',')) : "";

            delete empresa.aliquota_pis
            delete empresa.aliquota_cofins
            delete empresa.aliquota_icms
            delete empresa.aliquota_base_irpj
            delete empresa.aliquota_irpj
            delete empresa.aliquota_base_csll
            delete empresa.aliquota_csll
        } else if (empresa.regime_tributario === 'Lucro presumido') {
            empresa.aliquota_pis ? empresa.aliquota_pis = parseFloat(parseNumber(empresa.aliquota_pis, ',')) : "";
            empresa.aliquota_cofins ? empresa.aliquota_cofins = parseFloat(parseNumber(empresa.aliquota_cofins, ',')) : "";
            empresa.aliquota_icms ? empresa.aliquota_icms = parseFloat(parseNumber(empresa.aliquota_icms, ',')) : "";


            empresa.aliquota_base_irpj ? empresa.aliquota_base_irpj = parseFloat(parseNumber(empresa.aliquota_base_irpj, ',')) : "";
            empresa.aliquota_irpj ? empresa.aliquota_irpj = parseFloat(parseNumber(empresa.aliquota_irpj, ',')) : "";
            empresa.aliquota_base_csll ? empresa.aliquota_base_csll = parseFloat(parseNumber(empresa.aliquota_base_csll, ',')) : "";
            empresa.aliquota_csll ? empresa.aliquota_csll = parseFloat(parseNumber(empresa.aliquota_csll, ',')) : "";

            delete empresa.aliquota_simplesnacional;
        } else {
            empresa.aliquota_pis ? empresa.aliquota_pis = parseFloat(parseNumber(empresa.aliquota_pis, ',')) : "";
            empresa.aliquota_cofins ? empresa.aliquota_cofins = parseFloat(parseNumber(empresa.aliquota_cofins, ',')) : "";
            empresa.aliquota_icms ? empresa.aliquota_icms = parseFloat(parseNumber(empresa.aliquota_icms, ',')) : "";

            delete empresa.aliquota_simplesnacional;
            delete empresa.aliquota_base_irpj
            delete empresa.aliquota_irpj
            delete empresa.aliquota_base_csll
            delete empresa.aliquota_csll
        }

        if (empresa.id) {
            app.db('empresas')
                .update(empresa)
                .where({ id: empresa.id })
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
        } else {
            app.db('empresas')
                .insert(empresa)
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
        }
    }

    const get = async (req, res) => {
        // console.log(req)
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5

        const result = await app.db('empresas').count('id').first()
        const count = parseInt(result.count)

        try {
            app.db('empresas')
                .select('id', 'cnpj', 'nome', 'email', 'contato')
                .limit(limit).offset(page * limit - limit)
                .orderBy(req.query.order || "nome", req.query.desc || "asc")
                .where((qb) => {
                    if (req.query.tipo == 2) {
                        // pesquisa avançada
                        if (req.query.nome) {
                            qb.where('empresas.nome', 'ilike', `%${req.query.nome}%`);
                        } else if (req.query.id) {
                            qb.orWhere('empresas.id', '=', req.query.id);
                        } else if (req.query.cnpj) {
                            qb.orWhere('empresas.cnpj', 'ilike', `%${req.query.cnpj}%`);
                        }
                        if (req.query.email) {
                            qb.where('empresas.email', 'ilike', `%${req.query.email}%`);
                        }
                        if (req.query.contato) {
                            qb.where('empresas.contato', 'ilike', `%${req.query.contato}%`);
                        }
                    } else {
                        // pesquisa rapida
                        if (req.query.nome) {
                            qb.where('empresas.nome', 'ilike', `${req.query.nome}%`);
                        } else if (req.query.id) {
                            qb.orWhere('empresas.id', '=', req.query.id);
                        } else if (req.query.cnpj) {
                            qb.orWhere('empresas.cnpj', 'ilike', `${req.query.cnpj}%`);
                        }
                        if (req.query.email) {
                            qb.where('empresas.email', 'ilike', `${req.query.email}%`);
                        }
                        if (req.query.contato) {
                            qb.where('empresas.contato', 'ilike', `${req.query.contato}%`);
                        }
                    }
                })
                .then(empresas => res.json({ data: empresas, count, limit }))
                .catch(e => res.status(500).send(e.toString()))
        } catch (e) {
            res.status(500).send(e.toString())
        }
    }

    const getAll = async (req, res) => {
        app.db('empresas')
            .select('id as value', 'nome as text')
            .then(empresas => res.json(empresas))
            .catch(e => { console.log(e); res.status(500).send(e.toString()) })
    }

    const getById = async (req, res) => {
        app.db('empresas')
            .leftJoin('municipios', 'empresas.id_cidade', 'municipios.cmun')
            .select('*', 'municipios.uf as uf', 'municipios.xmun as cidade')
            .where({ id: req.params.id })
            .first()
            .then(empresa => res.json(empresa))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getEmails = async (req, res) => {
        app.db('empresas')
            .select('email', 'email2', 'email_envio_nfe', 'email_envio_boleto', 'email_envio_compra', 'email_envio_venda')
            .where({ id: req.params.id })
            .first()
            .then(empresa => res.json(Object.values(empresa).filter(email => email != null)))
            .catch(e => res.status(500).send(e.toString()))
    }

    const remove = async (req, res) => {
        try {
            const estoque = await app.db('produto_estoque')
                .where({ id_empresa: req.params.id }).first()
            notExistsOrError(estoque, 'Há movimentos de estoque associados a essa empresa')

            const financeiro = await app.db('financeiro').where({ id_empresa: req.params.id }).first()
            notExistsOrError(financeiro, 'Há movimentos financeiros associados a essa empresa')

            const compras = await app.db('compra').where({ id_empresa: req.params.id }).first()
            notExistsOrError(compras, 'Há compras associadas a essa empresa')

            const vendas = await app.db('venda').where({ id_empresa: req.params.id }).first()
            notExistsOrError(vendas, 'Há vendas associadas a essa empresa')


            const empresa = await app.db('empresas')
                .where({ id: req.params.id }).delete()
            existsOrError(empresa, 'Empresa não encontrada')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getAll, getById, getEmails, remove }
}