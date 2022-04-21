import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import VueSocketIO from 'vue-socket.io'

import { io } from 'socket.io-client'
import { SOCKET_URL } from './constants'

Vue.use(
  new VueSocketIO({
    debug: false,
    connection: io(SOCKET_URL)
  })
)

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: (h) => h(App)
}).$mount('#app')
