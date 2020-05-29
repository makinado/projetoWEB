const multer = require('multer')
const grantAccess = require('./grantAccess')
const fs = require('fs'),
    sharp = require('sharp');


const storageIMG = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/img/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const storageXML = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/xml/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const fileFilterIMG = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
        return cb(null, true)
    else
        return cb(null, false);
}
const fileFilterXML = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'text/xml')
        return cb(null, true)
    else
        return cb(null, false)
}

const uploadIMG = multer({
    storage: storageIMG,
    limits: { fileSize: 1024 * 1024 * 20 },
    fileFilter: fileFilterIMG
})
const uploadXML = multer({
    storage: storageXML,
    limits: { fileSize: 1024 * 1024 * 20 },
    fileFilter: fileFilterXML
})

module.exports = app => {
    app.post('/uploadIMG', uploadIMG.single('img'), function (req, res, next) {

        const file = req.file
        const newPath = file.path.split('.')[0] + '.jpeg';

        sharp(file.path, { failOnError: false })
            .resize(200, 200)
            .toFormat('jpeg')
            .toBuffer()
            .then(data => {
                fs.access(file.path, (err) => {
                    // Um erro significa que a o arquivo não existe, então não tentamos apagar
                    if (!err) {
                        //Se não houve erros, tentamos apagar
                        fs.unlink(file.path, err => {
                            // Não quero que erros aqui parem todo o sistema, então só vou imprimir o erro, sem throw.
                            if (err) console.log(err)
                        })
                    }
                });
                fs.writeFile(newPath, data, err => {
                    if (err) {
                        // Já aqui um erro significa que o upload falhou, então é importante que o usuário saiba.
                        throw err;
                    }
                });
                res.status(200).send(newPath)
            })
            .catch(e => res.status(500).send('Erro ao fazer fazer upload da imagem'))

    })
    app.post('/uploadXML', uploadXML.fields([{ name: 'xml' }]), function (req, res, next) {
        return res.status(204).send()
    })

    app.post('/signup', app.api.auth.auth.signup)
    app.post('/signin', app.api.auth.auth.signin)
    app.post('/validateToken', app.api.auth.auth.validateToken)
    app.post('/recoverPassword', app.api.auth.usuarios.recoverPassword)


    app.route('/empresas/todas')
        .all(app.config.passport.authenticate())
        .get(app.api.empresas.empresas.getAll)
    app.route('/empresas')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.empresas.empresas.save, 'empresa'))
        .get(grantAccess(app.api.empresas.empresas.get, 'empresa'))
    app.route('/empresas/:id')
        .all(app.config.passport.authenticate())
        .put(grantAccess(app.api.empresas.empresas.save, 'empresa'))
        .get(grantAccess(app.api.empresas.empresas.getById, 'empresa'))
        .delete(grantAccess(app.api.empresas.empresas.remove, 'empresa'))
    app.route('/emailsEmpresa/:id')
        .all(app.config.passport.authenticate())
        .get(grantAccess(app.api.empresas.empresas.getEmails, 'empresa'))


    app.route('/usuarios')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.auth.usuarios.save, 'usuario'))
        .get(grantAccess(app.api.auth.usuarios.get, 'usuario'))
    app.route('/usuarios/todos')
        .all(app.config.passport.authenticate())
        .get(app.api.auth.usuarios.getAll)
    app.route('/usuarioEmpresas/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.auth.usuarios.getEmpresas)
    app.route('/usuarios/:id')
        .all(app.config.passport.authenticate())
        .put(grantAccess(app.api.auth.usuarios.save, 'usuario'))
        .get(app.api.auth.usuarios.getById)
        .delete(grantAccess(app.api.auth.usuarios.remove, 'usuario'))


    app.route('/pessoas/clientes')
        // .all(app.config.passport.authenticate())
        .post(app.api.pessoas.pessoas.fastSave)
        .get(app.api.pessoas.pessoas.getClientes)
    app.route('/pessoas/fornecedores')
        .all(app.config.passport.authenticate())
        .post(app.api.pessoas.pessoas.fastSave)
        .get(app.api.pessoas.pessoas.getFornecs)
    app.route('/pessoas/transportadoras')
        .all(app.config.passport.authenticate())
        .post(app.api.pessoas.pessoas.fastSave)
        .get(app.api.pessoas.pessoas.getTransps)
    app.route('/pessoas/todas')
        .all(app.config.passport.authenticate())
        .post(app.api.pessoas.pessoas.fastSave)
        .get(app.api.pessoas.pessoas.getAll)
    app.route('/pessoas')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.pessoas.pessoas.save, 'pessoa'))
        .get(grantAccess(app.api.pessoas.pessoas.get, 'pessoa'))
    app.route('/pessoas/:id')
        .all(app.config.passport.authenticate())
        .put(grantAccess(app.api.pessoas.pessoas.save, 'pessoa'))
        .get(grantAccess(app.api.pessoas.pessoas.getById, 'pessoa'))
        .delete(grantAccess(app.api.pessoas.pessoas.remove, 'pessoa'))
    app.route('/pessoasComFinanceiro/:id')
        .all(app.config.passport.authenticate())
        .get(grantAccess(app.api.pessoas.pessoas.getWithFinanceiro, 'pessoa'))
    app.route('/pessoasPorCategoria/:id_categoria')
        .all(app.config.passport.authenticate())
        .get(grantAccess(app.api.pessoas.pessoas.getByCategoria, 'pessoa'))


    app.route('/categorias')
        .all(app.config.passport.authenticate())
        .post(app.api.categorias.save)
        .get(app.api.categorias.get)

    app.route('/categorias/pessoas')
        .all(app.config.passport.authenticate())
        .get(app.api.categorias.getPessoa)
    app.route('/categorias/produtos')
        .all(app.config.passport.authenticate())
        .get(app.api.categorias.getProduto)

    app.route('/categorias/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.categorias.save)
        .get(app.api.categorias.getById)
        .delete(app.api.categorias.remove)


    app.route('/produtos/todos')
        .all(app.config.passport.authenticate())
        .post(app.api.produtos.produtos.fastSave)
        .get(app.api.produtos.produtos.getAll)
    app.route('/produtos')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.produtos.produtos.save, 'produto'))
        .get(grantAccess(app.api.produtos.produtos.get, 'produto'))
    app.route('/produtos/:id')
        .all(app.config.passport.authenticate())
        .put(grantAccess(app.api.produtos.produtos.save, 'produto'))
        .get(grantAccess(app.api.produtos.produtos.getById, 'produto'))
        .delete(grantAccess(app.api.produtos.produtos.remove, 'produto'))


    app.route('/marcas/todas')
        .all(app.config.passport.authenticate())
        .get(app.api.produtos.produtoMarcas.getAll)
    app.route('/marcas')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.produtos.produtoMarcas.save, 'produto'))
        .get(grantAccess(app.api.produtos.produtoMarcas.get, 'produto'))
    app.route('/marcas/:id')
        .all(app.config.passport.authenticate())
        .put(grantAccess(app.api.produtos.produtoMarcas.save, 'produto'))
        .delete(grantAccess(app.api.produtos.produtoMarcas.remove, 'produto'))
    app.route('/unidades/todas')
        .all(app.config.passport.authenticate())
        .get(app.api.produtos.produtoUnidade.getAll)
    app.route('/unidades')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.produtos.produtoUnidade.save, 'produto'))
        .get(grantAccess(app.api.produtos.produtoUnidade.get, 'produto'))
    app.route('/unidades/:id')
        .all(app.config.passport.authenticate())
        .put(grantAccess(app.api.produtos.produtoUnidade.save, 'produto'))
        .delete(grantAccess(app.api.produtos.produtoUnidade.remove, 'produto'))


    app.route('/movimEstoque/:id')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.movimentacoes.movimEstoque.save, 'produto'))
        .get(grantAccess(app.api.movimentacoes.movimEstoque.getById, 'produto'))
        .delete(grantAccess(app.api.movimentacoes.movimEstoque.remove, 'produto'))
    app.route('/estoque/:id_produto')
        .all(app.config.passport.authenticate())
        .get(grantAccess(app.api.movimentacoes.movimEstoque.getEstoque, 'produto'))
    app.route('/movimEstoque/')
        .all(app.config.passport.authenticate())
        .get(grantAccess(app.api.movimentacoes.movimEstoque.get, 'produto'))


    app.route('/movimConta/:id')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.movimentacoes.movimConta.save, 'financeiro'))
        .get(grantAccess(app.api.movimentacoes.movimConta.getById, 'financeiro'))
        .delete(grantAccess(app.api.movimentacoes.movimConta.remove, 'financeiro'))
    app.route('/movimConta/')
        .all(app.config.passport.authenticate())
        .get(grantAccess(app.api.movimentacoes.movimConta.get, 'financeiro'))


    app.route('/grupoTrib')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.produtos.grupoTributario.save, 'produto'))
        .get(grantAccess(app.api.produtos.grupoTributario.get, 'produto'))
    app.route('/grupoTrib/:id')
        .all(app.config.passport.authenticate())
        .put(grantAccess(app.api.produtos.grupoTributario.save, 'produto'))
        .get(grantAccess(app.api.produtos.grupoTributario.getById, 'produto'))
        .delete(grantAccess(app.api.produtos.grupoTributario.remove, 'produto'))


    app.route('/municipios')
        .get(app.api.municipios.get)
    app.route('/municipios/:id')
        .get(app.api.municipios.getById)



    app.route('/empresaMetas')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.empresas.empresaMetas.save, 'empresa'))
        .get(grantAccess(app.api.empresas.empresaMetas.get, 'empresa'))
    app.route('/empresaMetas/:id')
        .all(app.config.passport.authenticate())
        .put(grantAccess(app.api.empresas.empresaMetas.save, 'empresa'))
        .get(grantAccess(app.api.empresas.empresaMetas.getById, 'empresa'))
        .delete(grantAccess(app.api.empresas.empresaMetas.remove, 'empresa'))

    app.route('/usuarioMetas')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.usuarios.usuarioMetas.save, 'usuario'))
        .get(grantAccess(app.api.usuarios.usuarioMetas.get, 'usuario'))
    app.route('/usuarioMetas/:id')
        .all(app.config.passport.authenticate())
        .put(grantAccess(app.api.usuarios.usuarioMetas.save, 'usuario'))
        .get(grantAccess(app.api.usuarios.usuarioMetas.getById, 'usuario'))
        .delete(grantAccess(app.api.usuarios.usuarioMetas.remove, 'usuario'))

    app.route('/usuarioComissoes')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.usuarios.usuarioComissoes.save, 'usuario'))
        .get(grantAccess(app.api.usuarios.usuarioComissoes.get, 'usuario'))
    app.route('/usuarioComissoes/:id')
        .all(app.config.passport.authenticate())
        .put(grantAccess(app.api.usuarios.usuarioComissoes.save, 'usuario'))
        .get(grantAccess(app.api.usuarios.usuarioComissoes.getById, 'usuario'))
        .delete(grantAccess(app.api.usuarios.usuarioComissoes.remove, 'usuario'))



    app.route('/email')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.email.enviarEmail))
    app.route('/testarEmail')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.email.testarEmail))



    app.route('/pedidos/pendentes')
        .all(app.config.passport.authenticate())
        .get(app.api.compras.pedidos.getPendentes)
    app.route('/pedidos')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.compras.pedidos.save, 'pedidos'))
        .get(grantAccess(app.api.compras.pedidos.get, 'pedidos'))
    app.route('/pedidos/:id')
        .all(app.config.passport.authenticate())
        .put(grantAccess(app.api.compras.pedidos.save, 'pedidos'))
        .get(grantAccess(app.api.compras.pedidos.getById, 'pedidos'))
        .delete(grantAccess(app.api.compras.pedidos.remove, 'pedidos'))
    app.route('/pedidosBySituacao/:situacao')
        .all(app.config.passport.authenticate())
        .get(grantAccess(app.api.compras.pedidos.getBySituacao, 'pedidos'))



    app.route('/compras/vinculacao')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.compras.vinculacao.save, 'compras'))
        .get(grantAccess(app.api.compras.vinculacao.get, 'compras'))
    app.route('/compras/vinculacao/:id')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.compras.vinculacao.save, 'compras'))
        .get(grantAccess(app.api.compras.vinculacao.get, 'compras'))



    app.route('/compras/prepararXML')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.compras.importacoes.lerXMLs, 'compras'))
    app.route('/compras/importarXML')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.compras.importacoes.save, 'compras'))
    app.route('/compras/gerarDANFe')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.compras.importacoes.gerarDANFe, 'compras'))
    app.route('/compras')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.compras.compras.save, 'compras'))
        .get(grantAccess(app.api.compras.compras.get, 'compras'))
    app.route('/compras/:id')
        .all(app.config.passport.authenticate())
        // .put(grantAccess(app.api.compras.compras.save, 'compras'))
        .get(grantAccess(app.api.compras.compras.getById, 'compras'))
        .delete(grantAccess(app.api.compras.compras.remove, 'compras'))



    app.route('/financeiro')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.financeiro.financeiro.save, 'financeiro'))
        .get(grantAccess(app.api.financeiro.financeiro.get, 'financeiro'))
    app.route('/financeiro/:id')
        .all(app.config.passport.authenticate())
        .put(grantAccess(app.api.financeiro.financeiro.save, 'financeiro'))
        .get(grantAccess(app.api.financeiro.financeiro.getById, 'financeiro'))
        .delete(grantAccess(app.api.financeiro.financeiro.remove, 'financeiro'))
    app.route('/financeiro/pagamento')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.financeiro.financeiro.save_pagamento, 'financeiro'))
    app.route('/financeiro/pagamento/:id')
        .all(app.config.passport.authenticate())
        .delete(grantAccess(app.api.financeiro.financeiro.remove_pagamento, 'financeiro'))
    app.route('/verFinanceiro/:id')
        .all(app.config.passport.authenticate())
        .get(grantAccess(app.api.financeiro.financeiro.getConta, 'financeiro'))


    app.route('/boletos')
        .all(app.config.passport.authenticate())
        .get(grantAccess(app.api.financeiro.boletos.getBoleto, 'financeiro'))


    app.route('/classificacoes/todas')
        .all(app.config.passport.authenticate())
        .get(grantAccess(app.api.financeiro.classificacoes.getAll, 'financeiro'))
    app.route('/classificacoes/tree')
        .all(app.config.passport.authenticate())
        .get(grantAccess(app.api.financeiro.classificacoes.getTree, 'financeiro'))
    app.route('/classificacoes')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.financeiro.classificacoes.save, 'financeiro'))
        .get(grantAccess(app.api.financeiro.classificacoes.get, 'financeiro'))
    app.route('/classificacoes/:id')
        .all(app.config.passport.authenticate())
        .put(grantAccess(app.api.financeiro.classificacoes.save, 'financeiro'))
        .get(grantAccess(app.api.financeiro.classificacoes.getById, 'financeiro'))
        .delete(grantAccess(app.api.financeiro.classificacoes.remove, 'financeiro'))

    app.route('/documentos/todos')
        .all(app.config.passport.authenticate())
        .get(app.api.financeiro.documentos.getAll)
    app.route('/documentos')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.financeiro.documentos.save, 'financeiro'))
        .get(grantAccess(app.api.financeiro.documentos.get, 'financeiro'))
    app.route('/documentos/:id')
        .all(app.config.passport.authenticate())
        .put(grantAccess(app.api.financeiro.documentos.save, 'financeiro'))
        .get(grantAccess(app.api.financeiro.documentos.getById, 'financeiro'))
        .delete(grantAccess(app.api.financeiro.documentos.remove, 'financeiro'))


    app.route('/conta/todas')
        .all(app.config.passport.authenticate())
        .get(app.api.financeiro.conta.getAll)
    app.route('/conta/bancos')
        .all(app.config.passport.authenticate())
        .get(grantAccess(app.api.financeiro.conta.getBancos, 'contas'))
    app.route('/conta')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.financeiro.conta.save, 'contas'))
        .get(grantAccess(app.api.financeiro.conta.get, 'contas'))
    app.route('/conta/:id')
        .all(app.config.passport.authenticate())
        .put(grantAccess(app.api.financeiro.conta.save, 'contas'))
        .get(grantAccess(app.api.financeiro.conta.getById, 'contas'))
        .delete(grantAccess(app.api.financeiro.conta.remove, 'contas'))



    app.route('/vendas/orcamentos')
        .all(app.config.passport.authenticate())
        .get(app.api.vendas.vendas.getOrcamentos)
    app.route('/vendas/vendas')
        .all(app.config.passport.authenticate())
        .get(app.api.vendas.vendas.getVendas)
    app.route('/vendas')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.vendas.vendas.save, 'vendas'))
        .get(grantAccess(app.api.vendas.vendas.get, 'vendas'))
    app.route('/vendas/:id')
        .all(app.config.passport.authenticate())
        // .put(grantAccess(app.api.vendas.vendas.save, 'vendas'))
        .get(grantAccess(app.api.vendas.vendas.getById, 'vendas'))
        .delete(grantAccess(app.api.vendas.vendas.remove, 'vendas'))


    app.route('/tabelas/todas')
        .all(app.config.passport.authenticate())
        .get(app.api.vendas.tabelas.getAll)
    app.route('/tabelas')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.vendas.tabelas.save, 'vendas'))
        .get(grantAccess(app.api.vendas.tabelas.get, 'vendas'))
    app.route('/tabelas/:id')
        .all(app.config.passport.authenticate())
        .put(grantAccess(app.api.vendas.tabelas.save, 'vendas'))
        .get(grantAccess(app.api.vendas.tabelas.getById, 'vendas'))
        .delete(grantAccess(app.api.vendas.tabelas.remove, 'vendas'))


    app.route('/eventos_agenda')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.ferramentas.eventos.save, 'agenda'))
        .get(grantAccess(app.api.ferramentas.eventos.get, 'agenda'))
    app.route('/eventos_agenda/:id')
        .all(app.config.passport.authenticate())
        .put(grantAccess(app.api.ferramentas.eventos.save, 'agenda'))
        .get(grantAccess(app.api.ferramentas.eventos.getById, 'agenda'))
        .delete(grantAccess(app.api.ferramentas.eventos.remove, 'agenda'))



    app.route('/rel_cadastros')
        .all(app.config.passport.authenticate())
        .post(grantAccess(app.api.relatorios.rel_cadastros.getData, 'rel_cadastros'))
    app.route('/rel_estoque')
        .all(app.config.passport.authenticate())
        .get(grantAccess(app.api.relatorios.rel_estoque.getData, 'rel_estoque'))
    app.route('/rel_compras')
        .all(app.config.passport.authenticate())
        .get(grantAccess(app.api.relatorios.rel_compras.getData, 'rel_compras'))
    app.route('/rel_vendas')
        .all(app.config.passport.authenticate())
        .get(grantAccess(app.api.relatorios.rel_vendas.getData, 'rel_vendas'))
    app.route('/rel_financeiro')
        .all(app.config.passport.authenticate())
        .get(grantAccess(app.api.relatorios.rel_financeiro.getData, 'rel_financeiro'))
    app.route('/rel_estat')
        .all(app.config.passport.authenticate())
        .get(grantAccess(app.api.relatorios.rel_estat.getData, 'rel_estat'))



    app.route('/categoriasArtigos')
        .all(app.config.passport.authenticate())
        .get(app.api.ajuda.categorias.get)
        .post(app.api.ajuda.categorias.save)

    // Cuidado com ordem! Tem que vir antes de /categoriasArtigos/:id
    app.route('/categoriasArtigos/tree')
        .all(app.config.passport.authenticate())
        .get(app.api.ajuda.categorias.getTree)

    app.route('/categoriasArtigos/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.ajuda.categorias.getById)
        .put(app.api.ajuda.categorias.save)
        .delete(app.api.ajuda.categorias.remove)

    app.route('/artigos')
        .all(app.config.passport.authenticate())
        .get(app.api.ajuda.artigos.get)
        .post(app.api.ajuda.artigos.save)

    app.route('/artigos/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.ajuda.artigos.getById)
        .put(app.api.ajuda.artigos.save)
        .delete(app.api.ajuda.artigos.remove)

    app.route('/categoriasArtigos/:id/artigos')
        .all(app.config.passport.authenticate())
        .get(app.api.ajuda.artigos.getByCategory)


    app.get('/log/hoje', app.api.log.log.get)
    app.route('/log')
        .all(app.config.passport.authenticate())
        .post(app.api.log.log.save)
        .get(grantAccess(app.api.log.log.getAll, 'atividades'))

    app.route('/stats')
        .all(app.config.passport.authenticate())
        .get(app.api.stat.get)


    app.get('*', function (req, res) {
        res.status(404).send('Erro 404');
    });
}