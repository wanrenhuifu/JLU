@Entry
@Component
struct Method {
  build() {
    //文本显示
    Text('吉林大学')
    //属性方法 字体大小宽度颜色 点联是方法引用
      .fontColor(Color.Orange)
      .fontSize(50)
    //事件方法 用于做逻辑操作
    //点击事件
      .onClick(()=>{
        //逻辑
      })
    //Text()
    // .fontSize()
  }
}
//设有入口文件
@Component
struct Method2{
  //页面被构建之前，拿取数据
  aboutToAppear(): void {
    //逻辑

  }
  build(){
    //只能有一个根节点，最外层的盒子要包起来
    Column() {
      //页面内容
      Text('吉林大学前卫校区')
      Method3()
      Method3()
      Method3()
    }
  }
}
//自己定义一个组件满足自己的需求
@Component
struct Method3{
  build(){
    Text(){
      Span('吉林大学')
      Span('前卫') .fontColor(Color.Red)
      Span('校区')
    }

  }
}