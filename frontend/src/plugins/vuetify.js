import Vue from 'vue'
import Vuetify, { VLayout } from 'vuetify/lib'
import theme from './theme'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify, {
  iconfont: 'md',
  theme,
  components: { VLayout },
})
