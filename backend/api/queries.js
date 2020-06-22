module.exports = {
    categoryWithChildren: `
        WITH RECURSIVE subcategories (id) AS (
            SELECT id FROM categories WHERE id = ?
            UNION ALL
            SELECT c.id FROM subcategories, categories c
                WHERE "parentId" = subcategories.id
        )
        SELECT id FROM subcategories
    `,
    chartFluxoCaixa: (param) => `
        select extract(${param.view || 'month'} from data_lancamento) as data_lanc, sum(valor), dc from conta_movimento
            ${param.view == 'day' ? ` where extract(month from data_lancamento) = extract(month from now()) ${param.empresa ? ` and id_empresa = ${param.empresa}` : ''}` : ''}
            group by data_lanc, dc
    `,
    chartFinanc: (param) => `
        select extract(${param.view || 'month'} from data_vencimento) as data_venc, sum(valor_total) from financeiro 
            where tipo_conta = ${param.tipo_conta} 
                ${param.view == 'day' ? `and extract(month from data_vencimento) = extract(month from now()) ${param.empresa ? ` and id_empresa = ${param.empresa}` : ''}` : ''}
            group by data_venc
    `,
    performanceVendas: (param) => `
        select extract(${param.view || 'month'} from data_criacao) as varData, sum(valor_total) from venda
            ${param.empresa ? ` where id_empresa = ${param.empresa}` : ''}
            ${param.view == 'day' ? ` ${param.empresa ? 'and' : 'where'} extract(month from data_criacao) = extract(month from now())` : ''}
            group by varData
    `,
    performanceCompras: (param) => `
        select extract(${param.view || 'month'} from data_lancamento) as varData, sum(valor_total) from compra 
            ${param.empresa ? ` where id_empresa = ${param.empresa}` : ''}
            ${param.view == 'day' ? ` ${param.empresa ? 'and' : 'where'} extract(month from data_lancamento) = extract(month from now())` : ''}
            group by varData
    `,
    produtosCampeoes: () => `
        select produtos.descricao, sum(produto_venda.valor_total) as total from venda
        inner join produto_venda on produto_venda.id_venda = venda.id
        inner join produtos on produtos.id = produto_venda.id_produto
        where extract(month from venda.data_criacao) = extract(month from now())
        group by produtos.descricao 
        order by total desc
        limit 5
    `,
    clientesCampeoes: () => `
        select pessoas.nome, sum(venda.valor_total) as total from venda
        inner join pessoas on pessoas.id = venda.id_pessoa
        where extract(month from venda.data_criacao) = extract(month from now())
        group by pessoas.nome
        order by total desc
        limit 5
    `,
    usuariosCampeoes: () => `
        select usuarios.nome, sum(venda.valor_total) as total from venda
        inner join usuario_vendas on usuario_vendas.id_venda = venda.id
        inner join usuarios on usuario_vendas.id_usuario = usuarios.id
        where extract(month from venda.data_criacao) = extract(month from now())
        group by usuarios.nome
        order by total desc
        limit 5
    `,
    valorEstoque: () => `
        select sum(pe.quantidade * prod.valor_unitario) as total from produto_estoque as pe
        inner join produtos as prod on pe.id_produto = prod.id
    `
}