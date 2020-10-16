import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
// antd ui
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import '@/assets/css.less'
import "@/assets/iconfont/iconfont.css";
import { Icon } from 'ant-design-vue'
import iconFont from './assets/iconfont/iconfont'
import './directives/index'
import VueLazyload from 'vue-lazyload'
Vue.use(VueLazyload)
Vue.use(VueLazyload, {
  preLoad: 1.3,
  error: require('./assets/error.jpg'),
  loading: require('./assets/timg.gif'),
  attempt: 1
})
 
const  customIcon = Icon.createFromIconfontCN({
  scriptUrl:iconFont
})
Vue.component('customIcon',customIcon)
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

// socket
// import SocketIO from "socket.io-client";
// import VueSocketIO from "vue-socket.io";
// if(localStorage.getItem('userInfo')){
//   let userInfo = JSON.parse(localStorage.getItem('userInfo'))
//   Vue.use(
//     new VueSocketIO({
//       debug: true,
//       connection: SocketIO.connect(`wss://server.nikidigital.net`, {
//         path: `/socket.io/?username=${userInfo.kefu_code}&code=${userInfo.seller_code}&`,
//         transports: ["websocket"]
//       }),
//       store
//     })
//   );
// } 
// import axios from 'axios'
// Vue.http = Vue.prototype.$http = axios
import Toast from '@/components/Toast/toast'
Vue.prototype.$toast = Toast
Vue.config.productionTip = false
Vue.use(Antd)
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')