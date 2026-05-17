import { FormData } from '@ohos/axios';
import { request } from '../utils/Request';
import { Context } from '@ohos.abilityAccessCtrl';

export function UploadImgApi(data:FormData,context:Context){
  return request<UploadData,FormData>({
    url:'/quiz-community/public/v1.0/users/images',
    method:'post',
    headers:{'Content-Type':'multipart/form-data'},
    data:data,
    context:context
  })
}

export interface UploadData {
  /**
   * 图片名称
   */
  imgUrl: string;
}
