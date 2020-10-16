import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'
import routers from './router'
// socket
import SocketIO from "socket.io-client";
import VueSocketIO from "vue-socket.io";
Vue.use(Router)
const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}
const router =  new Router({
  routes: routers
})
router.beforeEach((to, from, next) => {  
  let token = localStorage.getItem('accessToken')
    store.commit('SET_CURRENT_PAGE', to.name)
  if (!token && to.name !== 'Login') {
    // 未登录且要跳转的页面不是登录页
    next({
      name: 'Login' // 跳转到登录页
    })
  } else if (!token && to.name === 'Login') {
    // 未登陆且要跳转的页面是登录页
    next() // 跳转
  } 
   if( to.name === 'Login'){
    store.commit('RESETVUEX')
    store.commit('SET_USER_INFO','')
    next() // 跳转
  }
  
if(localStorage.getItem('userInfo')){
  let userInfo = JSON.parse(localStorage.getItem('userInfo'))
  Vue.use(
    new VueSocketIO({
      debug: true,
      connection: SocketIO.connect(`wss://server.nikidigital.net`, {
        path: `/socket.io/?username=${userInfo.kefu_code}&code=${userInfo.seller_code}&`,
        transports: ["websocket"]
      }),
      vuex: {
        store,
        mutationPrefix: "SOCKET_",
        actionPrefix: "SOCKET_"
      }
    })
  );
} 

 next()
})



export default router
