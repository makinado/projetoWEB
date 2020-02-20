const multer = require('multer')
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
            .catch(e => res.status(500).send(e.toString()))

    })
    app.post('/uploadXML', uploadXML.fields([{ name: 'xml' }]), function (req, res, next) {
        return res.status(204).send()
    })

    app.post('/signup', app.api.auth.usuarios.save)
    app.post('/signin', app.api.auth.auth.signin)
    app.post('/validateToken', app.api.auth.auth.validateToken)
    app.post('/recoverPassword', app.api.auth.usuarios.recoverPassword)


    app.route('/usuarios/tela')
        .all(app.config.passport.authenticate())
        .get(app.api.auth.usuarios.getTela)
    app.route('/usuarios/tela/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.auth.usuarios.getTela)
    app.route('/usuarios')
        .all(app.config.passport.authenticate())
        .post(app.api.auth.usuarios.save)
        .get(app.api.auth.usuarios.get)
    app.route('/usuarios/todos')
        .all(app.config.passport.authenticate())
        .get(app.api.auth.usuarios.getAll)
    app.route('/usuarioEmpresas/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.auth.usuarios.getEmpresas)
    app.route('/usuarios/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.auth.usuarios.save)
        .get(app.api.auth.usuarios.getById)
        .delete(app.api.auth.usuarios.remove)


    app.route('/perfis')
        .all(app.config.passport.authenticate())
        .post(app.api.usuarios.perfis.save)
        .get(app.api.usuarios.perfis.get)
    app.route('/perfis/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.usuarios.perfis.getById)
        .put(app.api.usuarios.perfis.save)
        .delete(app.api.usuarios.perfis.remove)


    app.route('/pessoas/clientes')
        .all(app.config.passport.authenticate())
        .get(app.api.pessoas.pessoas.getClientes)
    app.route('/pessoas/fornecedores')
        .all(app.config.passport.authenticate())
        .get(app.api.pessoas.pessoas.getFornecs)
    app.route('/pessoas/todos')
        .all(app.config.passport.authenticate())
        .get(app.api.pessoas.pessoas.getAll)
    app.route('/pessoas/tela')
        .all(app.config.passport.authenticate())
        .get(app.api.pessoas.pessoas.getTela)
    app.route('/pessoas/tela/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.pessoas.pessoas.getTela)
    app.route('/pessoas')
        .all(app.config.passport.authenticate())
        .post(app.api.pessoas.pessoas.save)
        .get(app.api.pessoas.pessoas.get)
    app.route('/pessoas/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.pessoas.pessoas.save)
        .get(app.api.pessoas.pessoas.getById)
        .delete(app.api.pessoas.pessoas.remove)
    app.route('/pessoasComFinanceiro/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.pessoas.pessoas.getWithFinanceiro)
    app.route('/pessoasPorCategoria/:id_categoria')
        .all(app.config.passport.authenticate())
        .get(app.api.pessoas.pessoas.getByCategoria)


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


    app.route('/produtos/TelaProduto')
        .all(app.config.passport.authenticate())
        .get(app.api.produtos.produtos.getTelaProduto)
    app.route('/produtos/TelaProduto/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.produtos.produtos.getTelaProduto)
    app.route('/produtos')
        .all(app.config.passport.authenticate())
        .post(app.api.produtos.produtos.save)
        .get(app.api.produtos.produtos.get)
    app.route('/produtos/estoque')
        .all(app.config.passport.authenticate())
        .get(app.api.produtos.produtos.getWithEstoque)
    app.route('/produtos/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.produtos.produtos.save)
        .get(app.api.produtos.produtos.getById)
        .delete(app.api.produtos.produtos.remove)
    app.route('/produtosPorCategoria/:id_categoria')
        .all(app.config.passport.authenticate())
        .get(app.api.produtos.produtos.getByCategoria)


    app.route('/marcas')
        .all(app.config.passport.authenticate())
        .post(app.api.produtos.produtoMarcas.save)
        .get(app.api.produtos.produtoMarcas.get)
    app.route('/marcas/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.produtos.produtoMarcas.save)
        .get(app.api.produtos.produtoMarcas.getById)
        .delete(app.api.produtos.produtoMarcas.remove)
    app.route('/unidades')
        .all(app.config.passport.authenticate())
        .post(app.api.produtos.produtoUnidade.save)
        .get(app.api.produtos.produtoUnidade.get)
    app.route('/unidades/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.produtos.produtoUnidade.save)
        .delete(app.api.produtos.produtoUnidade.remove)




    app.route('/movimEstoque/:id')
        .all(app.config.passport.authenticate())
        .post(app.api.movimentacoes.movimEstoque.save)
        .get(app.api.movimentacoes.movimEstoque.getById)
        .delete(app.api.movimentacoes.movimEstoque.remove)
    app.route('/estoque/:id_produto')
        .all(app.config.passport.authenticate())
        .get(app.api.movimentacoes.movimEstoque.getEstoque)
    app.route('/movimEstoque/')
        .all(app.config.passport.authenticate())
        .get(app.api.movimentacoes.movimEstoque.get)


    app.route('/movimConta/tela/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.movimentacoes.movimConta.getTela)
    app.route('/movimConta/:id')
        .all(app.config.passport.authenticate())
        .post(app.api.movimentacoes.movimConta.save)
        .get(app.api.movimentacoes.movimConta.getById)
        .delete(app.api.movimentacoes.movimConta.remove)
    app.route('/movimConta/')
        .all(app.config.passport.authenticate())
        .get(app.api.movimentacoes.movimConta.get)



    app.route('/telaGrupoTrib')
        .all(app.config.passport.authenticate())
        .get(app.api.produtos.grupoTributario.getTela)
    app.route('/telaGrupoTrib/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.produtos.grupoTributario.getTela)
    app.route('/grupoTrib')
        .all(app.config.passport.authenticate())
        .post(app.api.produtos.grupoTributario.save)
        .get(app.api.produtos.grupoTributario.get)
    app.route('/grupoTrib/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.produtos.grupoTributario.save)
        .get(app.api.produtos.grupoTributario.getById)
        .delete(app.api.produtos.grupoTributario.remove)



    app.route('/empresas')
        .all(app.config.passport.authenticate())
        .post(app.api.empresas.empresas.save)
        .get(app.api.empresas.empresas.get)
    app.route('/empresas/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.empresas.empresas.save)
        .get(app.api.empresas.empresas.getById)
        .delete(app.api.empresas.empresas.remove)
    app.route('/emailsEmpresa/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.empresas.empresas.getEmails)



    app.route('/municipios')
        .get(app.api.municipios.get)

    app.route('/municipios/:id')
        .get(app.api.municipios.getById)



    app.route('/empresaMetas/TelaMetas')
        .all(app.config.passport.authenticate())
        .get(app.api.empresas.empresaMetas.getTelaMetas)
    app.route('/empresaMetas/TelaMetas/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.empresas.empresaMetas.getTelaMetas)
    app.route('/empresaMetas')
        .all(app.config.passport.authenticate())
        .post(app.api.empresas.empresaMetas.save)
        .get(app.api.empresas.empresaMetas.get)
    app.route('/empresaMetas/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.empresas.empresaMetas.save)
        .get(app.api.empresas.empresaMetas.getById)
        .delete(app.api.empresas.empresaMetas.remove)

    app.route('/vendMetas')
        .all(app.config.passport.authenticate())
        .post(app.api.pessoas.vendMetas.save)
        .get(app.api.pessoas.vendMetas.get)
    app.route('/vendMetas/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.pessoas.vendMetas.save)
        .get(app.api.pessoas.vendMetas.getById)
        .delete(app.api.pessoas.vendMetas.remove)



    app.route('/pessoaComissao')
        .all(app.config.passport.authenticate())
        .post(app.api.pessoas.pessoaComissao.save)
        .get(app.api.pessoas.pessoaComissao.get)
    app.route('/pessoaComissao/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.pessoas.pessoaComissao.save)
        .get(app.api.pessoas.pessoaComissao.getById)
        .delete(app.api.pessoas.pessoaComissao.remove)



    app.route('/email')
        .all(app.config.passport.authenticate())
        .post(app.api.email.enviarEmail)
    app.route('/testarEmail')
        .all(app.config.passport.authenticate())
        .post(app.api.email.testarEmail)

    app.route('/pedidos/TelaPedido')
        .all(app.config.passport.authenticate())
        .get(app.api.compras.pedidos.getTelaPedido)
    app.route('/pedidos/TelaPedido/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.compras.pedidos.getTelaPedido)
    app.route('/pedidos')
        .all(app.config.passport.authenticate())
        .post(app.api.compras.pedidos.save)
        .get(app.api.compras.pedidos.get)
    app.route('/pedidos/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.compras.pedidos.save)
        .get(app.api.compras.pedidos.getById)
        .delete(app.api.compras.pedidos.remove)
    app.route('/pedidosBySituacao/:situacao')
        .all(app.config.passport.authenticate())
        .get(app.api.compras.pedidos.getBySituacao)



    app.route('/compras/vinculacao')
        .all(app.config.passport.authenticate())
        .post(app.api.compras.vinculacao.save)
        .get(app.api.compras.vinculacao.get)
    app.route('/compras/vinculacao/:id')
        .all(app.config.passport.authenticate())
        .post(app.api.compras.vinculacao.save)
        .get(app.api.compras.vinculacao.get)



    app.route('/compras/prepararXML')
        .all(app.config.passport.authenticate())
        .post(app.api.compras.importacoes.lerXMLs)
    app.route('/compras/importarXML')
        .all(app.config.passport.authenticate())
        .post(app.api.compras.importacoes.save)
    app.route('/compras/gerarDANFe')
        .all(app.config.passport.authenticate())
        .post(app.api.compras.importacoes.gerarDANFe)
    app.route('/compras/Tela')
        .all(app.config.passport.authenticate())
        .get(app.api.compras.compras.getTela)
    app.route('/compras/Tela/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.compras.compras.getTela)
    app.route('/compras')
        .all(app.config.passport.authenticate())
        .post(app.api.compras.compras.save)
        .get(app.api.compras.compras.get)
    app.route('/compras/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.compras.compras.save)
        .get(app.api.compras.compras.getById)
        .delete(app.api.compras.compras.remove)



    app.route('/financeiro/Tela')
        .all(app.config.passport.authenticate())
        .get(app.api.financeiro.financeiro.getTela)
    app.route('/financeiro/Tela/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.financeiro.financeiro.getTela)
    app.route('/financeiro')
        .all(app.config.passport.authenticate())
        .post(app.api.financeiro.financeiro.save)
        .get(app.api.financeiro.financeiro.get)
    app.route('/financeiro/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.financeiro.financeiro.save)
        .get(app.api.financeiro.financeiro.getById)
        .delete(app.api.financeiro.financeiro.remove)
    app.route('/financeiroBySituacao/:situacao')
        .all(app.config.passport.authenticate())
        .get(app.api.financeiro.financeiro.getBySituacao)
    app.route('/financeiro/pagamento')
        .all(app.config.passport.authenticate())
        .post(app.api.financeiro.financeiro.save_pagamento)
    app.route('/financeiro/pagamento/:id')
        .all(app.config.passport.authenticate())
        .delete(app.api.financeiro.financeiro.remove_pagamento)


    app.route('/financeiro/boletos/:banco')
        .all(app.config.passport.authenticate())
        .get(app.api.financeiro.boletos.getBoleto)


    app.route('/classificacoes')
        .all(app.config.passport.authenticate())
        .post(app.api.financeiro.classificacoes.save)
        .get(app.api.financeiro.classificacoes.get)
    app.route('/classificacoes/tree')
        .all(app.config.passport.authenticate())
        .get(app.api.financeiro.classificacoes.getTree)
    app.route('/classificacoes/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.financeiro.classificacoes.save)
        .get(app.api.financeiro.classificacoes.getById)
        .delete(app.api.financeiro.classificacoes.remove)

    app.route('/documentos')
        .all(app.config.passport.authenticate())
        .post(app.api.financeiro.documentos.save)
        .get(app.api.financeiro.documentos.get)
    app.route('/documentos/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.financeiro.documentos.save)
        .get(app.api.financeiro.documentos.getById)
        .delete(app.api.financeiro.documentos.remove)


    app.route('/conta/tela')
        .all(app.config.passport.authenticate())
        .get(app.api.financeiro.conta.getTela)
    app.route('/conta/tela/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.financeiro.conta.getTela)
    app.route('/conta')
        .all(app.config.passport.authenticate())
        .post(app.api.financeiro.conta.save)
        .get(app.api.financeiro.conta.get)
    app.route('/conta/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.financeiro.conta.save)
        .get(app.api.financeiro.conta.getById)
        .delete(app.api.financeiro.conta.remove)



    app.route('/vendas/tela')
        .all(app.config.passport.authenticate())
        .get(app.api.vendas.vendas.getTela)
    app.route('/vendas/tela/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.vendas.vendas.getTela)
    app.route('/vendas')
        .all(app.config.passport.authenticate())
        .post(app.api.vendas.vendas.save)
        .get(app.api.vendas.vendas.get)
    app.route('/vendas/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.vendas.vendas.save)
        .get(app.api.vendas.vendas.getById)
        .delete(app.api.vendas.vendas.remove)


    app.route('/tabelas')
        .all(app.config.passport.authenticate())
        .post(app.api.vendas.tabelas.save)
        .get(app.api.vendas.tabelas.get)
    app.route('/tabelas/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.vendas.tabelas.save)
        .get(app.api.vendas.tabelas.getById)
        .delete(app.api.vendas.tabelas.remove)


    app.route('/eventos_agenda')
        .all(app.config.passport.authenticate())
        .post(app.api.ferramentas.eventos.save)
        .get(app.api.ferramentas.eventos.get)
    app.route('/eventos_agenda/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.ferramentas.eventos.save)
        .get(app.api.ferramentas.eventos.getById)
        .delete(app.api.ferramentas.eventos.remove)



    app.route('/rel_cadastros')
        .all(app.config.passport.authenticate())
        .post(app.api.relatorios.rel_cadastros.getData)

    app.get('/log/hoje', app.api.log.log.get)
    app.route('/log')
        .all(app.config.passport.authenticate())
        .post(app.api.log.log.save)
        .get(app.api.log.log.getAll)


    app.get('*', function (req, res) {
        res.status(404).send('Erro 404');
    });
}