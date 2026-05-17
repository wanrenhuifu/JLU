@Entry
@Component
struct FlexTest {
  build() {
    //改变主轴：direction 换行：wrap
    // 调整主轴：justifyContent 调整侧轴：alignContent
    Flex({wrap:FlexWrap.Wrap,
      justifyContent:FlexAlign.SpaceBetween,
      alignContent:FlexAlign.Center}){
      Text('1')
        .width(50)
        .height(50)
        .border({width:2})
      Text('2')
        .width(50)
        .height(50)
        .border({width:2})
      Text('3')
        .width(50)
        .height(50)
        .border({width:2})

    }
    .width('100%')
    .height('100%')
    .border({width:5})

  }
}