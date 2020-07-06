const commonDb = require('../knexfile')

module.exports = (middleware, resource) => {
    return async (req, res, next) => {
        if (req.url == '/signup' || req.url == '/signin' || req.url == '/validateToken' || req.url == '/recoverPassword')
            return next()

        if (!req.headers.user) {
            res.status(400).send('Usuário não informado');
            return;
        }
        const user = JSON.parse(req.headers.user)

        // console.log(resource)

        var acesso = false
        if (req.method == "POST") {
            if (user[resource + '_create'])
                acesso = await commonDb('acesso').select(resource + '_create').where({ id_usuario: user.id }).first().then(res => res[resource + '_create'])
            else if (user[resource])
                acesso = await commonDb('acesso').select(resource).where({ id_usuario: user.id }).first().then(res => res[resource])
        } else if (req.method == "GET") {
            if (user[resource + '_read'])
                acesso = await commonDb('acesso').select(resource + '_read').where({ id_usuario: user.id }).first().then(res => res[resource + '_read'])
            else if (user[resource])
                acesso = await commonDb('acesso').select(resource).where({ id_usuario: user.id }).first().then(res => res[resource])
        } else if (req.method == "PUT") {
            if (user[resource + '_update'])
                acesso = await commonDb('acesso').select(resource + '_update').where({ id_usuario: user.id }).first().then(res => res[resource + '_update'])
            else if (user[resource])
                acesso = await commonDb('acesso').select(resource).where({ id_usuario: user.id }).first().then(res => res[resource])
        } else if (req.method == "DELETE") {
            if (user[resource + '_delete'])
                acesso = await commonDb('acesso').select(resource + '_delete').where({ id_usuario: user.id }).first().then(res => res[resource + '_delete'])
            else if (user[resource])
                acesso = await commonDb('acesso').select(resource).where({ id_usuario: user.id }).first().then(res => res[resource])
        }

        if (!acesso)
            return res.status(400).send("O acesso ao recurso foi negado, consulte o administrador da empresa")
        else
            middleware(req, res, next)
    }
}