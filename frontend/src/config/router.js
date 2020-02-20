import Vue from 'vue'
import VueRouter from 'vue-router'

import store from './store'

import Auth from '@/components/auth/Auth'
import Home from '@/components/home/Home'

import { usuarioKey } from '@/global'

Vue.use(VueRouter)

const routes = [{
    name: 'Home',
    path: '/',
    component: Home
}, {
    name: 'Login',
    path: '/auth',
    component: Auth
}, {
    name: 'Recuperar senha',
    path: '/reset/:token',
    component: () => import('@/components/auth/RecoverPassword')
}, {
    name: 'Perfil',
    path: '/usuario',
    component: () => import('@/components/usuario/PerfilUsuario')
}, {
    name: 'Pessoas',
    path: '/pessoas',
    component: () => import('@/components/pessoas/Pessoas')
}, {
    name: 'Empresas',
    path: '/empresas',
    component: () => import('@/components/empresas/Empresas')
}, {
    name: 'Usuários',
    path: '/usuarios',
    component: () => import('@/components/usuario/Usuarios')
}, {
    name: 'Produtos',
    path: '/produtos',
    component: () => import('@/components/produtos/Produtos')
}, {
    name: 'Agenda',
    path: '/agenda',
    component: () => import('@/components/ferramentas/Agenda')
}, {
    name: 'Atividades',
    path: "/atividades",
    component: () => import('@/components/ferramentas/Atividade')
}, {
    name: 'Pedidos',
    path: '/pedidos',
    component: () => import('@/components/compras/Pedidos')
}, {
    name: 'Compras',
    path: '/importacoes',
    component: () => import('@/components/compras/Compras')
}, {
    name: 'Configurações',
    path: '/config',
    component: () => import('@/components/configuracoes/Config')
}, {
    name: 'Financeiro',
    path: '/financeiro',
    component: () => import('@/components/financeiro/Financeiro')
}, {
    name: 'Contas',
    path: '/conta',
    component: () => import('@/components/financeiro/Conta')
}, {
    name: 'Metas de empresa',
    path: '/metasEmp',
    component: () => import('@/components/empresas/Metas')
}, {
    name: 'Metas de Vendedor',
    path: '/metasVend',
    component: () => import('@/components/pessoas/Metas')
}, {
    name: 'Comissões',
    path: '/comissoes',
    component: () => import('@/components/pessoas/Comissoes')

}, {
    name: 'Orçamentos',
    path: '/orcamentos',
    component: () => import('@/components/vendas/Orcamentos')
}, {
    name: 'PDV',
    path: '/pdv',
    component: () => import('@/components/vendas/PDV')
}, {
    name: 'Dúvidas',
    path: "/duvidas",
    component: () => import('@/components/ajuda/Duvidas')
}, {
    name: 'Material de apoio',
    path: "/materialApoio",
    component: () => import('@/components/ajuda/MaterialApoio')
}, {
    name: 'Relatório de cadastros',
    path: "/cadastros",
    component: () => import('@/components/relatorios/Cadastros')
}, {
    name: 'Relatório de compras',
    path: "/compras",
    component: () => import('@/components/relatorios/Compras')
}, {
    name: 'Relatório de vendas',
    path: "/vendas",
    component: () => import('@/components/relatorios/Vendas')
}, {
    name: 'Relatório de estoque',
    path: "/estoque",
    component: () => import('@/components/relatorios/Estoque')
}, {
    name: 'Relatório financeiro',
    path: "/rel_financeiro",
    component: () => import('@/components/relatorios/Financeiro')
}, {
    name: 'Relatório estatístico',
    path: "/estat",
    component: () => import('@/components/relatorios/Estatisticas')
}, {
    name: 'Page not Found',
    path: "*",
    component: () => import('@/components/template/PageNotFound')
}]

const router = new VueRouter({
    mode: 'history',
    history: true,
    base: process.env.BASE_URL,
    routes
})


router.beforeEach((to, from, next) => {
    document.title = 'NOME_EMPRESA | ' + to.name;

    store.state.isLoading = true
    next()
})

router.afterEach((to, from) => {
    setTimeout(function () {
        store.state.isLoading = false
    }, 1000);

})

export default router
