@Entry
@Component
struct MarginPadding{
  build() {
    Column(){
      //Text()
       // .width(80)
       // .height(80)
        //.backgroundColor(Color.Black)
      //外边距
      //   .margin({top:20})
      Text()
        .width('100%')
        .height('100%')
        .backgroundColor(Color.Black)

    }
    .width(200)
    .height(200)
    .backgroundColor(Color.Pink)
    //内边距
    .border({width:2,color:Color.Red})
    .padding(20)
  }
}
