import { HomeImg } from '../models/Home'
import { request } from '../utils/Request'

/**
 * 获取首页轮播图
 */
export function getHomeImgsApi(){
  return request<HomeImg[],null>({url:'/quiz-community/public/v1.0/home/slideshows'})
}