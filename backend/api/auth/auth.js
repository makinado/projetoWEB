const { authSecret } = require('../../.env')
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
            var usuarioBD = await app.dbUsers('usuarios')
                .where({ email: usuario.email })
                .first()

            if (!usuarioBD) return res.status(400).send('Usuário não encontrado')
            const isMatch = bcrypt.compareSync(usuario.senha, usuarioBD.senha)
            if (!isMatch) return res.status(400).send('Senha inválida')
        } else {
            var usuarioBD = await app.dbUsers('usuarios')
                .where({ email: usuario.email })
                .first()
        }

        const now = Math.floor(Date.now() / 1000)

        const payload = {
            id: usuarioBD.id,
            nome: usuarioBD.nome,
            email: usuarioBD.email,
            contato: usuarioBD.contato,
            id_perfil: usuarioBD.id_perfil,
            img: usuarioBD.img,
            id_base: null,
            iat: now,
            exp: now + (60 * 60 * 4)
        }

        res.json({
            ...payload,
            token: usuario.token ? usuario.token : jwt.encode(payload, authSecret)
        })
    }

    const validateToken = async (req, res) => {
        const usuarioData = req.body || null
        try {
            if (usuarioData) {
                const token = jwt.decode(usuarioData.token, authSecret)
                if (new Date(token.exp * 1000) > new Date()) {
                    return res.send(true)
                }
            }
        } catch (e) {
            // erro com o token
        }

        res.send(false)
    }

    return { signin, validateToken }
}