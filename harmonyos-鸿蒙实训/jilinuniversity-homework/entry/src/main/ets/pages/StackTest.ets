@Entry
@Component
struct StackTest {
  build() {
    //层叠布局 默认越往后层级越高
    Stack({alignContent:Alignment.TopEnd}){
      Text('剩余3s 跳过')
        .width(100)
        .height(60)
        .backgroundColor(Color.Green)
        //设置显示优先级
        .zIndex(999)
      Text()
        .width('100%')
        .height('100%')
        .backgroundColor(Color.Red)

    }
    .width('100%')
    .height('100%')
    .border({width:5})

  }
}