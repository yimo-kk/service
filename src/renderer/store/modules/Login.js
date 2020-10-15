
  import {handleLogin,getUserInfo} from '@/api/login.js'
  const state = {
    userInfo: JSON.parse(localStorage.getItem('userInfo'))?JSON.parse(localStorage.getItem('userInfo')):{}
  }
  const mutations = {
    SET_USER_INFO(state,val){
      if(val){
        state.userInfo = val
      localStorage.setItem('userInfo',JSON.stringify(val))
      }else {
        localStorage.removeItem('userInfo')
      }
    },
  }
  const actions = {
     // 登录
     handleLogin({ state, commit }, data) {
        return new Promise(async (resolve, reject) => {
          await handleLogin(data)
            .then(result => {
              resolve(result);
            })
            .catch(err => {
              reject(err);
            });
        });
      },
      // 获取用户信息
     getUserInfo({ state, commit }) {
      return new Promise(async (resolve, reject) => {
        await getUserInfo()
          .then(result => {
            commit('SET_USER_INFO',result.data)
            resolve(result);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    // 退出登录
    outLogin({commit}){
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      commit('SET_USER_INFO','')
    }
  }
  
  export default {
    state,
    mutations,
    actions
  }
  