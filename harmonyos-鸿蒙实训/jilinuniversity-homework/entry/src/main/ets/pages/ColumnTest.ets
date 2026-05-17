@Entry
@Component
struct ColumnTest {
  build() {
    //列布局 主轴是Y轴 从上到下
    Column({space:100}){
      Text()
        .width(50)
        .height(50)
        .border({width:10})
      Text()
        .width(50)
        .height(50)
        .border({width:10})
      Text()
        .width(50)
        .height(50)
        .border({width:10})
    }
    .width('100%')
    .height('100%')
    .border({width:5})
    //主轴
    //.justifyContent(FlexAlign.SpaceBetween)
    //侧轴
    .alignItems(HorizontalAlign.End)

  }
}