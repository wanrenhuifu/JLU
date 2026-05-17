//第一步：引入数据库相关模块
import { relationalStore } from '@kit.ArkData'
import{ Content} from '@kit.ArkUI'
let rdbStore: relationalStore.RdbStore | null = null
//第二步 配置相关信息

const store:relationalStore.StoreConfig={
  name:'jluDB',
  securityLevel: relationalStore.SecurityLevel.S3
}
//建表
const sqlUser =
  'create table if not exists USER(ID integer primary key autoincrement,name text not null ,age integer)'
@Entry
@Component
struct SQTest {
  rdbStore:relationalStore.RdbStore | null=null
  //页面构建前获取实例
  aboutToAppear(): void {
    this.getjluDB()
  }
  async getjluDB(){
    //第三步 过去实例 并且执行建表语句
   rdbStore = await relationalStore.getRdbStore(getContext(Content),store)
   rdbStore.executeSql(sqlUser)
  }

  build() {
    Column(){
      Button('存储')
        .onClick(()=>{
          let num: number = this.rdbStore?.insertSync('USER', {name: '吉林大学', age: 20}) || 0
            if(num>0){
              AlertDialog.show({message:'插入成功了'})
            }else{
              AlertDialog.show({message:'插入失败了'})
            }

        })
    }

  }
}