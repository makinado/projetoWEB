import Vue from 'vue'
import './plugins/vuetify'
import 'font-awesome/css/font-awesome.css'

import App from './App'

import store from './config/store/'
import router from './config/router'

import './config/bootstrap'
import './config/axios'
import './config/msg'

import ViaCep from 'vue-viacep'
Vue.use(ViaCep);
import VueTheMask from 'vue-the-mask'
Vue.use(VueTheMask)

Vue.config.productionTip = false
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')