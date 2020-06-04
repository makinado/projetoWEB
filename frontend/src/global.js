import Vue from 'vue'
import axios from 'axios'
import store from './config/store/state'

export const usuarioKey = 'campag-vuetify123'
// export const urlBD = 'https://35.247.196.105/'          // production
export const urlBD = 'http://192.168.0.21:3000'              // LOCAL NETWORK
// export const urlBD = 'http://localhost:3000'              // LOCAL

Vue.directive('uppercase', {
    bind(el, _, vnode) {
        el.addEventListener('keyup', (e) => {
            e.target.value = e.target.value.toUpperCase()
            vnode.componentInstance.$emit('input', e.target.value.toUpperCase())
        })
    }
})

export function showSuccess(e) {
    if (!e) {
        Vue.toasted.global.defaultSuccess({})
    } else if (e && e.response && e.response.data) {
        Vue.toasted.global.defaultSuccess({ msg: e.response.data })
    } else if (typeof e === 'string') {
        Vue.toasted.global.defaultSuccess({ msg: e })
    } else if (e.message) {
        Vue.toasted.global.defaultSuccess({ msg: e.message })
    } else if (e.length > 0) {
        e.forEach((e) = this.Vue.toasted.global.defaultSuccess(e.message))
    }
}

export function showError(e) {
    if (e && e.response && e.response.data) {
        Vue.toasted.global.defaultError({ msg: e.response.data })

    } else if (typeof e === 'string') {
        Vue.toasted.global.defaultError({ msg: e })
    } else if (e.message) {
        Vue.toasted.global.defaultError({ msg: e.message })
    } else if (e.length > 0) {
        e.forEach((e) = this.Vue.toasted.global.defaultError(e.message))
    } else {
        Vue.toasted.global.defaultError({})
    }
}

export function formatDate(date) {
    if (!date) return null;

    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
}

export function moneyToNumber(money) {
    money = money.replace("R$", "");
    return money;
}

export function parseNumber(number, decimalpoint = ",") {
    var p = number.split(decimalpoint);
    for (var i = 0; i < p.length; i++) p[i] = p[i].replace(/\D/g, "");
    return parseFloat(p.join("."));
}

export async function saveLog(data, tipo, tela, detalhe) {
    const hora = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`;
    const log = {
        id_usuario: store.usuarioStore.currentUsuario.id,
        data: formatDate(data.toISOString().substr(0, 10)),
        hora,
        tipo: tipo,
        tela: tela,
        detalhe: detalhe
    };

    return axios.post(`${urlBD}/log`, log).catch(showError);
}

export default { showError, usuarioKey }