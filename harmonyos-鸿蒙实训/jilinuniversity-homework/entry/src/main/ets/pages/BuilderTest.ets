@Entry
@Component
struct BuilderTest{
  @State num:number=0
  //定义builder
  @Builder textBuilder(title:string){
    Text(title)
  }
  @Builder textBuilder1(){
    Text('Builder内容1')
  }
  @Builder textBuilder2(){
    Text('Builder内容2')
  }
  build(){
    //列布局，相当于最外层盒子
    Column(){
      this.textBuilder('Builder内容')
      this.textBuilder1()
      this.textBuilder2()
//按钮样式
      Button('按钮')
        .stateStyles({
          //获焦
          focused:{
            .backgroundColor(Color.Pink)
          },
          //按压
          pressed:{
            .backgroundColor(Color.Red)
            .width(200)
          },
          //正常
          normal:{
            .backgroundColor(Color.Blue)
            .width(50)
          }
        })
    }
  }
}