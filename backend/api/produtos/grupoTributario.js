module.exports = app => {
    const { existsOrError, notExistsOrError, parseNumber } = app.api.validation

    const save = async (req, res) => {
        const grupo = { ...req.body }
        if (req.params.id)
            grupo.id = req.params.id

        try {
            existsOrError(grupo.descricao, 'Informe a descrição do grupo')
            existsOrError(grupo.uf, 'Informe a UF do grupo')
            existsOrError(grupo.cfop, 'Informe o CFOP do grupo')
            existsOrError(grupo.situacao_tributaria, 'Informe a situação tributária do grupo')
            existsOrError(grupo.perc_icms, 'Informe o percentual de ICMS do grupo')

            const grupoDB = await req.knex('grupos_tributacao')
                .where({ uf: grupo.uf, descricao: grupo.descricao })
            if (!grupo.id) {
                notExistsOrError(grupoDB, 'Grupo já cadastrado')
            }
        } catch (e) {
            res.status(400).send(e.toString())
        }

        grupo.perc_icms = parseNumber(grupo.perc_icms, ',')

        if (grupo.id) {
            req.knex('grupos_tributacao')
                .update(grupo)
                .where({ id: grupo.id })
                .then(_ => res.status(204).send())
                .catch(e => {
                    console.log(e.toString())
                    res.status(500).send('Erro ao atualizar o registro!')
                })
        } else {
            req.knex('grupos_tributacao')
                .insert(grupo)
                .then(_ => res.status(204).send())
                .catch(e => {
                    console.log(e.toString())
                    res.status(500).send('Erro ao inserir o registro!')
                })
        }
    }

    const get = async (req, res) => {
        req.knex('grupos_tributacao')
            .select('id', 'uf', 'descricao', 'cfop')
            .then(grupos => res.json(grupos))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getById = async (req, res) => {
        req.knex('grupos_tributacao')
            .where({ id: req.params.id }).first()
            .then(grupo => res.json(grupo))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getTela = async (req, res) => {
        if (req.params.id) {
            const grupo = await req.knex('grupos_tributacao')
                .where({ id: req.params.id }).first()
                .catch(e => res.status(500).send(e.toString()))

            const cfop = await req.knex('cfop').select('codigo_cfop', 'desc_cfop')
            const empresa = await req.knex('empresas').select('regime_tributario').first();

            let st = []

            if (empresa.regime_tributario === 'Simples nacional') {
                st = [
                    '101 - Tributada pelo Simples Nacional com permissão de crédito',
                    '102 - Tributada pelo Simples Nacional sem permissão de crédito',
                    '103 - Isenção do ICMS no Simples Nacional para faixa de receita bruta',
                    '201 - Tributada pelo Simples Nacional com permissão de crédito e com cobrança do ICMS por substituição tributária',
                    '202 - Tributada pelo Simples Nacional sem permissão de crédito e com cobrança do ICMS por substituição tributária',
                    '203 - Isenção do ICMS no Simples Nacional para faixa de receita bruta e com cobrança do ICMS por substituição tributária',
                    '300 - Imune',
                    '400 - Não tributada pelo Simples Nacional',
                    '500 - ICMS cobrado anteriormente por substituição tributária(substituído) ou por antecipação',
                    '900 - Outros'
                ]
            } else {
                st = [
                    '00 - Tributada integralmente',
                    '10 - Tributada e com cobrança do ICMS por substituição tributária',
                    '20 - Com redução de base de cálculo',
                    '30 - Isenta ou não tributada e com cobrança do ICMS por substituição tributária',
                    '40 - Isenta',
                    '41 - Não tributada',
                    '50 - Suspensão',
                    '51 - Diferimento',
                    '60 - ICMS cobrado anteriormente por substituição tributária',
                    '70 - Com redução de base de cálculo e cobrança do ICMS por substituição tributária',
                    '90 - Outras'
                ]
            }

            const tela = {
                st,
                grupo,
                cfop
            }
            res.json(tela);

        } else {
            const cfop = await req.knex('cfop').select('codigo_cfop', 'desc_cfop')

            const empresa = await req.knex('empresas').select('regime_tributario').first();

            let st = []

            if (empresa.regime_tributario === 'Simples nacional') {
                st = [
                    '101 - Tributada pelo Simples Nacional com permissão de crédito',
                    '102 - Tributada pelo Simples Nacional sem permissão de crédito',
                    '103 - Isenção do ICMS no Simples Nacional para faixa de receita bruta',
                    '201 - Tributada pelo Simples Nacional com permissão de crédito e com cobrança do ICMS por substituição tributária',
                    '202 - Tributada pelo Simples Nacional sem permissão de crédito e com cobrança do ICMS por substituição tributária',
                    '203 - Isenção do ICMS no Simples Nacional para faixa de receita bruta e com cobrança do ICMS por substituição tributária',
                    '300 - Imune',
                    '400 - Não tributada pelo Simples Nacional',
                    '500 - ICMS cobrado anteriormente por substituição tributária(substituído) ou por antecipação',
                    '900 - Outros'
                ]
            } else {
                st = [
                    '00 - Tributada integralmente',
                    '10 - Tributada e com cobrança do ICMS por substituição tributária',
                    '20 - Com redução de base de cálculo',
                    '30 - Isenta ou não tributada e com cobrança do ICMS por substituição tributária',
                    '40 - Isenta',
                    '41 - Não tributada',
                    '50 - Suspensão',
                    '51 - Diferimento',
                    '60 - ICMS cobrado anteriormente por substituição tributária',
                    '70 - Com redução de base de cálculo e cobrança do ICMS por substituição tributária',
                    '90 - Outras'
                ]
            }

            const tela = {
                st,
                cfop
            }
            res.json(tela);
        }
    }

    const remove = async (req, res) => {
        try {

            const exclusao = await req.knex('grupos_tributacao')
                .where({ id: req.params.id }).delete()

            existsOrError(exclusao, 'Grupo não encontrado')
            res.status(204).send()
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    return { save, get, getById, getTela, remove }
}