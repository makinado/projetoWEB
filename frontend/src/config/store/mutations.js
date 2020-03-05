// https://vuex.vuejs.org/en/mutations.html

import axios from 'axios'

export default {
  setUsuario(state, usuario) {
    state.usuarioStore.currentUsuario = usuario
    if (state.usuarioStore.currentUsuario) {
      axios.defaults.headers.common['Authorization'] = `bearer ${usuario.token}`
      state.TemplateVisible = true
    } else {
      delete axios.defaults.headers.common['Authorization']
      state.empresaStore.currentEmpresa = null
      state.usuarioStore.currentPerfil = null
      state.TemplateVisible = false
    }
  },
  setEmpresa(state, empresa) {
    state.empresaStore.currentEmpresa = empresa
  },
  setPerfil(state, perfil) {
    state.usuarioStore.currentPerfil = perfil
  },
  setEmpresas(state, empresas) {
    state.empresaStore.empresas = empresas
  },
  setUsuarios(state, usuarios) {
    state.usuarioStore.currentUsuarios = usuarios
  },
  setPessoas(state, pessoas) {
    state.pessoaStore.pessoas = pessoas
  },
  setClientes(state, clientes) {
    state.pessoaStore.clientes = clientes
  },
  setFornecs(state, fornecedores) {
    state.pessoaStore.fornecedores = fornecedores
  },
  setTransps(state, transportadoras) {
    state.pessoaStore.transportadoras = transportadoras
  },
  setProdutos(state, produtos) {
    state.produtoStore.produtos = produtos
  },
  setMarcas(state, marcas) {
    state.produtoStore.marcas = marcas
  },
  setUnidades(state, unidades) {
    state.produtoStore.unidades = unidades
  },
  setCategorias(state, categorias) {
    state.categoriaStore.categorias = categorias
  },
  setAtividades(state, atividades) {
    state.atividadeStore.atividades = atividades
  },
  setDocumentos(state, documentos) {
    state.financeiroStore.documentos = documentos
  },
  setContas(state, contas) {
    state.financeiroStore.contas = contas
  },
  setBancos(state, bancos) {
    state.financeiroStore.bancos = bancos
  },
  setTabelas(state, tabelas) {
    state.vendaStore.tabelas = tabelas
  },
}
