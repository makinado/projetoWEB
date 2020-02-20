import Vue from 'vue'
import axios from 'axios'
import store from './config/store/state'

import { formatToBRL } from 'brazilian-values'

export const usuarioKey = 'campag-vuetify123'
// export const urlBD = 'http://3.15.52.156:3000'          // EC2
export const urlBD = 'http://localhost:3000'          // LOCAL NETWORK
// export const urlBD = 'http://localhost:3000'              // LOCAL

Vue.directive('uppercase', {
    bind(el, _, vnode) {
        el.addEventListener('keyup', (e) => {
            e.target.value = e.target.value.toUpperCase()
            vnode.componentInstance.$emit('input', e.target.value.toUpperCase())
        })
    }
})

export function showError(e) {
    if (e && e.response && e.response.data) {
        Vue.toasted.global.defaultError({ msg: e.response.data })

    } else if (typeof e === 'string') {
        Vue.toasted.global.defaultError({ msg: e })
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

export async function loadProdutos() {
    const url = `${urlBD}/produtos`;
    axios.get(url).then(res => {
        store.produtoStore.produtos = res.data.map(produto => {
            produto.value = produto.id;
            produto.text = produto.descricao;
            produto.valor_unitario = formatToBRL(produto.valor_unitario);
            produto.valor_venda = formatToBRL(produto.valor_venda);

            return produto;
        });
    });
}

export async function loadClientes() {
    const url = `${urlBD}/pessoas/clientes`;
    axios.get(url).then(res => {
        console.log(res.data)
        store.pessoaStore.pessoas = res.data
    });
}

export async function loadFornecs() {
    const url = `${urlBD}/pessoas/fornecedores`;
    axios.get(url).then(res => {
        store.pessoaStore.pessoas = res.data.map(pessoa => {
            pessoa.value = pessoa.id;
            pessoa.text = pessoa.nome;

            return pessoa;
        });
    });
}

export async function loadUsuarios() {
    const url = `${urlBD}/usuarios/todos`;
    axios.get(url).then(res => {
        store.usuarioStore.currentUsuarios = res.data.map(usuario => {
            usuario.value = usuario.id;
            usuario.text = usuario.nome;

            return usuario;
        });
    });
}

export async function loadPessoas() {
    const url = `${urlBD}/pessoas/todos`;
    axios.get(url).then(res => {
        store.pessoaStore.pessoas = res.data.map(pessoa => {
            pessoa.value = pessoa.id;
            pessoa.text = pessoa.nome;

            return pessoa;
        });
    });
}

export async function loadCategoriasPessoas() {
    const url = `${urlBD}/categorias/pessoas`;
    axios
        .get(url)
        .then(res => {
            store.categoriaStore.categorias = res.data.map(cat => {
                cat.value = cat.id;
                cat.text = cat.descricao;

                return cat;
            });
        })
        .catch(showError);
}

export async function loadCategoriasProdutos() {
    const url = `${urlBD}/categorias/produtos`;
    axios
        .get(url)
        .then(res => {
            store.categoriaStore.categorias = res.data.map(cat => {
                cat.value = cat.id;
                cat.text = cat.descricao;

                return cat;
            });
        })
        .catch(showError);
}

export async function loadMarcas() {
    const urlMarcas = `${urlBD}/marcas`;
    axios.get(urlMarcas)
        .then(res => {
            store.produtoStore.marcas = res.data.map(marca => {
                marca.value = marca.id;
                marca.text = marca.nome;

                return marca
            });
        })
        .catch(showError);
}

export async function loadUnidades() {
    const urlUnidades = `${urlBD}/unidades`;
    axios.get(urlUnidades)
        .then(res => {
            store.produtoStore.unidades = res.data.map(unidade => {
                unidade.value = unidade.id;
                unidade.text = unidade.descricao;

                return unidade
            });
        })
        .catch(showError);
}

export async function loadTabelas() {
    const url = `${urlBD}/tabelas`;
    axios.get(url)
        .then(res => {
            store.vendaStore.tabelas = res.data.map(tabela => {
                tabela.value = tabela.id;
                tabela.text = tabela.descricao;

                return tabela
            });
        })
        .catch(showError);
}

export async function loadEmpresas() {
    if (!store.usuarioStore.currentUsuario) return
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

export async function loadAtividades() {
    axios
        .get(`${urlBD}/log/hoje`)
        .then(res => {
            store.atividades = res.data;
        })
        .catch(showError);
}

export default { showError, usuarioKey }