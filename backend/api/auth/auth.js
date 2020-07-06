const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')
const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

module.exports = app => {
    const { existsOrError, notExistsOrError, equalsOrError } = app.api.validation

    const encryptSenha = senha => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(senha, salt)
    }

    const signin = async (req, res) => {
        const usuario = { ...req.body }

        if (!usuario) return
        if (!usuario.email || !usuario.senha) {
            return res.status(400).send('Usuário ou senha não informados')
        }
        var usuarioBD = await app.commonDb('usuarios')
            .join('acesso', 'usuarios.id', 'acesso.id_usuario')
            .select('id', 'nome', 'email', 'senha', 'contato', 'img', 'nome_base', 'acesso.*')
            .where({ email: usuario.email })
            .first()

        if (!usuarioBD) return res.status(400).send('Usuário não encontrado')
        const isMatch = bcrypt.compareSync(usuario.senha, usuarioBD.senha)
        if (!isMatch) return res.status(400).send('Senha inválida')
        if (new Date(usuarioBD.data_validade) < new Date())
            return res.status(400).send('Parece que seu período de utilização do sistema acabou, realize o pagamento da sua fatura')

        console.log(usuarioBD)

        const now = Math.floor(Date.now() / 1000)
        delete usuarioBD.senha
        delete usuarioBD.id_usuario

        const payload = {
            ...usuarioBD,
            iat: now,
            exp: now + (60 * 60 * 4)
        }

        return res.json({
            ...payload,
            token: usuario.token ? usuario.token : jwt.encode(payload, process.env.AUTH_SECRET)
        })
    }

    const createDatabase = (cnpj) => {
        const databasename = 'db' + cnpj.replace(/[^\w\s]/gi, '')

        return app.commonDb.raw(`CREATE DATABASE ${databasename} TEMPLATE 'CampagWEB'`)
            .then(() => {
                return databasename
            })
    }

    const signup = async (req, res) => {
        const usuario = { ...req.body }

        try {
            //valida usuario
            existsOrError(usuario.nome, 'Nome não informado')
            existsOrError(usuario.email, 'E-mail não informado')
            existsOrError(usuario.senha, 'Senha não informada')
            existsOrError(usuario.contato, 'Contato não informado')
            existsOrError(usuario.confirmaSenha, 'Confirmação de senha não informada')
            equalsOrError(usuario.senha, usuario.confirmaSenha,
                'Senhas não conferem')

            const usuarioFromDB = await app.commonDb('usuarios')
                .where({ email: usuario.email }).first()
            if (!usuario.id) {
                notExistsOrError(usuarioFromDB, 'Usuário já cadastrado')
            }

            //valida empresa
            existsOrError(usuario.cnpj, 'CNPJ não informado')
            existsOrError(usuario.nomeEmpresa, 'Razão social não informada')
        } catch (e) {
            return res.status(400).send(e)
        }

        const empresa = {
            cnpj: usuario.cnpj,
            nome: usuario.nomeEmpresa,
            email: usuario.emailEmpresa,
            contato: usuario.contatoEmpresa
        }

        delete usuario.confirmaSenha
        delete usuario.cnpj
        delete usuario.nomeEmpresa
        delete usuario.emailEmpresa
        delete usuario.contatoEmpresa

        usuario.senha = encryptSenha(usuario.senha)

        const acesso = {
            empresa_create: true,
            empresa_read: true,
            empresa_update: true,
            empresa_delete: true,

            usuario_create: true,
            usuario_read: true,
            usuario_update: true,
            usuario_delete: true,

            pessoa_create: true,
            pessoa_read: true,
            pessoa_update: true,
            pessoa_delete: true,

            produto_create: true,
            produto_read: true,
            produto_update: true,
            produto_delete: true,

            pedidos_create: true,
            pedidos_read: true,
            pedidos_update: true,
            pedidos_delete: true,

            compras_create: true,
            compras_read: true,
            compras_update: true,
            compras_delete: true,

            vendas_create: true,
            vendas_read: true,
            vendas_update: true,
            vendas_delete: true,

            pdv_create: true,
            pdv_read: true,
            pdv_update: true,
            pdv_delete: true,

            financeiro_create: true,
            financeiro_read: true,
            financeiro_update: true,
            financeiro_delete: true,

            contas_create: true,
            contas_read: true,
            contas_update: true,
            contas_delete: true,

            nfe_create: true,
            nfe_read: true,
            nfe_update: true,
            nfe_delete: true,

            nfce_create: true,
            nfce_read: true,
            nfce_update: true,
            nfce_delete: true,

            mdfe_create: true,
            mdfe_read: true,
            mdfe_update: true,
            mdfe_delete: true,

            agenda: true,
            atividades: true,
            configuracoes: true,

            rel_cadastros: true,
            rel_compras: true,
            rel_vendas: true,
            rel_estoque: true,
            rel_financeiro: true,
            rel_estat: true,
            data_validade: new Date().setDate(new Date().getDate() + 7)
        }

        try {
            await createDatabase(empresa.cnpj)
                .then(databasename => {
                    usuario.nome_base = databasename
                })
        } catch (e) {
            console.log(e)
            return res.status(500).send('Erro ao criar a base de dados, tente novamente mais tarde.')
        }

        return app.commonDb.transaction(async function (trx) {
            return app.commonDb('usuarios')
                .insert(usuario).returning('id')
                .transacting(trx)
                .then(id_usuario => {
                    return app.commonDb('acesso')
                        .insert({ ...acesso, id_usuario: id_usuario[0] })
                        .transacting(trx)
                        .then(() => {
                            return req.knex('usuarios')
                                .insert({ ...usuario, id: id_usuario[0] })
                                .then(() => {
                                    return req.knex('empresas')
                                        .insert(empresa).returning('id')
                                        .then(id_empresa => {
                                            return req.knex('usuario_empresas')
                                                .insert({ id_empresa: id_empresa[0], id_usuario: id_usuario[0] })
                                        })
                                })
                        })
                })
                .then(trx.commit)
                .catch(trx.rollback);
        }).then(_ => {
            if (usuario.contato) {
                client.messages.create({
                    from: 'whatsapp:+14155238886',
                    body: `Olá ${usuario.nome}, aproveite o seu período de teste grátis. \n\nGostaríamos de lebra-lo que o sistema possui uma central de ajuda para dúvidas comuns e estaremos aqui para tirar suas dúvidas em relação ao sistema, obrigado.`,
                    to: `whatsapp:+55${usuario.contato}`
                }).then(message => console.log(message.sid)).catch(e => console.log(e))
            }

            return res.status(204).send()
        }).catch(async e => {
            await app.commonDb.raw(`DROP DATABASE ${usuario.nome_base}`)
            console.log(e);
            return res.status(500).send('Ocorreu um erro durante o processo, tente novamente mais tarde')
        })
    }

    const validateToken = async (req, res) => {

        const usuario = req.body || null

        try {
            if (usuario) {
                const token = jwt.decode(usuario.token, process.env.AUTH_SECRET)
                if (new Date(token.exp * 1000) > new Date()) {
                    return res.send(true)
                }
            }
        } catch (e) {
            // erro com o token
        }

        res.send(false)
    }

    return { signin, signup, validateToken }
}