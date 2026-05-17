@Entry
@Component
//练习所有的常用组件
struct CommonTest {
  //@State num:number=0
  build() {
    //必须要有一个容器组件跟节点
    Column() {
      //按钮
      //Button('按钮'+this.num)
      //类型样式
      //.type(ButtonType.Normal)
      //.fontSize(20)
      //.width(150)
      //.height(80)
      //.borderRadius(20)
      //.border({width:10})
      //.backgroundImage()
      //事件方法
      // .onClick(()=>{
      //   this.num++
      //})
      //Text('多选框')
      //多选框
      //Checkbox()
      //是否选中事件
      //.onChange((flag:boolean)=>{
      //打印 控制台输出
      //  console.log('jlu'+flag)
      //})
      //.select(true)
      //.selectedColor(Color.Orange)
      //Checkbox()
      //Checkbox()
      //Text('群组')
      //群组
      //CheckboxGroup({group:'check'}){
      //分组
      //Checkbox({group:'check',name:'Checkbox1'})
      // Checkbox({group:'check',name:'Checkbox2'})
      //Checkbox({group:'check',name:'Checkbox3'})
      //}
      //.onChange((value)=>{
      //解析对象 JSON.stringify()
      // console.log('jlu '+JSON.stringify(value))

      // })
      //Text('数据看板')
      //DataPanel({values:[10,10,10,10,10],max:100,type:DataPanelType.Line})
      // .width(200)
      //  .height(20)
      //Text('图片')
      //Image($rawfile('图片1.png'))
      //.width(200)
      //Image('https://www.quark.cn/s/F2eP22PUAO0luKTQ41?q=%E5%9B%BE%E7%89%87&uc_param_str=ntnwvepffrbiprsvchutosstxs&by=submit&from=kkframenew&queryId=CrvZFv7DeQnM8JZ3slM6Hn9IB8QGH8p9nE2QUbAls2W8gGQqp5B7bHyAZcAzjlaNNMJs3FSYR21vaTPdVTF24LvJnkM0B')
      // .width(200)
      //Text('动态加载')
      //LoadingProgress()
      //.width(80)
      // .color(Color.Blue)
      //Text('二维码')
      //QRCode('123456').width(100)
      Text('下拉选择')
      Select([
        { value: '111', icon: $rawfile('图片1.png') },
        { value: '222' },
        { value: '333' }
      ])
        .value('444')
        .onSelect((value: number) => {
          console.log('jlu' + value)
        })
      Text('span text')
      //可以作为容器组件使用
      Text('111222')
      Text() {
        Span('111')
        Span('222')
          .fontColor(Color.Blue)
      }

      Text('输入框')
      TextInput({ placeholder: '默认提示信息 单行', text: '默认可选中信息' })
        .onChange((value: string) => {
          console.log('jlu' + value)
        })
      TextArea({ placeholder: '默认提示信息 多行'})
        .onChange((value: string) => {
          console.log('jlu' + value)
        })
    }

  }
}
