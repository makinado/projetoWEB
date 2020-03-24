// https://vuex.vuejs.org/en/actions.html

import axios from 'axios'
import { urlBD, parseNumber } from '@/global'
import Vue from 'vue'

import { formatToBRL } from 'brazilian-values'

export default {
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
  async calcTotalPDV(store) {
    let quantidade = 0,
      valor_desconto = 0,
      valor_total = 0;

    store.state.vendaStore.pdv.produtos.forEach(produto => {
      quantidade += parseNumber(produto.quantidade || "0,00");
      valor_desconto += parseNumber(produto.valor_desconto || "0,00");
      valor_total += parseNumber(produto.valor_total || "0,00");
    });

    store.commit('setTotaisPDV', {
      quantidade: formatToBRL(quantidade).replace("R$", ""),
      valor_desconto: formatToBRL(valor_desconto),
      valor_total: formatToBRL(valor_total)
    })
  }
}
