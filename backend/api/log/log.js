module.exports = app => {
    const { existsOrError } = app.api.validation

    const save = async (req, res) => {
        const log = { ...req.body }

        if (req.params.id)
            log.id = req.params.id

        try {
            existsOrError(log.id_usuario, 'Informe o usuário do log')
            existsOrError(log.data, 'Informe a data do log')
            existsOrError(log.hora, 'Informe a hora do log')
            existsOrError(log.tipo, 'Informe o tipo do log')
            existsOrError(log.tela, 'Informe a tela do log')
            existsOrError(log.detalhe, 'Informe o detalhe do log')

        } catch (e) {
            return res.status(400).send(e.toString())
        }

        req.knex('log')
            .insert(log)
            .then(_ => res.status(204).send())
            .catch(e => res.status(500).send(e.toString()))
    }

    const getAll = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await req.knex('log').count('id').first()
        const count = parseInt(result.count)

        req.knex('log')
            .leftJoin('usuarios', 'log.id_usuario', 'usuarios.id')
            .select('log.id', 'usuarios.nome as usuario', 'data', 'hora', 'tela', 'tipo', 'detalhe')
            .limit(limit).offset(page * limit - limit)
            .where(async (qb) => {
                // pesquisa avançada
                if (req.query.tipo == 2) {
                    if (req.query.id) {
                        qb.where('log.id', '=', req.query.id);
                    } else if (req.query.usuario) {
                        qb.orWhere('log.id_usuario', '=', req.query.usuario);
                    }
                    if (req.query.tipo_acao) {
                        if (req.query.tipo_acao == 1) {
                            qb.where('log.tipo', '=', 'GRAVAÇÂO');
                        } else if (req.query.tipo_acao == 2) {
                            qb.where('log.tipo', '=', 'ALTERAÇÃO');
                        } else {
                            qb.where('log.tipo', '=', 'EXCLUSÃO');
                        }
                    }

                    if (req.query.data_inicial && req.query.data_final) {
                        qb.whereBetween('log.data', [req.query.data_inicial, req.query.data_final])
                    }
                    if (req.query.hora_inicial && req.query.hora_final) {
                        qb.whereBetween('log.hora', [req.query.hora_inicial, req.query.hora_final])
                    }
                } else {
                    // pesquisa rapida
                    if (req.query.id) {
                        qb.where('log.id', '=', req.query.id);
                    } else if (req.query.usuario) {
                        qb.orWhere('log.id_usuario', '=', req.query.usuario);
                    }
                    if (req.query.tipo_acao) {
                        if (req.query.tipo_acao == 1) {
                            qb.where('log.tipo', '=', 'GRAVAÇÃO');
                        } else if (req.query.tipo_acao == 2) {
                            qb.where('log.tipo', '=', 'ALTERAÇÃO');
                        } else {
                            qb.where('log.tipo', '=', 'EXCLUSÃO');
                        }
                    }

                    if (req.query.data_inicial && req.query.data_final) {
                        qb.whereBetween('log.data', [req.query.data_inicial, req.query.data_final])
                    }
                    if (req.query.hora_inicial && req.query.hora_final) {
                        qb.whereBetween('log.hora', [req.query.hora_inicial, req.query.hora_final])
                    }
                }
            })
            .orderBy([{ column: 'data', order: 'desc' }, { column: 'hora', order: 'desc' }])
            .then(logs => res.json({ data: logs, count, limit }))
            .catch(e => res.status(500).send(e.toString()))
    }

    const get = async (req, res) => {
        req.knex('log')
            .select('hora', 'id_usuario', 'tela', 'tipo', 'detalhe')
            .where({ data: new Date() })
            .orderBy([{ column: 'data', order: 'desc' }, { column: 'hora', order: 'desc' }])
            .then(async logs => {
                logs = logs.map(async log => {
                    log.usuario = await req.knex('usuarios').select('img', 'nome').where({ id: log.id_usuario }).first()

                    return log
                })

                res.json(await Promise.all(logs));
            })
            .catch(e => res.status(500).send(e.toString()))


    }

    return { save, get, getAll }
}