const nodemailer = require("nodemailer");
const fs = require('fs')

module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation

    const enviarEmail = async (req, res) => {
        const email = { ...req.body }

        const empresa = await req.knex('empresas')
            .select('nome', 'endereco_servidor', 'porta', 'usuario', 'senha', 'protocolo_ssl')
            .where({ id: email.id_empresa })
            .first()

        let transporter = nodemailer.createTransport({
            host: empresa.endereco_servidor,
            port: empresa.porta,
            secure: empresa.protocolo_ssl, // true for 465, false for other ports
            auth: {
                user: empresa.usuario,
                pass: empresa.senha
            },
            tls: {
                rejectUnauthorized: false // pode ocasionar problemas de segurança verificar
            }
        });

        transporter.sendMail({
            from: `<${email.de}>`, // sender address
            to: `${email.para}`, // list of receivers
            subject: email.assunto, // Subject line
            text: email.mensagem, // plain text body
            attachments: email.attachments
            // html: '<b>Hello world?</b>' // html body
        })
            .then(_ => res.status(204).send())
            .catch(e => {
                console.log(e.toString())
                res.status(500).send("Algo deu errado, verifique as configurações da empresa e tente novamente!")
            })
    }

    const testarEmail = async (req, res) => {
        const email = { ...req.body }

        try {
            existsOrError(email.endereco_servidor, '')
            existsOrError(email.porta, '')
            existsOrError(email.usuario, '')
            existsOrError(email.senha, '')

        } catch (e) {
            return res.status(400).send(e)
        }

        let transporter = nodemailer.createTransport({
            host: email.endereco_servidor,
            port: email.porta,
            secure: email.porta === 465 ? true : false, // true for 465, false for other ports
            auth: {
                user: email.usuario, // 
                pass: email.senha // 
            },
            tls: {
                rejectUnauthorized: false // pode ocasionar problemas de segurança verificar
            }

        });

        transporter.sendMail({
            from: email.usuario, // sender address
            to: email.usuario, // list of receivers
            subject: `Teste de envio de email`, // Subject line
            text: `Parece que está tudo ok com a configuração de e-mail! :D`, // plain text body
            // html: '<b>Hello world?</b>' // html body
        })
            .then(_ => res.status(204).send())
            .catch(e => {
                console.log(e.toString())
                res.status(500).send("Algo deu errado, verifique as configurações da empresa e tente novamente!")
            })
    }

    return { enviarEmail, testarEmail }
}