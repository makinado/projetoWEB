const FebrabanBanks = require('febraban-bancos');

module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation

    const save = async (req, res) => {
        const conta = { ...req.body }
        if (req.params.id) {
            conta.id = req.params.id
        }

        try {
            existsOrError(conta.id_empresa, 'Informe a empresa da conta')
            existsOrError(conta.nome, 'Informe o nome da conta')

            if (conta.cod_banco) {
                existsOrError(conta.agencia, 'Informe a agencia da conta')
                existsOrError(conta.num_conta, 'Informe o número da conta')
            }

            const contaDB = await app.db('conta')
                .where({ nome: conta.nome }).first()
            if (!conta.id) {
                notExistsOrError(contaDB, 'Conta conta já cadastrada')
            }
        } catch (e) {
            return res.status(400).send(e.toString())
        }

        if (conta.id) {
            app.db('conta')
                .update(conta)
                .where({ id: conta.id })
                .then(async _ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
        } else {
            app.db('conta')
                .insert(conta)
                .then(async _ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
        }
    }

    const get = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await app.db('conta').count('id').first()
        const count = parseInt(result.count)

        app.db('conta')
            .join('empresas', 'conta.id_empresa', 'empresas.id')
            .select('conta.id', 'conta.nome', 'conta.observacao', 'empresas.nome as empresa', 'saldo_atual')
            .limit(limit).offset(page * limit - limit)
            .where((qb) => {
                if (req.query.tipo == 2) {
                    // pesquisa avançada
                    if (req.query.nome) {
                        qb.where('conta.nome', 'ilike', `%${req.query.nome}%`);
                    } else if (req.query.id) {
                        qb.orWhere('conta.id', '=', req.query.id);
                    }

                    if (req.query.empresa) {
                        qb.where('conta.id_empresa', '=', req.query.empresa);
                    }

                } else {
                    // pesquisa rapida
                    if (req.query.nome) {
                        qb.where('conta.nome', 'ilike', `${req.query.nome}%`);
                    } else if (req.query.id) {
                        qb.orWhere('conta.id', '=', req.query.id);
                    }

                    if (req.query.empresa) {
                        qb.where('conta.id_empresa', '=', req.query.empresa);
                    }
                }
            })
            .orderBy('nome')
            .then(contas => res.json({ data: contas, count, limit }))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getById = async (req, res) => {
        app.db('conta')
            .where({ id: req.params.id }).first()
            .then(conta => res.json(conta))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getTela = async (req, res) => {
        if (req.params.id) {
            var conta = await app.db('conta')
                .where({ id: req.params.id }).first()
                .catch(e => res.status(500).send(e))
        }

        FebrabanBanks.getBanks().then(data => {
            var banks = data.map(item => { return { value: parseInt(item.code), text: `${item.code} - ${item.name}` } })

            const tela = {
                conta,
                banks
            }

            res.json(tela)
        }).catch(e => console.log(e));
    }

    const remove = async (req, res) => {
        try {
            const conta = await app.db('conta')
                .where({ id: req.params.id }).delete()

            existsOrError(conta, 'conta não encontrado')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getById, getTela, remove }
}