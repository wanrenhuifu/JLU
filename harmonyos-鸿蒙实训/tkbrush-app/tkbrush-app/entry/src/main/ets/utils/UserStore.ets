import { preferences } from '@kit.ArkData'
import { UserData } from '../models/User'

class UserStore {
  key = 'user_token'

  //获取本地仓库
  getUserStore() {
    return preferences.getPreferences(getContext(this),{name:'UserStore'})
  }

  //设置token
  async setUserToken(userData: UserData) {
    const store = await this.getUserStore()
    store.putSync(this.key, JSON.stringify(userData))
    store.flush()
  }
  //获取token
  async getUserToken(){
    const store = await this.getUserStore()
    const data = await store.get(this.key,'{}') as string
    return JSON.parse(data) as UserData
  }

  //删除token
  async deleteUserToken(){
    const store = await this.getUserStore()
    store.deleteSync(this.key)
    store.flush()
  }

}

export default  new UserStore()