export interface GetCodeParms {
  /**
   * 标识：注册时参数值为手机号；其它情况获取验证码可不传该参数
   */
  identify?: string;
}

export interface CodeData {
  /**
   * 验证码信息ID
   */
  captchaId: string;
  /**
   * 验证码图片base64
   */
  imageBase64: string;
}

export interface RegisterParms {
  /**
   * 验证码的唯一标识符
   */
  captchaId: string;
  /**
   * 密码
   */
  password: string;
  /**
   * 账号
   */
  username?: string;
  /**
   * 验证码
   */
  verifycode: string;
}

export interface UserData {
  token: string;
}

export interface LoginParms {
  /**
   * 密码
   */
  password?: string;
  /**
   * 账号
   */
  username?: string;
}

export interface UserInfo {
  /**
   * 头像
   */
  avatar: string;
  /**
   * 创建时间戳
   */
  ctime: number;
  /**
   * 用户昵称
   */
  nickname: string;
  /**
   * 手机号
   */
  phone: string;
  /**
   * 用户答题数量
   */
  questionAnswerCount: number;
  /**
   * 账号
   */
  username: string;
}
export interface UpdateUserParms {
  /**
   * 头像
   */
  avatar?: string;
  /**
   * 昵称
   */
  nickname?: string;
}