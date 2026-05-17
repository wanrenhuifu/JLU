import router from '@ohos.router'

@Entry
@Component
struct RouterTest {
  //路由练习
  build(){
    Column(){
      Button('跳转')
        .onClick(()=>{
          //url代表目标地址
          //跳转后想返回
          router.pushUrl({url:"pages/Index"})
          //跳转后不想返回
          //router.replaceUrl({url:"pages/Index"})
          //返回上一页 和pushUrl联用才会有返回上一页效果
         // router.back()
        })

    }



  }
}