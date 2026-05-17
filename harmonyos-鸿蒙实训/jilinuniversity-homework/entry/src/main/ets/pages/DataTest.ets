//导入其他子页面
import {DataTestSon} from './DataTestSon'
@Entry
@Component
struct DataTest{
  @State num:number=0
  build() {
    //text组件参数必须为字符串
    //Text(this.num.toString())
    //.onClick(()=>{
    // this.num++
    //})
    Column(){
      Text('父组件原始值'+this.num.toString())
        .onClick(()=>{
          this.num++
        })
      //使用子组件并传值{名称:值}
      DataTestSon({count:this.num})
    }

  }
}