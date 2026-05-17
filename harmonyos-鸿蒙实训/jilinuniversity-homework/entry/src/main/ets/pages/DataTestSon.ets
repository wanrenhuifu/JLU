@Component
//注意要在父组件使用要先导出
export struct DataTestSon{
  @State num:number=0
  //单向
  //@Prop count:number
  //双向改变
  @Link count:number
  //子页面
  build() {
    //text组件参数必须为字符串
    Text(this.count.toString())
      .onClick(()=>{
        this.count++
      })
  }
}