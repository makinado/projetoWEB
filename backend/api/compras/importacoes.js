const fs = require('fs')
const xml2js = require('xml2js')
const parser = new xml2js.Parser({ explicitArray: false })
const webdanfe = require('webdanfe')
const { formatToCNPJ, formatToBRL } = require('brazilian-values')

module.exports = app => {
    const { existsOrError, parseNumber, moneyToNumber, formatDate } = app.api.validation

    const save = async (req, res) => {
        const files = Object.values({ ...req.body })

        files.forEach(async file => {
            try {
                //valida dados da compra/produtos/financeiro
                existsOrError(file.id_empresa, 'Informe a empresa da compra')
                if (file.situacao != 1) throw `XML ${file.dados.fornecedor} inválido, ${file.situacao == 2 ? 'Fornecedor não cadastrado' : 'XML já importado'}`
            } catch (e) {
                return res.status(400).send(e)
            }

            file.produtos.map(produto => {
                try {
                    existsOrError(produto.id, `Produto ${produto.prod.xProd || ""} não vinculado corretamente`)
                    existsOrError(produto.prod.cProd, `Produto ${produto.prod.xProd || ""} não possui código, verifique o XML`)
                    existsOrError(produto.fornec, `Produto ${produto.prod.xProd || ""} sem fornecedor, cadastre-o antes de continuar`)

                } catch (e) {
                    return res.status(400).send(e)
                }
            })
            file.financeiro.map(parcela => {
                try {
                    if (parcela.pago) {
                        existsOrError(parcela.data_baixa, `Data do pagamento não preenchida na parcela ${parcea.nDup || ""}`)
                        existsOrError(parcela.documento_baixa, `Documento não preenchido na parcela ${parcea.nDup || ""}`)
                    }
                } catch (e) {
                    return res.status(400).send(e)
                }
            })

            return file
        })

        files.map(async xml => {
            const compra = {
                id_empresa: xml.id_empresa,
                nota_fiscal: xml.dados.nNF,
                chave_nfe: xml.dados.chNFe,
                natureza_operacao: xml.dados.natOp,
                id_pessoa: await app.db('pessoas').select('id').where({ cnpj: xml.dados.cnpj }).first().then(fornec => fornec.id),
                data_lancamento: new Date().toISOString().substr(0, 10),
                data_notafiscal: xml.dados.dhEmi.substr(0, 10),
                observacao: xml.dados.observacao,

                base_icms: parseNumber(xml.dados.vBC, '.'),
                valor_icms: parseNumber(xml.dados.vICMS, '.'),
                base_st: parseNumber(xml.dados.vBCST, '.'),
                valor_st: parseNumber(xml.dados.vST, '.'),

                valor_ipi: parseNumber(xml.dados.vIPI, '.'),
                valor_pis: parseNumber(xml.dados.vPIS, '.'),
                valor_cofins: parseNumber(xml.dados.vCOFINS, '.'),

                valor_frete: parseNumber(xml.dados.vFrete, '.'),
                valor_seguro: parseNumber(xml.dados.vSeg, '.'),
                valor_desconto: parseNumber(xml.dados.vDesc, '.'),
                outras_despesas: parseNumber(xml.dados.vOutro, '.'),
                valor_produtos: parseNumber(xml.dados.vProd, '.'),
                valor_total: parseNumber(xml.dados.vNF),
                situacao: 'CONCLUÍDA',
                importado: true,
                xml: xml.xml
            }

            return app.db.transaction(async function (trx) {
                return app.db('compra')
                    .insert(compra).returning('id')
                    .transacting(trx)
                    .then(function (id) {
                        const movim_estoque = []
                        const produtos = xml.produtos.map(produto => {
                            const newProd = {
                                id_compra: id[0],
                                id_empresa: xml.id_empresa,
                                id_produto: produto.id,
                                sequencia: produto.$.nItem,
                                cfop: produto.prod.CFOP,
                                ncm: produto.prod.NCM,
                                qcom: parseNumber(produto.prod.qCom || "0,00"),
                                quantidade: parseNumber(produto.prod.qtde_embalagem || "0,00"),
                                valor_unitario: parseNumber(produto.prod.vUnCom || "0,00"),
                                valor_total: parseNumber(produto.prod.vProd || "0,00"),
                                valor_desconto: parseNumber(produto.prod.valor_desconto || "0,00"),
                                perc_custo_adicional: parseNumber(produto.prod.perc_add || "0,00"),
                                grupo_tributacao: produto.imposto.grupo_tributacao,
                                origem: produto.imposto.origem,
                                cst: produto.imposto.cst,
                                mod_bc: produto.imposto.mod_bc,
                                base_icms: parseNumber(produto.imposto.base_icms || "0,00"),
                                perc_icms: parseNumber(produto.imposto.perc_icms || "0,00"),
                                valor_icms: parseNumber(produto.imposto.valor_icms || "0,00"),
                                perc_red_icms: parseNumber(produto.imposto.perc_red_icms || "0,00"),
                                mod_bcst: produto.imposto.mod_bcst,
                                perc_mvast: parseNumber(produto.imposto.perc_mvast || "0,00"),
                                base_st: parseNumber(produto.imposto.base_st || "0,00"),
                                perc_st: parseNumber(produto.imposto.perc_st || "0,00"),
                                valor_st: parseNumber(produto.imposto.valor_st || "0,00"),
                                valor_icms_deson: parseNumber(produto.imposto.valor_icms_deson || "0,00"),
                                motivo_deson: produto.imposto.motivo_deson,
                                valor_icms_op: parseNumber(produto.imposto.valor_icms_op || "0,00"),
                                perc_dif: parseNumber(produto.imposto.perc_dif || "0,00"),
                                valor_icms_dif: parseNumber(produto.imposto.valor_icms_dif || "0,00"),
                                perc_ipi: parseNumber(produto.imposto.perc_ipi || "0,00"),
                                valor_ipi: parseNumber(produto.imposto.valor_ipi || "0,00"),
                                perc_pis: parseNumber(produto.imposto.perc_pis || "0,00"),
                                perc_cofins: parseNumber(produto.imposto.perc_cofins || "0,00"),
                                perc_custo_adicional: parseNumber(produto.imposto.perc_custo_adicional || "0,00"),
                            }

                            movim_estoque.push({
                                id_empresa: compra.id_empresa,
                                id_produto: produto.id,
                                tipo_movimentacao: 0,
                                data_movimentacao: compra.data_lancamento,
                                id_movimentacao: id[0],
                                quantidade: newProd.quantidade == 0 ? newProd.qcom : newProd.quantidade * newProd.qcom,
                            })

                            return newProd
                        })

                        const financeiro = xml.financeiro.map(parcela => {
                            const newFinanc = {
                                id_movimento_origem: id[0],
                                id_empresa: xml.id_empresa,
                                tipo_conta: 2, //pagar
                                pago: parcela.pago || false,
                                id_pessoa: compra.id_pessoa,
                                documento_origem: parcela.documento_origem,
                                num_documento_origem: parcela.nota_fiscal,
                                documento_baixa: parcela.documento_baixa,
                                num_documento_baixa: parcela.num_documento_baixa,
                                data_criacao: new Date().toISOString().substr(0, 10),
                                data_emissao: compra.data_notafiscal.substr(0, 10),
                                data_vencimento: parcela.dVenc,
                                data_baixa: parcela.pago ? parcela.data_baixa : null,
                                valor_parcela: parseNumber(parcela.vDup),
                                valor_pago: parcela.pago ? parseNumber(parcela.vDup) : 0
                            }
                            return newFinanc
                        })

                        return app.db.batchInsert('produto_compra', produtos)
                            .transacting(trx)
                            .then(function () {
                                return app.db.batchInsert('produto_movimento_estoque', movim_estoque)
                                    .transacting(trx)
                                    .then(function () {
                                        return app.db.batchInsert('financeiro', financeiro)
                                            .transacting(trx)
                                    })
                            })

                    })
                    .then(trx.commit)
                    .catch(trx.rollback)
            }).then(function (inserts) {
                res.status(204).send()
            }).catch(function (error) {
                console.log(error.toString())
                res.status(500).send(error.toString())
            })
        })
    }

    let seq
    const lerXMLs = async (req, res) => {
        const files = Object.values({ ...req.body })

        try {
            existsOrError(files, 'Nenhum arquivo XML selecionado')

            let xmls = new Array()
            seq = 0
            files.forEach(async file => {
                parser.parseString(fs.readFileSync(`uploads/xml/${file}`, 'UTF-8'), async function (err, data) {
                    xml = JSON.parse(JSON.stringify(data))
                    xml = validarXML(xml)
                    xmls.push(xml)
                })
            })

            xmls = await Promise.all(xmls)

            return res.json(xmls)

        } catch (e) {
            return res.status(500).send(e.toString())
        }
    }

    const validarXML = async (xml) => {
        if (!xml.nfeProc.NFe) throw "XML inválido, tag NFe não encontrada"
        if (!xml.nfeProc.NFe.infNFe.ide) throw "XML inválido, tag ide não encontrada"
        if (!xml.nfeProc.NFe.infNFe.det) throw "XML inválido, tag det não encontrada"
        if (xml.nfeProc.protNFe.infProt.cStat !== '100')
            throw "XML inválido, uso não autorizado"

        //validar arquivo
        const fornec = formatToCNPJ(xml.nfeProc.NFe.infNFe.emit.CNPJ)
        const fornecDB = await app.db('pessoas')
            .select('id')
            .where({ cnpj: fornec }).first()
            .then(fornec => {
                return fornec
            })
        if (fornecDB) {
            xml.id_fornecedor = fornecDB.id
            const jaImportado = await app.db('compra')
                .where({ id_pessoa: fornecDB.id, nota_fiscal: xml.nfeProc.NFe.infNFe.ide.nNF }).first()
            if (jaImportado) {
                xml.situacao = 3
            } else {
                xml.situacao = 1
            }
        } else {
            xml.situacao = 2
        }

        xml.nfeProc.NFe.infNFe.infAdic = xml.nfeProc.NFe.infNFe.infAdic && xml.nfeProc.NFe.infNFe.infAdic.infCpl ? xml.nfeProc.NFe.infNFe.infAdic.infCpl : ""

        //validar produtos
        let produtos = []
        if (Array.isArray(xml.nfeProc.NFe.infNFe.det))
            produtos = xml.nfeProc.NFe.infNFe.det
        else
            produtos.push(xml.nfeProc.NFe.infNFe.det)

        let total = xml.nfeProc.NFe.infNFe.total
        produtos = produtos.map(async produto => {
            if (!produto.prod) return
            produto.fornec = fornec
            if (produto.imposto) {
                if (produto.imposto.ICMS) {
                    if (produto.imposto.ICMS.ICMS00) {
                        produto.imposto = {
                            grupo_tributacao: "ICMS00",
                            origem: produto.imposto.ICMS.ICMS00.orig,
                            cst: produto.imposto.ICMS.ICMS00.CST,
                            mod_bc: produto.imposto.ICMS.ICMS00.modBC,

                            base_icms: formatToBRL(produto.imposto.ICMS.ICMS00.vBC),
                            perc_icms: formatToBRL(produto.imposto.ICMS.ICMS00.pICMS).replace("R$", "") + " %",
                            valor_icms: formatToBRL(produto.imposto.ICMS.ICMS00.vICMS)
                        }

                    } else if (produto.imposto.ICMS.ICMS10) {
                        produto.imposto = {
                            grupo_tributacao: "ICMS10",
                            origem: produto.imposto.ICMS.ICMS10.orig,
                            cst: produto.imposto.ICMS.ICMS10.CST,

                            mod_bc: produto.imposto.ICMS.ICMS10.modBC,
                            base_icms: formatToBRL(produto.imposto.ICMS.ICMS10.vBC),
                            perc_icms: formatToBRL(produto.imposto.ICMS.ICMS10.pICMS).replace("R$", "") + " %",
                            valor_icms: formatToBRL(produto.imposto.ICMS.ICMS10.vICMS),

                            mod_bcst: produto.imposto.ICMS.ICMS10.modBCST,
                            perc_mvast: formatToBRL(produto.imposto.ICMS.ICMS10.pMVAST).replace("R$", "") + " %",
                            perc_red_bcst: formatToBRL(produto.imposto.ICMS.ICMS10.pRedBCST || "0,00").replace("R$", "") + " %",
                            base_st: formatToBRL(produto.imposto.ICMS.ICMS10.vBCST),
                            perc_st: formatToBRL(produto.imposto.ICMS.ICMS10.pICMSST).replace("R$", "") + " %",
                            valor_st: formatToBRL(produto.imposto.ICMS.ICMS10.vICMSST)
                        }
                    }
                    else if (produto.imposto.ICMS.ICMS20) {
                        produto.imposto = {
                            grupo_tributacao: "ICMS20",
                            origem: produto.imposto.ICMS.ICMS20.orig,
                            cst: produto.imposto.ICMS.ICMS20.CST,

                            mod_bc: produto.imposto.ICMS.ICMS20.modBC,
                            perc_red_icms: formatToBRL(produto.imposto.ICMS.ICMS20.pRedBC || "0,00").replace("R$", "") + " %",
                            base_icms: formatToBRL(produto.imposto.ICMS.ICMS20.vBC),
                            perc_icms: formatToBRL(produto.imposto.ICMS.ICMS20.pICMS).replace("R$", "") + " %",
                            valor_icms: formatToBRL(produto.imposto.ICMS.ICMS20.vICMS),

                            valor_icms_deson: formatToBRL(produto.imposto.ICMS.ICMS20.vICMSDeson),
                            motivo_deson: produto.imposto.ICMS.ICMS20.motDesICMS,
                        }
                    }
                    else if (produto.imposto.ICMS.ICMS30) {
                        produto.imposto = {
                            grupo_tributacao: "ICMS30",
                            origem: produto.imposto.ICMS.ICMS30.orig,
                            cst: produto.imposto.ICMS.ICMS30.CST,

                            mod_bcst: produto.imposto.ICMS.ICMS30.modBCST,
                            perc_mvast: formatToBRL(produto.imposto.ICMS.ICMS30.pMVAST).replace("R$", "") + " %",
                            perc_red_bcst: formatToBRL(produto.imposto.ICMS.ICMS30.pRedBCST || "0,00").replace("R$", "") + " %",
                            base_st: formatToBRL(produto.imposto.ICMS.ICMS30.vBCST),
                            perc_st: formatToBRL(produto.imposto.ICMS.ICMS30.pICMSST).replace("R$", "") + " %",
                            valor_st: formatToBRL(produto.imposto.ICMS.ICMS30.vICMSST),

                            valor_icms_deson: formatToBRL(produto.imposto.ICMS.ICMS30.vICMSDeson),
                            motivo_deson: produto.imposto.ICMS.ICMS30.motDesICMS,
                        }
                    }
                    else if (produto.imposto.ICMS.ICMS40 || produto.imposto.ICMS.ICMS41 || produto.imposto.ICMS.ICMS50) {
                        if (produto.imposto.ICMS.ICMS40) {
                            produto.imposto = {
                                grupo_tributacao: "ICMS40",
                                origem: produto.imposto.ICMS.ICMS40.orig,
                                cst: produto.imposto.ICMS.ICMS40.CST,

                                valor_icms_deson: formatToBRL(produto.imposto.ICMS.ICMS40.vICMSDeson),
                                motivo_deson: produto.imposto.ICMS.ICMS40.motDesICMS,
                            }
                        }
                        else if (produto.imposto.ICMS.ICMS41) {
                            produto.imposto = {
                                grupo_tributacao: "ICMS41",
                                origem: produto.imposto.ICMS.ICMS41.orig,
                                cst: produto.imposto.ICMS.ICMS41.CST,

                                valor_icms_deson: formatToBRL(produto.imposto.ICMS.ICMS41.vICMSDeson),
                                motivo_deson: produto.imposto.ICMS.ICMS41.motDesICMS
                            }
                        }
                        else {
                            produto.imposto = {
                                grupo_tributacao: "ICMS50",
                                origem: produto.imposto.ICMS.ICMS50.orig,
                                cst: produto.imposto.ICMS.ICMS50.CST,

                                valor_icms_deson: formatToBRL(produto.imposto.ICMS.ICMS50.vICMSDeson),
                                motivo_deson: produto.imposto.ICMS.ICMS50.motDesICMS,
                            }
                        }
                    }
                    else if (produto.imposto.ICMS.ICMS51) {
                        produto.imposto = {
                            grupo_tributacao: "ICMS51",
                            origem: produto.imposto.ICMS.ICMS51.orig,
                            cst: produto.imposto.ICMS.ICMS51.CST,

                            mod_bc: produto.imposto.ICMS.ICMS51.modBC,
                            perc_red_icms: formatToBRL(produto.imposto.ICMS.ICMS51.pRedBC || "0,00").replace("R$", "") + " %",
                            base_icms: formatToBRL(produto.imposto.ICMS.ICMS51.vBC),
                            perc_icms: formatToBRL(produto.imposto.ICMS.ICMS51.pICMS).replace("R$", "") + " %",
                            valor_icms_op: formatToBRL(produto.imposto.ICMS.ICMS51.vICMSOp),
                            perc_dif: formatToBRL(produto.imposto.ICMS.ICMS51.pDif).replace("R$", "") + " %",
                            valor_icms_dif: formatToBRL(produto.imposto.ICMS.ICMS51.vICMSDif),
                            valor_icms: formatToBRL(produto.imposto.ICMS.ICMS51.vICMS),
                        }

                    } else if (produto.imposto.ICMS.ICMS60) {
                        produto.imposto = {
                            grupo_tributacao: "ICMS60",
                            origem: produto.imposto.ICMS.ICMS60.orig,
                            cst: produto.imposto.ICMS.ICMS60.CST,

                            valor_bcst_ret: formatToBRL(produto.imposto.ICMS.ICMS60.vBCSTRet),
                            valor_st_ret: formatToBRL(produto.imposto.ICMS.ICMS60.vICMSSTRet),
                        }

                    } else if (produto.imposto.ICMS.ICMS70) {
                        produto.imposto = {
                            grupo_tributacao: "ICMS70",
                            origem: produto.imposto.ICMS.ICMS70.orig,
                            cst: produto.imposto.ICMS.ICMS70.CST,

                            mod_bc: produto.imposto.ICMS.ICMS70.modBC,
                            perc_red_icms: formatToBRL(produto.imposto.ICMS.ICMS70.pRedBC || "0,00").replace("R$", "") + " %",
                            base_icms: formatToBRL(produto.imposto.ICMS.ICMS70.vBC),
                            perc_icms: formatToBRL(produto.imposto.ICMS.ICMS70.pICMS).replace("R$", "") + " %",
                            valor_icms: formatToBRL(produto.imposto.ICMS.ICMS70.vICMS),

                            mod_bcst: produto.imposto.ICMS.ICMS70.modBCST,
                            perc_mvast: formatToBRL(produto.imposto.ICMS.ICMS70.pMVAST).replace("R$", "") + " %",
                            perc_red_bcst: formatToBRL(produto.imposto.ICMS.ICMS70.pRedBCST || "0,00").replace("R$", "") + " %",
                            base_st: formatToBRL(produto.imposto.ICMS.ICMS70.vBCST),
                            perc_st: formatToBRL(produto.imposto.ICMS.ICMS70.pICMSST).replace("R$", "") + " %",
                            valor_st: formatToBRL(produto.imposto.ICMS.ICMS70.vICMSST),

                            valor_icms_deson: formatToBRL(produto.imposto.ICMS.ICMS70.vICMSDeson),
                            motivo_deson: produto.imposto.ICMS.ICMS70.motDesICMS,
                        }

                    } else if (produto.imposto.ICMS.ICMS90) {
                        produto.imposto = {
                            grupo_tributacao: "ICMS90",
                            origem: produto.imposto.ICMS.ICMS90.orig,
                            cst: produto.imposto.ICMS.ICMS90.CST,

                            mod_bc: produto.imposto.ICMS.ICMS90.modBC,
                            perc_red_icms: formatToBRL(produto.imposto.ICMS.ICMS90.pRedBC || "0,00").replace("R$", "") + " %",
                            base_icms: formatToBRL(produto.imposto.ICMS.ICMS90.vBC),
                            perc_icms: formatToBRL(produto.imposto.ICMS.ICMS90.pICMS).replace("R$", "") + " %",
                            valor_icms: formatToBRL(produto.imposto.ICMS.ICMS90.vICMS),

                            mod_bcst: produto.imposto.ICMS.ICMS90.modBCST,
                            perc_mvast: formatToBRL(produto.imposto.ICMS.ICMS90.pMVAST).replace("R$", "") + " %",
                            perc_red_bcst: formatToBRL(produto.imposto.ICMS.ICMS90.pRedBCST || "0,00").replace("R$", "") + " %",
                            base_st: formatToBRL(produto.imposto.ICMS.ICMS90.vBCST),
                            perc_st: formatToBRL(produto.imposto.ICMS.ICMS90.pICMSST).replace("R$", "") + " %",
                            valor_st: formatToBRL(produto.imposto.ICMS.ICMS90.vICMSST),

                            valor_icms_deson: formatToBRL(produto.imposto.ICMS.ICMS90.vICMSDeson),
                            motivo_deson: produto.imposto.ICMS.ICMS90.motDesICMS,
                        }

                    } else if (produto.imposto.ICMS.ICMSPart) {
                        produto.imposto = {
                            grupo_tributacao: "ICMSPart",
                            origem: produto.imposto.ICMS.ICMSPart.orig,
                            cst: produto.imposto.ICMS.ICMSPart.CST,

                            mod_bc: produto.imposto.ICMS.ICMSPart.modBC,
                        }
                    } else {
                        produto.imposto = {
                            base_st: formatToBRL(0),
                            perc_st: formatToBRL(0).replace("R$", "") + " %",
                            valor_st: formatToBRL(0),

                            base_icms: formatToBRL(0),
                            perc_icms: formatToBRL(0).replace("R$", "") + " %",
                            valor_icms: formatToBRL(0)
                        }
                    }
                }

                if (produto.imposto.IPI && produto.imposto.IPI.IPITrib) {
                    produto.imposto.perc_ipi = formatToBRL(produto.imposto.IPI.IPITrib.pIPI).replace("R$", "") + " %"
                    produto.imposto.valor_ipi = formatToBRL(produto.imposto.IPI.IPITrib.vIPI)
                } else {
                    produto.imposto.perc_ipi = "0,00 %"
                    produto.imposto.valor_ipi = "R$ 0,00"
                }
                if (produto.imposto.PIS && produto.imposto.PIS.PISAliq) {
                    produto.imposto.perc_pis = formatToBRL(produto.imposto.PIS.PISAliq.pPIS).replace("R$", "") + " %"
                } else {
                    produto.imposto.perc_pis = "0,00 %"
                }
                if (produto.imposto.COFINS && produto.imposto.COFINS.COFINSAliq) {
                    produto.imposto.perc_cofins = formatToBRL(produto.imposto.COFINS.COFINSAliq.pCOFINS).replace("R$", "") + " %"
                } else {
                    produto.imposto.perc_cofins = "0,00 %"
                }
            }

            if (produto.prod.CFOP && produto.prod.CFOP[0] == '5')
                produto.prod.CFOP = produto.prod.CFOP.replace('5', '1')
            else if (produto.prod.CFOP && produto.prod.CFOP[0] == '6')
                produto.prod.CFOP = produto.prod.CFOP.replace('6', '2')

            produto.prod.valor_custo = formatToBRL(
                parseNumber(produto.prod.vUnCom, '.') +
                parseNumber(produto.imposto.valor_st || "0,00") +
                parseNumber(produto.imposto.valor_ipi || "0,00") +
                parseNumber(total.ICMSTot.vFrete, '.') / produtos.length +
                parseNumber(total.ICMSTot.vSeg, '.') / produtos.length
            )
            produto.prod.vUnCom = formatToBRL((produto.prod.vUnCom))
            produto.prod.vProd = formatToBRL((produto.prod.vProd))
            produto.prod.qCom = moneyToNumber(formatToBRL(parseFloat(produto.prod.qCom).toFixed(2)))
            produto.prod.valor_frete = formatToBRL((total.ICMSTot.vFrete) / produtos.length)
            produto.prod.valor_seguro = formatToBRL((total.ICMSTot.vSeg) / produtos.length)
            produto.prod.valor_desconto = formatToBRL(produto.prod.vDesc ? (produto.prod.vDesc) : 0)
            produto.prod.dif_aliquota = "0,00 %"
            produto.prod.perc_add = "0,00 %"

            if (fornecDB) {
                let produtoVinc = await app.db('compra_vinculacao').select('id_produto_empresa', 'qtde_embalagem')
                    .where({ id_fornecedor: fornecDB.id, id_produto_fornecedor: produto.prod.cProd }).first()

                produto.id_fornecedor = fornecDB.id
                if (!produtoVinc) {
                    produto.situacao = 2
                } else {
                    produto.situacao = 1
                    produto.id = produtoVinc.id_produto_empresa
                    produto.qtde_embalagem = produtoVinc.qtde_embalagem
                }
            } else {
                produto.situacao = 2
            }

            return produto
        })
        xml.nfeProc.NFe.infNFe.det = await Promise.all(produtos)

        //validar financeiro
        if (xml.nfeProc.NFe.infNFe.cobr && xml.nfeProc.NFe.infNFe.cobr.dup) {
            let financeiro = []
            if (Array.isArray(xml.nfeProc.NFe.infNFe.cobr.dup))
                financeiro = xml.nfeProc.NFe.infNFe.cobr.dup
            else
                financeiro.push(xml.nfeProc.NFe.infNFe.cobr.dup)

            financeiro = financeiro.map(async parcela => {
                parcela.sequencia = seq++
                parcela.parcelas = parcela.nDup
                parcela.nota_fiscal = xml.nfeProc.NFe.infNFe.ide.nNF
                parcela.vDup = formatToBRL(parcela.vDup)
                parcela.dVenc = formatDate(parcela.dVenc)

                return parcela
            })
            xml.nfeProc.NFe.infNFe.cobr.dup = await Promise.all(financeiro)
        }

        return xml
    }

    const gerarDANFe = async (req, res) => {
        const { xml } = req.body

        const arquivo = fs.readFileSync(`uploads/xml/${xml}`).toString();
        webdanfe.gerarDanfe(arquivo, function (err, pdf) {
            if (err) {
                throw err;
            }

            fs.writeFileSync(`${xml}.pdf`, pdf, {
                encoding: 'binary'
            })

            return res.status(200).send()
        });

    }

    return { lerXMLs, gerarDANFe, save }
}