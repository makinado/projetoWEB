import Vue from 'vue'

import './plugins/vuetify'
import './plugins/chartist'
import 'font-awesome/css/font-awesome.css'

import App from './App'

import store from './config/store/'
import router from './config/router'

import './config/bootstrap'
import './config/axios'
import './config/msg'
import './config/filter'

import ViaCep from 'vue-viacep'
Vue.use(ViaCep);
import VueTheMask from 'vue-the-mask'
Vue.use(VueTheMask)

import firebase from 'firebase/app';
import 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDu861Jo7gYWl0FMUjPnZ5Cu_0219Yw218",
  authDomain: "sistemaonline-eadd6.firebaseapp.com",
  databaseURL: "https://sistemaonline-eadd6.firebaseio.com",
  projectId: "sistemaonline-eadd6",
  storageBucket: "sistemaonline-eadd6.appspot.com",
  messagingSenderId: "304650913777",
  appId: "1:304650913777:web:d572c12ce56c4fa2626650",
  measurementId: "G-N4FBK3PWGJ"
};

firebase.initializeApp(firebaseConfig);

Vue.config.productionTip = false
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')