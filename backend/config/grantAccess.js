module.exports = (middleware, resource) => {
    return (req, res, next) => {
        console.log(resource, req.method)
        if (req.method == "POST") {
            if (resource || req.user[resource + '_create']) {
                middleware(req, res, next)
            } else {
                return res.status(401).send('Acesso não autorizado')
            }
        } else
            if (req.method == "GET") {
                if (resource || req.user[resource + '_read']) {
                    middleware(req, res, next)
                } else {
                    return res.status(401).send('Acesso não autorizado')
                }
            } else
                if (req.method == "PUT") {
                    if (resource || req.user[resource + '_update']) {
                        middleware(req, res, next)
                    } else {
                        return res.status(401).send('Acesso não autorizado')
                    }
                } else
                    if (req.method == "DELETE") {
                        if (resource || req.user[resource + '_delete']) {
                            middleware(req, res, next)
                        } else {
                            return res.status(401).send('Acesso não autorizado')
                        }
                    } else return res.status(400).send('Operção não autorizada')
    }
}