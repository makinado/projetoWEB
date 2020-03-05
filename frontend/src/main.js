import Vue from 'vue'

import './plugins/vuetify'
import './plugins/chartist'
import 'font-awesome/css/font-awesome.css'

import App from './App'

import store from './config/store'
import router from './config/router'

import './config/bootstrap'
import './config/axios'
import './config/msg'
import './config/filter'
import './config/socket'
import './config/firebase'
import './config/cep'
import './config/mask'

Vue.config.productionTip = false
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')