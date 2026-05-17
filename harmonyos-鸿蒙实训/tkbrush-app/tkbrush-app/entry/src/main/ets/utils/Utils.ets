import dayjs from '@hview/dayjs'

export class Utils{
  
  /**
   * 获取图片全路径
   */
  static getImgUrl(imgName:string){
    return `https://quiz-community.ictedu.com/quiz-community/public/v1.0/users/images/${imgName}?type=1`
  }

  /**
   * 通过时间戳转时间字符串
   */
  static getTimeStr(time:number){
    return dayjs(time).format('YYYY.MM.DD HH:mm:ss')
  }
  
}