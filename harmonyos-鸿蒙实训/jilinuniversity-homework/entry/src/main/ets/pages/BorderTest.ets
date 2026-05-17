@Entry
@Component
struct BorderTest{
  build() {
    Text()
      .width(80)
      .height(80)
      //边框
      .border({width:{top:10,bottom:5},
        color:{top:Color.Blue,bottom:Color.Green},
        style:BorderStyle.Dotted})
    //圆角
     // .borderRadius({topLeft:50,bottomRight:50})
    //样式
     // .borderStyle(BorderStyle.Dotted)
  }
}