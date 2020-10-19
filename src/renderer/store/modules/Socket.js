import {
    getGroupList
} from "@/api/group.js";
import Toast from '@/components/Toast/toast'
import router from '@/router'
import { getCustomerQueue } from "@/api/await.js";
import { getNowServiceList } from "@/api/current.js";
const state = {
    currentUser: {
        activtyUid: null,
        activtyeUsername: "",
        login_ip:'', 
        area:''
    },
    activityGroup: {
        activityId: null,
        activityTitle: "",
        is_invite:1
    },
    userMessage: {}, // 客服收到用户消息
    relinkMessage: {}, // 客服收到转接消息
    refuseMessage: {}, // 转接是否被接受
    groupMessage: {}, // 接受群聊消息
    chatList: [],//群列表
    awaitList:[], // 等待接入
    currentChatList:[], // 正在聊天列表
    userIp:{},
    groupBlack:{},//全局拉黑提示
    userBlack:{}, //个人拉黑提示
    groupForbid:{}, //禁言全局
    userForbid:{}, //禁言个人
    kefuStatus:{},
    oldUser:{},//上次接待的人
}
const getters = {
    currentNum(state){
        let num = 0
       state.currentChatList.forEach(element => {
        num += element.noReadNum
        });
        return num
    },
    groupChatNum(state){
        let num = 0
       state.chatList.forEach(element => {
        num += element.noReadNum
        });
        return num
    }
}
const mutations = {
    // connect:查看socket是否渲染成功
    SOCKET_connect: (state) => {
    },
    // disconnect:检测socket断开连接
    SOCKET_disconnect: (data) => {
    },
    // reconnect:重新连接socket事件
    SOCKET_reconnect: (data) => {
        
    },
    SOCKET_delKefu: (state,data) => {
        Toast( { icon: 'close',
        content: data.message})
        router.push({name:'Login'})
    },
    //收到用户消息
    SOCKET_userMsg: (state, data) => {
        state.userMessage = data
    },
    SOCKET_relink: (state, data) => {
        state.relinkMessage = data
    },
    SOCKET_refuse: (state, data) => {
        state.refuseMessage = data
    },
    SOCKET_prompt:(state, data)=>{
        let arr = []
        state.awaitList.forEach((item) => {
          if(item.customer_id != data.uid){
           arr.push(item)
          }
        });
        state.awaitList= arr

    },
    //群消息
    SOCKET_groupMsg: (state, data) => {
        state.groupMessage = data
    },
    //新待接
    SOCKET_addQueue: (state, data) => {
        state.awaitList.push(data)
    },
    // 收到拉黑全局提示
    SOCKET_groupBlack: (state, data) => {
        state.groupBlack = data
    },
    // 个人提示已被拉黑
    SOCKET_userBlack: (state, data) => {
        state.userBlack = data
    },
    // 个人提示解除拉黑
    SOCKET_removeblack: (state, data) => {
        state.userBlack = data
    },
    // 禁言全局提示
    SOCKET_groupForbid: (state, data) => {
        state.groupForbid = data
    },
     // 禁言全局个人提示
     SOCKET_userForbid: (state, data) => {
        state.userForbid = data
    },
    // 提示个人解禁
    SOCKET_removeforbid: (state, data) => {
        state.userForbid = data
    },
    // 当前登录状态
    SOCKET_setStatus:(state, data) => { 
        state.kefuStatus = data
    },
    //  上次接待 再次默认接待
    SOCKET_autoLink:(state, data) => { 
        data.access_time = data.createtime
        if(!state.currentChatList.length){
            data.noReadNum = 0
            state.currentUser= {
                activtyUid: data.uid,
                activtyeUsername: data.username,
                login_ip:data.login_ip, 
                area:data.area
            }
        }
        state.oldUser = data
        state.currentChatList.push(data)
    },
    SET_STATUS(state, data){
        state.status = data
    },  
    SET_CHAT_LIST(state, data) {
        state.chatList = data
    },
    SET_CURRENT_USER(state, data){
        state.currentUser = data
    },
    SET_ACTIVITY_GROUP(state, data){
        state.activityGroup = data
    },
    SET_AWAIT_LIST(state, data){
        state.awaitList = data
    },
    SET_CURRENT_CHAT_LIST(state, data){
        state.currentChatList = data
    },
    SET_USER_IP(state, data){
        state.userIp = data
    },
    RESETVUEX(state){
        state.currentUser.activtyUid= null
        state.currentUser.activtyeUsername=""
        state.currentUser.login_ip=''
        state.currentUser.area=''
        state.activityGroup.activityId= null
        state.activityGroup. activityTitle= ""
        state.activityGroup.is_invite=1
        state.userMessage= {} // 客服收到用户消息
        state.relinkMessage= {} // 客服收到转接消息
        state. refuseMessage= {} // 转接是否被接受
        state.groupMessage= {} // 接受群聊消息
        state.chatList= []//群列表
        state.awaitList=[] // 等待接入
        state.currentChatList=[]// 正在聊天列表
        state.userIp={}
        state.groupBlack={}//全局拉黑提示
        state.userBlack={}//个人拉黑提示
        state.groupForbid={} //禁言全局
        state. userForbid={} //禁言个人
        state.kefuStatus={}
        state.oldUser={}//上次接待的人
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userInfo')
    }, 
} 
const actions = {
    // 获取群列表
    getGroupList({ commit },data) {
        return new Promise(async (resolve, reject) => {
            getGroupList(data).then((result) => {
                    // let chatList = result.data.map((item) => {
                    //     item.badgeShow = 0;
                    //     return item;
                    // });
                    commit('SET_CHAT_LIST',  result.data)
                    resolve( result.data);
                })
                .catch(err => {
                    reject(err);
                });
        })
    },
     // 等待接入的列表
     getAwaitList({ commit },data) {
        return new Promise(async (resolve, reject) => {
            getCustomerQueue(data).then((result) => {
               let awaitList = result.data;
                    commit('SET_AWAIT_LIST', awaitList)
                    resolve(awaitList);
                })
                .catch(err => {
                    reject(err);
                });
        })
    },
      // 正在聊天的列表
      getCurrentListData({ state,commit }) {
        return new Promise(async (resolve, reject) => {
            getNowServiceList().then((result) => {
                let list= JSON.parse(JSON.stringify(state.currentChatList))
                let currentChatList = result.data.map(item=>{
                    list.forEach(val=>{
                        val.isMultitap?item.isMultitap = true:item.isMultitap = false
                    })
                    return item
                })
                commit('SET_CURRENT_CHAT_LIST', currentChatList)
                resolve(currentChatList);
                })
                .catch(err => {
                    reject(err);
                });
        })
    },
    delKefu({commit}){
        commit(DEL)
    }
   
}

export default {
    state,
    getters,
    mutations,
    actions
}