// https://vuex.vuejs.org/en/mutations.html

import axios from 'axios'
import { formatToBRL } from 'brazilian-values'
import { showSuccess } from '@/global'

export default {
  setUsuario(state, usuario) {
    state.usuarioStore.currentUsuario = usuario
    if (usuario) {
      axios.defaults.headers.common['Authorization'] = `bearer ${usuario.token}`
      state.TemplateVisible = true
    } else {
      delete axios.defaults.headers.common['Authorization']
      state.empresaStore.currentEmpresa = null
      state.usuarioStore.currentPerfil = null
      state.TemplateVisible = false
    }
  },
  setNotificacoes(state, notificacoes) {
    console.log(notificacoes)
    state.notificacoes = notificacoes
  },
  setEmpresa(state, empresa) {
    state.empresaStore.currentEmpresa = empresa
  },
  setPerfil(state, perfil) {
    state.usuarioStore.currentPerfil = perfil
  },
  setEmpresas(state, empresas) {
    console.log(empresas)
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
  setPedidos(state, pedidos) {
    state.comprasStore.pedidos = pedidos
  },
  setMarcas(state, marcas) {
    state.produtoStore.marcas = marcas
  },
  setUnidades(state, unidades) {
    state.produtoStore.unidades = unidades
  },
  setCategoriasArtigos(state, categorias) {
    state.categoriaStore.categoriasArtigos = categorias
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
  setPDVProduto(state, produto) {
    state.vendaStore.pdv.pdvProduto = produto
  },
  setVendas(state, vendas) {
    state.vendaStore.vendas = vendas
  },
  setClassificacoes(state, classificacoes) {
    state.classificacaoStore.classificacoes = classificacoes
  },
  setPDVProdutos(state, produtos) {
    state.vendaStore.pdv.produtos = produtos.map(p => {
      return {
        sequencia: p.sequencia,
        produto: { value: p.id, text: p.descricao },
        quantidade: formatToBRL(p.quantidade).replace('R$', ''),
        valor_venda: formatToBRL(p.valor_venda),
        valor_desconto: formatToBRL(p.valor_desconto),
        valor_total: formatToBRL(p.valor_total)
      }
    })
  },
  pushPDVProduto(state, produto) {
    if (!produto.sequencia) {
      if (state.vendaStore.pdv.produtos.length == 0)
        produto.sequencia = 1
      else {
        produto.sequencia = state.vendaStore.pdv.produtos.slice(-1)[0].sequencia + 1
      }
    }
    state.vendaStore.pdv.produtos.push(produto)
    showSuccess('Produto adicionado com sucesso!')
  },
  setTotaisPDV(state, totais) {
    state.vendaStore.pdv.totais = totais
  },
  setFilter(state, filter) {
    state.filter = filter
  }
}
