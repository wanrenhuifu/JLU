import axios, { AxiosError,
  AxiosHeaders,
  AxiosProgressEvent,
  AxiosResponse, InternalAxiosRequestConfig, Method,
  RawAxiosRequestHeaders } from '@ohos/axios'
import { RouterUrl } from '../constants/RouterUrl';
import { hilog } from '@kit.PerformanceAnalysisKit';
import userStore from '../utils/UserStore'
import { router } from '@kit.ArkUI';


const instance = axios.create({
  baseURL: RouterUrl.APIUrl,
  timeout: 5000
});

// 添加请求拦截器
instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // 对请求数据做处理
  hilog.info(666,'brushAPP',`1-请求配置${config.method!}-${config.url}：${JSON.stringify(config.params || config.data)}`)
  // 1. 因为每个需要用户信息的接口都需要toke，所以在这里统一添加
  const store = await userStore.getUserToken()
  if (store.token) {
    config.headers.set('x-jwt-token',`Bearer ${store.token}`)
    hilog.info(666,'brushAPP',`1-请求配置${config.method!}-${config.url}：${JSON.stringify(config.headers)}`)
  }
  return config;
}, (error: AxiosError) => {
  // 对请求错误返回错误信息
  return Promise.reject(error);
});


interface ErrorRes {
  status: number;
  msg: string
}

// 响应拦截器
instance.interceptors.response.use((response: AxiosResponse) => {
  // 对响应数据处理
  if (response.data?.code && response.data.code !== 200) {
    AlertDialog.show({
      message: response.data?.msg
    })
    hilog.error(666,'TKBrushAPP','4-code请求错误：' + JSON.stringify(response.data))
    return Promise.reject(response.data)
  }
  hilog.warn(666,'TKBrushAPP','2-请求结果：' + JSON.stringify(response.data))
  // 返回数据
  return response.data?.data || response.data

}, (error: AxiosError<ErrorRes>) => {
  AlertDialog.show({
    message: error.response?.status + '：' + error.response?.data.msg
  })
  hilog.error(666,'TKBrushAPP',`3-http请求错误${error.response?.status}：` + JSON.stringify(error))
  // 2. 处理 401
  if (error.response?.status === 401) {
    userStore.deleteUserToken()
    router.replaceUrl({ url:'pages/Login/TKLogin' })
  }
  // 对响应错误做点什么
  return Promise.reject(error);
});

// 请求参数
interface RequestParams<T> {
  url: string
  method?: Method
  params?: T
  data?: T
  headers?: RawAxiosRequestHeaders | AxiosHeaders
  context?: Context
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
}
/**
 * 所有接口调用的入口
 */
export function request<DataModel = null, DataParams = null>(requestParams: RequestParams<DataParams>): Promise<DataModel> {
  return instance<null, DataModel>(requestParams)
}

export {instance}