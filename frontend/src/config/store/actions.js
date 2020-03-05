// https://vuex.vuejs.org/en/actions.html

import axios from 'axios'
import { urlBD } from '@/global'

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
}
