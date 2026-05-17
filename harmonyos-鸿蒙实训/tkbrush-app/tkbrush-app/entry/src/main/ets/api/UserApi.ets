import { CodeData, GetCodeParms, LoginParms, RegisterParms, UpdateUserParms, UserData, UserInfo } from '../models/User'
import { request } from '../utils/Request'

/**
 * 获取验证码接口
 */
export function getImgCodeApi(data:GetCodeParms){
  return request<CodeData,GetCodeParms>({url:'/quiz-community/public/v1.0/users/generate-captcha',method:'get',params:data})
}

/**
 * 注册接口
 */
export  function registerApi(data:RegisterParms){
  return request<UserData,RegisterParms>({url:'/quiz-community/public/v1.0/users/register',method:'post',data:data})
}

/**
 * 登录接口
 */
export function loginApi(data:LoginParms){

  return request<UserData,LoginParms>({url:'/quiz-community/public/v1.0/users/login',method:'put',data:data})

}

/**
 * 获取用户信息
 */
export function getUserInfoApi(){
  return request<UserInfo,null>({url:'/quiz-community/public/v1.0/users/userinfo',method:'get'})
}

/**
 * 退出登录
 */
export function logoutApi(){
  return request<null,null>({url:'/quiz-community/public/v1.0/users/logout',method:'delete'})
}
/**
 * 修改用户信息
 */
export function updateUserInfoApi(data:UpdateUserParms){
  return request<null,UpdateUserParms>({url:'/quiz-community/public/v1.0/users/userinfo',method:'put',data:data})
}

/**
 * 修改密码
 */
export function updatePasswordApi(data:RegisterParms){
  return request<null,RegisterParms>({url:'/quiz-community/public/v1.0/users/pwd',method:'put',data:data})
}