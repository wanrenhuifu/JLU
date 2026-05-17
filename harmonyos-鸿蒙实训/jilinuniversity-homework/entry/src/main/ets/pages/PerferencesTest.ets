//第一步
import {preferences}from'@kit.ArkData'
import{Content}from'@kit.ArkUI'
//第二步 定义一个全局状态
let dataPreferences:preferences.Preferences|null=null
//用户首选项练习
@Entry
@Component
struct PerferencesTest {
  //第三步 获取Preferences实例 getPreferences方法 注意 在页面构建前先要获取到实例
  //页面获取上下文 getContext
  aboutToAppear(): void {
    dataPreferences = preferences.getPreferencesSync(getContext(Content), { name: 'mystore' })
  }
  build() {
    Column()
    {
      Button('存储 school（键名） name（值）吉林大学')
        .onClick(() => {
          //第四步使用 通过实例调用内置方法
          dataPreferences?.putSync('school','吉林大学')
          //持久化存储
          dataPreferences?.flush()
        })
      Button('读取 school（键名）的（值）')
        .onClick(()=>{
          console.log('jlu 值为'+dataPreferences?.getSync('school','没有哦'))
        })

    }
  }
}