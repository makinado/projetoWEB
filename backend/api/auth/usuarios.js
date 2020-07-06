const bcrypt = require('bcrypt-nodejs')
const generator = require('generate-password')
const jwt = require('jwt-simple')
const nodemailer = require("nodemailer");
require('dotenv').config()

module.exports = app => {
    const { existsOrError, notExistsOrError, equalsOrError } = app.api.validation

    const encryptSenha = senha => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(senha, salt)
    }

    const save = async (req, res) => {
        const usuario = { ...req.body }
        
        try {
            existsOrError(usuario.nome, 'Nome não informado')
            existsOrError(usuario.email, 'E-mail não informado')
            existsOrError(usuario.senha, 'Senha não informada')
            // existsOrError(usuario.acessos, 'Permissões não informadas')
            // existsOrError(usuario.empresas, 'Empresas que o usuário acessará não informadas')
            existsOrError(usuario.confirmaSenha, 'Confirmação de Senha inválida')
            equalsOrError(usuario.senha, usuario.confirmaSenha,
                'Senhas não conferem')

            const usuarioFromDB = await app.commonDb('usuarios')
                .where({ email: usuario.email }).first()
            if (!usuario.id) {
                notExistsOrError(usuarioFromDB, 'Usuário já cadastrado')
            }
        } catch (msg) {
            return res.status(400).send(msg)
        }

        usuario.senha = encryptSenha(usuario.senha)

        delete usuario.confirmaSenha
        delete usuario.token

        var empresas = usuario.empresas
        var acessos = usuario.acessos
        delete usuario.empresas
        delete usuario.acessos

        if (usuario.id) {
            return app.commonDb.transaction(async function (trx) {
                return app.commonDb('usuarios')
                    .update(usuario)
                    .where({ id: usuario.id })
                    .transacting(trx)
                    .then(async function () {
                        if (acessos) {
                            await app.commonDb('acesso').where({ id_usuario: usuario.id }).delete().transacting(trx)
                            return app.commonDb('acesso')
                                .insert({ ...acessos, id_usuario: usuario.id })
                                .transacting(trx)
                                .then(() => {
                                    return req.knex('usuarios')
                                        .update(usuario)
                                        .where({ id: usuario.id })
                                        .then(async () => {
                                            if (empresas) {
                                                empresas = empresas.map(e => {
                                                    const newEmp = {
                                                        id_empresa: e,
                                                        id_usuario: usuario.id
                                                    }

                                                    return newEmp
                                                })
                                                await req.knex('usuario_empresas').where({ id_usuario: usuario.id }).delete()
                                                return req.knex.batchInsert('usuario_empresas', empresas)
                                            }
                                        })
                                })
                        } else {
                            return req.knex('usuarios')
                                .update(usuario)
                                .where({ id: usuario.id })
                                .then(async () => {
                                    if (empresas) {
                                        empresas = empresas.map(e => {
                                            const newEmp = {
                                                id_empresa: e,
                                                id_usuario: usuario.id
                                            }

                                            return newEmp
                                        })
                                        await req.knex('usuario_empresas').where({ id_usuario: usuario.id }).delete()
                                        return req.knex.batchInsert('usuario_empresas', empresas)
                                    }
                                })
                        }
                    })
                    .then(trx.commit).catch(trx.rollback);
            }).then(function (inserts) {
                res.status(204).send()
            }).catch(function (error) {
                console.log(error.toString())
                res.status(500).send("Erro ao salvar usuário")
            });
        } else {
            return app.commonDb.transaction(async function (trx) {
                return app.commonDb('usuarios')
                    .insert(usuario).returning('id')
                    .transacting(trx)
                    .then(async function (id_usuario) {
                        if (acessos) {
                            return app.commonDb('acesso')
                                .insert({ ...acessos, id_usuario: id_usuario[0] })
                                .transacting(trx)
                                .then(() => {
                                    return req.knex('usuarios')
                                        .insert({ ...usuario, id: id_usuario[0] })
                                        .then(() => {
                                            if (empresas) {
                                                empresas = empresas.map(e => {
                                                    const newEmp = {
                                                        id_empresa: e,
                                                        id_usuario: id_usuario[0]
                                                    }

                                                    return newEmp
                                                })
                                                return req.knex.batchInsert('usuario_empresas', empresas)
                                            }
                                        })
                                })
                        } else {
                            return req.knex('usuarios')
                                .insert({ ...usuario, id: id_usuario[0] })
                                .then(() => {
                                    if (empresas) {
                                        empresas = empresas.map(e => {
                                            const newEmp = {
                                                id_empresa: e,
                                                id_usuario: id_usuario[0]
                                            }

                                            return newEmp
                                        })
                                        return req.knex.batchInsert('usuario_empresas', empresas)
                                    }
                                })
                        }
                    })
                    .then(trx.commit).catch(trx.rollback);
            }).then(function (inserts) {
                res.status(204).send()
            }).catch(function (error) {
                console.log(error.toString())
                res.status(500).send("Erro ao salvar usuário")
            });
        }
    }

    const getEmpresas = async (req, res) => {
        req.knex('usuario_empresas')
            .join('empresas', 'usuario_empresas.id_empresa', 'empresas.id')
            .select('empresas.id as value', 'empresas.nome as text', 'cnpj')
            .where({ id_usuario: req.params.id })
            .then(empresas => res.json(empresas))
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar empresas do usuário") })
    }

    const get = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await req.knex('usuarios').count('id').first()
        const count = parseInt(result.count)

        req.knex('usuarios')
            .select('usuarios.id', 'nome', 'email', 'contato')
            .limit(limit).offset(page * limit - limit)
            .orderBy(req.query.order || "nome", req.query.desc || "asc")
            .where((qb) => {
                if (req.query.tipo == 2) {
                    // pesquisa avançada
                    if (req.query.nome) {
                        qb.where('usuarios.nome', 'ilike', `%${req.query.nome}%`);
                    } else if (req.query.id) {
                        qb.orWhere('usuarios.id', '=', req.query.id);
                    }
                    if (req.query.email) {
                        qb.where('usuarios.email', 'ilike', `%${req.query.email}%`);
                    }
                    if (req.query.contato) {
                        qb.where('usuarios.contato', 'ilike', `%${req.query.contato}%`);
                    }
                } else {
                    // pesquisa rapida
                    if (req.query.nome) {
                        qb.where('usuarios.nome', 'ilike', `${req.query.nome}%`);
                    } else if (req.query.id) {
                        qb.orWhere('usuarios.id', '=', req.query.id);
                    }
                    if (req.query.email) {
                        qb.where('usuarios.email', 'ilike', `${req.query.email}%`);
                    }
                    if (req.query.contato) {
                        qb.where('usuarios.contato', 'ilike', `${req.query.contato}%`);
                    }
                }
            })
            .then(usuarios => res.json({ data: usuarios, count, limit }))
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar usuários") })
    }

    const getAll = async (req, res) => {
        req.knex('usuarios')
            .select('id as value', 'nome as text')
            .then(usuarios => res.json(usuarios))
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar usuários") })
    }

    const getById = async (req, res) => {
        req.knex('usuarios')
            .select('id', 'nome', 'email', 'contato')
            .where({ id: req.params.id })
            .first()
            .then(async usuario => {
                usuario.empresas = await req.knex('usuario_empresas')
                    .select('id_empresa').where({ id_usuario: usuario.id }).then(empresas => empresas.map(e => e.id_empresa))
                usuario.acessos = await app.commonDb('acesso').where({ id_usuario: usuario.id }).first()
                res.json(usuario)
            })
            .catch(e => { console.log(e.toString()); res.status(500).send("Erro ao buscar usuário") })
    }

    const remove = async (req, res) => {
        try {
            const log = await req.knex('log').where({ id_usuario: req.params.id }).first()
            notExistsOrError(log, 'Há atividades associadas a esse usuário')

            const vendas = await req.knex('venda').where({ id_vendedor: req.params.id }).first()
            notExistsOrError(vendas, 'Há vendas associadas a essa pessoa')

            app.commonDb.transaction(async function (trx) {
                return app.commonDb('usuarios')
                    .where({ id: req.params.id }).delete()
                    .transacting(trx)
                    .then(function () {
                        return app.commonDb('acesso')
                            .where({ id_usuario: req.params.id }).delete()
                            .transacting(trx)
                            .then(function () {
                                return req.knex('usuarios').where({ id: req.params.id }).delete()
                                    .then(function () {
                                        return req.knex('usuario_empresas').where({ id_usuario: req.params.id }).delete()
                                    })
                            })
                    })
                    .then(trx.commit)
                    .catch(trx.rollback);
            }).then(function (inserts) {
                res.status(204).send()
            }).catch(function (error) {
                console.log(error.toString())
                res.status(500).send(error.toString())
            });
        } catch (e) {
            return res.status(400).send(e.toString())
        }
    }

    const recoverPassword = async (req, res) => {
        const email = req.body.email

        try {
            existsOrError(email, 'E-mail não informado')

            var usuarioBD = await req.knex('usuarios')
                .where({ email: email }).first()
            existsOrError(usuarioBD, 'Nenhum usuário encontrado com esse e-mail')
        } catch (e) {
            return res.status(400).send(e.toString())
        }

        // const senha = generator.generate({ length: 6, numbers: true, uppercase: false }).toUpperCase()

        const now = Math.floor(Date.now() / 1000)

        const payload = {
            id: usuarioBD.id,
            nome: usuarioBD.nome,
            email: usuarioBD.email,
            iat: now,
            exp: now + 3600000
        }

        const token = jwt.encode(payload, process.env.AUTH_SECRET)

        try {
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // use SSL
                auth: {
                    user: process.env.EMAIL, // 
                    pass: process.env.SENHA // 
                },
            });
            const message = {
                to: 'leandrocantiero@hotmail.com', // list of receivers
                from: 'leandrocantiero03@gmail.com', // sender address
                subject: 'Recuperação de senha NOME_EMPRESA', // Subject line
                text: `Olá ${usuarioBD.nome}, você solicitou a recuperação de senha para a sua conta na NOME_EMPRESA.\n\n` +
                    'Clique no link para recuperar a senha:\n\n' +
                    'http://localhost:8081/reset/' + token + '\n\n' +
                    'Caso não tenha solicitado a recuperação, apenas ignore este e-mail.\n\n' +
                    'Atenciosamente,\n' +
                    'NOME_EMPRESA.'
            }
            transporter.sendMail(message, (err, data) => {
                if (err) {
                    console.log(err)
                    return res.status(500).send('Houve um problema ao enviar o e-mail de recuperação, tente novamente mais tarde')
                } else {
                    return res.status(204).send()
                }
            });
        } catch (e) {
            console.log(e.toString())
            res.status(500).send()
        }
    }

    return { save, get, getAll, getById, getEmpresas, remove, recoverPassword }
}