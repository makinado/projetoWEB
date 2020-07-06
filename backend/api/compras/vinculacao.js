const { isCNPJ } = require('brazilian-values')
module.exports = app => {
    const { existsOrError, notExistsOrError, parseNumber } = app.api.validation

    const save = async (req, res) => {
        const vinculacao = { ...req.body }

        if (req.params.id) {
            vinculacao.id = req.params.id
        }



        try {
            existsOrError(vinculacao.id_fornecedor, 'Informe o fornecedor do produto')
            existsOrError(vinculacao.id_produto_fornecedor, 'Informe o código do produto de seu fornecedor')
            existsOrError(vinculacao.id_produto_empresa, 'Informe o produto que deseja vincular')
            const vinculacaoDB = await req.knex('compra_vinculacao')
                .select('id')
                .where({
                    id_fornecedor: vinculacao.id_fornecedor,
                    id_produto_fornecedor: vinculacao.id_produto_fornecedor,
                    id_produto_empresa: vinculacao.id_produto_empresa
                }).first()
            if (!vinculacao.id) {
                notExistsOrError(vinculacaoDB, 'Vinculação já realizada')
            }

        } catch (e) {
            return res.status(400).send(e.toString())
        }

        vinculacao.qtde_embalagem = parseNumber(vinculacao.qtde_embalagem || "0,00")

        // await req.knex('compra_vinculacao').where({
        //     id_fornecedor: vinculacao.id_fornecedor,
        //     id_produto_fornecedor: vinculacao.id_produto_fornecedor,
        // }).delete()

        if (vinculacao.id) {
            req.knex('compra_vinculacao')
                .update(vinculacao)
                .where({ id: vinculacao.id })
                .then(id => res.json({ id: vinculacao.id }))
                .catch(e => res.status(500).send(e.toString()))
        } else {
            req.knex('compra_vinculacao')
                .insert(vinculacao)
                .returning('id')
                .then(id => res.json({ id: id[0] }))
                .catch(e => res.status(500).send(e.toString()))
        }
    }

    const get = async (req, res) => { }

    const getById = async (req, res) => {
        req.knex('compra_vinculacao')
            .where({ id: req.params.id })
            .first()
            .then(vinculacao => res.json(vinculacao))
            .catch(e => res.status(500).send(e.toString()))
    }

    const remove = async (req, res) => {
        try {
            const exclusao = await req.knex('compra_vinculacao')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'Vinculação não encontrada')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getById, remove }
}