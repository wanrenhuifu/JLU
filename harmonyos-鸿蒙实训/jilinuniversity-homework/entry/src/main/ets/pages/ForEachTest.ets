interface arrItem{
  name:string,
  age:number,
  phone?:number
}
@Entry
@Component
struct ForEachTest{
  @State arr:number[]=[1,2,3,4]
  @State arr1:string[]=['11','22']
  //第一步 第一数据源
  @State arr2:arrItem[]=[
    {name:'1',age:2},
    {name:'3',age:4},
    {name:'1',age:2},
    {name:'1',age:2}
  ]
  build(){
    Column(){
      //ui循环生成函数
      //ForEach(数据源，循环函数箭头函数 (每一项:每一项的类型，下标：数值类型）=>{})4\]=
      ForEach(this.arr2,(item:arrItem,index:number)=>{
        //被循环UI内容
        Text(index+'我叫'+item.name+'年龄为'+item.age)
      })

    }
  }
}