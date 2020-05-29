// https://vuex.vuejs.org/en/actions.html

import axios from 'axios'
import { urlBD, parseNumber, showError, showSuccess } from '@/global'
import Vue from 'vue'

import store from '@/config/store'

import { formatToBRL } from 'brazilian-values'

export default {
  async addPessoa(state, pessoa) {
    const url = `${urlBD}/pessoas/todas/`
    axios.post(url, pessoa).then(res => {
      showSuccess()
      store.dispatch('loadPessoas')
    }).catch(showError)
  },
  async addCliente(state, cliente) {
    const url = `${urlBD}/pessoas/clientes/`
    axios.post(url, cliente).then(res => {
      showSuccess()
      store.dispatch('loadClientes')
    }).catch(showError)
  },
  async addFornecedor(state, fornecedor) {
    const url = `${urlBD}/pessoas/fornecedores/`
    axios.post(url, fornecedor).then(res => {
      showSuccess()
      store.dispatch('loadFornecs')
    }).catch(showError)
  },
  async addTransportadora(state, transportadora) {
    const url = `${urlBD}/pessoas/transportadoras/`
    axios.post(url, transportadora).then(res => {
      showSuccess()
      store.dispatch('loadTransps')
    }).catch(showError)
  },
  async addProduto(state, produto) {
    const url = `${urlBD}/produtos/todos/`
    axios.post(url, produto).then(res => {
      showSuccess()
      store.dispatch('loadProdutos')
    }).catch(showError)
  },
  async loadEmpresas(state) {
    const url = `${urlBD}/empresas/todas`;
    axios.get(url).then(res => {
      state.commit('setEmpresas', res.data)
    })
  },
  async loadUsuarios(state) {
    const url = `${urlBD}/usuarios/todos`;
    axios.get(url).then(res => {
      state.commit('setUsuarios', res.data)
    });
  },
  async loadPessoas(state) {
    const url = `${urlBD}/pessoas/todas`;
    axios.get(url).then(res => {
      state.commit('setPessoas', res.data)
    });
  },
  async loadClientes(state) {
    const url = `${urlBD}/pessoas/clientes`;
    axios.get(url).then(res => {
      state.commit('setClientes', res.data)
    });
  },
  async loadFornecs(state) {
    const url = `${urlBD}/pessoas/fornecedores`;
    axios.get(url).then(res => {
      state.commit('setFornecs', res.data)
    });
  },
  async loadTransps(state) {
    const url = `${urlBD}/pessoas/transportadoras`;
    axios.get(url).then(res => {
      state.commit('setTransps', res.data)
    });
  },
  async loadProdutos(state) {
    const url = `${urlBD}/produtos/todos`;
    axios.get(url).then(res => {
      state.commit('setProdutos', res.data)
    });
  },
  async loadPedidos(state) {
    const url = `${urlBD}/pedidos/pendentes`
    axios.get(url).then(res => {
      state.commit('setPedidos', res.data)
    })
  },
  async loadCategoriasArtigos(state) {
    const url = `${urlBD}/categoriasArtigos`;
    axios.get(url).then(res => {
      state.commit('setCategoriasArtigos', res.data.map(c => {
        return { value: c.id, text: c.path }
      }))
    }).catch(showError)
  },
  async loadCategoriasProdutos(state) {
    const url = `${urlBD}/categorias/produtos`;
    axios.get(url).then(res => {
      state.commit('setCategorias', res.data)
    });
  },
  async loadCategoriasPessoas(state) {
    const url = `${urlBD}/categorias/pessoas`;
    axios.get(url).then(res => {
      state.commit('setCategorias', res.data)
    });
  },
  async loadMarcas(state) {
    const url = `${urlBD}/marcas/todas`;
    axios.get(url).then(res => {
      state.commit('setMarcas', res.data)
    });
  },
  async loadUnidades(state) {
    const url = `${urlBD}/unidades/todas`;
    axios.get(url).then(res => {
      state.commit('setUnidades', res.data)
    });
  },
  async loadAtividades(state) {
    const url = `${urlBD}/log/hoje`;
    axios.get(url).then(res => {
      state.commit('setAtividades', res.data)
    });
  },
  async loadDocumentos(state) {
    const url = `${urlBD}/documentos/todos`;
    axios.get(url).then(res => {
      state.commit('setDocumentos', res.data)
    });
  },
  async loadContas(state) {
    const url = `${urlBD}/conta/todas`;
    axios.get(url).then(res => {
      state.commit('setContas', res.data)
    });
  },
  async loadBancos(state) {
    const url = `${urlBD}/conta/bancos`;
    axios.get(url).then(res => {
      state.commit('setBancos', res.data)
    });
  },
  async loadTabelas(state) {
    const url = `${urlBD}/tabelas/todas`;
    axios.get(url).then(res => {
      state.commit('setTabelas', res.data)
    });
  },
  async loadOrcamentos(state) {
    const url = `${urlBD}/vendas/orcamentos`;
    axios.get(url).then(res => {
      state.commit('setVendas', res.data)
    });
  },
  async loadVendas(state) {
    const url = `${urlBD}/vendas/vendas`;
    axios.get(url).then(res => {
      state.commit('setVendas', res.data)
    });
  },
  async loadClassificacoes(state, tipo = "") {
    const url = `${urlBD}/classificacoes/todas?tipo=${tipo}`
    axios.get(url).then(res => {
      state.commit('setClassificacoes', res.data)
    });
  },
  async loadPDV(store, pdv) {
    Vue.set(store.state.vendaStore.pdv, "id", pdv.id);
    Vue.set(store.state.vendaStore.pdv, "id_empresa", pdv.id_empresa);
    Vue.set(store.state.vendaStore.pdv, "id_pessoa", pdv.id_pessoa);
    Vue.set(store.state.vendaStore.pdv, "cpf_cnpj", pdv.cpf_cnpj);
    Vue.set(store.state.vendaStore.pdv, "id_vendedor", pdv.id_vendedor);
    store.commit('setPDVProdutos', pdv.produtos)
    store.dispatch('calcTotalPDV')

    console.log(store.state.vendaStore.pdv)
  },
  async resetPDV(store, pdv) {
    Vue.set(store.state.vendaStore.pdv, "id_pessoa", null);
    Vue.set(store.state.vendaStore.pdv, "id_vendedor", store.state.usuarioStore.currentUsuario.id);
    Vue.set(store.state.vendaStore.pdv, "cpf_cnpj", null);
    store.state.modalStore.vendas.pdv.stepper = 1
    store.commit("setPDVProdutos", []);
    store.dispatch("calcTotalPDV");
  },
  async calcTotalPDV(store) {
    let valor_desconto = 0,
      valor_total = 0,
      valor_acrescimo = 0;

    store.state.vendaStore.pdv.produtos.forEach(produto => {
      valor_desconto += parseNumber(produto.valor_desconto || "0,00");
      valor_acrescimo += parseNumber(produto.valor_acrescimo || "0,00");
      valor_total += parseNumber(produto.valor_total || "0,00")
    });

    store.commit('setTotaisPDV', {
      valor_acrescimo: formatToBRL(valor_acrescimo),
      valor_desconto: formatToBRL(valor_desconto),
      valor_total: formatToBRL(valor_total)
    })
  }
}
