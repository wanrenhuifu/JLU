@Entry
@Component
struct IfElseTest{
  @State flag:boolean = true
  build(){
    Column (){
      Button('按钮')
        .onClick(()=>{
          this.flag=!this.flag
        })
      if( this.flag){
        Text('我是真的')
      }else{
        Text('我是假的')
      }
    }
  }
}

