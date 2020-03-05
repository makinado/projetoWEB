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
            existsOrError(usuario.id_perfil, 'Perfil do usuário não informado')
            existsOrError(usuario.nome, 'Nome não informado')
            existsOrError(usuario.email, 'E-mail não informado')
            existsOrError(usuario.senha, 'Senha não informada')
            existsOrError(usuario.confirmaSenha, 'Confirmação de Senha inválida')
            equalsOrError(usuario.senha, usuario.confirmaSenha,
                'Senhas não conferem')

            const usuarioFromDB = await app.db('usuarios')
                .where({ email: usuario.email }).first()
            if (!usuario.id) {
                notExistsOrError(usuarioFromDB, 'Usuário já cadastrado')
            }
        } catch (msg) {
            return res.status(400).send(msg)
        }

        usuario.senha = encryptSenha(usuario.senha)
        delete usuario.confirmaSenha
        delete usuario.iat
        delete usuario.exp
        delete usuario.token

        var empresas = usuario.empresas
        delete usuario.empresas

        if (usuario.id) {
            return app.db('usuarios')
                .update(usuario)
                .where({ id: usuario.id })
                .then(async function () {
                    if (empresas) {
                        await app.db('usuario_empresas').where({ id_usuario: usuario.id }).delete()
                        empresas = await empresas.map(empresa => {
                            const usuario_empresas = {
                                id_usuario: usuario.id,
                                id_empresa: empresa
                            }

                            return usuario_empresas
                        })
                        return app.db.batchInsert('usuario_empresas', empresas)
                    }
                })
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
        } else {
            return app.db('usuarios')
                .insert(usuario).returning('id')
                .then(async function (id) {
                    if (empresas) {
                        empresas = await empresas.map(empresa => {
                            const usuario_empresas = {
                                id_usuario: id[0],
                                id_empresa: empresa
                            }
                            return usuario_empresas
                        })
                        return app.db.batchInsert('usuario_empresas', empresas)
                    }

                })
                .then(_ => res.status(204).send())
                .catch(e => res.status(500).send(e.toString()))
        }
    }

    const getEmpresas = async (req, res) => {
        app.db('usuario_empresas')
            .join('empresas', 'usuario_empresas.id_empresa', 'empresas.id')
            .select('empresas.id as value', 'empresas.nome as text', 'cnpj')
            .where({ id_usuario: req.params.id })
            .then(empresas => res.json(empresas))
            .catch(e => res.status(500).send(e.toString()))
    }

    const get = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await app.db('usuarios').count('id').first()
        const count = parseInt(result.count)

        app.db('usuarios')
            .join('perfil', 'usuarios.id_perfil', 'perfil.id')
            .select('usuarios.id', 'nome', 'perfil.descricao as perfil', 'email', 'contato')
            .limit(limit).offset(page * limit - limit)
            .orderBy('nome')
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
            .catch(e => res.status(500).send(e.toString()))
    }

    const getAll = async (req, res) => {
        app.db('usuarios')
            .select('id as value', 'nome as text')
            .then(usuarios => res.json(usuarios))
            .catch(e => res.status(500).send(e.toString()))
    }

    const getById = async (req, res) => {
        app.db('usuarios')
            .select('id', 'nome', 'email', 'contato', 'id_perfil')
            .where({ id: req.params.id })
            .first()
            .then(async usuario => {
                usuario.empresas = await app.db('usuario_empresas')
                    .select('id_empresa').where({ id_usuario: usuario.id }).then(empresas => empresas.map(e => e.id_empresa))
                res.json(usuario)
            })
            .catch(e => res.status(500).send(e.toString()))
    }

    const remove = async (req, res) => {
        try {
            const rowsUpdated = await app.db('usuarios')
                .where({ id: req.params.id }).delete()
            existsOrError(rowsUpdated, 'Usuário não encontrado')

            res.status(204).send()
        } catch (e) {
            res.status(400).send(e.toString())
        }
    }

    const recoverPassword = async (req, res) => {
        const email = req.body.email

        try {
            existsOrError(email, 'E-mail não informado')

            var usuarioBD = await app.db('usuarios')
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
            id_perfil: usuarioBD.id_perfil,
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