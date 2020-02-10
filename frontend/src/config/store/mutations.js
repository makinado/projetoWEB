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
  }
}
