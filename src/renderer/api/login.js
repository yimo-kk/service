import request from '@/utils/axios.js'
/**
 * 登录
 */
export function handleLogin(params){
    return request.post('/service/doLogin', params)
}
/**
 * 获取用户信息
 */
export function getUserInfo(params){
    return request.get('/service/getKefuInfo')
}
/**
 * 登录状态
 */
export function updateKefuStatus(code){
    return request.get(`/service/updateKefuStatus?kefu_code=${code}`)
}
