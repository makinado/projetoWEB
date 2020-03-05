const { formatToBRL } = require('brazilian-values')

module.exports = app => {
    const { existsOrError, notExistsOrError, parseNumber } = app.api.validation

    const save = async (req, res) => {
        const tabela = { ...req.body }
        if (req.params.id)
            tabela.id = req.params.id

        try {
            existsOrError(tabela.id_empresa, 'Informe a empresa da tabela')
            existsOrError(tabela.descricao, 'Informe a descrição da tabela')
            existsOrError(tabela.tipo, 'Informe o tipo da tabela')

            tabela.tipo = tabela.tipo == 'ACRÉSCIMO' ? 1 : 2

            const tabDB = await app.db('tabela_preco').where({ id_empresa: tabela.id_empresa, descricao: tabela.descricao, tipo: tabela.tipo }).first()
            if (!tabela.id) {
                notExistsOrError(tabDB, 'Tabela já cadastrada')
            }
        } catch (e) {
            return res.status(400).send(e.toString())
        }

        delete tabela.value
        delete tabela.text

        tabela.percentual = tabela.percentual ? parseNumber(tabela.percentual) : 0

        if (tabela.id) {
            app.db('tabela_preco')
                .update(tabela)
                .where({ id: tabela.id })
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
        } else {
            app.db('tabela_preco')
                .insert(tabela)
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
        }
    }

    const get = async (req, res) => {
        app.db('tabela_preco')
            .then(tabelas => {
                tabelas = tabelas.map(tab => {
                    tab.tipo = tab.tipo === 1 ? 'ACRÉSCIMO' : 'DESCONTO'
                    tab.percentual = formatToBRL(tab.percentual).replace('R$', "") + " %"
                    return tab
                })
                res.json(tabelas)
            })
            .catch(e => res.status(500).send(e.toString()))
    }

    const getAll = async (req, res) => {
        app.db('tabela_preco')
            .select('id as value', 'descricao as text', 'percentual')
            .then(tabelas => {
                tabelas = tabelas.map(tab => {
                    tab.percentual = formatToBRL(tab.percentual).replace('R$', "") + " %"
                    tab.text += ' | ' + tab.percentual
                    return tab
                })
                res.json(tabelas)
            })
            .catch(e => res.status(500).send(e.toString()))
    }

    const getById = async (req, res) => {
        app.db('tabela_preco')
            .where({ id: req.params.id })
            .first()
            .then(tabela => res.json(tabela))
            .catch(e => res.status(500).send(e.toString()))
    }

    const remove = async (req, res) => {
        try {
            const exclusao = await app.db('tabela_preco')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'tabela não encontrada')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getAll, getById, remove }
}