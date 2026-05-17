@Entry
@Component
struct PagesTest  {
  build() {
    Column(){
      Row(){
        Text('头部区域')

      }
    .width('92%')
      .height(60)
    .backgroundColor(Color.White)
      .margin({top:5})
     .borderRadius(10)
     List(){
        ListItem(){
          Row(){
            Text('List区域')

          }
        }

       }
       .margin({top:10})
     .width('92%')
     //站剩余空间
     .layoutWeight(1)
      .backgroundColor(Color.White)
      .borderRadius(10)
      Row(){
        Text('导航区域')

      }
      .width('92%')
      .height(60)
      .backgroundColor(Color.White)
      .margin({top:10})
      .borderRadius(10)
    }
    //一般最外层都是100%
    .width('100%')
    .height('100%')
    .backgroundColor('#f0eff4')


  }
}