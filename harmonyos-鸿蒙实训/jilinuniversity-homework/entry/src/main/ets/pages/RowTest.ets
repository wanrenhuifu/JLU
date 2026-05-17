@Entry
@Component
struct RowTest{
  build() {
    //行布局 主轴是横向 从左到右 X轴 默认侧轴居中
    Row(){
      Text()
        .width(50)
        .height(50)
        .border({width:10})
      //空白组件
      Blank()
      Text()
        .width(50)
        .height(50)
        .border({width:10})


    }
    .width('100%')
    .height('100%')
    .border({width:5})
    //主轴位置 justifyContent
    //两侧摊开 中间平分
    //.justifyContent(FlexAlign.SpaceBetween)
    //.justifyContent(FlexAlign.SpaceEvenly)
    //侧轴调整
    //.alignItems(VerticalAlign.Bottom)

  }
}