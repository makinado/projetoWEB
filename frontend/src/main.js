import Vue from 'vue'

import './plugins/vuetify'
import 'font-awesome/css/font-awesome.css'

import App from './App'

import store from './config/store'
import router from './config/router'

import './config/axios'
import './config/msg'
import './config/filter'
import './config/firebase'
import './config/cep'
import './config/mask'
import './config/notification'

Vue.config.productionTip = false
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')