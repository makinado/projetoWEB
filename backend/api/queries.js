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
    chartFinanc: (param) => `
        select extract(${param.view || 'month'} from data_vencimento) as data_venc, sum(valor_total) from financeiro 
            where tipo_conta = ${param.tipo_conta} ${param.view == 'day' ? `and extract(month from data_vencimento) = extract(month from now())` : ''}
            group by data_venc
    `,
    chartVenda: (param) => `
        select extract(${param.view || 'month'} from data_criacao) as data_criacao, sum(valor_total) from venda 
            group by data_criacao
    `,
}