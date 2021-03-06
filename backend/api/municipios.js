module.exports = app => {
    const get = async (res) => {
        req.knex('municipios')
            .then(municipios => res.json(municipios))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getById = async (req, res) => {
        req.knex('municipios')
            .where({ cmun: req.params.id })
            .first()
            .then(municipio => res.json(municipio))
            .catch(e => res.status(500).send(e.toString()))
    }

    return {get, getById}
}