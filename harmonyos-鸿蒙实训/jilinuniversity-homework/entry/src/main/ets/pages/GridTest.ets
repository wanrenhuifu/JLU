@Entry
@Component
struct GridTest  {
  build() {
    //网格布局 Grid当中子元素只能是GridItem
    //GridItem中只能有一个根节点
    Grid(){
      GridItem(){
        Text('1')
      }.border({width:2})
      GridItem(){
        Text('1')
      }.border({width:2})
      GridItem(){
        Text('1')
      }.border({width:2})
      GridItem(){
        Text('1')
      }.border({width:2})
    }
    .width(300)
    .height(300)
    .border({width:5})
    .columnsTemplate('1fr 1fr 1fr 1fr 1fr')
    .rowsTemplate('1fr 1fr 1fr 1fr 1fr')
  }
}