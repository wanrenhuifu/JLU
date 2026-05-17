@Entry
@Component
struct Test01 {
  build() {
    Column() {
      Text('Test01 Page')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin({ top: 50 })
    }
    .height('100%')
    .width('100%')
    .justifyContent(FlexAlign.Center)
  }
}
//单向
//@Prop
//双向改变
//@Link
