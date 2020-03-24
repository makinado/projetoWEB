const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const signin = async (req, res) => {
        const usuario = { ...req.body }

        if (!usuario) return
        if (!usuario.token) {
            if (!usuario.email || !usuario.senha) {
                return res.status(400).send('Usuário ou senha não informados')
            }
            var usuarioBD = await app.db('usuarios')
                .join('acesso', 'usuarios.id', 'acesso.id_usuario')
                .select('id', 'nome', 'email', 'senha', 'contato', 'img', 'acesso.*')
                .where({ email: usuario.email })
                .first()

            if (!usuarioBD) return res.status(400).send('Usuário não encontrado')
            const isMatch = bcrypt.compareSync(usuario.senha, usuarioBD.senha)
            if (!isMatch) return res.status(400).send('Senha inválida')
        } else {
            var usuarioBD = await app.db('usuarios')
                .where({ email: usuario.email })
                .first()
        }

        const now = Math.floor(Date.now() / 1000)

        delete usuarioBD.senha

        const payload = {
            ...usuarioBD,
            iat: now,
            exp: now + (60 * 60 * 4)
        }

        res.json({
            ...payload,
            token: usuario.token ? usuario.token : jwt.encode(payload, process.env.AUTH_SECRET)
        })
    }

    const signup = async (req, res) => {
        const usuario = { ...req.body }

        // todo
        // criar nova base para o usuario master
        // criar a empresa na base
        // criar o usuario na base
        // alimentar a tabela usuario_empresas

        return res.status(500).send('FAZER SINGUP')

        // app.db('usuarios')
        //     .insert(usuario).returning('id')
        //     .then(async function (id) {
        //         if (empresas) {
        //             empresas = await empresas.map(empresa => {
        //                 const usuario_empresas = {
        //                     id_usuario: id[0],
        //                     id_empresa: empresa
        //                 }
        //                 return usuario_empresas
        //             })
        //             return app.db.batchInsert('usuario_empresas', empresas)
        //         }

        //     })
        //     .then(_ => res.status(204).send())
        //     .catch(e => res.status(500).send(e.toString()))
    }

    const validateToken = async (req, res) => {
        const usuarioData = req.body || null
        try {
            if (usuarioData) {
                const token = jwt.decode(usuarioData.token, process.env.AUTH_SECRET)
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