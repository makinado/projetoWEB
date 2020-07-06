const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const { existsOrError, notExistsOrError, equalsOrError } = app.api.validation

    const encryptSenha = senha => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(senha, salt)
    }

    const signin = async (req, res) => {
        const funcionario = { ...req.body }

        if (!funcionario) return
        if (!funcionario.email || !funcionario.senha) {
            return res.status(400).send('E-mail ou senha não informados')
        }
        var funcionarioBD = await app.commonDb('funcionarios')
            .where({ email: funcionario.email })
            .first()

        if (!funcionarioBD) return res.status(400).send('Funcionário não encontrado')
        const isMatch = bcrypt.compareSync(funcionario.senha, funcionarioBD.senha)
        if (!isMatch) return res.status(400).send('Senha inválida')

        const now = Math.floor(Date.now() / 1000)
        delete funcionarioBD.senha

        const payload = {
            ...funcionarioBD,
            iat: now,
            exp: now + (60 * 60 * 8)
        }

        return res.json({
            ...payload,
            token: funcionario.token ? funcionario.token : jwt.encode(payload, process.env.AUTH_SECRET)
        })
    }

    const signup = async (req, res) => {
        const funcionario = { ...req.body }

        try {
            //valida funcionario
            existsOrError(funcionario.nome, 'Nome não informado')
            existsOrError(funcionario.email, 'E-mail não informado')
            existsOrError(funcionario.senha, 'Senha não informada')
            existsOrError(funcionario.contato, 'Contato não informado')
            existsOrError(funcionario.confirmaSenha, 'Confirmação de senha não informada')
            equalsOrError(funcionario.senha, funcionario.confirmaSenha,
                'Senhas não conferem')
            existsOrError(funcionario.senhaMestre, 'Senha mestre não informada')
            equalsOrError(funcionario.senhaMestre, process.env.AUTH_FUNC, 'Senha mestre incorreta')

            const funcionarioFromDB = await app.commonDb('funcionarios')
                .where({ email: funcionario.email }).first()
            if (!funcionario.id) {
                notExistsOrError(funcionarioFromDB, 'Usuário já cadastrado')
            }

        } catch (e) {
            return res.status(400).send(e)
        }

        funcionario.data_criado = new Date()
        funcionario.senha = encryptSenha(funcionario.senha)
        delete funcionario.confirmaSenha
        delete funcionario.senhaMestre

        app.commonDb('funcionarios')
            .insert(funcionario).returning('id')
            .then(_ => res.status(204).send())
            .catch(e => { console.log(e); res.status(500).send("Erro ao salvar novo funcionário") })
    }

    const validateToken = async (req, res) => {

        const funcionario = req.body || null

        try {
            if (funcionario) {
                const token = jwt.decode(funcionario.token, process.env.AUTH_SECRET)
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