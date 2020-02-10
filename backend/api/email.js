const nodemailer = require("nodemailer");

module.exports = app => {
    const enviarEmail = async (req, res) => {
        const email = { ...req.body }

        const empresa = await app.db('empresas')
            .select('nome', 'provedor_email', 'endereco_servidor', 'porta', 'usuario', 'senha', 'protocolo_ssl')
            .where({ id: email.id_empresa })
            .first()

        try {
            let transporter = nodemailer.createTransport({
                host: empresa.endereco_servidor,
                port: empresa.porta,
                secure: empresa.porta === 465 ? true : false, // true for 465, false for other ports
                auth: {
                    user: empresa.usuario, // 
                    pass: empresa.senha // 
                },
                tls: {
                    rejectUnauthorized: false // pode ocasionar problemas de segurança verificar
                }

            });

            let info = await transporter.sendMail({
                from: `${empresa.nome}` + `<${email.de}>`, // sender address
                to: `${email.para}`, // list of receivers
                subject: `${email.assunto}`, // Subject line
                text: `${email.mensagem}`, // plain text body
                // html: '<b>Hello world?</b>' // html body
            });

            console.log('Message sent: %s', info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

            // Preview only available when sending through an Ethereal account
            // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...


            res.status(204).send() //.send("Message sent: %s | Preview URL: %s", info.messageId, nodemailer.getTestMessageUrl(info));
        } catch (e) {
            console.log(e.toString())
            res.status(500).send("Algo deu errado, verifique as configurações da empresa e tente novamente!")
        }
    }

    const testarEmail = async (req, res) => {
        const empresa = { ...req.body }

        let transporter = nodemailer.createTransport({
            host: empresa.endereco_servidor,
            port: empresa.porta,
            secure: empresa.porta === 465 ? true : false, // true for 465, false for other ports
            auth: {
                user: empresa.usuario, // 
                pass: empresa.senha // 
            },
            tls: {
                rejectUnauthorized: false // pode ocasionar problemas de segurança verificar
            }
        });

        transporter.verify(function (error, success) {
            if (error) {
                console.log(error)
                res.status(400).send("Ops, parece que a configuração está incorreta")
            } else {
                res.status(204).send()
            }
        })
    }

    return { enviarEmail, testarEmail }
}