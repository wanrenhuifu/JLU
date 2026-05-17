import{ListTest}from'./ListTest'
@Entry
@Component
struct TabsTest {
  build() {
    //tabs导航
    Tabs({barPosition:BarPosition.End}){
      TabContent() {
        //Text('1')
        ListTest()
      }
      //设置导航名称
      // .tabBar({icon:'',text:''})
      .tabBar('首页')

        TabContent() {
        //  Text('2')
          //搜索组件
          Search({value:'',placeholder:'请输入'})
          //搜索按扭
            .searchButton('搜索',{fontSize:32,fontColor:Color.Blue})
            .onSubmit((value:string)=>{
              console.log('jlu'+value)

            })
            .onChange((value:string)=>{
              console.log('jlu'+value)

            })
        } .tabBar('首页')

          TabContent() {
            Text('3')
          } .tabBar('首页')

            TabContent() {
              Text('4')
            } .tabBar('首页')
    }
    .onChange((index:number)=>{
      console.log('jlu'+index)
    })
    .scrollable(false)
    //.barWidth(300)
    .barBackgroundColor(Color.Blue)


  }
}
