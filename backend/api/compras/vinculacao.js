const { isCNPJ } = require('brazilian-values')
module.exports = app => {
    const { existsOrError, parseNumber } = app.api.validation

    const save = async (req, res) => {
        const vinculacao = { ...req.body }

        if (req.params.id) {
            vinculacao.id = req.params.id
        }

        try {
            existsOrError(vinculacao.id_produto_empresa, 'Informe o produto que deseja vincular')
            existsOrError(vinculacao.id_fornecedor, 'Informe o fornecedor do produto')
            existsOrError(vinculacao.id_produto_fornecedor, 'Informe o código do produto de seu fornecedor')

        } catch (e) {
            return res.status(400).send(e.toString())
        }

        vinculacao.qtde_embalagem = parseNumber(vinculacao.qtde_embalagem || "0,00")

        if (vinculacao.id) {
            app.db('compra_vinculacao')
                .update(vinculacao)
                .where({ id: vinculacao.id })
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
        } else {
            app.db('compra_vinculacao')
                .insert(vinculacao)
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
        }
    }

    const get = async (req, res) => { }

    const getById = async (req, res) => {
        app.db('compra_vinculacao')
            .where({ id: req.params.id })
            .first()
            .then(vinculacao => res.json(vinculacao))
            .catch(e => res.status(500).send(e.toString()))
    }

    const remove = async (req, res) => {
        try {
            const exclusao = await app.db('compra_vinculacao')
                .where({ id: req.params.id }).delete()
            existsOrError(exclusao, 'Vinculação não encontrada')

            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getById, remove }
}