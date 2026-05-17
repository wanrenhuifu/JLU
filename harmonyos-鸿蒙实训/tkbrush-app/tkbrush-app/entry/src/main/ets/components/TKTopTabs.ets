
@Preview
@Component
struct TKTopTabs {

  list:string[] = ['初级试题','进阶试题']

  //当前选中项的索引
  @Prop
  currentIndex:number = 0
  //点击事件
  itemClick:(currentIndex:number)=>void = ()=>{}

  @Builder
  getItem(title:string,index:number){
    Column({space:4.5}){
      Text(title)
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .fontColor(index===this.currentIndex?$r('app.color.primary'):$r('app.color.text_primary'))
      Divider().strokeWidth(3).width(38).color($r('app.color.primary'))
        .visibility(index===this.currentIndex?Visibility.Visible:Visibility.Hidden)
    }
    .onClick(()=>{
      this.currentIndex = index
      this.itemClick(this.currentIndex)
    })

  }

  build() {
    Row(){
      ForEach(this.list,(title:string,index:number)=>{
        this.getItem(title,index)
      })
    }
    .justifyContent(FlexAlign.SpaceAround)
    .width('100%')
    .height(50)
  }
}

export {TKTopTabs}