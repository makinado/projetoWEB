module.exports = app => {

    const getData = async (req, res) => {
        const relatorio = req.query.relatorio

        // inventario, entrada, saida e movimento de estoque
        if (relatorio == 'inventario') {

        } else if (relatorio == 'entrada') {
            
        } else if (relatorio == 'saida') {

        } else {

        }
    }

    return { getData }
}