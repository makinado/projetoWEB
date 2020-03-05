import Vue from 'vue'
import store from './store'
import Socket from 'vue-socket.io'

import { urlBD } from '@/global'

Vue.use(new Socket({
    debug: true,
    connection: urlBD,
    vuex: {
        store,
        actionPrefix: 'SOCKET_',
        mutationPrefix: 'SOCKET_'
    },
}))
